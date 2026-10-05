const express=require('express'),Database=require('better-sqlite3'),path=require('path'),fs=require('fs');
const app=express(),PORT=+process.env.PORT||8787,DIR=process.env.DATA_DIR||'C:\\ProgramData\\DanjeongCheck\\data';
fs.mkdirSync(DIR,{recursive:true});const db=new Database(path.join(DIR,'testserver.db'));db.exec('CREATE TABLE IF NOT EXISTS app_state(id INTEGER PRIMARY KEY CHECK(id=1),json TEXT NOT NULL,updated_at TEXT NOT NULL)');
const seed=JSON.stringify(require('./seed.json'));if(!db.prepare('SELECT 1 FROM app_state WHERE id=1').get())db.prepare('INSERT INTO app_state(id,json,updated_at) VALUES(1,?,?)').run(seed,new Date().toISOString());
app.use(express.json({limit:'20mb'}));app.get('/api/health',(q,s)=>s.json({ok:true,mode:'v4.1-test-server',port:PORT}));
app.get('/api/state',(q,s)=>s.type('json').send(db.prepare('SELECT json FROM app_state WHERE id=1').get().json));
app.put('/api/state',(q,s)=>{if(!q.body||typeof q.body!=='object')return s.status(400).json({message:'state error'});db.prepare('UPDATE app_state SET json=?,updated_at=? WHERE id=1').run(JSON.stringify(q.body),new Date().toISOString());s.json({ok:true})});
app.use(express.static(path.join(__dirname,'public')));app.get('*',(q,s)=>s.sendFile(path.join(__dirname,'public','index.html')));app.listen(PORT,'127.0.0.1',()=>console.log('DanjeongCheck Test Server '+PORT));