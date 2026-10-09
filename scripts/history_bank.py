"""Original Turkish history questions, with topic-specific distractor pools."""
from pathlib import Path
CATEGORIES = ['turkiye-tarihi', 'osmanli-tarihi', 'islam-tarihi', 'peygamberler-tarihi']
# Same-kind alternatives for groups with fewer than four answers in the bank.
EXTRA_POOLS = {('osmanli-tarihi', 'mahlas'): ['Avnî', 'Muhibbî', 'Selîmî', 'Adlî']}
def extend_history(questions, add):
    root = Path(__file__).resolve().parent.parent
    for category in CATEGORIES:
        rows=[]
        for line in (root/'data/history'/f'{category}.txt').read_text().splitlines():
            if not line.strip() or line.startswith('#'): continue
            fields=line.split('|')
            assert len(fields) in (3,4), (category,line)
            kind,text,answer=fields[:3]
            rows.append((kind,text,answer,fields[3] if len(fields)==4 else ''))
        assert len(rows)==150,(category,len(rows))
        pools={kind:list(dict.fromkeys(a for k,_,a,_ in rows if k==kind)) for kind,_,_,_ in rows}
        for kind,text,answer,note in rows:
            pool=EXTRA_POOLS.get((category,kind),pools[kind])
            assert answer in pool and len(pool)>=4,(category,kind)
            add(category,text,answer,pool,note or f'Doğru cevap: {answer}.')
