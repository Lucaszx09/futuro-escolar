import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  
  // Banco de dados com persistência no localStorage para não perder nada ao atualizar
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('escola_users');
    return saved ? JSON.parse(saved) : [
      { name: 'Administrador', email: 'admin.escola@gmail.com', role: 'admin', phone: '(11) 99999-9999', relation: 'Admin' }
    ];
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('escola_students');
    return saved ? JSON.parse(saved) : [];
  });

  const [checkins, setCheckins] = useState(() => {
    const saved = localStorage.getItem('escola_checkins');
    return saved ? JSON.parse(saved) : [];
  });

  const [justifications, setJustifications] = useState(() => {
    const saved = localStorage.getItem('escola_justifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [terminalCodes, setTerminalCodes] = useState(() => {
    const saved = localStorage.getItem('escola_terminals');
    return saved ? JSON.parse(saved) : { 'Portaria Principal': 'ADM2026' };
  });

  // Salvar automaticamente no localStorage sempre que houver mudanças
  useEffect(() => { localStorage.setItem('escola_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('escola_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('escola_checkins', JSON.stringify(checkins)); }, [checkins]);
  useEffect(() => { localStorage.setItem('escola_justifications', JSON.stringify(justifications)); }, [justifications]);
  useEffect(() => { localStorage.setItem('escola_terminals', JSON.stringify(terminalCodes)); }, [terminalCodes]);

  // Estados de controle de tela e sessão
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Cadastro de Usuário
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRelation, setRegRelation] = useState('Pai/Mãe');

  // Cadastro de Aluno
  const [studentName, setStudentName] = useState('');
  const [studentCpf, setStudentCpf] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [studentTime, setStudentTime] = useState('');

  // Justificativa de Falta
  const [justStudentCpf, setJustStudentCpf] = useState('');
  const [justDate, setJustDate] = useState('');
  const [justReason, setJustReason] = useState('');
  const [justPhoto, setJustPhoto] = useState(null);

  // Catraca / Kiosk
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

  const handleRegisterUser = (e) => {
    e.preventDefault();
    if (users.some(u => u.email === regEmail)) {
      alert('Este e-mail já está cadastrado!');
      return;
    }
    const newUser = { 
      name: regName, 
      email: regEmail, 
      phone: regPhone, 
      relation: regRelation, 
      role: 'pai' 
    };
    setUsers([...users, newUser]);
    alert('Conta criada com sucesso! Faça login.');
    setCurrentScreen('login');
    setRegName(''); setRegEmail(''); setRegPassword(''); setRegPhone('');
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    const newStudent = {
      id: Date.now(),
      parentEmail: currentUser.email,
      parentName: currentUser.name,
      parentPhone: currentUser.phone || 'Não informado',
      relation: currentUser.relation || 'Responsável',
      name: studentName,
      cpf: studentCpf,
      grade: studentGrade,
      time: studentTime
    };
    setStudents([...students, newStudent]);
    alert('Filho cadastrado com sucesso!');
    setStudentName(''); setStudentCpf(''); setStudentGrade(''); setStudentTime('');
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm('Deseja realmente excluir este aluno?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  // Enviar Justificativa de Falta com Atestado (Foto)
  const handleSendJustification = (e) => {
    e.preventDefault();
    const aluno = students.find(s => s.cpf === justStudentCpf);
    if (!aluno) {
      alert('CPF do aluno não encontrado nos seus cadastros!');
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
      photo: justPhoto,
      status: 'Pendente'
    };

    setJustifications([newJust, ...justifications]);
    alert('Justificativa enviada com sucesso para análise da administração!');
    setJustStudentCpf(''); setJustDate(''); setJustReason(''); setJustPhoto(null);
  };

  // Conversão de arquivo de atestado para imagem base64
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setJustPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Cálculo baseado no fuso horário real de São Paulo (Brasília)
  const calcularStatusAula = () => {
    const agoraStr = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
    const agoraDate = new Date(agoraStr);
    
    const horas = agoraDate.getHours();
    const minutos = agoraDate.getMinutes();
    const totalMinutos = horas * 60 + minutos;

    let status = 'Presente';
    let classInfo = '1ª Aula (Pontual)';

    if (totalMinutos >= 420 && totalMinutos <= 470) { // 07:00 - 07:50
      status = 'Presente';
      classInfo = '1ª Aula (Pontual)';
    } else if (totalMinutos > 470 && totalMinutos <= 510) { // 07:51 - 08:30
      status = 'Atrasado';
      classInfo = '2ª Aula (Entrada Atrasada)';
    } else if (totalMinutos > 510 && totalMinutos <= 735) { // Até 12:15
      status = 'Presente';
      classInfo = 'Turno Regular';
    } else {
      status = 'Presente';
      classInfo = 'Período Extra';
    }

    const time = agoraDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = agoraDate.toLocaleDateString();

    return { time, date, status, classInfo };
  };

  const handleKioskCheckin = (e) => {
    e.preventDefault();
    
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }
    const photoDataUrl = canvas.toDataURL('image/jpeg');

    const alunoEncontrado = students.find(s => s.cpf === kioskCpf);
    const nomeAluno = alunoEncontrado ? alunoEncontrado.name : 'Aluno não cadastrado';

    const { time, date, status, classInfo } = calcularStatusAula();

    const newCheckin = {
      cpf: kioskCpf,
      studentName: nomeAluno,
      parentEmail: alunoEncontrado ? alunoEncontrado.parentEmail : 'Desconhecido',
      parentName: alunoEncontrado ? alunoEncontrado.parentName : 'Desconhecido',
      relation: alunoEncontrado ? alunoEncontrado.relation : '-',
      time,
      date,
      photo: photoDataUrl,
      status,
      classInfo
    };

    setCheckins([newCheckin, ...checkins]);
    setKioskMsg(`✅ ${nomeAluno} - ${classInfo} às ${time}!`);
    setKioskCpf('');
    setTimeout(() => setKioskMsg(null), 5000);
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
    const codigosValidos = Object.values(terminalCodes);
    if (codigosValidos.includes(enteredTerminalCode)) {
      setTerminalUnlocked(true);
      setKioskError(null);
    } else {
      setKioskError('❌ Código de terminal inválido! Solicite o código correto ao Administrador.');
    }
  };

  const toggleUserRole = (userEmail) => {
    setUsers(users.map(u => {
      if (u.email === userEmail) {
        const newRole = u.role === 'admin' ? 'pai' : 'admin';
        return { ...u, role: newRole };
      }
      return u;
    }));
  };

  const updateJustificationStatus = (id, newStatus) => {
    setJustifications(justifications.map(j => j.id === id ? { ...j, status: newStatus } : j));
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* TELA DE LOGIN */}
      {currentScreen === 'login' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '16px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ background: '#dbeafe', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>🎓</div>
              <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>Frequência Escolar</h1>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Acesse sua conta para continuar</p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>E-mail</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" 
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Senha</label>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha" 
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <button type="submit" style={{ background: '#059669', color: 'white', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)' }}>
                Entrar no Sistema
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', fontSize: '13px' }}>
              <button onClick={() => setCurrentScreen('register')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>Criar nova conta</button>
              <button onClick={() => { setTerminalUnlocked(false); setCurrentScreen('kiosk'); }} style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 'bold', cursor: 'pointer' }}>📱 Acessar Catraca</button>
            </div>
          </div>
        </div>
      )}

      {/* TELA DE CRIAR CONTA */}
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
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Telefone para Contato</label>
                <input type="text" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="(11) 99999-9999" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Parentesco com o Aluno</label>
                <select value={regRelation} onChange={(e) => setRegRelation(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box', background: 'white' }}>
                  <option value="Pai/Mãe">Pai / Mãe</option>
                  <option value="Irmão(ã)">Irmão(ã)</option>
                  <option value="Tio(a)">Tio(a)</option>
                  <option value="Avô/Avó">Avô / Avó</option>
                  <option value="Outro">Outro Responsável</option>
                </select>
              </div>
              <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Cadastrar Conta</button>
              <button type="button" onClick={() => setCurrentScreen('login')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>← Voltar ao Login</button>
            </form>
          </div>
        </div>
      )}

      {/* TELA DA CATRACA / KIOSK */}
      {currentScreen === 'kiosk' && (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          
          {!terminalUnlocked ? (
            <div style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid #334155' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Terminal Protegido</h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '6px 0 20px' }}>Insira o código fornecido pelo Administrador para liberar este tablet.</p>

              {kioskError && (
                <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', marginBottom: '14px' }}>
                  {kioskError}
                </div>
              )}

              <form onSubmit={handleUnlockTerminal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  type="password" required value={enteredTerminalCode} onChange={(e) => setEnteredTerminalCode(e.target.value)}
                  placeholder="Código do Terminal..." 
                  style={{ width: '100%', padding: '14px', textAlign: 'center', fontSize: '16px', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '12px', outline: 'none', boxSizing: 'border-box' }}
                />
                <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Desbloquear Terminal 🔓
                </button>
              </form>
              <button onClick={() => setCurrentScreen('login')} style={{ background: 'none', border: 'none', color: '#94a3b8', marginTop: '20px', cursor: 'pointer', fontSize: '12px' }}>← Voltar ao Início</button>
            </div>
          ) : (
            <div style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid #334155' }}>
              <div style={{ width: '140px', height: '140px', background: '#000', borderRadius: '20px', margin: '0 auto 20px', overflow: 'hidden', border: '2px solid #3b82f6' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Catraca Escolar (Liberada)</h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '6px 0 20px' }}>Digite o CPF do aluno para registrar entrada e foto</p>

              {kioskMsg && (
                <div style={{ backgroundColor: '#059669', color: 'white', padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
                  {kioskMsg}
                </div>
              )}

              <form onSubmit={handleKioskCheckin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  type="text" required value={kioskCpf} onChange={(e) => setKioskCpf(e.target.value)}
                  placeholder="Digite o CPF do aluno..." 
                  style={{ width: '100%', padding: '14px', textAlign: 'center', fontSize: '16px', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '12px', outline: 'none', boxSizing: 'border-box' }}
                />
                <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Registrar Ponto / Presença 📸
                </button>
              </form>

              <button onClick={() => { setTerminalUnlocked(false); setCurrentScreen('login'); }} style={{ background: 'none', border: 'none', color: '#94a3b8', marginTop: '20px', cursor: 'pointer', fontSize: '12px' }}>🔒 Bloquear e Sair</button>
            </div>
          )}
        </div>
      )}

      {/* PAINEL DO ADMINISTRADOR */}
      {currentScreen === 'admin' && (
        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Painel do Administrador (Geral)</h1>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Gestão completa de usuários, alunos, acessos e atestados</p>
            </div>
            <button onClick={() => { setCurrentUser(null); setCurrentScreen('login'); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Sair</button>
          </div>

          {/* GERADOR DE CÓDIGOS DE TERMINAL */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>🔑 Códigos de Acesso para Terminais</h3>
            <form onSubmit={handleCreateTerminalCode} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '16px' }}>
              <input type="text" required placeholder="Nome da Sala (Ex: Portaria A)" value={newTerminalName} onChange={(e) => setNewTerminalName(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px' }} />
              <input type="text" required placeholder="Código Secreto (Ex: 9876)" value={newTerminalCode} onChange={(e) => setNewTerminalCode(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px' }} />
              <button type="submit" style={{ background: '#059669', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Criar</button>
            </form>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(terminalCodes).map(([termName, code], idx) => (
                <div key={idx} style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', border: '1px solid #cbd5e1' }}>
                  <strong>{termName}:</strong> <code>{code}</code>
                </div>
              ))}
            </div>
          </div>

          {/* CONTAS CRIADAS NO APP */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>👥 Contas Criadas no App ({users.length})</h3>
            {users.map((u, idx) => (
              <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                <div>
                  <strong style={{ fontSize: '14px' }}>{u.name}</strong> <span style={{ fontSize: '11px', color: '#64748b' }}>({u.relation})</span>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>E-mail: {u.email} | Tel: {u.phone || 'N/A'} | Cargo: <span style={{ fontWeight: 'bold', color: u.role === 'admin' ? '#059669' : '#2563eb' }}>{u.role.toUpperCase()}</span></div>
                </div>
                {u.email !== 'admin.escola@gmail.com' && (
                  <button onClick={() => toggleUserRole(u.email)} style={{ background: u.role === 'admin' ? '#fef3c7' : '#dbeafe', color: u.role === 'admin' ? '#d97706' : '#1d4ed8', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {u.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* JUSTIFICATIVAS E ATESTADOS ENVIADOS PELOS PAIS */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>📝 Justificativas e Atestados Pendentes</h3>
            {justifications.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Nenhuma justificativa enviada até o momento.</p>
            ) : (
              justifications.map((item) => (
                <div key={item.id} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', marginBottom: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {item.photo && <img src={item.photo} alt="Atestado" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />}
                    <div>
                      <strong style={{ fontSize: '14px' }}>{item.studentName}</strong> (CPF: {item.cpf})
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Data da Falta: {item.date} | Motivo: {item.reason}</div>
                      <div style={{ fontSize: '11px', color: '#0284c7' }}>Resp: {item.parentName} ({item.parentEmail})</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '8px', background: item.status === 'Aprovado' ? '#d1fae5' : item.status === 'Recusado' ? '#fee2e2' : '#fef3c7', color: item.status === 'Aprovado' ? '#065f46' : item.status === 'Recusado' ? '#dc2626' : '#d97706' }}>
                      {item.status}
                    </span>
                    {item.status === 'Pendente' && (
                      <>
                        <button onClick={() => updateJustificationStatus(item.id, 'Aprovado')} style={{ background: '#059669', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Aprovar</button>
                        <button onClick={() => updateJustificationStatus(item.id, 'Recusado')} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Recusar</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* HISTÓRICO DA CATRACA */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>📋 Histórico Completo de Acessos</h3>
            {checkins.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Nenhum acesso registrado na catraca ainda.</p>
            ) : (
              checkins.map((item, idx) => (
                <div key={idx} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.photo && <img src={item.photo} alt="Foto Aluno" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />}
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{item.studentName}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>CPF: {item.cpf} | {item.classInfo} ({item.date} às {item.time})</div>
                      <div style={{ fontSize: '11px', color: '#0284c7' }}>Resp: {item.parentName} ({item.relation})</div>
                    </div>
                  </div>
                  <span style={{ background: item.status.includes('Atrasado') ? '#fef3c7' : '#d1fae5', color: item.status.includes('Atrasado') ? '#d97706' : '#065f46', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PAINEL DO PAI / RESPONSÁVEL */}
      {currentScreen === 'painel-pai' && (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Painel do Responsável</h1>
              <p style={{ fontSize: '12px', color: '#64748b' }}>{currentUser?.name} ({currentUser?.relation}) - {currentUser?.phone}</p>
            </div>
            <button onClick={() => { setCurrentUser(null); setCurrentScreen('login'); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Sair</button>
          </div>

          {/* CADASTRAR FILHO */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>👶 Cadastrar Novo Filho / Aluno</h3>
            <form onSubmit={handleAddStudent} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Nome Completo do Aluno</label>
                <input type="text" required value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Ex: João da Silva" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>CPF do Aluno</label>
                <input type="text" required value={studentCpf} onChange={(e) => setStudentCpf(e.target.value)} placeholder="Ex: 00000000000" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Turma</label>
                  <input type="text" required value={studentGrade} onChange={(e) => setStudentGrade(e.target.value)} placeholder="Ex: 5º Ano B" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Horário de Aula</label>
                  <input type="text" required value={studentTime} onChange={(e) => setStudentTime(e.target.value)} placeholder="Ex: 07:00 - 12:15" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <button type="submit" style={{ background: '#059669', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px' }}>
                Salvar Filho 💾
              </button>
            </form>
          </div>

          {/* LISTA DOS FILHOS CADASTRADOS */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>👦 Meus Filhos Cadastrados</h3>
            {students.filter(s => s.parentEmail === currentUser?.email).length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Nenhum filho cadastrado por você ainda.</p>
            ) : (
              students.filter(s => s.parentEmail === currentUser?.email).map((child) => (
                <div key={child.id} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', marginBottom: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{child.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      CPF: {child.cpf} | Turma: {child.grade} | Horário: {child.time}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteStudent(child.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Excluir</button>
                </div>
              ))
            )}
          </div>

          {/* JUSTIFICAR FALTA / ATESTADO */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>📄 Justificar Falta ou Enviar Atestado</h3>
            <form onSubmit={handleSendJustification} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Selecione o Aluno (CPF)</label>
                <select value={justStudentCpf} onChange={(e) => setJustStudentCpf(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box', background: 'white' }}>
                  <option value="">Selecione...</option>
                  {students.filter(s => s.parentEmail === currentUser?.email).map(s => (
                    <option key={s.id} value={s.cpf}>{s.name} ({s.cpf})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Data da Falta</label>
                <input type="date" required value={justDate} onChange={(e) => setJustDate(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Explicação / Motivo</label>
                <textarea required value={justReason} onChange={(e) => setJustReason(e.target.value)} placeholder="Explique o motivo da ausência..." rows="3" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }}></textarea>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Foto do Atestado Médico / Documento</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box', background: '#f8fafc' }} />
              </div>
              <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                Enviar Justificativa 📤
              </button>
            </form>
          </div>

          {/* HISTÓRICO DE ACESSOS */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>🕒 Histórico de Acessos dos Meus Filhos</h3>
            {checkins.filter(item => {
              const meusCpfs = students.filter(s => s.parentEmail === currentUser?.email).map(s => s.cpf);
              return meusCpfs.includes(item.cpf);
            }).length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Nenhum registro de acesso para os seus filhos ainda.</p>
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
                      <div style={{ fontSize: '12px', color: '#64748b' }}>CPF: {item.cpf} | {item.classInfo}</div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>Data: {item.date} às {item.time}</div>
                    </div>
                  </div>
                  <span style={{ background: item.status.includes('Atrasado') ? '#fef3c7' : '#d1fae5', color: item.status.includes('Atrasado') ? '#d97706' : '#065f46', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
