import sys,os,struct,zlib,math
monde=sys.argv[1]; MINY=-64
def nbt(b,i,t):
  if t==1: return b[i],i+1
  if t==2: return struct.unpack('>h',b[i:i+2])[0],i+2
  if t==3: return struct.unpack('>i',b[i:i+4])[0],i+4
  if t==4: return struct.unpack('>q',b[i:i+8])[0],i+8
  if t==5: return None,i+4
  if t==6: return None,i+8
  if t==7: n=struct.unpack('>i',b[i:i+4])[0]; return None,i+4+n
  if t==8: n=struct.unpack('>H',b[i:i+2])[0]; return b[i+2:i+2+n].decode('utf-8','replace'),i+2+n
  if t==9:
    et=b[i]; n=struct.unpack('>i',b[i+1:i+5])[0]; i+=5; L=[]
    for _ in range(n): v,i=nbt(b,i,et); L.append(v)
    return L,i
  if t==10:
    d={}
    while True:
      tt=b[i]; i+=1
      if tt==0: return d,i
      n=struct.unpack('>H',b[i:i+2])[0]; k=b[i+2:i+2+n].decode('utf-8','replace'); i+=2+n
      v,i=nbt(b,i,tt); d[k]=v
  if t==11: n=struct.unpack('>i',b[i:i+4])[0]; return None,i+4+4*n
  if t==12: n=struct.unpack('>i',b[i:i+4])[0]; return list(struct.unpack('>%dq'%n,b[i+4:i+4+8*n])),i+4+8*n
cache={}
def chunk(cx,cz):
  if (cx,cz) in cache: return cache[(cx,cz)]
  rf=os.path.join(monde,'region','r.%d.%d.mca'%(cx>>5,cz>>5)); r=None
  if os.path.exists(rf):
    with open(rf,'rb') as f:
      f.seek(4*((cx&31)+32*(cz&31))); e=struct.unpack('>I',f.read(4))[0]
      if e>>8:
        f.seek((e>>8)*4096); ln,ct=struct.unpack('>IB',f.read(5)); raw=zlib.decompress(f.read(ln-1))
        d,_=nbt(raw,3+struct.unpack('>H',raw[1:3])[0],10)
        hm={}
        for k,v in d.get('Heightmaps',{}).items():
          vals=[]
          for L in v:
            L&=(1<<64)-1
            for j in range(7): vals.append((L>>(9*j))&511)
          hm[k]=vals[:256]
        r=hm
  cache[(cx,cz)]=r; return r
def h(x,z,k='MOTION_BLOCKING_NO_LEAVES'):
  c=chunk(x>>4,z>>4)
  if not c or k not in c: return None
  return c[k][(x&15)+16*(z&15)]+MINY-1
def sol(x,z): return h(x,z,'OCEAN_FLOOR')
best=(-999,0,0)
for z in range(-1342,-1222):
  for x in range(2314,2434):
    v=sol(x,z)
    if v is not None and v>best[0]: best=(v,x,z)
print('SOMMET_MONDE Y=%d en %d,%d (sol OCEAN_FLOOR)'%best)
print('sommet prevu 2374,-1282 : sol',sol(2374,-1282),'surface',h(2374,-1282))
print('replat 12x12 autour du sommet prevu :',sorted(set(sol(x,z) for x in range(2368,2380) for z in range(-1288,-1276))))
print('profil est z-1282 :',[(x,sol(x,-1282)) for x in range(2374,2700,25)])
for az in (90,95,100,105):
  a=math.radians(az); ux,uz=math.sin(a),-math.cos(a); first=None; prev=None
  for d in range(30,700,1):
    x=int(round(2374+ux*d)); z=int(round(-1282+uz*d)); g=sol(x,z)
    if g is None: first=('hors monde',d); break
    if prev is not None and g-prev>=6 and d>100: first=(d,x,z,'de',prev,'a',g); break
    prev=g
  print('azimut',az,'premier batiment (surface >= sol+8) :',first)
