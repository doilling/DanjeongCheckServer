(function(){
var app=document.getElementById('app'),KEY='danjeong-v26';
var D=JSON.parse(localStorage.getItem(KEY)||'null')||{users:[{id:'1101',pw:'1234',name:'김하늘',role:'student',g:'1',c:'1',n:'1',home:'김은혜'},{id:'1102',pw:'1234',name:'박서연',role:'student',g:'1',c:'1',n:'2',home:'김은혜'},{id:'t100',pw:'1234',name:'이수연',role:'teacher'},{id:'admin',pw:'1234',name:'관리자',role:'admin'}],items:['명찰 미착용','실내화 미착용','교복 상의 규정 미준수'],records:[{id:1,sid:'1101',item:'명찰 미착용',note:'다음 등교일부터 명찰을 착용해 주세요.',status:'pending',teacher:'이수연',date:'2026-09-28'}],audit:[],reset:[]},S=JSON.parse(localStorage.getItem(KEY+'-session')||'null');
if(!D.reset)D.reset=[];if(!D.defaultStudentPw)D.defaultStudentPw='1234';if(!D.rules)D.rules=['학교 지정 교복과 명찰을 단정하게 착용합니다.','교내에서는 지정 실내화를 착용합니다.'];
function save(){localStorage.setItem(KEY,JSON.stringify(D));fetch('api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(D)}).catch(function(){toast('서버 저장에 실패했습니다.')})}
function xlsxReady(done){if(window.XLSX){done();return}var a=document.createElement('script');a.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';a.onload=done;a.onerror=function(){toast('Excel 모듈을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.')};document.head.append(a)}
function studentId(g,c,n){return String(g)+String(c)+String(n).padStart(2,'0')}
function downloadTemplate(kind){xlsxReady(function(){var rows=kind==='students'?[{학년:'1',반:'1',번호:'1',이름:'김하늘',담임교사:'김은혜',초기비밀번호:'1234'}]:[{교사아이디:'t101',이름:'김은혜',역할:'teacher',담당학년:'1',담당반:'1',초기비밀번호:'1234'}];var ws=XLSX.utils.json_to_sheet(rows),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'양식');XLSX.writeFile(wb,kind==='students'?'학생등록양식.xlsx':'교사등록양식.xlsx')})}
function importExcel(kind){var inp=document.createElement('input');inp.type='file';inp.accept='.xlsx,.xls';inp.onchange=function(){var f=inp.files[0];if(!f)return;xlsxReady(function(){var rd=new FileReader();rd.onload=function(ev){try{var wb=XLSX.read(ev.target.result,{type:'array'}),rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''}),created=0,updated=0,bad=[];rows.forEach(function(r,i){if(kind==='students'){var g=String(r['학년']||'').trim(),c=String(r['반']||'').trim(),n=String(r['번호']||'').trim(),name=String(r['이름']||'').trim();if(!g||!c||!n||!name){bad.push(i+2);return}var id=studentId(g,c,n),obj={id:id,name:name,role:'student',pw:String(r['초기비밀번호']||'1234'),g:g,c:c,n:n,home:String(r['담임교사']||'')},old=user(id);if(old){Object.assign(old,obj);updated++}else{D.users.push(obj);created++}}else{var tid=String(r['교사아이디']||'').trim(),tn=String(r['이름']||'').trim();if(!tid||!tn){bad.push(i+2);return}var tobj={id:tid,name:tn,role:String(r['역할']||'teacher'),pw:String(r['초기비밀번호']||'1234'),g:String(r['담당학년']||''),c:String(r['담당반']||'')},oldT=user(tid);if(oldT){Object.assign(oldT,tobj);updated++}else{D.users.push(tobj);created++}}});save();toast('신규 '+created+'건 / 수정 '+updated+'건 / 오류 '+bad.length+'건');manage(kind)}catch(ex){toast('Excel 양식을 확인해 주세요.')}};rd.readAsArrayBuffer(f)})};inp.click()}
function populateFilters(){var fg=q('#fg'),fc=q('#fc');if(!fg||!fc)return;var st=D.users.filter(function(x){return x.role==='student'}),gs=Array.from(new Set(st.map(function(x){return String(x.g||'')}).filter(Boolean))).sort();fg.innerHTML='<option value="">전체</option>'+gs.map(function(x){return '<option value="'+e(x)+'">'+e(x)+'학년</option>'}).join('');function fill(){var g=fg.value,cs=Array.from(new Set(st.filter(function(x){return !g||String(x.g)===g}).map(function(x){return String(x.c||'')}).filter(Boolean))).sort();fc.innerHTML='<option value="">전체</option>'+cs.map(function(x){return '<option value="'+e(x)+'">'+e(x)+'반</option>'}).join('')}fg.onchange=fill;fill()}function q(s){return document.querySelector(s)}function e(x){return String(x||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}function user(id){return D.users.find(function(x){return x.id===id})}function toast(x){var d=document.createElement('div');d.className='toast';d.textContent=x;document.body.appendChild(d);setTimeout(function(){d.remove()},2200)}function tag(s){return '<span class="tag '+s+'">'+(s==='done'?'완료':s==='review'?'재점검 필요':'확인 필요')+'</span>'}
function loadXlsx(done){
  if(window.XLSX){done();return}
  var sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
  sc.onload=done;sc.onerror=function(){toast('Excel 기능을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.')};
  document.head.appendChild(sc);
}
function exportXlsx(name,rows,sheet){
  loadXlsx(function(){
    if(!rows.length){toast('다운로드할 데이터가 없습니다.');return}
    var ws=XLSX.utils.json_to_sheet(rows);ws['!cols']=Object.keys(rows[0]).map(function(k){return {wch:Math.max(12,k.length*2+4)}});
    var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,sheet||'Sheet1');XLSX.writeFile(wb,name);
  });
}
function importXlsx(kind){
  var inp=document.createElement('input');inp.type='file';inp.accept='.xlsx,.xls,.csv';
  inp.onchange=function(){
    var f=inp.files[0];if(!f)return;loadXlsx(function(){
      var rd=new FileReader();rd.onload=function(ev){try{
        var wb=XLSX.read(ev.target.result,{type:'array'}),rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''}),ok=0,err=[];
        rows.forEach(function(r,i){
          if(kind==='student'){var id=String(r['학번']||'').trim(),name=String(r['이름']||'').trim();if(!id||!name||user(id)){err.push(i+2);return}D.users.push({id:id,name:name,role:'student',pw:String(r['초기비밀번호']||'1234'),g:String(r['학년']||''),c:String(r['반']||''),n:String(r['번호']||''),home:String(r['담임교사']||'')});ok++}
          if(kind==='teacher'){var tid=String(r['교사아이디']||'').trim(),tn=String(r['이름']||'').trim();if(!tid||!tn||user(tid)){err.push(i+2);return}D.users.push({id:tid,name:tn,role:'teacher',pw:String(r['초기비밀번호']||'1234')});ok++}
        });save();toast('등록 '+ok+'건 / 오류 행 '+(err.join(',')||'없음'));manage(kind==='student'?'students':'teachers');
      }catch(ex){toast('Excel 파일 형식을 확인해 주세요.')}};rd.readAsArrayBuffer(f);
    });
  };inp.click();
}
function templateXlsx(kind){
  var rows=kind==='student'?[{학번:'1101',이름:'김하늘',학년:'1',반:'1',번호:'1',담임교사:'김은혜',초기비밀번호:'1234'}]:[{교사아이디:'t101',이름:'김은혜',역할:'교사',담당학년:'1',담당반:'1',초기비밀번호:'1234'}];
  exportXlsx(kind==='student'?'학생등록양식.xlsx':'교사등록양식.xlsx',rows,'양식');
}
function login(){
  app.innerHTML='<main class="login"><section class="card"><div class="brand"><img class="school-logo" src="assets/school-logo.png" alt="데레사여자고등학교 교표"><h1>단정체크</h1><p>데레사여자고등학교 · 로컬 시연판</p></div><form id="login"><label>학번 또는 교사 아이디</label><input id="id" required><label>비밀번호</label><input id="pw" type="password" required><label><input id="remember" type="checkbox" style="width:auto"> 이 기기에서 로그인 유지</label><button class="btn primary full">로그인</button></form><div class="hint">로그인 정보가 없거나 비밀번호를 잊은 경우 관리자 또는 담임교사에게 문의하세요.</div></section></main>';
  q('#login').onsubmit=function(ev){ev.preventDefault();var u=user(q('#id').value.trim());if(!u||u.pw!==q('#pw').value){toast('아이디 또는 비밀번호를 확인해 주세요.');return}S={id:u.id,pw:u.pw,name:u.name,role:u.role,g:u.g,c:u.c,n:u.n,home:u.home};if(q('#remember').checked)localStorage.setItem(KEY+'-session',JSON.stringify(S));render('home')};
}
function shell(page,body){var nav=S.role==='student'?[['home','홈'],['records','내 안내'],['password','비밀번호 변경']]:S.role==='teacher'?[['home','대시보드'],['check','점검 등록'],['records','지도 내역'],['reset','학생 비밀번호 초기화'],['password','비밀번호 변경']]:[['home','대시보드'],['check','점검 등록'],['manage','관리자 설정'],['records','지도 내역'],['report','기간별 보고서'],['password','비밀번호 변경']];app.innerHTML='<div class="shell"><aside class="side"><div class="side-brand"><img class="side-logo" src="assets/school-logo.png" alt="데레사여자고등학교 교표"><div><b>단정체크</b><small>데레사여자고등학교</small></div></div><nav class="nav">'+nav.map(function(x){return '<button data-page="'+x[0]+'" class="'+(page===x[0]?'on':'')+'">'+x[1]+'</button>'}).join('')+'</nav><button id="logout" class="btn outline" style="margin:14px 8px;width:calc(100% - 16px)">로그아웃</button></aside><main class="main">'+body+'</main></div>';document.querySelectorAll('[data-page]').forEach(function(b){b.onclick=function(){render(b.dataset.page)}});q('#logout').onclick=function(){localStorage.removeItem(KEY+'-session');S=null;login()}}
function head(t,p,a){return '<header class="head"><div><h2>'+t+'</h2><p>'+p+'</p></div>'+(a||'')+'</header>'}
function student(){var r=D.records.filter(function(x){return x.sid===S.id});shell('home',head('안녕하세요, '+e(S.name)+' 학생','복장 안내를 확인해 주세요.')+'<div class="grid three"><section class="card metric"><small>전체 안내</small><b>'+r.length+'</b></section><section class="card metric"><small>처리 중</small><b>'+r.filter(function(x){return x.status!=='done'}).length+'</b></section><section class="card metric"><small>완료</small><b>'+r.filter(function(x){return x.status==='done'}).length+'</b></section></div>')}
function teacher(){shell('home',head(S.name+' 선생님','학생 학번을 검색하여 지도 내역을 등록합니다.','<button id="go" class="btn primary">+ 점검 등록</button>')+'<section class="card"><h3>빠른 안내</h3><p>학번 검색 후 점검 항목과 안내 내용을 등록할 수 있습니다.</p></section>');q('#go').onclick=function(){render('check')}}
function check(){shell('check',head('복장 점검 등록','같은 학생을 반복 검색할 수 있습니다.')+'<section class="card"><label>학번 검색</label><div class="search"><input id="sidInput" placeholder="예: 1101"><button id="find" type="button" class="btn soft">검색</button></div><div id="found" class="found">학생을 검색해 주세요.</div><form id="form" style="display:none"><input type="hidden" id="sid"><label>점검 항목</label><select id="item">'+D.items.map(function(x){return '<option>'+e(x)+'</option>'}).join('')+'</select><label>안내 내용</label><textarea id="note">다음 등교일부터 복장 규정을 확인해 주세요.</textarea><button class="btn primary" style="margin-top:12px">등록</button></form></section>');var find=function(){var x=user(q('#sidInput').value.trim());q('#form').style.display='none';if(!x||x.role!=='student'){q('#found').textContent='등록되지 않은 학번입니다.';return}q('#found').innerHTML='<b>'+x.id+' · '+e(x.name)+'</b><br><small>'+x.g+'학년 '+x.c+'반 '+x.n+'번 · 담임 '+e(x.home)+'</small>';q('#sid').value=x.id;q('#form').style.display='block'};q('#find').onclick=find;q('#sidInput').onkeydown=function(ev){if(ev.key==='Enter'){ev.preventDefault();find()}};q('#form').onsubmit=function(ev){ev.preventDefault();D.records.push({id:Date.now(),sid:q('#sid').value,item:q('#item').value,note:q('#note').value,status:'pending',teacher:S.name,date:new Date().toISOString().slice(0,10)});save();toast('지도 내역을 등록했습니다.');render('records')}}
function filterStudentRecords(list){
  var g=q('#fg')?q('#fg').value:'',c=q('#fc')?q('#fc').value:'',term=(q('#fstudent')?q('#fstudent').value:'').trim();
  return list.filter(function(x){var st=user(x.sid);return (!g||(st&&st.g===g))&&(!c||(st&&st.c===c))&&(!term||(st&&((st.id||'').indexOf(term)>=0||(st.name||'').indexOf(term)>=0)))});
}
function records(){
  var all=S.role==='student'?D.records.filter(function(x){return x.sid===S.id}):D.records;
  var controls=S.role==='student'?'':'<div class="grid two"><div><label>학년</label><select id="fg"><option value="">전체</option><option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option></select></div><div><label>학반</label><select id="fc"><option value="">전체</option><option value="1">1반</option><option value="2">2반</option><option value="3">3반</option><option value="4">4반</option><option value="5">5반</option></select></div><div><label>학생 검색</label><input id="fstudent" placeholder="이름 또는 학번"></div><div><label>시작일</label><input id="from" type="date"></div><div><label>종료일</label><input id="to" type="date"></div></div><button id="filter" class="btn soft" style="margin-top:12px">조회</button>';
  shell('records',head(S.role==='student'?'내 안내':'지도 내역',S.role==='student'?'지도 내용을 선택하여 상세 안내를 확인할 수 있습니다.':'학년·학반·학생 이름 또는 학번·기간으로 조회합니다.')+'<section class="card">'+controls+'<div id="rows" style="margin-top:14px"></div></section>');
  function show(list){
    q('#rows').innerHTML=list.map(function(x){var st=user(x.sid);if(S.role==='student')return '<div class="row"><div><b>'+e(x.item)+'</b><small>'+x.date+' · '+e(x.teacher)+'</small><p>'+e(x.note)+'</p></div><div>'+tag(x.status)+'<br><button class="btn soft" style="margin-top:8px" data-view="'+x.id+'">지도 내용 확인</button></div></div>';return '<div class="row"><div><b>'+e(st?st.name:'학생')+' · '+e(x.item)+'</b><small>'+x.date+' · '+e(x.teacher)+'</small><p>'+e(x.note)+'</p></div>'+tag(x.status)+'</div>'}).join('')||'<div class="hint">조회된 기록이 없습니다.</div>';
    if(S.role==='student')document.querySelectorAll('[data-view]').forEach(function(b){b.onclick=function(){openStudentRecord(Number(b.dataset.view))}});
  }
  show(all);
  if(S.role!=='student')q('#filter').onclick=function(){var f=q('#from').value,t=q('#to').value,r=filterStudentRecords(all).filter(function(x){return (!f||x.date>=f)&&(!t||x.date<=t)});show(r)};
}
function openStudentRecord(id){
  var x=D.records.find(function(r){return r.id===id});if(!x)return;
  var m=document.createElement('div');m.className='modalbg';
  m.innerHTML='<div class="modal"><h3>복장 안내 상세</h3><label>점검 항목</label><div class="hint">'+e(x.item)+'</div><label>등록 일자</label><div class="hint">'+e(x.date)+'</div><label>지도교사</label><div class="hint">'+e(x.teacher)+'</div><label>안내 내용</label><div class="hint">'+e(x.note)+'</div><label>처리 상태</label><div class="hint">'+tag(x.status)+'</div><div class="actions">'+(x.status!=='done'?'<button id="completeRecord" class="btn primary">교정 완료</button>':'')+'<button id="closeRecord" class="btn outline">닫기</button></div></div>';
  document.body.append(m);
  q('#closeRecord').onclick=function(){m.remove()};
  if(x.status!=='done')q('#completeRecord').onclick=function(){x.status='done';save();m.remove();toast('교정 완료로 처리했습니다.');records()};
}
function manage(tab){
  tab=tab||'students';
  var tabs=[['students','학생 관리'],['teachers','교사 관리'],['items','점검 항목'],['password','관리자 비밀번호'],['backup','백업·학년도 초기화']];
  var title='',heads=[],rows=[];
  if(tab==='students'){title='학생 관리';heads=['학번','이름','학년','반','번호','담임'];rows=D.users.filter(function(x){return x.role==='student'}).map(function(x){return [x.id,x.name,x.g,x.c,x.n,x.home,x.id]})}
  if(tab==='teachers'){title='교사 관리';heads=['아이디','이름','역할'];rows=D.users.filter(function(x){return x.role!=='student'}).map(function(x){return [x.id,x.name,x.role,x.id]})}
  if(tab==='items'){title='점검 항목 관리';heads=['점검 항목'];rows=D.items.map(function(x,i){return [x,i]})}
  if(tab==='backup'){
    shell('manage',head('관리자 설정','전체 자료를 백업하거나 새 학년도를 위해 데이터를 초기화합니다.')+'<div class="tabs">'+tabs.map(function(x){return '<button data-tab="'+x[0]+'" class="'+(tab===x[0]?'on':'')+'">'+x[1]+'</button>'}).join('')+'</div><section class="card"><h3>전체 자료 백업</h3><p>학생·교사·점검항목·지도내역·설정·초기화 이력을 JSON 파일로 저장합니다.</p><button id="backupDownload" class="btn primary">전체 자료 백업 다운로드</button><label style="margin-top:20px">백업 파일 복원</label><input id="backupUpload" type="file" accept=".json"><button id="restoreBackup" class="btn soft" style="margin-top:10px">백업 파일 복원</button></section><section class="card" style="margin-top:16px"><h3>학년도 데이터 초기화</h3><p>현재 로그인한 관리자 계정은 유지하고, 학생·교사·지도내역·초기화 이력을 삭제합니다.</p><button id="yearReset" class="btn danger">새 학년도 데이터 초기화</button></section>');
    document.querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){manage(b.dataset.tab)}});
    q('#backupDownload').onclick=function(){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(D,null,2)],{type:'application/json'}));a.download='단정체크_전체백업_'+new Date().toISOString().slice(0,10)+'.json';a.click()};
    q('#restoreBackup').onclick=function(){var f=q('#backupUpload').files[0];if(!f)return toast('복원할 백업 JSON 파일을 선택해 주세요.');if(!confirm('현재 데이터가 백업 파일 내용으로 교체됩니다. 계속하시겠습니까?'))return;var rd=new FileReader();rd.onload=function(ev){try{var obj=JSON.parse(ev.target.result);if(!obj.users||!obj.items||!obj.records)throw new Error();D=obj;save();toast('백업 자료를 복원했습니다.');manage('backup')}catch(ex){toast('올바른 단정체크 백업 파일이 아닙니다.')}};rd.readAsText(f,'utf-8')};
    q('#yearReset').onclick=function(){if(!confirm('새 학년도 초기화를 실행하시겠습니까? 학생·교사·지도내역이 삭제됩니다. 먼저 백업을 권장합니다.'))return;var admin=user(S.id);D={users:[admin],items:['명찰 미착용','실내화 미착용','교복 상의 규정 미준수'],rules:['학교 지정 교복과 명찰을 단정하게 착용합니다.'],records:[],audit:[],reset:[],defaultStudentPw:D.defaultStudentPw||'1234'};save();toast('새 학년도 데이터 초기화가 완료되었습니다.');manage('students')};
    return;
  }
  if(tab==='password'){
    shell('manage',head('관리자 설정','관리자 비밀번호를 변경합니다.')+'<div class="tabs">'+tabs.map(function(x){return '<button data-tab="'+x[0]+'" class="'+(tab===x[0]?'on':'')+'">'+x[1]+'</button>'}).join('')+'</div><section class="card"><h3>관리자 비밀번호 변경</h3><label>현재 비밀번호</label><input id="oldpw" type="password"><label>새 비밀번호</label><input id="newpw" type="password"><label>새 비밀번호 확인</label><input id="newpw2" type="password"><label>학생 비밀번호 초기화 기본값</label><input id="defaultStudentPw" value="'+e(D.defaultStudentPw)+'"><button id="changePw" class="btn primary" style="margin-top:13px">비밀번호 변경</button></section>');
    document.querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){manage(b.dataset.tab)}});
    q('#changePw').onclick=function(){var me=user(S.id);if(q('#oldpw').value!==me.pw)return toast('현재 비밀번호가 일치하지 않습니다.');if(!q('#newpw').value||q('#newpw').value!==q('#newpw2').value)return toast('새 비밀번호와 확인 값이 일치하지 않습니다.');me.pw=q('#newpw').value;S.pw=me.pw;D.defaultStudentPw=q('#defaultStudentPw').value||D.defaultStudentPw;save();localStorage.removeItem(KEY+'-session');toast('비밀번호가 변경되었습니다. 다시 로그인해 주세요.');setTimeout(function(){S=null;login()},700)};return;
  }
  var table='<table class="table"><thead><tr>'+heads.map(function(h){return '<th>'+h+'</th>'}).join('')+'<th>관리</th></tr></thead><tbody>'+rows.map(function(r){var key=r[r.length-1],data=r.slice(0,-1);return '<tr>'+data.map(function(v){return '<td>'+e(v)+'</td>'}).join('')+'<td><button class="btn soft" data-edit="'+key+'">수정</button> <button class="btn danger" data-del="'+key+'">삭제</button></td></tr>'}).join('')+'</tbody></table>';
  shell('manage',head('관리자 설정','학생·교사·점검 항목을 직접 관리합니다.')+'<div class="tabs">'+tabs.map(function(x){return '<button data-tab="'+x[0]+'" class="'+(tab===x[0]?'on':'')+'">'+x[1]+'</button>'}).join('')+'</div><section class="card"><div class="head"><div><h3>'+title+'</h3><p>개별 추가·수정·삭제가 가능합니다.</p></div><button id="addEntity" class="btn primary">+ 추가</button></div><div style="overflow:auto">'+table+'</div></section>');
  document.querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){manage(b.dataset.tab)}});
  q('#addEntity').onclick=function(){entityModal(tab,null)};
  if(tab==='students'||tab==='teachers'){
    var host=q('#addEntity').parentElement;
    var wrap=document.createElement('span');
    wrap.innerHTML='<button id="templateExcel" class="btn soft">Excel 양식</button> <button id="importExcel" class="btn soft">Excel 업로드</button> ';
    host.insertBefore(wrap,q('#addEntity'));
    q('#templateExcel').onclick=function(){downloadTemplate(tab)};
    q('#importExcel').onclick=function(){importExcel(tab)};
  }
  document.querySelectorAll('[data-edit]').forEach(function(b){b.onclick=function(){entityModal(tab,b.dataset.edit)}});
  document.querySelectorAll('[data-del]').forEach(function(b){b.onclick=function(){removeEntity(tab,b.dataset.del)}});
}
function entityModal(type,key){
  var old=null;if(key!==null){if(type==='students'||type==='teachers')old=user(key);if(type==='items')old={value:D.items[Number(key)]}}
  var body='';
  if(type==='students'){old=old||{id:'',name:'',g:'1',c:'1',n:'1',home:'',pw:'1234'};body='<div class="formgrid"><div><label>학번</label><input id="f_id" '+(key!==null?'readonly':'')+' value="'+e(old.id)+'"></div><div><label>이름</label><input id="f_name" value="'+e(old.name)+'"></div><div><label>학년</label><input id="f_g" value="'+e(old.g)+'"></div><div><label>반</label><input id="f_c" value="'+e(old.c)+'"></div><div><label>번호</label><input id="f_n" value="'+e(old.n)+'"></div><div><label>담임교사</label><input id="f_home" value="'+e(old.home)+'"></div><div class="wide"><label>비밀번호</label><input id="f_pw" value="'+e(old.pw)+'"></div></div>'}
  if(type==='teachers'){old=old||{id:'',name:'',role:'teacher',pw:'1234'};body='<label>교사 아이디</label><input id="f_id" '+(key!==null?'readonly':'')+' value="'+e(old.id)+'"><label>이름</label><input id="f_name" value="'+e(old.name)+'"><label>역할</label><select id="f_role"><option value="teacher">교사</option><option value="admin">관리자</option></select><label>비밀번호</label><input id="f_pw" value="'+e(old.pw)+'">'}
  if(type==='items')body='<label>점검 항목</label><textarea id="f_value">'+e(old?old.value:'')+'</textarea>';
  var m=document.createElement('div');m.className='modalbg';m.innerHTML='<div class="modal"><h3>'+({students:'학생',teachers:'교사',items:'점검 항목'})[type]+' '+(key===null?'추가':'수정')+'</h3>'+body+'<div class="actions">'+(type==='students'&&key!==null?'<button id="resetStudentPw" class="btn danger">비밀번호 초기화</button>':'')+'<button id="cancel" class="btn outline">취소</button><button id="saveEntity" class="btn primary">저장</button></div></div>';document.body.append(m);
  if(type==='teachers'&&old)q('#f_role').value=old.role||'teacher';
  q('#cancel').onclick=function(){m.remove()};
  if(type==='students'&&key!==null){
    q('#resetStudentPw').onclick=function(){
      var st=user(key);
      if(!confirm(st.name+' 학생의 비밀번호를 학교 기본 초기 비밀번호로 초기화하시겠습니까?'))return;
      st.pw=D.defaultStudentPw||'1234';
      if(!D.reset)D.reset=[];
      D.reset.push({id:Date.now(),sid:st.id,name:st.name,processor:S.name,date:new Date().toISOString().slice(0,10),status:'관리자 초기화'});
      save();
      toast(st.name+' 학생의 비밀번호를 초기화했습니다.');
    };
  }
  q('#saveEntity').onclick=function(){
    if(type==='students'){var id=q('#f_id').value.trim(),name=q('#f_name').value.trim();if(!id||!name)return toast('학번과 이름을 입력해 주세요.');if(key===null&&user(id))return toast('이미 등록된 학번입니다.');var x=key===null?{id:id,role:'student'}:user(key);x.name=name;x.g=q('#f_g').value;x.c=q('#f_c').value;x.n=q('#f_n').value;x.home=q('#f_home').value;x.pw=q('#f_pw').value||'1234';if(key===null)D.users.push(x)}
    if(type==='teachers'){var tid=q('#f_id').value.trim(),tn=q('#f_name').value.trim();if(!tid||!tn)return toast('교사 아이디와 이름을 입력해 주세요.');if(key===null&&user(tid))return toast('이미 등록된 아이디입니다.');var t=key===null?{id:tid}:user(key);t.name=tn;t.role=q('#f_role').value;t.pw=q('#f_pw').value||'1234';if(key===null)D.users.push(t)}
    if(type==='items'){var iv=q('#f_value').value.trim();if(!iv)return toast('점검 항목을 입력해 주세요.');if(key===null)D.items.push(iv);else D.items[Number(key)]=iv}
    save();m.remove();manage(type);
  };
}
function removeEntity(type,key){
  if(!confirm('정말 삭제할까요?'))return;
  if(type==='students'){D.users=D.users.filter(function(x){return x.id!==key});D.records=D.records.filter(function(x){return x.sid!==key})}
  if(type==='teachers'){var t=user(key);if(t&&t.id===S.id)return toast('현재 로그인한 관리자 계정은 삭제할 수 없습니다.');D.users=D.users.filter(function(x){return x.id!==key})}
  if(type==='items')D.items.splice(Number(key),1);
  save();manage(type);
}
function report(){
  var today=new Date().toISOString().slice(0,10);
  shell('report',head('기간별 지도 결과','학년·학반·학생 조건과 기간을 설정해 일반 또는 반복 지도 결과만 조회합니다.')+
  '<section class="card"><div class="grid two"><div><label>학년</label><select id="fg"><option value="">전체</option><option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option></select></div><div><label>학반</label><select id="fc"><option value="">전체</option><option value="1">1반</option><option value="2">2반</option><option value="3">3반</option><option value="4">4반</option><option value="5">5반</option></select></div><div><label>학생 검색</label><input id="fstudent" placeholder="이름 또는 학번"></div><div><label>시작일</label><input id="rf" type="date" value="'+today+'"></div><div><label>종료일</label><input id="rt" type="date" value="'+today+'"></div></div><label style="margin-top:16px"><input id="repeatOnly" type="checkbox" style="width:auto"> 반복 지도 학생만 보기</label><div id="thresholdBox" style="display:none"><div class="grid two"><div><label>기준 횟수</label><select id="threshold"><option value="5">5회 이상</option><option value="10">10회 이상</option><option value="15">15회 이상</option></select></div><div><label>직접 입력</label><input id="customThreshold" type="number" min="1" placeholder="예: 7"></div></div></div><button id="rview" class="btn soft" style="margin-top:12px">조회</button> <button id="rexcel" class="btn primary">Excel 다운로드</button><div id="rsummary" class="hint" style="margin-top:14px"></div><div id="rrows" style="margin-top:12px"></div></section>');
  populateFilters();
  var result=[],repeatRows=[],modeRepeat=false;
  function query(){
    var f=q('#rf').value,t=q('#rt').value;modeRepeat=q('#repeatOnly').checked;
    result=filterStudentRecords(D.records).filter(function(x){return (!f||x.date>=f)&&(!t||x.date<=t)});
    if(!modeRepeat){
      q('#rsummary').textContent='일반 지도 결과: '+result.length+'건';
      q('#rrows').innerHTML='<table class="table"><tr><th>학번</th><th>이름</th><th>일자</th><th>항목</th><th>지도교사</th><th>상태</th></tr>'+result.map(function(x){return '<tr><td>'+x.sid+'</td><td>'+e(user(x.sid)?.name||'')+'</td><td>'+x.date+'</td><td>'+e(x.item)+'</td><td>'+e(x.teacher)+'</td><td>'+x.status+'</td></tr>'}).join('')+(result.length?'':'<tr><td colspan="6" style="text-align:center;color:#706a7a;padding:20px">조회된 지도 내역이 없습니다.</td></tr>')+'</table>';return;
    }
    var n=Number(q('#customThreshold').value)||Number(q('#threshold').value),m={};
    result.forEach(function(x){m[x.sid]=(m[x.sid]||0)+1});
    repeatRows=Object.keys(m).filter(function(id){return m[id]>=n}).map(function(id){var st=user(id),his=result.filter(function(x){return x.sid===id}).sort(function(a,b){return b.date.localeCompare(a.date)});return {학번:id,이름:st?st.name:'',학년:st?st.g:'',반:st?st.c:'',담임교사:st?st.home:'',지도횟수:m[id],최근지도일:his[0]?his[0].date:'',최근지도항목:his[0]?his[0].item:''}});
    q('#rsummary').textContent='반복 지도 학생 결과: '+repeatRows.length+'명 · 기준 '+n+'회 이상';
    q('#rrows').innerHTML='<table class="table"><tr><th>학번</th><th>이름</th><th>학년/반</th><th>지도 횟수</th><th>최근 지도일</th><th>최근 항목</th></tr>'+repeatRows.map(function(x){return '<tr><td>'+x.학번+'</td><td>'+e(x.이름)+'</td><td>'+x.학년+'/'+x.반+'</td><td>'+x.지도횟수+'</td><td>'+x.최근지도일+'</td><td>'+e(x.최근지도항목)+'</td></tr>'}).join('')+(repeatRows.length?'':'<tr><td colspan="6" style="text-align:center;color:#706a7a;padding:20px">해당 학생이 없습니다.</td></tr>')+'</table>';
  }
  q('#repeatOnly').onchange=function(){q('#thresholdBox').style.display=this.checked?'block':'none'};query();q('#rview').onclick=query;
  q('#rexcel').onclick=function(){if(modeRepeat){exportXlsx('단정체크_반복지도학생.xlsx',repeatRows.map(function(x){return {학년:x.학년||'',반:x.반||'',번호:user(x.학번)?.n||'',이름:x.이름||'',담임교사:x.담임교사||'',지도횟수:x.지도횟수||'',최근지도일:x.최근지도일||'',최근지도항목:x.최근지도항목||''}}),'반복지도학생')}else{exportXlsx('단정체크_지도결과.xlsx',result.map(function(x){return {학년:user(x.sid)?.g||'',반:user(x.sid)?.c||'',번호:user(x.sid)?.n||'',이름:user(x.sid)?.name||'',일자:x.date,점검항목:x.item,안내내용:x.note,지도교사:x.teacher,처리상태:x.status}}),'지도결과')}};
}
function repeat(){var m={};D.records.forEach(function(x){m[x.sid]=(m[x.sid]||0)+1});shell('repeat',head('반복 지도 현황','기준 횟수 이상 학생을 확인합니다.')+'<section class="card"><label>기준 횟수</label><select id="n"><option value="5">5회 이상</option><option value="10">10회 이상</option><option value="15">15회 이상</option><option value="1">1회 이상</option></select><button id="run" class="btn primary" style="margin-top:12px">조회</button><div id="result" class="hint"></div></section>');q('#run').onclick=function(){var n=+q('#n').value;var a=Object.keys(m).filter(function(id){return m[id]>=n}).map(function(id){return e(user(id).name)+' · '+m[id]+'회'}).join('<br>')||'해당 학생이 없습니다.';q('#result').innerHTML=a;q('#repeatExcel').onclick=function(){var rows=Object.keys(m).filter(function(id){return m[id]>=n}).map(function(id){var st=user(id);return {학번:id,이름:st?st.name:'',학년:st?st.g:'',반:st?st.c:'',담임교사:st?st.home:'',지도횟수:m[id]}});exportXlsx('단정체크_반복지도학생_'+n+'회이상.xlsx',rows,'반복지도')}}}
function reset(){
  var list=D.users.filter(function(x){return x.role==='student'});
  shell('reset',head('학생 비밀번호 초기화','담당교사 또는 관리자가 학생 비밀번호를 학교 기본 초기 비밀번호로 초기화합니다.')+
  '<section class="card"><div class="hint">교사와 관리자는 학생 이름 또는 학번으로 검색한 뒤 비밀번호를 초기화할 수 있습니다.</div><label>학생 검색</label><div class="search"><input id="resetSearch" placeholder="이름 또는 학번"><button id="resetFind" class="btn soft" type="button">검색</button></div><div id="resetTable" style="margin-top:14px"></div></section>');
  function drawResetRows(rows){
    q('#resetTable').innerHTML='<table class="table"><tr><th>학번</th><th>이름</th><th>학년/반</th><th>담임</th><th>처리</th></tr>'+rows.map(function(st){return '<tr><td>'+st.id+'</td><td>'+e(st.name)+'</td><td>'+st.g+'/'+st.c+'</td><td>'+e(st.home||'')+'</td><td><button class="btn primary" data-pwreset="'+st.id+'">비밀번호 초기화</button></td></tr>'}).join('')+(rows.length?'':'<tr><td colspan="5" style="text-align:center;padding:18px;color:#706a7a">검색 결과가 없습니다.</td></tr>')+'</table>';
    document.querySelectorAll('[data-pwreset]').forEach(function(b){b.onclick=function(){var st=user(b.dataset.pwreset);if(!confirm(st.name+' 학생의 비밀번호를 초기화하시겠습니까?'))return;st.pw=D.defaultStudentPw;D.reset.push({id:Date.now(),sid:st.id,name:st.name,processor:S.name,date:new Date().toISOString().slice(0,10),status:'초기화 완료'});save();toast(st.name+' 학생의 비밀번호를 초기화했습니다.')}});
  }
  drawResetRows(list);
  q('#resetFind').onclick=function(){var term=q('#resetSearch').value.trim();drawResetRows(list.filter(function(st){return !term||st.id.indexOf(term)>=0||st.name.indexOf(term)>=0}))};
  q('#resetSearch').onkeydown=function(ev){if(ev.key==='Enter'){ev.preventDefault();q('#resetFind').click()}};
  /* legacy handler kept below for compatibility */
  document.querySelectorAll('[data-pwreset]').forEach(function(b){b.onclick=function(){var st=user(b.dataset.pwreset);if(!confirm(st.name+' 학생의 비밀번호를 초기화하시겠습니까?'))return;st.pw=D.defaultStudentPw;D.reset.push({id:Date.now(),sid:st.id,name:st.name,processor:S.name,date:new Date().toISOString().slice(0,10),status:'초기화 완료'});save();toast(st.name+' 학생의 비밀번호를 초기화했습니다.')}});
}
function passwordPage(){
  shell('password',head('비밀번호 변경','본인 계정의 비밀번호를 변경합니다.')+'<section class="card"><label>현재 비밀번호</label><input id="ownOld" type="password"><label>새 비밀번호</label><input id="ownNew" type="password"><label>새 비밀번호 확인</label><input id="ownNew2" type="password"><button id="ownChange" class="btn primary" style="margin-top:13px">비밀번호 변경</button></section>');
  q('#ownChange').onclick=function(){var me=user(S.id);if(q('#ownOld').value!==me.pw)return toast('현재 비밀번호가 일치하지 않습니다.');if(!q('#ownNew').value||q('#ownNew').value!==q('#ownNew2').value)return toast('새 비밀번호와 확인 값이 일치하지 않습니다.');me.pw=q('#ownNew').value;save();localStorage.removeItem(KEY+'-session');toast('비밀번호가 변경되었습니다. 다시 로그인해 주세요.');setTimeout(function(){S=null;login()},600)};
}

function render(page){if(!S){login();return}if(S.role==='student'){if(page==='records')records();else if(page==='password')passwordPage();else student();return}if(S.role==='teacher'){if(page==='check')check();else if(page==='records')records();else if(page==='reset')reset();else if(page==='password')passwordPage();else teacher();return}if(page==='check')check();else if(page==='password')passwordPage();else if(page==='manage')manage();else if(page==='records')records();else if(page==='report')report();else if(page==='reset')reset();else if(page==='repeat')repeat();else shell('home',head('관리자 대시보드','로컬 시연 데이터를 관리합니다.')+'<div class="grid three"><section class="card metric"><small>학생</small><b>'+D.users.filter(function(x){return x.role==='student'}).length+'</b></section><section class="card metric"><small>교사</small><b>'+D.users.filter(function(x){return x.role!=='student'}).length+'</b></section><section class="card metric"><small>지도 기록</small><b>'+D.records.length+'</b></section></div>')}
try{render()}catch(err){app.innerHTML='<div style="padding:30px;color:#a00">오류: '+e(err.message)+'</div>'}
}());