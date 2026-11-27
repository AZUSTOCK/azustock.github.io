"""Preview or move legacy public resources to configured public paths; never overwrite."""
import argparse
import shutil
from pathlib import Path

from tools.common.paths import ROOT_DIR
from tools.common.build_cache import file_lock
from tools.config.site_config import RESOURCE_PATHS, legacy_resource_locations


def migrate(root=ROOT_DIR, *, apply=False):
    root = Path(root).resolve()
    moves, messages = [], []
    # Preflight every source/destination before making any changes.
    for key, new in RESOURCE_PATHS.items():
        old_paths = tuple(old for old in legacy_resource_locations(key) if old != new)
        dest = root / new
        sources = [root / old for old in old_paths]
        for path in [*sources, dest]:
            for parent in (p for p in path.parents if p != root and root in p.parents):
                if parent.is_symlink():
                    raise ValueError(f'Symlink not allowed: {parent}')
                if parent.exists() and not parent.is_dir():
                    raise ValueError(f'Not a directory: {parent}')
            if path.is_symlink():
                raise ValueError(f'Symlink not allowed: {path}')
            if path.exists() and not path.is_file():
                raise ValueError(f'Not a file: {path}')
        existing = [path for path in sources if path.exists()]
        if len(existing) + int(dest.exists()) > 1:
            conflicts = [*existing, *([dest] if dest.exists() else [])]
            raise FileExistsError('Multiple resource paths exist; compare manually: ' +
                                  ' / '.join(str(path.relative_to(root)) for path in conflicts))
        if dest.exists():
            messages.append(f'Already moved: {new}')
        elif not existing:
            messages.append(f'Optional resource missing: {" / ".join((*old_paths, new))}')
        else:
            src = existing[0]
            moves.append((src, dest))
            messages.append(f'{src.relative_to(root).as_posix()} -> {new}')
    if apply:
        for src, dest in moves:
            dest.parent.mkdir(parents=True, exist_ok=True)
            # Exclusive creation prevents overwriting an unexpected destination.
            # Preserve the exact bytes and remove the original only after copy succeeds.
            created = False
            try:
                with src.open('rb') as reader, dest.open('xb') as writer:
                    created = True
                    shutil.copyfileobj(reader, writer)
                shutil.copystat(src, dest)
            except BaseException:
                if created:
                    dest.unlink(missing_ok=True)
                raise
            src.unlink()
    return messages


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='Move files (default: preview only)')
    args = parser.parse_args()
    if args.apply:
        with file_lock(ROOT_DIR/'tools/.cache/site_build.lock'):
            messages = migrate(apply=True)
    else:
        messages = migrate()
    print('\n'.join(messages))
    print('Migration complete.' if args.apply else 'Preview only. Use --apply to move files.')


if __name__ == '__main__':
    main()
