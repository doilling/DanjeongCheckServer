"""Windows CI: launch the actual EXE, bootstrap, login, restart, restore session."""
import http.cookiejar,json,os,pathlib,subprocess,sys,tempfile,time,urllib.request,urllib.error

def stop(process):
 if os.name=='nt':
  subprocess.run(['taskkill','/PID',str(process.pid),'/T','/F'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,check=False)
 else: process.terminate()
 process.wait(timeout=15)

def main():
 exe=pathlib.Path(sys.argv[1]).resolve()
 with tempfile.TemporaryDirectory() as tmp:
  port=18787;url=f'http://127.0.0.1:{port}'
  jar=http.cookiejar.CookieJar();opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
  def call(path,data=None):
   req=urllib.request.Request(url+'/danjeong/api/'+path,headers={'Origin':url,'Content-Type':'application/json'},data=json.dumps(data).encode() if data is not None else None)
   with opener.open(req,timeout=5) as r:return json.load(r)
  def launch():
   command=[sys.executable,str(exe)] if exe.suffix=='.py' else [str(exe)]
   p=subprocess.Popen(command+['--data-dir',tmp,'--port',str(port)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
   for _ in range(100):
    try:
     if call('health')['ok']:return p
    except Exception:pass
    if p.poll() is not None:raise RuntimeError('EXE terminated before health check')
    time.sleep(.2)
   stop(p);raise RuntimeError('EXE health timeout')
  p=launch()
  try:
   for asset in ('','app.js','styles.css','assets/school-logo.png'):
    with opener.open(url+'/danjeong/'+asset,timeout=5) as response:
     assert response.status==200 and response.read()
   code=(pathlib.Path(tmp)/'setup-code.txt').read_text()
   call('setup',{'code':code,'id':'admin','name':'관리자','password':'testpw'})
   call('login',{'id':'admin','password':'testpw','remember':True})
   assert call('session')['user']['role']=='admin'
   # Use real Waitress, not Flask's test client: Caddy forwards HTTPS over localhost HTTP.
   forwarded={'Host':'presentoo.duckdns.org','Origin':'https://presentoo.duckdns.org',
              'X-Forwarded-Host':'presentoo.duckdns.org','X-Forwarded-Proto':'https',
              'X-Forwarded-For':'203.0.113.10','Content-Type':'application/json'}
   payload=json.dumps({'id':'admin','password':'testpw'}).encode()
   req=urllib.request.Request(url+'/danjeong/api/login',headers=forwarded,data=payload)
   with urllib.request.urlopen(req,timeout=5) as response:
    assert json.load(response)['user']['id']=='admin'
    assert 'Secure' in response.headers['Set-Cookie']
   forwarded['Origin']='https://untrusted.example'
   try:
    urllib.request.urlopen(urllib.request.Request(url+'/danjeong/api/login',headers=forwarded,data=payload),timeout=5)
    raise AssertionError('Foreign origin should be rejected')
   except urllib.error.HTTPError as error:
    assert error.code==403
  finally:stop(p)
  p=launch()
  try:assert call('session')['user']['id']=='admin'
  finally:stop(p)
 print(('Source server' if exe.suffix=='.py' else 'Bundled EXE')+' start, HTTPS proxy login, origin rejection and process restart checks passed')
if __name__=='__main__':main()
