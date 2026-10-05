const express=require('express'),Database=require('better-sqlite3'),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),path=require('path'),fs=require('fs'),XLSX=require('xlsx');
const app=express(),PORT=Number(process.env.PORT||8787),SECRET=process.env.JWT_SECRET||'CHANGE_ME',DIR=process.env.DATA_DIR||path.join(__dirname,'data');
fs.mkdirSync(DIR,{recursive:true});const db=new Database(path.join(DIR,'danjeongcheck.db'));db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL,grade TEXT,class_no TEXT,number_no TEXT,homeroom TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS rules(id INTEGER PRIMARY KEY AUTOINCREMENT,body TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS records(id INTEGER PRIMARY KEY AUTOINCREMENT,student_id TEXT NOT NULL,item_id INTEGER NOT NULL,note TEXT,status TEXT DEFAULT 'pending',teacher_id TEXT NOT NULL,record_date TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS audit_logs(id INTEGER PRIMARY KEY AUTOINCREMENT,actor_id TEXT,action TEXT,target_type TEXT,target_id TEXT,before_json TEXT,after_json TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS app_settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);`);
if(!db.prepare('SELECT 1 FROM items LIMIT 1').get())['명찰 미착용','실내화 미착용','교복 상의 규정 미준수'].forEach(x=>db.prepare('INSERT INTO items(name) VALUES(?)').run(x));
app.use(express.json({limit:'10mb'}));app.use(express.static(path.join(__dirname,'public')));
const pub=u=>({id:u.id,name:u.name,role:u.role,grade:u.grade,classNo:u.class_no,numberNo:u.number_no,homeroom:u.homeroom});
function auth(req,res,next){try{req.user=jwt.verify((req.headers.authorization||'').replace('Bearer ',''),SECRET);next()}catch{res.status(401).json({message:'로그인이 필요합니다.'})}}
function role(...r){return(req,res,next)=>r.includes(req.user.role)?next():res.status(403).json({message:'권한이 없습니다.'})}
function log(actor,action,type,id,before,after){db.prepare('INSERT INTO audit_logs(actor_id,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?)').run(actor,action,type,String(id||''),JSON.stringify(before||null),JSON.stringify(after||null))}
app.get('/api/health',(req,res)=>res.json({ok:true,port:PORT}));
app.get('/api/setup-status',(req,res)=>res.json({needsSetup:!db.prepare("SELECT 1 FROM users WHERE role='admin' LIMIT 1").get()}));
app.post('/api/setup',(req,res)=>{const {id,name,password}=req.body;if(db.prepare("SELECT 1 FROM users WHERE role='admin'").get())return res.status(409).json({message:'관리자가 이미 설정되었습니다.'});if(!id||!name||!password)return res.status(400).json({message:'필수값을 입력하세요.'});db.prepare('INSERT INTO users(id,name,password,role) VALUES(?,?,?,?)').run(id,name,bcrypt.hashSync(password,10),'admin');res.json({ok:true})});
app.post('/api/login',(req,res)=>{const u=db.prepare('SELECT * FROM users WHERE id=?').get(String(req.body.id||''));if(!u||!bcrypt.compareSync(String(req.body.password||''),u.password))return res.status(401).json({message:'아이디 또는 비밀번호를 확인하세요.'});res.json({token:jwt.sign(pub(u),SECRET,{expiresIn:'12h'}),user:pub(u)})});
app.get('/api/students',auth,role('teacher','admin'),(req,res)=>{const q=String(req.query.q||'');const rows=db.prepare("SELECT id,name,grade,class_no,number_no,homeroom FROM users WHERE role='student' AND (id LIKE ? OR name LIKE ?) ORDER BY grade,class_no,number_no").all('%'+q+'%','%'+q+'%');res.json(rows.map(pub))});
app.get('/api/items',auth,(req,res)=>res.json(db.prepare('SELECT * FROM items WHERE active=1 ORDER BY id').all()));
app.post('/api/records',auth,role('teacher','admin'),(req,res)=>{const p=req.body,s=db.prepare("SELECT * FROM users WHERE id=? AND role='student'").get(p.studentId);if(!s)return res.status(400).json({message:'학생을 찾을 수 없습니다.'});const i=db.prepare('SELECT * FROM items WHERE id=?').get(p.itemId);if(!i)return res.status(400).json({message:'점검 항목을 찾을 수 없습니다.'});const x=db.prepare('INSERT INTO records(student_id,item_id,note,status,teacher_id,record_date) VALUES(?,?,?,?,?,?)').run(s.id,i.id,p.note||'',p.status||'pending',req.user.id,p.recordDate||new Date().toISOString().slice(0,10));log(req.user.id,'CREATE','record',x.lastInsertRowid,null,p);res.json({ok:true,id:x.lastInsertRowid})});
app.get('/api/reports',auth,role('teacher','admin'),(req,res)=>{const {from='',to='',grade='',classNo='',q='',repeatOnly='',threshold='5'}=req.query;let rows=db.prepare(`SELECT r.*,s.name student_name,s.grade,s.class_no,s.number_no,s.homeroom,i.name item_name,t.name teacher_name FROM records r JOIN users s ON s.id=r.student_id JOIN items i ON i.id=r.item_id JOIN users t ON t.id=r.teacher_id WHERE (''=? OR r.record_date>=?) AND (''=? OR r.record_date<=?) AND (''=? OR s.grade=?) AND (''=? OR s.class_no=?) AND (''=? OR s.id LIKE ? OR s.name LIKE ?) ORDER BY r.record_date DESC`).all(from,from,to,to,grade,grade,classNo,classNo,q,'%'+q+'%','%'+q+'%');if(String(repeatOnly)==='true'){let m={};rows.forEach(x=>m[x.student_id]=(m[x.student_id]||0)+1);rows=Object.keys(m).filter(id=>m[id]>=Number(threshold)).map(id=>{let a=rows.filter(x=>x.student_id===id),x=a[0];return {...x,count:m[id]}})}res.json(rows)});

function xlsxResponse(res,filename,rows,sheet){
  const ws=XLSX.utils.json_to_sheet(rows);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,sheet);
  const buf=XLSX.write(wb,{bookType:'xlsx',type:'buffer'});
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition',`attachment; filename="${filename}"`);res.send(buf);
}
app.get('/api/admin/templates/students',auth,role('admin'),(req,res)=>xlsxResponse(res,'학생등록양식.xlsx',[{학년:'1',반:'1',번호:'1',이름:'김하늘',담임교사:'김은혜',초기비밀번호:'1234'}],'학생등록양식'));
app.get('/api/admin/templates/teachers',auth,role('admin'),(req,res)=>xlsxResponse(res,'교사등록양식.xlsx',[{교사아이디:'t101',이름:'김은혜',역할:'teacher',담당학년:'1',담당반:'1',초기비밀번호:'1234'}],'교사등록양식'));
app.post('/api/admin/import/students',auth,role('admin'),(req,res)=>{
  const rows=Array.isArray(req.body.rows)?req.body.rows:[],result={created:0,updated:0,errors:[]};
  const tx=db.transaction(()=>rows.forEach((r,index)=>{
    const id=String(r['학번']||r.id||'').trim(),name=String(r['이름']||r.name||'').trim();
    if(!id||!name){result.errors.push({row:index+2,message:'학번 또는 이름 누락'});return}
    const old=db.prepare('SELECT * FROM users WHERE id=?').get(id);
    const vals=[name,String(r['학년']||r.grade||''),String(r['반']||r.classNo||''),String(r['번호']||r.numberNo||''),String(r['담임교사']||r.homeroom||'')];
    if(old){if(old.role!=='student'){result.errors.push({row:index+2,message:'이미 교사/관리자 아이디로 사용 중'});return}db.prepare('UPDATE users SET name=?,grade=?,class_no=?,number_no=?,homeroom=? WHERE id=?').run(...vals,id);result.updated++}
    else{db.prepare('INSERT INTO users(id,name,password,role,grade,class_no,number_no,homeroom) VALUES(?,?,?,?,?,?,?,?)').run(id,vals[0],bcrypt.hashSync(String(r['초기비밀번호']||r.password||'1234'),10),'student',...vals.slice(1));result.created++}
  }));tx();log(req.user.id,'IMPORT','students','',null,result);res.json(result);
});
app.post('/api/admin/import/teachers',auth,role('admin'),(req,res)=>{
  const rows=Array.isArray(req.body.rows)?req.body.rows:[],result={created:0,updated:0,errors:[]};
  const tx=db.transaction(()=>rows.forEach((r,index)=>{
    const id=String(r['교사아이디']||r.id||'').trim(),name=String(r['이름']||r.name||'').trim(),roleName=String(r['역할']||r.role||'teacher').trim();
    if(!id||!name){result.errors.push({row:index+2,message:'교사 아이디 또는 이름 누락'});return}
    if(!['teacher','admin'].includes(roleName)){result.errors.push({row:index+2,message:'역할값 오류'});return}
    const old=db.prepare('SELECT * FROM users WHERE id=?').get(id);
    if(old){if(old.role==='student'){result.errors.push({row:index+2,message:'이미 학생 학번으로 사용 중'});return}db.prepare('UPDATE users SET name=?,role=?,grade=?,class_no=? WHERE id=?').run(name,roleName,String(r['담당학년']||''),String(r['담당반']||''),id);result.updated++}
    else{db.prepare('INSERT INTO users(id,name,password,role,grade,class_no) VALUES(?,?,?,?,?,?)').run(id,name,bcrypt.hashSync(String(r['초기비밀번호']||r.password||'1234'),10),roleName,String(r['담당학년']||''),String(r['담당반']||''));result.created++}
  }));tx();log(req.user.id,'IMPORT','teachers','',null,result);res.json(result);
});

app.get('/api/admin/backup',auth,role('admin'),(req,res)=>{const out={users:db.prepare('SELECT * FROM users').all(),items:db.prepare('SELECT * FROM items').all(),rules:db.prepare('SELECT * FROM rules').all(),records:db.prepare('SELECT * FROM records').all(),audit:db.prepare('SELECT * FROM audit_logs').all()};res.json(out)});
app.post('/api/admin/year-reset',auth,role('admin'),(req,res)=>{db.transaction(()=>{db.prepare("DELETE FROM records").run();db.prepare("DELETE FROM users WHERE role!='admin'").run();db.prepare('DELETE FROM audit_logs').run()})();log(req.user.id,'YEAR_RESET','system','',null,null);res.json({ok:true})});

app.get('/api/my-records',auth,(req,res)=>{
  const rows=db.prepare(`SELECT r.id,r.note,r.status,r.record_date,i.name item,t.name teacher FROM records r JOIN items i ON i.id=r.item_id JOIN users t ON t.id=r.teacher_id WHERE r.student_id=? ORDER BY r.record_date DESC,r.id DESC`).all(req.user.id);
  res.json(rows);
});
app.post('/api/my-records/:id/done',auth,role('student'),(req,res)=>{
  const before=db.prepare('SELECT * FROM records WHERE id=? AND student_id=?').get(req.params.id,req.user.id);
  if(!before)return res.status(404).json({message:'기록을 찾을 수 없습니다.'});
  db.prepare("UPDATE records SET status='done' WHERE id=?").run(req.params.id);
  log(req.user.id,'UPDATE','record',req.params.id,before,{...before,status:'done'});res.json({ok:true});
});
app.post('/api/password/change',auth,(req,res)=>{
  const u=db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  if(!bcrypt.compareSync(String(req.body.current||''),u.password))return res.status(400).json({message:'현재 비밀번호가 일치하지 않습니다.'});
  if(!req.body.next)return res.status(400).json({message:'새 비밀번호를 입력하세요.'});
  db.prepare('UPDATE users SET password=? WHERE id=?').run(bcrypt.hashSync(req.body.next,10),u.id);
  log(u.id,'PASSWORD_CHANGE','user',u.id,null,null);res.json({ok:true});
});
app.get('/api/admin/users',auth,role('admin'),(req,res)=>res.json(db.prepare("SELECT id,name,role,grade,class_no,number_no,homeroom FROM users ORDER BY role,grade,class_no,number_no,name").all()));
app.post('/api/admin/users',auth,role('admin'),(req,res)=>{
  const p=req.body;if(!p.id||!p.name||!p.role)return res.status(400).json({message:'필수값을 입력하세요.'});
  try{db.prepare('INSERT INTO users(id,name,password,role,grade,class_no,number_no,homeroom) VALUES(?,?,?,?,?,?,?,?)').run(p.id,p.name,bcrypt.hashSync(p.password||'1234',10),p.role,p.grade||'',p.classNo||'',p.numberNo||'',p.homeroom||'');log(req.user.id,'CREATE','user',p.id,null,p);res.json({ok:true})}catch{res.status(400).json({message:'이미 등록된 아이디입니다.'})}
});
app.put('/api/admin/users/:id',auth,role('admin'),(req,res)=>{
  const before=db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);if(!before)return res.status(404).json({message:'계정을 찾을 수 없습니다.'});
  const p=req.body;db.prepare('UPDATE users SET name=?,grade=?,class_no=?,number_no=?,homeroom=? WHERE id=?').run(p.name||before.name,p.grade||'',p.classNo||'',p.numberNo||'',p.homeroom||'',req.params.id);
  log(req.user.id,'UPDATE','user',req.params.id,before,p);res.json({ok:true});
});
app.delete('/api/admin/users/:id',auth,role('admin'),(req,res)=>{
  if(req.params.id===req.user.id)return res.status(400).json({message:'현재 관리자 계정은 삭제할 수 없습니다.'});
  const before=db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);db.prepare('DELETE FROM records WHERE student_id=?').run(req.params.id);log(req.user.id,'DELETE','user',req.params.id,before,null);res.json({ok:true});
});
app.post('/api/students/:id/reset-password',auth,role('teacher','admin'),(req,res)=>{
  const st=db.prepare("SELECT * FROM users WHERE id=? AND role='student'").get(req.params.id);if(!st)return res.status(404).json({message:'학생을 찾을 수 없습니다.'});
  const def=db.prepare("SELECT value FROM app_settings WHERE key='student_default_password'").get();const pw=def?.value||'1234';
  db.prepare('UPDATE users SET password=? WHERE id=?').run(bcrypt.hashSync(pw,10),st.id);log(req.user.id,'PASSWORD_RESET','user',st.id,null,null);res.json({ok:true});
});

app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,'127.0.0.1',()=>console.log(`DanjeongCheck Server http://127.0.0.1:${PORT}`));