"""建置快取的內容簽章與原子寫入；不涉及使用者狀態。"""
import hashlib
import json
import os
from pathlib import Path
import tempfile
from contextlib import contextmanager


@contextmanager
def file_lock(path, label='網站建置'):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        descriptor = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError as error:
        raise RuntimeError(f'{label}已在執行；若先前程序已中止，請確認後移除鎖定檔：{path}') from error
    identity = os.fstat(descriptor)
    try:
        with os.fdopen(descriptor, 'w', encoding='utf-8') as stream:
            json.dump({'pid': os.getpid()}, stream)
        yield
    finally:
        try:
            current = path.stat()
            if (current.st_dev, current.st_ino) == (identity.st_dev, identity.st_ino):
                path.unlink()
        except FileNotFoundError:
            pass


def stat_key(path):
    stat = Path(path).stat()
    return (stat.st_dev, stat.st_ino, stat.st_size, stat.st_mtime_ns, stat.st_ctime_ns)


def invalidate(path, *memos):
    absolute = os.path.abspath(path)
    for memo in memos:
        for key in list(memo):
            if key[0] == absolute:
                memo.pop(key, None)


def atomic_write(path, content, *memos):
    path = Path(path)
    data = content.encode('utf-8') if isinstance(content, str) else content
    if path.is_file() and path.read_bytes() == data:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='wb', dir=path.parent, prefix='.build-cache-', delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(data)
        temporary.chmod(path.stat().st_mode & 0o777 if path.exists() else 0o644)
        os.replace(temporary, path)
        temporary = None
        invalidate(path, *memos)
        return True
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def signature(primary, dependencies, settings, logic_version, hash_file):
    if not primary or not Path(primary).is_file():
        raise FileNotFoundError('建置來源不存在：' + str(primary))
    paths = [primary, *(dependencies or ())]
    values = []
    for path in paths:
        if path is None:
            values.append(None)
        else:
            name = os.path.normpath(path).replace('\\', '/')
            values.append([name, hash_file(path) if Path(path).is_file() else '(missing)'])
    encoded = json.dumps(dict(inputs=values, settings=settings or {}, logic=logic_version),
                         sort_keys=True, ensure_ascii=False, separators=(',', ':'), allow_nan=False)
    return hashlib.sha256(encoded.encode('utf-8')).hexdigest()[:16]
