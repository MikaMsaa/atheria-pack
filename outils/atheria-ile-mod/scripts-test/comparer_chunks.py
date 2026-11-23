import sys,os,struct,zlib
sys.argv,args=[sys.argv[0],'x'],sys.argv[1:]
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'sommet_monde.py')).read().split('cache={}')[0])
def lire(monde,cx,cz):
  rf=os.path.join(monde,'region','r.%d.%d.mca'%(cx>>5,cz>>5))
  with open(rf,'rb') as f:
    f.seek(4*((cx&31)+32*(cz&31))); e=struct.unpack('>I',f.read(4))[0]
    if not e>>8: return None
    f.seek((e>>8)*4096); ln,ct=struct.unpack('>IB',f.read(5)); raw=zlib.decompress(f.read(ln-1))
  d,_=nbt(raw,3+struct.unpack('>H',raw[1:3])[0],10)
  blocs={}
  for s in d.get('sections',[]):
    bs=s.get('block_states');
    if not bs: continue
    pal=[p.get('Name','?')+str(sorted(p.get('Properties',{}).items())) for p in bs['palette']]
    data=bs.get('data')
    if not data: idx=[0]*4096
    else:
      bits=max(4,(len(pal)-1).bit_length()); per=64//bits; mask=(1<<bits)-1; idx=[]
      for L in data:
        L&=(1<<64)-1
        for j in range(per):
          idx.append((L>>(bits*j))&mask)
      idx=idx[:4096]
    blocs[s['Y']]=[pal[i] for i in idx]
  return d.get('Status'),blocs
import re as _re
TERRAIN=os.environ.get('TERRAIN')=='1'
_VEG=_re.compile(r'(?<!_block)(grass|fern|flower|bush|sapling|mushroom|vine|leaves|log|wood|petals|dandelion|poppy|tulip|orchid|allium|bluet|daisy|cornflower|lily|rose|peony|lilac|sunflower|sugar_cane|kelp|seagrass|cactus|dead_|moss_carpet|snow\[|chest|barrel|spawner|sign|bed|banner|torch|lantern|candle|pot|fossil|cobweb|pointed_dripstone|amethyst_cluster|bud|glow_lichen|roots|sprouts|reed|cattail|pebble|twig|stick)')
def norm(b):
  # blocs de terrain seuls : minerais -> roche hote, vegetation / conteneurs / fossiles / objets -> air
  n=b.split('[')[0]
  if 'ore' in n.split(':')[-1].split('_') or n.endswith('_ore') or 'gypsum' in n: return 'minecraft:deepslate' if 'deepslate' in n else 'minecraft:stone'
  if os.environ.get('TERRAIN_ROCHE')=='1':
    c=n.split(':')[-1]
    # nuances de roche des poches de minerai (tuff, andesite, diorite, granite, idium, gravier) -> roche ; blocs de ruines -> air
    if 'fossil' in c or c in ('smooth_basalt','tuff','andesite','diorite','granite','calcite','gravel','idium','deepslate') or c.endswith('idium'): return 'minecraft:stone'
    if c.startswith('mossy_') or c in ('moss_block','cobblestone','stone_bricks','cracked_stone_bricks','iron_block','light_gray_concrete') or 'concrete' in c or 'brick' in c: return 'minecraft:air'
  if _VEG.search(n.split(':')[-1]+'['): return 'minecraft:air'
  if n in ('minecraft:cave_air','minecraft:void_air'): return 'minecraft:air'
  return n
mondes=args[0].split(';'); chunks=[tuple(map(int,c.split('/'))) for c in args[1].split(';')]
for cx,cz in chunks:
  ref=lire(mondes[0],cx,cz)
  for m in mondes[1:]:
    o=lire(m,cx,cz)
    if ref is None or o is None: print(cx,cz,os.path.basename(m),'absent'); continue
    diff=0;tot=0;ex=[];import collections;cp=collections.Counter();ys=collections.Counter()
    for Y in [y for y in sorted(set(ref[1])|set(o[1])) if y>=int(os.environ.get("YMIN","-99"))//16]:
      a=ref[1].get(Y,['minecraft:air[]']*4096); b=o[1].get(Y,['minecraft:air[]']*4096)
      for i in range(4096):
        tot+=1
        if Y*16+(i>>8)<int(os.environ.get("YMIN","-999")): tot-=1; continue
        if (norm(a[i])!=norm(b[i])) if TERRAIN else (a[i]!=b[i]):
          diff+=1;cp[(a[i].split('[')[0][10:],b[i].split('[')[0][10:])]+=1;ys[(Y*16+(i>>8))//8*8]+=1
          if len(ex)<3: ex.append((Y*16+(i>>8),i&15,(i>>4)&15,a[i][:40],b[i][:40]))
    print('chunk %d/%d %s vs %s : %d blocs differents sur %d (%.2f %%) statuts %s/%s %s'%(cx,cz,os.path.basename(mondes[0]),os.path.basename(m),diff,tot,100*diff/tot,ref[0],o[0],''))
    print('   paires',cp.most_common(8));print('   Y',sorted(ys.items()))
