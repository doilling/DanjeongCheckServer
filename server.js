const express=require('express'),Database=require('better-sqlite3'),path=require('path'),fs=require('fs');
const app=express(),PORT=+process.env.PORT||8787,DIR=process.env.DATA_DIR||'C:\\ProgramData\\DanjeongCheck\\data';
fs.mkdirSync(DIR,{recursive:true});const db=new Database(path.join(DIR,'danjeongcheck-v42.db'));db.pragma('journal_mode=WAL');
db.exec(`CREATE TABLE IF NOT EXISTS app_state(id INTEGER PRIMARY KEY CHECK(id=1),json TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT,role TEXT,grade TEXT,class_no TEXT,number_no TEXT,homeroom TEXT);
CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE);
CREATE TABLE IF NOT EXISTS rules(id INTEGER PRIMARY KEY AUTOINCREMENT,body TEXT);
CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY,student_id TEXT,item TEXT,note TEXT,status TEXT,teacher TEXT,record_date TEXT);
CREATE TABLE IF NOT EXISTS audit_log(id INTEGER PRIMARY KEY AUTOINCREMENT,action TEXT,detail TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);
const seed=require('./seed.json');
function sync(state){
  const tx=db.transaction(()=>{
    db.prepare('DELETE FROM users').run();db.prepare('DELETE FROM items').run();db.prepare('DELETE FROM rules').run();db.prepare('DELETE FROM records').run();
    const iu=db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?,?)'),ii=db.prepare('INSERT INTO items(name) VALUES(?)'),ir=db.prepare('INSERT INTO rules(body) VALUES(?)'),irec=db.prepare('INSERT INTO records VALUES(?,?,?,?,?,?,?)');
    (state.users||[]).forEach(x=>iu.run(String(x.id),x.name||'',x.role||'',x.g||'',x.c||'',x.n||'',x.home||''));
    (state.items||[]).forEach(x=>ii.run(String(x)));
    (state.rules||[]).forEach(x=>ir.run(String(x)));
    (state.records||[]).forEach(x=>irec.run(String(x.id),String(x.sid),x.item||'',x.note||'',x.status||'',x.teacher||'',x.date||''));
  });tx();
}
if(!db.prepare('SELECT 1 FROM app_state WHERE id=1').get()){db.prepare('INSERT INTO app_state VALUES(1,?,?)').run(JSON.stringify(seed),new Date().toISOString());sync(seed)}
app.use(express.json({limit:'20mb'}));
app.get('/api/health',(q,s)=>s.json({ok:true,mode:'v4.2-test-server',port:PORT}));
app.get('/api/state',(q,s)=>s.type('json').send(db.prepare('SELECT json FROM app_state WHERE id=1').get().json));
app.put('/api/state',(q,s)=>{if(!q.body||typeof q.body!=='object')return s.status(400).json({message:'state error'});const before=db.prepare('SELECT json FROM app_state WHERE id=1').get().json;db.prepare('UPDATE app_state SET json=?,updated_at=? WHERE id=1').run(JSON.stringify(q.body),new Date().toISOString());sync(q.body);db.prepare('INSERT INTO audit_log(action,detail) VALUES(?,?)').run('STATE_SYNC',JSON.stringify({beforeLength:before.length,afterLength:JSON.stringify(q.body).length}));s.json({ok:true})});
app.get('/api/filters/grades-classes',(q,s)=>{let r=db.prepare("SELECT DISTINCT grade,class_no FROM users WHERE role='student' AND grade!='' ORDER BY grade,class_no").all();s.json(r)});
app.get('/api/admin/backup',(q,s)=>s.json(JSON.parse(db.prepare('SELECT json FROM app_state WHERE id=1').get().json)));
app.use(express.static(path.join(__dirname,'public')));app.get('*',(q,s)=>s.sendFile(path.join(__dirname,'public','index.html')));app.listen(PORT,'127.0.0.1',()=>console.log('DanjeongCheck Test Server v4.2 '+PORT));