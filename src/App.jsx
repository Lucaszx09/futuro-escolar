import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// Configuração do seu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyApR5NmJFOPGJ_6WdkG3cs",
  authDomain: "futuro-escolar.firebaseapp.com",
  projectId: "futuro-escolar",
  storageBucket: "futuro-escolar.appspot.com",
  messagingSenderId: "188302827087",
  appId: "1:188302827087:web:d8569b69d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  
  // Estados sincronizados com a Nuvem (Firebase)
  const [users, setUsers] = useState([
    { name: 'Administrador', email: 'admin.escola@gmail.com', role: 'admin', phone: '(11) 99999-9999', relation: 'Admin' }
  ]);
  const [students, setStudents] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [justifications, setJustifications] = useState([]);
  const [terminalCodes, setTerminalCodes] = useState({ 'Portaria Principal': 'ADM2026' });

  // Sincronização em Tempo Real com o Firestore
  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      setStudents(snapshot.docs.map(d => ({ idDoc: d.id, ...d.data() })));
    });

    const unsubCheckins = onSnapshot(collection(db, 'checkins'), (snapshot) => {
      setCheckins(snapshot.docs.map(d => ({ idDoc: d.id, ...d.data() })));
    });

    const unsubJust = onSnapshot(collection(db, 'justifications'), (snapshot) => {
      setJustifications(snapshot.docs.map(d => ({ idDoc: d.id, ...d.data() })));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const cloudUsers = snapshot.docs.map(d => d.data());
      if (cloudUsers.length > 0) {
        setUsers([
          { name: 'Administrador', email: 'admin.escola@gmail.com', role: 'admin', phone: '(11) 99999-9999', relation: 'Admin' },
          ...cloudUsers
        ]);
      }
    });

    return () => {
      unsubStudents();
      unsubCheckins();
      unsubJust();
      unsubUsers();
    };
  }, []);

  // Estados de sessão
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Cadastro de Usuário
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRelation, setRegRelation] = useState('Pai/Mãe');

  // Cadastro de Aluno com Foto
  const [studentName, setStudentName] = useState('');
  const [studentCpf, setStudentCpf] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [studentTime, setStudentTime] = useState('');
  const [studentPhoto, setStudentPhoto] = useState(null);

  // Justificativa de Falta
  const [justStudentCpf, setJustStudentCpf] = useState('');
  const [justDate, setJustDate] = useState('');
  const [justReason, setJustReason] = useState('');
  const [justPhoto, setJustPhoto] = useState(null);

  // Catraca por CPF
  const [kioskCpf, setKioskCpf] = useState('');
  const [kioskMsg, setKioskMsg] = useState(null);
  const [kioskError, setKioskError] = useState(null);
  const [newTerminalName, setNewTerminalName] = useState('');
  const [newTerminalCode, setNewTerminalCode] = useState('');
  const [enteredTerminalCode, setEnteredTerminalCode] = useState('');
  const [terminalUnlocked, setTerminalUnlocked] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (currentScreen === 'kiosk' && terminalUnlocked) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch((err) => console.log("Câmera indisponível"));
    }
  }, [currentScreen, terminalUnlocked]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin.escola@gmail.com' && password === 'ADM1') {
      const adminUser = users.find(u => u.email === 'admin.escola@gmail.com') || { name: 'Administrador', email, role: 'admin' };
      setCurrentUser(adminUser);
      setCurrentScreen('admin');
    } else {
      const foundUser = users.find(u => u.email === email);
      if (!foundUser) {
        alert('Usuário não encontrado! Crie uma conta primeiro.');
        return;
      }
      setCurrentUser(foundUser);
      setCurrentScreen(foundUser.role === 'admin' ? 'admin' : 'painel-pai');
    }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    if (users.some(u => u.email === regEmail)) {
      alert('Este e-mail já está cadastrado!');
      return;
    }
    const newUser = { name: regName, email: regEmail, phone: regPhone, relation: regRelation, role: 'pai' };
    try {
      await addDoc(collection(db, 'users'), newUser);
      alert('Conta criada com sucesso! Faça login.');
      setCurrentScreen('login');
      setRegName(''); setRegEmail(''); setRegPassword(''); setRegPhone('');
    } catch (err) {
      alert('Erro ao criar conta no Firebase.');
    }
  };

  const handleStudentPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setStudentPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentPhoto) {
      alert('Por favor, envie uma foto do rosto do aluno!');
      return;
    }
    const newStudent = {
      id: Date.now(),
      parentEmail: currentUser.email,
      parentName: currentUser.name,
      parentPhone: currentUser.phone || 'Não informado',
      relation: currentUser.relation || 'Responsável',
      name: studentName,
      cpf: studentCpf,
      grade: studentGrade,
      time: studentTime,
      photo: studentPhoto
    };
    try {
      await addDoc(collection(db, 'students'), newStudent);
      alert('Filho cadastrado com sucesso na nuvem!');
      setStudentName(''); setStudentCpf(''); setStudentGrade(''); setStudentTime(''); setStudentPhoto(null);
    } catch (err) {
      alert('Erro ao salvar aluno.');
    }
  };

  const handleDeleteStudent = async (idDoc) => {
    if (window.confirm('Deseja realmente excluir este aluno?')) {
      try {
        await deleteDoc(doc(db, 'students', idDoc));
      } catch (err) {
        alert('Erro ao excluir.');
      }
    }
  };

  const handleSendJustification = async (e) => {
    e.preventDefault();
    const aluno = students.find(s => s.cpf === justStudentCpf);
    if (!aluno) {
      alert('CPF do aluno não encontrado nos cadastros!');
      return;
    }

    const newJust = {
      id: Date.now(),
      studentName: aluno.name,
      cpf: justStudentCpf,
      parentEmail: currentUser.email,
      parentName: currentUser.name,
      date: justDate,
      reason: justReason,
      photo: justPhoto || '',
      status: 'Pendente'
    };

    try {
      await addDoc(collection(db, 'justifications'), newJust);
      alert('Justificativa enviada com sucesso para a administração!');
      setJustStudentCpf(''); setJustDate(''); setJustReason(''); setJustPhoto(null);
    } catch (err) {
      alert('Erro ao enviar justificativa.');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setJustPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const calcularStatusAula = () => {
    const agoraStr = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
    const agoraDate = new Date(agoraStr);
    const totalMinutos = agoraDate.getHours() * 60 + agoraDate.getMinutes();

    let status = 'Presente';
    let classInfo = '1ª Aula (Pontual)';

    if (totalMinutos >= 420 && totalMinutos <= 470) {
      status = 'Presente';
      classInfo = '1ª Aula (Pontual)';
    } else if (totalMinutos > 470 && totalMinutos <= 510) {
      status = 'Atrasado';
      classInfo = '2ª Aula (Entrada Atrasada)';
    } else {
      status = 'Presente';
      classInfo = 'Turno Regular';
    }

    return {
      time: agoraDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: agoraDate.toLocaleDateString(),
      status,
      classInfo
    };
  };

  const handleCatracaCheckin = async (e) => {
    e.preventDefault();
    const alunoEncontrado = students.find(s => s.cpf === kioskCpf.trim());

    if (!alunoEncontrado) {
      setKioskError('❌ CPF não encontrado no sistema!');
      setKioskMsg(null);
      setTimeout(() => setKioskError(null), 4000);
      return;
    }

    const { time, date, status, classInfo } = calcularStatusAula();

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }
    const photoDataUrl = canvas.toDataURL('image/jpeg');

    const newCheckin = {
      cpf: alunoEncontrado.cpf,
      studentName: alunoEncontrado.name,
      parentEmail: alunoEncontrado.parentEmail,
      parentName: alunoEncontrado.parentName,
      relation: alunoEncontrado.relation,
      time,
      date,
      photo: photoDataUrl,
      status,
      classInfo,
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, 'checkins'), newCheckin);
      setKioskMsg(`✅ Acesso Liberado: ${alunoEncontrado.name} (${classInfo} às ${time})! 🔓`);
      setKioskError(null);
      setKioskCpf('');
      setTimeout(() => setKioskMsg(null), 6000);
    } catch (err) {
      setKioskError('❌ Erro ao registrar na nuvem.');
    }
  };

  const handleCreateTerminalCode = (e) => {
    e.preventDefault();
    if (!newTerminalName || !newTerminalCode) return;
    setTerminalCodes({ ...terminalCodes, [newTerminalName]: newTerminalCode });
    setNewTerminalName(''); setNewTerminalCode('');
    alert('Código do terminal gerado com sucesso!');
  };

  const handleUnlockTerminal = (e) => {
    e.preventDefault();
    if (Object.values(terminalCodes).includes(enteredTerminalCode)) {
      setTerminalUnlocked(true);
      setKioskError(null);
    } else {
      setKioskError('❌ Código de terminal inválido!');
    }
  };

  const updateJustificationStatus = async (idDoc, newStatus) => {
    try {
      await updateDoc(doc(db, 'justifications', idDoc), { status: newStatus });
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* TELA DE LOGIN */}
      {currentScreen === 'login' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '16px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ background: '#dbeafe', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>🏫</div>
              <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>Catraca em Nuvem (Firebase)</h1>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Acesse sua conta para gerenciar</p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>E-mail</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" style={{ width: '100%', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '14px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Senha</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" style={{ width: '100%', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '14px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ background: '#059669', color: 'white', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>Entrar no Sistema</button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', fontSize: '13px' }}>
              <button onClick={() => setCurrentScreen('register')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>Criar nova conta</button>
              <button onClick={() => { setTerminalUnlocked(false); setCurrentScreen('kiosk'); }} style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 'bold', cursor: 'pointer' }}>📷 Abrir Catraca</button>
            </div>
          </div>
        </div>
      )}

      {/* TELA DE REGISTRO */}
      {currentScreen === 'register' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '16px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>Criar Conta de Responsável</h2>
            <form onSubmit={handleRegisterUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Nome Completo</label>
                <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Seu nome" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>E-mail</label>
                <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="seu@email.com" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Senha</label>
                <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Sua senha" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Telefone</label>
                <input type="text" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="(11) 99999-9999" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Parentesco</label>
                <select value={regRelation} onChange={(e) => setRegRelation(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', background: 'white' }}>
                  <option value="Pai/Mãe">Pai / Mãe</option>
                  <option value="Tio(a)">Tio(a)</option>
                  <option value="Avô/Avó">Avô / Avó</option>
                </select>
              </div>
              <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Cadastrar Conta</button>
              <button type="button" onClick={() => setCurrentScreen('login')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>← Voltar ao Login</button>
            </form>
          </div>
        </div>
      )}

      {/* CATRACA POR CPF */}
      {currentScreen === 'kiosk' && (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          {!terminalUnlocked ? (
            <div style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid #334155' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Catraca Protegida</h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '6px 0 20px' }}>Insira o código do terminal fornecido pelo Admin.</p>

              {kioskError && <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', marginBottom: '14px' }}>{kioskError}</div>}

              <form onSubmit={handleUnlockTerminal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="password" required value={enteredTerminalCode} onChange={(e) => setEnteredTerminalCode(e.target.value)} placeholder="Código..." style={{ width: '100%', padding: '14px', textAlign: 'center', fontSize: '16px', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '12px', outline: 'none' }} />
                <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Desbloquear Terminal</button>
              </form>
              <button onClick={() => setCurrentScreen('login')} style={{ background: 'none', border: 'none', color: '#94a3b8', marginTop: '20px', cursor: 'pointer', fontSize: '12px' }}>← Voltar</button>
            </div>
          ) : (
            <div style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '420px', textAlign: 'center', border: '1px solid #334155' }}>
              <div style={{ width: '160px', height: '160px', background: '#000', borderRadius: '50%', margin: '0 auto 16px', overflow: 'hidden', border: '3px solid #3b82f6', position: 'relative' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Catraca em Nuvem ☁️</h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '6px 0 20px' }}>Digite o CPF do aluno para registrar a entrada de qualquer celular.</p>

              {kioskMsg && <div style={{ backgroundColor: '#059669', color: 'white', padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>{kioskMsg}</div>}
              {kioskError && <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>{kioskError}</div>}

              <form onSubmit={handleCatracaCheckin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" required value={kioskCpf} onChange={(e) => setKioskCpf(e.target.value)} placeholder="Digite o CPF do aluno..." style={{ width: '100%', padding: '14px', textAlign: 'center', fontSize: '16px', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '12px', outline: 'none', boxSizing: 'border-box' }} />
                <button type="submit" style={{ background: '#059669', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 'bold', width: '100%', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}>
                  ✅ Confirmar Entrada por CPF
                </button>
              </form>

              <button onClick={() => { setTerminalUnlocked(false); setCurrentScreen('login'); }} style={{ background: 'none', border: 'none', color: '#94a3b8', marginTop: '20px', cursor: 'pointer', fontSize: '12px' }}>🔒 Bloquear Terminal</button>
            </div>
          )}
        </div>
      )}

      {/* PAINEL ADMIN */}
      {currentScreen === 'admin' && (
        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Painel do Administrador (Nuvem)</h1>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Gestão de acessos em tempo real</p>
            </div>
            <button onClick={() => { setCurrentUser(null); setCurrentScreen('login'); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Sair</button>
          </div>

          {/* CÓDIGOS DE TERMINAL */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>🔑 Códigos de Terminais</h3>
            <form onSubmit={handleCreateTerminalCode} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '16px' }}>
              <input type="text" required placeholder="Nome (Ex: Portaria B)" value={newTerminalName} onChange={(e) => setNewTerminalName(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px' }} />
              <input type="text" required placeholder="Código (Ex: 1234)" value={newTerminalCode} onChange={(e) => setNewTerminalCode(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px' }} />
              <button type="submit" style={{ background: '#059669', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Criar</button>
            </form>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(terminalCodes).map(([tName, code], idx) => (
                <div key={idx} style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', border: '1px solid #cbd5e1' }}>
                  <strong>{tName}:</strong> <code>{code}</code>
                </div>
              ))}
            </div>
          </div>

          {/* JUSTIFICATIVAS */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>📝 Atestados e Justificativas Pendentes</h3>
            {justifications.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Nenhuma justificativa pendente.</p>
            ) : (
              justifications.map((item) => (
                <div key={item.idDoc} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', marginBottom: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {item.photo && <img src={item.photo} alt="Atestado" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />}
                    <div>
                      <strong style={{ fontSize: '14px' }}>{item.studentName}</strong> (CPF: {item.cpf})
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Data: {item.date} | Motivo: {item.reason}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '8px', background: item.status === 'Aprovado' ? '#d1fae5' : '#fef3c7', color: item.status === 'Aprovado' ? '#065f46' : '#d97706' }}>{item.status}</span>
                    {item.status === 'Pendente' && (
                      <>
                        <button onClick={() => updateJustificationStatus(item.idDoc, 'Aprovado')} style={{ background: '#059669', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Aprovar</button>
                        <button onClick={() => updateJustificationStatus(item.idDoc, 'Recusado')} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Recusar</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* HISTÓRICO DE ACESSOS */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>📋 Histórico Geral de Acessos</h3>
            {checkins.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Nenhum acesso registrado.</p>
            ) : (
              checkins.map((item, idx) => (
                <div key={idx} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.photo && <img src={item.photo} alt="Foto Catraca" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />}
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{item.studentName}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{item.classInfo} ({item.date} às {item.time}) - Resp: {item.parentName}</div>
                    </div>
                  </div>
                  <span style={{ background: '#d1fae5', color: '#065f46', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>{item.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PAINEL DO PAI COM CADASTRO DO ALUNO */}
      {currentScreen === 'painel-pai' && (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Painel do Responsável (Nuvem)</h1>
              <p style={{ fontSize: '12px', color: '#64748b' }}>{currentUser?.name} ({currentUser?.relation})</p>
            </div>
            <button onClick={() => { setCurrentUser(null); setCurrentScreen('login'); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Sair</button>
          </div>

          {/* CADASTRAR FILHO */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>👦 Cadastrar Filho</h3>
            <form onSubmit={handleAddStudent} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Nome Completo do Aluno</label>
                <input type="text" required value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Ex: Ana Silva" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>CPF do Aluno</label>
                <input type="text" required value={studentCpf} onChange={(e) => setStudentCpf(e.target.value)} placeholder="Ex: 00000000000" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Turma</label>
                  <input type="text" required value={studentGrade} onChange={(e) => setStudentGrade(e.target.value)} placeholder="Ex: 5º Ano A" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Horário</label>
                  <input type="text" required value={studentTime} onChange={(e) => setStudentTime(e.target.value)} placeholder="Ex: 07:00 - 12:15" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Foto do Rosto do Aluno</label>
                <input type="file" accept="image/*" onChange={handleStudentPhotoUpload} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#f8fafc', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ background: '#059669', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px' }}>Salvar Aluno na Nuvem ☁️</button>
            </form>
          </div>

          {/* LISTA DOS FILHOS */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>👦 Meus Filhos Cadastrados</h3>
            {students.filter(s => s.parentEmail === currentUser?.email).length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Nenhum filho cadastrado.</p>
            ) : (
              students.filter(s => s.parentEmail === currentUser?.email).map((child) => (
                <div key={child.idDoc} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', marginBottom: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {child.photo && <img src={child.photo} alt="Rosto Aluno" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />}
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{child.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>CPF: {child.cpf} | Turma: {child.grade}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteStudent(child.idDoc)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Excluir</button>
                </div>
              ))
            )}
          </div>

          {/* JUSTIFICAR FALTA */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>📄 Justificar Falta ou Enviar Atestado</h3>
            <form onSubmit={handleSendJustification} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Aluno</label>
                <select value={justStudentCpf} onChange={(e) => setJustStudentCpf(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', background: 'white' }}>
                  <option value="">Selecione...</option>
                  {students.filter(s => s.parentEmail === currentUser?.email).map(s => (
                    <option key={s.idDoc} value={s.cpf}>{s.name} ({s.cpf})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Data da Falta</label>
                <input type="date" required value={justDate} onChange={(e) => setJustDate(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Motivo</label>
                <textarea required value={justReason} onChange={(e) => setJustReason(e.target.value)} placeholder="Explique o motivo..." rows="3" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }}></textarea>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Foto do Atestado Médico</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#f8fafc', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Enviar Justificativa</button>
            </form>
          </div>

          {/* HISTÓRICO DE ACESSOS */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>🕒 Histórico de Acessos dos Meus Filhos</h3>
            {checkins.filter(item => {
              const meusCpfs = students.filter(s => s.parentEmail === currentUser?.email).map(s => s.cpf);
              return meusCpfs.includes(item.cpf);
            }).length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Nenhum acesso registrado.</p>
            ) : (
              checkins.filter(item => {
                const meusCpfs = students.filter(s => s.parentEmail === currentUser?.email).map(s => s.cpf);
                return meusCpfs.includes(item.cpf);
              }).map((item, idx) => (
                <div key={idx} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.photo && <img src={item.photo} alt="Foto Catraca" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />}
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>{item.studentName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{item.classInfo} - {item.date} às {item.time}</div>
                    </div>
                  </div>
                  <span style={{ background: '#d1fae5', color: '#065f46', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>{item.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
