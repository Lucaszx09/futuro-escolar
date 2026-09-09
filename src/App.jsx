import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  
  // Banco de dados simulado no estado global da aplicação
  const [users, setUsers] = useState([
    { name: 'Administrador', email: 'admin.escola@gmail.com', role: 'admin' }
  ]);
  const [students, setStudents] = useState([]); // { parentEmail, name, cpf, grade, time }
  const [checkins, setCheckins] = useState([]); // { cpf, studentName, time, date, photo }

  // Estados de inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Cadastro de Usuário
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Cadastro de Aluno (Filho)
  const [studentName, setStudentName] = useState('');
  const [studentCpf, setStudentCpf] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [studentTime, setStudentTime] = useState('');

  // Catraca / Kiosk
  const [kioskCpf, setKioskCpf] = useState('');
  const [kioskMsg, setKioskMsg] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (currentScreen === 'kiosk') {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch((err) => console.log("Câmera indisponível"));
    }
  }, [currentScreen]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin.escola@gmail.com' && password === 'ADM1') {
      const adminUser = { name: 'Administrador', email, role: 'admin' };
      setCurrentUser(adminUser);
      setCurrentScreen('admin');
    } else {
      const foundUser = users.find(u => u.email === email);
      const userObj = foundUser || { name: 'Responsável', email, role: 'pai' };
      setCurrentUser(userObj);
      setCurrentScreen(userObj.role === 'admin' ? 'admin' : 'painel-pai');
    }
  };

  const handleRegisterUser = (e) => {
    e.preventDefault();
    const newUser = { name: regName, email: regEmail, role: 'pai' };
    setUsers([...users, newUser]);
    alert('Conta criada com sucesso! Faça login.');
    setCurrentScreen('login');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    const newStudent = {
      parentEmail: currentUser.email,
      name: studentName,
      cpf: studentCpf,
      grade: studentGrade,
      time: studentTime
    };
    setStudents([...students, newStudent]);
    alert('Filho cadastrado com sucesso!');
    setStudentName('');
    setStudentCpf('');
    setStudentGrade('');
    setStudentTime('');
  };

  // Função da Catraca tirando foto real e vinculando ao nome do aluno pelo CPF
  const handleKioskCheckin = (e) => {
    e.preventDefault();
    
    // Captura a foto do vídeo da câmera
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }
    const photoDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedPhoto(photoDataUrl);

    // Procura se o CPF está cadastrado em algum aluno para puxar o nome correto
    const alunoEncontrado = students.find(s => s.cpf === kioskCpf);
    const nomeAluno = alunoEncontrado ? alunoEncontrado.name : 'Aluno não identificado';

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString();

    const newCheckin = {
      cpf: kioskCpf,
      studentName: nomeAluno,
      time,
      date,
      photo: photoDataUrl
    };

    setCheckins([newCheckin, ...checkins]);
    setKioskMsg(`✅ ${nomeAluno} (${kioskCpf}) - Presença confirmada às ${time}!`);
    setKioskCpf('');
    setTimeout(() => setKioskMsg(null), 5000);
  };

  // Admin altera a permissão de um usuário para Admin ou Pai
  const toggleUserRole = (userEmail) => {
    setUsers(users.map(u => {
      if (u.email === userEmail) {
        const newRole = u.role === 'admin' ? 'pai' : 'admin';
        return { ...u, role: newRole };
      }
      return u;
    }));
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
                  placeholder="admin.escola@gmail.com" 
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
              <button onClick={() => setCurrentScreen('kiosk')} style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 'bold', cursor: 'pointer' }}>📱 Abrir Catraca</button>
            </div>
          </div>
        </div>
      )}

      {/* TELA DE CRIAR CONTA */}
      {currentScreen === 'register' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '16px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>Criar Nova Conta</h2>
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
              <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Cadastrar</button>
              <button type="button" onClick={() => setCurrentScreen('login')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>← Voltar ao Login</button>
            </form>
          </div>
        </div>
      )}

      {/* TELA DA CATRACA / KIOSK */}
      {currentScreen === 'kiosk' && (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid #334155' }}>
            <div style={{ width: '140px', height: '140px', background: '#000', borderRadius: '20px', margin: '0 auto 20px', overflow: 'hidden', border: '2px solid #3b82f6' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Catraca Escolar</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '6px 0 20px' }}>Digite o CPF do aluno para registrar entrada</p>

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
                Registrar Presença & Foto 📸
              </button>
            </form>

            <button onClick={() => setCurrentScreen('login')} style={{ background: 'none', border: 'none', color: '#94a3b8', marginTop: '20px', cursor: 'pointer', fontSize: '12px' }}>← Sair da Catraca</button>
          </div>
        </div>
      )}

      {/* PAINEL DO ADMINISTRADOR (VÊ TUDO E ALTERA PERMISSÕES) */}
      {currentScreen === 'admin' && (
        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Painel do Administrador (Geral)</h1>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Controle completo de usuários, alunos e acessos</p>
            </div>
            <button onClick={() => { setCurrentUser(null); setCurrentScreen('login'); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Sair</button>
          </div>

          {/* LISTA DE USUÁRIOS CADASTRADOS E CONTROLE DE ADMIN */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>👥 Contas Criadas no App</h3>
            {users.map((u, idx) => (
              <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                <div>
                  <strong style={{ fontSize: '14px' }}>{u.name}</strong>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>E-mail: {u.email} | Cargo: <span style={{ fontWeight: 'bold', color: u.role === 'admin' ? '#059669' : '#2563eb' }}>{u.role.toUpperCase()}</span></div>
                </div>
                {u.email !== 'admin.escola@gmail.com' && (
                  <button onClick={() => toggleUserRole(u.email)} style={{ background: u.role === 'admin' ? '#fef3c7' : '#dbeafe', color: u.role === 'admin' ? '#d97706' : '#1d4ed8', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {u.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* HISTÓRICO COMPLETO DA CATRACA PARA O ADMIN */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>📋 Todos os Registros da Catraca</h3>
            {checkins.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Nenhum acesso registrado na catraca ainda.</p>
            ) : (
              checkins.map((item, idx) => (
                <div key={idx} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.photo && <img src={item.photo} alt="Foto Catraca" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />}
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{item.studentName}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>CPF: {item.cpf} | Data: {item.date} às {item.time}</div>
                    </div>
                  </div>
                  <span style={{ background: '#d1fae5', color: '#065f46', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>Presente 🟢</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PAINEL DO PAI (VÊ APENAS OS FILHOS QUE ELE CADASTROU E OS REGISTROS DELES) */}
      {currentScreen === 'painel-pai' && (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Painel do Responsável</h1>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Bem-vindo, {currentUser?.name}</p>
            </div>
            <button onClick={() => { setCurrentUser(null); setCurrentScreen('login'); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Sair</button>
          </div>

          {/* CADASTRAR FILHO */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>👶 Cadastrar Novo Filho</h3>
            <form onSubmit={handleAddStudent} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Nome Completo do Aluno</label>
                <input type="text" required value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Ex: João da Silva" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>CPF do Aluno</label>
                <input type="text" required value={studentCpf} onChange={(e) => setStudentCpf(e.target.value)} placeholder="Ex: 000.000.000-00" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Turma</label>
                  <input type="text" required value={studentGrade} onChange={(e) => setStudentGrade(e.target.value)} placeholder="Ex: 5º Ano B" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Horário de Aula</label>
                  <input type="text" required value={studentTime} onChange={(e) => setStudentTime(e.target.value)} placeholder="Ex: 07:00 - 12:00" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <button type="submit" style={{ background: '#059669', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px' }}>
                Salvar Filho 💾
              </button>
            </form>
          </div>

          {/* LISTA DOS FILHOS DESTE RESPONSÁVEL */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>👦 Meus Filhos Cadastrados</h3>
            {students.filter(s => s.parentEmail === currentUser?.email).length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Nenhum filho cadastrado por você ainda.</p>
            ) : (
              students.filter(s => s.parentEmail === currentUser?.email).map((child, idx) => (
                <div key={idx} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', marginBottom: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{child.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    CPF: {child.cpf} | Turma: {child.grade} | Horário: {child.time}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* HISTÓRICO EXCLUSIVO APENAS DOS FILHOS DESTE RESPONSÁVEL */}
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
                      <div style={{ fontSize: '12px', color: '#64748b' }}>CPF: {item.cpf} | {item.date} às {item.time}</div>
                    </div>
                  </div>
                  <span style={{ background: '#d1fae5', color: '#065f46', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>Presente 🟢</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
