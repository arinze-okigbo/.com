import json,re,datetime,urllib.parse,subprocess
from html.parser import HTMLParser
from pathlib import Path
class Page(HTMLParser):
 def __init__(self):super().__init__();self.text=[];self.links=[];self.images=[];self.meta=[];self.skip=0
 def handle_starttag(self,t,a):
  a=dict(a)
  if t in ['script','style']:self.skip+=1
  if t=='a' and 'href'in a:self.links.append(a['href'])
  if t=='img':self.images.append(a)
  if t=='meta':self.meta.append(a)
 def handle_endtag(self,t):
  if t in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,d):
  if not self.skip and d.strip():self.text.append(d.strip())
base='https://arinzeokigbo.com';todo=[base];seen=set();pages=[]
while todo and len(seen)<80:
 u=todo.pop(0)
 if u in seen:continue
 seen.add(u)
 try:
  raw=subprocess.check_output(['curl','--fail','-LsS','--max-time','25',u]).decode();p=Page();p.feed(raw)
  links=list(dict.fromkeys(urllib.parse.urljoin(u,l) for l in p.links))
  pages.append(dict(url=u,fetchedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),text=p.text,links=links,images=p.images,meta=p.meta))
  Path('hive/research/current-site-'+str(len(pages))+'.html').write_text(raw)
  for link in links:
   z=urllib.parse.urlparse(link);clean=urllib.parse.urlunparse(z._replace(fragment='',query='')).rstrip('/')
   if z.netloc in ['arinzeokigbo.com','www.arinzeokigbo.com'] and not re.search(r'\.(pdf|png|jpg|ico|webp|svg)$',z.path) and clean not in seen:todo.append(clean)
 except Exception as e:pages.append(dict(url=u,error=str(e)))
out=dict(source=base,fetchedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),pages=pages)
Path('content/inventory.json').write_text(json.dumps(out,indent=2));Path('hive/research/current-site.json').write_text(json.dumps(out,indent=2))
print(json.dumps(out,indent=2)[:14000])
