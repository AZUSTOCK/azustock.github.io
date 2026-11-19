"""generate_projects.py 本地原圖增量檢查。不讀寫 EXIF 更新指紋。

首次遇到已有 WebP 而無紀錄時，只建立基準，不重編碼。
真正需要轉檔時，沿用原版 convert_webp._convert_single_worker。
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from .build_cache import file_lock
import hashlib
import json
import os
from pathlib import Path
import shutil
import tempfile

from .convert_webp import _convert_single_worker, MAX_SIZE, RATIO
from .cout import cout

SCHEMA_VERSION = 1


def file_hash(path):
    hasher = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            hasher.update(block)
    return hasher.hexdigest()


def read_manifest(path):
    if not path.exists():
        return {'schema': SCHEMA_VERSION, 'files': {}}
    try:
        manifest = json.loads(path.read_text(encoding='utf-8'))
        if not isinstance(manifest, dict) or manifest.get('schema') != SCHEMA_VERSION:
            raise ValueError('不支援的紀錄格式')
        records = manifest.get('files')
        if not isinstance(records, dict):
            raise ValueError('files 必須是物件')
        for key, record in records.items():
            if (not isinstance(record, dict) or not isinstance(record.get('source_sha256'), str)
                    or len(record['source_sha256']) != 64 or not isinstance(record.get('settings'), dict)
                    or not isinstance(record.get('webp'), str)):
                raise ValueError('圖片紀錄不完整：' + key)
        return manifest
    except (ValueError, UnicodeError) as error:
        # 損壞時不悄悄重建基準，避免把來源變更誤當成既有版本。
        raise ValueError(f'本地 WebP 紀錄無效：{path}；請還原有效備份，或明確移除此檔以重新建立基準。{error}') from error


def write_manifest(path, manifest):
    content = json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2) + '\n'
    if path.is_file() and path.read_text(encoding='utf-8') == content:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', newline='\n',
                                         prefix='.webp-manifest-', dir=path.parent, delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(content)
        os.replace(temporary, path)
        temporary = None
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def _ensure_gitignore(site_root, manifest_path):
    try:
        relative = manifest_path.relative_to(site_root).as_posix()
    except ValueError:
        return  # 明確指定網站外的紀錄檔時，不修改網站的 ignore 規則。
    path = site_root / '.gitignore'
    original = path.read_bytes() if path.exists() else b''
    text = original.decode('utf-8-sig')
    rules = ['/' + relative, '/' + relative + '.lock', '/tools/.cache/site_build.lock']
    existing = {line.strip().lstrip('/') for line in text.splitlines()}
    missing = [rule for rule in rules if rule.lstrip('/') not in existing]
    if not missing:
        return
    nl = b'\r\n' if b'\r\n' in original else b'\n'
    addition = (b'' if not original or original.endswith(b'\n') else nl)
    addition += b'# Local WebP incremental build cache' + nl
    addition += nl.join(rule.encode('utf-8') for rule in missing) + nl
    # 只追加新規則，保留原本的 BOM、內容、換行與其他忽略設定。
    with path.open('ab') as stream:
        stream.write(addition)


def _forced_target(relative, target_folders):
    parents = '/' + relative.parent.as_posix().strip('/') + '/'
    return any('/' + str(target).replace('\\', '/').strip('/') + '/' in parents
               for target in target_folders if str(target).strip('/\\'))


def _convert_staged(source, target, source_hash, quality, max_size, ratio):
    """用原版 worker 生成暫存 WebP，成功後才替換真正目標。"""
    with tempfile.TemporaryDirectory(prefix='.webp-build-', dir=source.parent) as directory:
        staged_source = Path(directory) / source.name
        shutil.copyfile(source, staged_source)
        if file_hash(staged_source) != source_hash:
            raise OSError('來源在準備轉檔時變動，請重新執行')
        status, _, _, error = _convert_single_worker(str(staged_source), True, quality, max_size, ratio)
        if status != 'CONVERTED':
            raise OSError(error or '原版轉檔器未完成轉換：' + status)
        staged_webp = staged_source.with_suffix('.webp')
        if file_hash(source) != source_hash:
            raise OSError('來源在轉檔期間變動，請重新執行')
        if target.exists():
            staged_webp.chmod(target.stat().st_mode & 0o777)
        os.replace(staged_webp, target)


def _convert_local_webp_unlocked(directory='projects', quality=90, max_size=MAX_SIZE, ratio=RATIO,
                       logic_version='1', force_overwrite=False, target_folders=None,
                       manifest_path=None, max_workers=None):
    root = Path(directory).resolve()
    if not root.is_dir():
        raise FileNotFoundError('找不到專案目錄：' + str(root))
    path = (Path(manifest_path).resolve() if manifest_path is not None
            else root.parent / 'tools' / '.cache' / 'webp_manifest.json')
    # 主程式只在本地呼叫本函式；本模組不以環境變數自行猜測執行模式。
    manifest = read_manifest(path)
    settings = dict(quality=quality, max_size=list(max_size), ratio=ratio, logic_version=str(logic_version))
    # 設定必須能以標準 JSON 持久化，避免 NaN 造成每次誤判。
    json.dumps(settings, allow_nan=False)
    _ensure_gitignore(root.parent, path)
    targets = set(target_folders or ())
    report = dict(converted=0, updated=0, baseline=0, skipped=0, ignored=0, errors=[])
    cout.stage('第一階段', '本地 WebP 內容與設定檢查（JSON 紀錄）', icon_key='search')

    def on_scan_error(error):
        report['errors'].append(str(error))

    sources = []
    destinations = {}
    for directory_path, dirs, names in os.walk(root, onerror=on_scan_error):
        # 不進入轉檔暫存目錄，亦不跟隨目錄符號連結。
        dirs[:] = sorted(d for d in dirs if not d.startswith('.webp-build-'))
        for name in sorted(names):
            source = Path(directory_path) / name
            if source.suffix.lower() not in ('.png', '.jpg', '.jpeg'):
                continue
            if '_ori' in str(source.with_suffix('')):
                report['ignored'] += 1
                continue
            if source.is_symlink():
                report['errors'].append(str(source) + ': 不處理來源圖片符號連結')
                continue
            target = source.with_suffix('.webp')
            destinations.setdefault(os.path.normcase(str(target)), []).append(source)
            sources.append(source)
    collisions = {key for key, value in destinations.items() if len(value) > 1}
    for key in collisions:
        report['errors'].append('多張來源會覆寫同一個 WebP，請先保留單一來源：'
                                + ', '.join(str(source) for source in destinations[key]))

    def process(source):
        relative = source.relative_to(root)
        target = source.with_suffix('.webp')
        key = relative.as_posix()
        digest = file_hash(source)
        old = manifest['files'].get(key)
        record = dict(source_sha256=digest, settings=settings, webp=target.relative_to(root).as_posix())
        forced = force_overwrite or _forced_target(relative, targets)
        exists = target.is_file()
        if exists and old is None and not forced:
            # 未知歷史狀態：建立基準但不聲稱既有 WebP 已由目前來源生成。
            record['baseline_only'] = True
            record['webp_sha256'] = file_hash(target)
            return key, record, 'baseline', None
        if exists and not forced and old is not None and all(old.get(k) == v for k, v in record.items()):
            target_hash = file_hash(target)
            if old.get('webp_sha256') is None:
                # 舊 manifest 升級時補上輸出 Hash，保留既有 WebP。
                return key, dict(old, webp_sha256=target_hash), 'skipped', None
            if old['webp_sha256'] == target_hash:
                return key, old, 'skipped', None
        _convert_staged(source, target, digest, quality, max_size, ratio)
        record['baseline_only'] = False
        record['webp_sha256'] = file_hash(target)
        return key, record, 'updated' if exists else 'converted', source

    workers = max_workers if max_workers is not None else min(32, (os.cpu_count() or 4) + 4)
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(process, source):source for source in sources
                   if os.path.normcase(str(source.with_suffix('.webp'))) not in collisions}
        for future in as_completed(futures):
            source = futures[future]
            try:
                key, record, status, changed_source = future.result()
                manifest['files'][key] = record
                report[status] += 1
                if changed_source is not None:
                    cout.file_size_action('本地更新' if status == 'updated' else '本地轉換',
                                          str(source), str(source.with_suffix('.webp')),
                                          icon_key='refresh' if status == 'updated' else 'success', tree=True)
            except (OSError, ValueError, RuntimeError) as error:
                # 舊紀錄維持不變，下次仍會辨識為待更新；成功項目則可以正常保存。
                report['errors'].append(str(source) + ': ' + str(error))
    write_manifest(path, manifest)
    for error in report['errors']:
        cout.error(error)
    summary = ('新增 {converted} / 更新 {updated} / 首次建立基準 {baseline} / 未變更 {skipped} / 排除 {ignored}'
               .format(**report))
    if report['errors']:
        cout.error('本地 WebP 處理有錯誤：' + summary)
    else:
        cout.success('本地 WebP 處理完成：' + summary)
    return report


def _manifest_lock(path):
    return file_lock(str(path) + '.lock', '本地 WebP 處理')


def convert_local_webp(directory='projects', quality=90, max_size=MAX_SIZE, ratio=RATIO,
                       logic_version='1', force_overwrite=False, target_folders=None,
                       manifest_path=None, max_workers=None):
    root = Path(directory).resolve()
    if not root.is_dir():
        raise FileNotFoundError('找不到專案目錄：' + str(root))
    path = (Path(manifest_path).resolve() if manifest_path is not None
            else root.parent / 'tools' / '.cache' / 'webp_manifest.json')
    with _manifest_lock(path):
        return _convert_local_webp_unlocked(directory, quality, max_size, ratio, logic_version,
                                           force_overwrite, target_folders, path, max_workers)
