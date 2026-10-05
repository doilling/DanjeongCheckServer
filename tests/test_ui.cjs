// Executes the actual UI in a DOM and calls the actual HTTP server.
const {JSDOM,CookieJar,VirtualConsole}=require('jsdom');
const {spawn}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'danjeong-ui-')),port=19878,origin='http://127.0.0.1:'+port;
const processServer=spawn(process.env.PYTHON||'python3',[path.join(root,'server.py'),'--data-dir',dir,'--port',String(port)],{stdio:'pipe'});
let errors=[],dom;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function wait(fn,label){for(let i=0;i<150;i++){if(fn())return;await delay(30);}throw Error('Timeout: '+label+'; '+errors.join('; '));}
async function main(){
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/danjeong/api/health')).ok)break;}catch{}await delay(100);}
 const jar=new CookieJar(),vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 dom=await JSDOM.fromURL(origin+'/danjeong/',{resources:'usable',runScripts:'dangerously',cookieJar:jar,virtualConsole:vc,beforeParse(window){
  window.confirm=()=>true;
  window.fetch=async(url,options={})=>{const absolute=new URL(url,window.location.href).href;const headers={...options.headers};const cookies=jar.getCookieStringSync(absolute);if(cookies)headers.Cookie=cookies;if(options.method&&options.method!=='GET')headers.Origin=origin;let body=options.body;if(body instanceof window.FormData){const native=new FormData();for(const [key,val] of body.entries()){if(typeof val==='string')native.append(key,val);else{const impl=Object.getOwnPropertySymbols(val).map(k=>val[k]).find(x=>x&&x._buffer);native.append(key,new Blob([impl._buffer]),val.name);}}body=native;}const r=await fetch(absolute,{...options,body,headers});const set=r.headers.getSetCookie();for(const c of set)jar.setCookieSync(c,absolute);return r;};
 }});
 const doc=dom.window.document,$=s=>doc.querySelector(s);
 const fill=(s,v)=>{assert($(s),'Missing '+s);$(s).value=v;$(s).dispatchEvent(new dom.window.Event('input',{bubbles:true}));};
 const click=s=>{assert($(s),'Missing '+s);$(s).click();};
 const submit=s=>$(s).dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
 const nav=async name=>{click('[data-page="'+name+'"]');await wait(()=>$('.nav button.on')?.dataset.page===name,'nav '+name);};
 async function login(id,pw){await wait(()=>$('#login'),'login form');fill('#id',id);fill('#pw',pw);$('#remember').checked=true;submit('#login');await wait(()=>$('.shell'),'logged in');}
 await wait(()=>$('#setup'),'setup');fill('#code',fs.readFileSync(path.join(dir,'setup-code.txt'),'utf8'));fill('#adminPw','adminpw');fill('#adminPw2','adminpw');submit('#setup');await login('admin','adminpw');
 await nav('manage');click('#add');await wait(()=>$('#entityForm'),'student modal');fill('#f_name','김하늘');fill('#f_home','담임');fill('#f_password','1234');assert.equal($('#f_id').value,'1101');submit('#entityForm');await wait(()=>!$('.modalbg')&&doc.body.textContent.includes('김하늘'),'student save');
 click('[data-edit="1101"]');fill('#f_name','김하늘수정');submit('#entityForm');await wait(()=>!$('.modalbg')&&doc.body.textContent.includes('김하늘수정'),'student edit');
 click('#importExcel');await wait(()=>$('#excelFile'),'import modal');Object.defineProperty($('#excelFile'),'files',{value:[new dom.window.File(['학년,반,번호,이름,담임교사,초기비밀번호\n2,7,10,일괄학생,담임,1234'], 'students.csv',{type:'text/csv'})]});click('#uploadExcel');await wait(()=>doc.body.textContent.includes('일괄학생'),'UI upload persisted');click('[data-close]');
 click('[data-tab="teachers"]');click('#add');fill('#f_id','t1');fill('#f_name','담임');fill('#f_password','1234');submit('#entityForm');await wait(()=>!$('.modalbg')&&doc.body.textContent.includes('t1'),'teacher save');
 click('[data-edit="t1"]');assert($('#resetPw'),'teacher reset button');click('#resetPw');await wait(()=>doc.body.textContent.includes('학교 기본 비밀번호로 초기화했습니다.'),'teacher reset');click('[data-close]');
 click('[data-tab="items"]');click('#add');fill('#f_value','새 점검');submit('#entityForm');await wait(()=>!$('.modalbg')&&doc.body.textContent.includes('새 점검'),'item save');
 await nav('check');fill('#sidInput','1101');click('#find');await wait(()=>!$('#checkForm').hidden,'student search');fill('#note','UI 통합 테스트 안내');submit('#checkForm');await wait(()=>$('.nav button.on')?.dataset.page==='records'&&$('[data-record]'),'checkin record');click('[data-record]');await wait(()=>$('#editNote'),'record modal');fill('#editNote','수정된 안내');
 click('#saveRecord');await wait(()=>!$('.modalbg')&&doc.body.textContent.includes('수정된 안내'),'record edit');
 await nav('report');await wait(()=>$('#summary')?.textContent.includes('1건'),'report query');assert($('#excelReport').href.includes('report.xlsx'));$('#repeatOnly').checked=true;$('#repeatOnly').dispatchEvent(new dom.window.Event('change',{bubbles:true}));fill('#customThreshold','1');click('#viewReport');await wait(()=>$('#summary').textContent.includes('1명'),'repeat query');
 await nav('manage');click('[data-tab="backup"]');assert($('a[href$="backup"]'),'backup link');assert($('#restore'),'restore button');
 click('#logout');await login('1101','1234');assert(!$('.nav [data-page="manage"]'));await nav('records');click('[data-record]');await wait(()=>$('#completeRecord'),'student detail');click('#completeRecord');await wait(()=>!$('.modalbg')&&doc.body.textContent.includes('완료'),'student complete');
 await nav('password');fill('#oldpw','1234');fill('#newpw','newpass');fill('#newpw2','newpass');submit('#passwordForm');await wait(()=>$('#login'),'password change logged out');await login('1101','newpass');
 click('#logout');await login('admin','adminpw');await nav('manage');click('[data-tab="backup"]');assert(!$('#confirmYear'),'no confirmation text field');fill('#yearPassword','adminpw');submit('#resetYear');await wait(()=>!!$('#add')&&!$('.main').textContent.includes('김하늘수정'),'password-only year reset');
 assert.equal(errors.length,0,errors.join('; '));console.log('UI DOM + HTTP flow passed: setup, account CRUD, item, record edit, report, repeat, backup controls, student completion, password');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(dom)dom.window.close();processServer.kill();await delay(500);fs.rmSync(dir,{recursive:true,force:true});});
