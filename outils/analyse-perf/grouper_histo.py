# Regroupe un GC.class_histogram par paquet (3 segments) et par module.
# Usage : python -I grouper_histo.py histo.txt [n]
import re, sys, collections
f = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 60
pq = collections.Counter(); mod = collections.Counter(); total = 0
for l in open(f, encoding='utf-8', errors='replace'):
    m = re.match(r'\s*\d+:\s+(\d+)\s+(\d+)\s+(\S+)(?:\s+\((\S+)\))?', l)
    if not m: continue
    b = int(m.group(2)); cls = m.group(3); md = (m.group(4) or '?').split('@')[0]
    total += b
    if cls.startswith('['):
        cls = cls.lstrip('[').lstrip('L').rstrip(';')
        if len(cls) == 1: cls = 'tableaux primitifs (' + {'B': 'byte', 'I': 'int', 'J': 'long', 'F': 'float', 'C': 'char', 'S': 'short', 'D': 'double', 'Z': 'boolean'}.get(cls, cls) + ')'
    p = '.'.join(cls.split('.')[:3])
    pq[p] += b; mod[md] += b
print('Total %.2f Go' % (total / 1e9))
print('== par paquet (3 segments), %d plus gros' % n)
for p, b in pq.most_common(n): print('%7.0f Mo %5.1f %%  %s' % (b / 1e6, 100 * b / total, p))
print('== par module/mod (colonne module du jcmd)')
for p, b in mod.most_common(25): print('%7.0f Mo %5.1f %%  %s' % (b / 1e6, 100 * b / total, p))
