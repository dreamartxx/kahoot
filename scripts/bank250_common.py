"""Helpers for the editorial expansion; no generated paraphrases or duplicate rows."""
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent

def rows(raw):
    return [line.split('|') for line in raw.strip().splitlines() if line.strip() and not line.startswith('#')]

def grouped(add,category,template,raw,pool=None):
    data=rows(raw)
    choices=pool or list(dict.fromkeys(row[1] for row in data))
    for row in data:
        add(category,template.format(row[0]),row[1],choices,row[2] if len(row)>2 else '')

def file_questions(add,category):
    p=ROOT/'data/expansion250'/f'{category}.txt'
    if not p.exists():return
    data=rows(p.read_text())
    pools={kind:list(dict.fromkeys(r[2] for r in data if r[0]==kind)) for kind,*_ in data}
    for r in data:
        kind,text,answer=r[:3]
        pool=r[4].split('~')+[answer] if len(r)>4 and r[4] else pools[kind]
        add(category,text,answer,pool,r[3] if len(r)>3 else '')
