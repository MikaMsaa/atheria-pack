import sys,os,struct,zlib,collections
monde,x1,z1,x2,z2=sys.argv[1],*map(int,sys.argv[2:6])
cx1,cz1,cx2,cz2=x1>>4,z1>>4,x2>>4,z2>>4
stat=collections.Counter();bad=[];nonfull=[]
for cz in range(cz1,cz2+1):
  for cx in range(cx1,cx2+1):
    rf=os.path.join(monde,'region','r.%d.%d.mca'%(cx>>5,cz>>5))
    if not os.path.exists(rf): stat['region absente']+=1; bad.append((cx,cz,'region absente')); continue
    with open(rf,'rb') as f:
      f.seek(4*((cx&31)+32*(cz&31))); e=struct.unpack('>I',f.read(4))[0]
      off,sec=e>>8,e&255
      if off==0: stat['absent']+=1; bad.append((cx,cz,'absent')); continue
      f.seek(off*4096); hd=f.read(5)
      if len(hd)<5: stat['tronque']+=1; bad.append((cx,cz,'tronque')); continue
      ln,ct=struct.unpack('>IB',hd)
      if ln-1>sec*4096: stat['longueur>secteurs']+=1; bad.append((cx,cz,'longueur')); continue
      data=f.read(ln-1)
      if len(data)<ln-1: stat['tronque']+=1; bad.append((cx,cz,'tronque')); continue
      try:
        raw=zlib.decompress(data) if ct==2 else (__import__('gzip').decompress(data) if ct==1 else data)
      except Exception as ex: stat['illisible']+=1; bad.append((cx,cz,'illisible')); continue
      k=raw.find(b'\x08\x00\x06Status')
      if k<0: stat['sans Status']+=1; bad.append((cx,cz,'sans Status')); continue
      n=struct.unpack('>H',raw[k+9:k+11])[0]; s=raw[k+11:k+11+n].decode()
      stat[s]+=1
      if s!='minecraft:full': nonfull.append((cx,cz,s))
tot=(cx2-cx1+1)*(cz2-cz1+1)
print('chunks',tot,dict(stat))
print('defauts',len(bad),bad[:30])
print('non full',len(nonfull),nonfull[:30])
if nonfull:
  xs=[c[0] for c in nonfull];zs=[c[1] for c in nonfull];print('boite non full blocs x',min(xs)*16,max(xs)*16+15,'z',min(zs)*16,max(zs)*16+15)
