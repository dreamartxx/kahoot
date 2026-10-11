#!/usr/bin/env python3
"""Resize the normal and safe-zone icon masters without changing their artwork.

python3 scripts/build-icons.py /path/to/normal.png /path/to/maskable.png
Without arguments, reuse the checked-in 512px versions. Requires Pillow.
"""
import sys
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
icons = root / 'public/icons'
source = Image.open(Path(sys.argv[1]) if len(sys.argv) > 1 else icons / 'icon-512.png').convert('RGB')
maskable = Image.open(Path(sys.argv[2]) if len(sys.argv) > 2 else icons / 'maskable-512.png').convert('RGB')
for image in (source, maskable):
    if image.width != image.height:
        raise SystemExit('Icon masters must be square.')
for name, size in [('icon-192.png',192),('icon-512.png',512),('apple-touch-icon.png',180)]:
    source.resize((size,size), Image.Resampling.LANCZOS).save(icons / name, optimize=True)
maskable.resize((512,512), Image.Resampling.LANCZOS).save(icons / 'maskable-512.png', optimize=True)
