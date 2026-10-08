#!/usr/bin/env python3
"""Resize the approved app icon master. Requires Pillow; not needed for CI."""
import sys
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parent.parent
source = Image.open(Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'public/icons/icon-512.png').convert('RGB')
for name, size in [('icon-192.png',192),('icon-512.png',512),('maskable-512.png',512),('apple-touch-icon.png',180)]:
    source.resize((size,size), Image.Resampling.LANCZOS).save(root / 'public/icons' / name, optimize=True)
