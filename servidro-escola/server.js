const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Cria a pasta 'uploads' se ela não existir para salvar as fotos da catraca
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// Conexão com o Banco de Dados Real (SQLite)
const db = new sqlite3.Database('./escola.db', (err) => {
  if (err) console.error('Erro ao conectar no banco', err);
  else console.log('Banco de dados conectado com sucesso!');
});

// Criação das tabelas reais
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER,
    name TEXT,
    cpf TEXT UNIQUE,
    grade TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_cpf TEXT,
    time TEXT,
    date TEXT,
    photo_url TEXT
  )`);
});

// Configuração para salvar a foto tirada pelo tablet/catraca
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Rota de Check-in (Catraca tirando foto e salvando)
app.post('/api/checkin', upload.single('photo'), (req, res) => {
  const { cpf } = req.body;
  const photoUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString();

  db.run(`INSERT INTO checkins (student_cpf, time, date, photo_url) VALUES (?, ?, ?, ?)`,
    [cpf, time, date, photoUrl], function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao registrar check-in.' });
      res.json({ success: true, time, photoUrl });
    });
});

// Rota para buscar dados do painel do pai
app.get('/api/checkins', (req, res) => {
  db.all(`SELECT * FROM checkins ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar dados' });
    res.json(rows);
  });
});

app.listen(5000, () => {
  console.log('Servidor rodando na porta 5000!');
});
