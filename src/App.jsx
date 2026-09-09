import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  
  // Banco de dados simulado com contas iniciais (incluindo o admin principal)
  const [users, setUsers] = useState([
    { name: 'Administrador', email: 'admin.escola@gmail.com', role: 'admin', phone: '', relation: '' }
  ]);
  const [students, setStudents] = useState([]); // { parentEmail, parentName, parentPhone, relation, name, cpf, grade, time }
  const [checkins, setCheckins] = useState([]); // { cpf, studentName, time, date, photo, status, classInfo }
  
  // Códigos de acesso para as catracas criados pelo Admin (ex: { 'PORTA-01': '1234' })
  const [terminalCodes, setTerminalCodes] = useState({ 'Entrada Principal': 'ADM2026' });
  const [newTerminalName, setNewTerminalName] = useState('');
  const [newTerminalCode, setNewTerminalCode] = useState('');
  const [enteredTerminalCode, setEnteredTerminalCode] = useState('');
  const [terminalUnlocked, setTerminalUnlocked] = useState(false);

  // Estados de inputs gerais
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Cadastro de Novo Usuário (Pai/Responsável)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRelation, setRegRelation] = useState('Pai/Mãe');

  // Cadastro de Aluno (Filho) no painel do responsável
  const [studentName, setStudentName] = useState('');
  const [studentCpf, setStudentCpf] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [studentTime, setStudentTime] = useState('');

  // Catraca / Kiosk
  const [kioskCpf, setKioskCpf] = useState('');
  const [kioskMsg, setKioskMsg] = useState(null);
  const [kioskError, setKioskError] = useState(null);
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
    // Verifica se já existe o e-mail
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
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegPhone('');
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    const newStudent = {
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
    setStudentName('');
    setStudentCpf('');
    setStudentGrade('');
    setStudentTime('');
  };

  // Validação do horário de São Paulo (Fuso Horário de Brasília) para calcular se chegou no horário ou atrasado
  const calcularStatusAula = () => {
    // Pega a hora atual do Brasil/São Paulo via Intl
    const agoraStr = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
    const agoraDate = new Date(agoraStr);
    
    const horas = agoraDate.getHours();
    const minutos = agoraDate.getMinutes();
    const totalMinutos = horas * 60 + minutos;

    // Horários convertidos em minutos desde 00:00:
    // 1ª Aula: 07:00 (420 min) até 07:50 (470 min)
    // 2ª Aula: 07:51 (471 min) até 08:30 (510 min) -> quem chega aqui entra atrasado na 2ª ou perdeu a 1ª
    // Limite geral da manhã: até 12:15 (735 min)
    
    let status = 'Presente no Horário';
    let classInfo = '1ª Aula (No horário)';

    if (totalMinutos >= 420 && totalMinutos <= 470) {
      status = 'Presente';
      classInfo = '1ª Aula (Pontual)';
    } else if (totalMinutos > 470 && totalMinutos <= 510) {
      status = 'Atrasado';
      classInfo = '2ª Aula (Entrada Atrasada)';
    } else if (totalMinutos > 510 && totalMinutos <= 735) {
      status = 'Presente (Turno Regular)';
      classInfo = 'Período Regular';
    } else if (totalMinutos > 735) {
      status = 'Presença após horário padrão';
      classInfo = 'Turno Tarde/Noite';
    } else {
      status = 'Entrada Antecipada';
      classInfo = 'Antes do início das aulas';
    }

    const time = agoraDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = agoraDate.toLocaleDateString();

    return { time, date, status, classInfo };
  };

  const handleKioskCheckin = (e) => {
    e.preventDefault();
    
    // Captura a foto da webcam
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }
    const photoDataUrl = canvas.toDataURL('image/jpeg');

    // Identifica o aluno pelo CPF cadastrado por algum responsável
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

  // Admin cria um código para a catraca/terminal
  const handleCreateTerminalCode = (e) => {
    e.preventDefault();
    if (!newTerminalName || !newTerminalCode) return;
    setTerminalCodes({ ...terminalCodes, [newTerminalName]: newTerminalCode });
    setNewTerminalName('');
    setNewTerminalCode('');
    alert('Código do terminal gerado com sucesso!');
  };

  // Pai ou operador desbloqueia o terminal informando o código criado pelo Admin
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

  // Admin altera a permissão do usuário
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

      {/* TELA DE CRIAR CONTA (COM PARENTESCO E TELEFONE) */}
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

      {/* TELA DA CATRACA / KIOSK (BLOQUEADA POR CÓDIGO DO ADMIN) */}
      {currentScreen === 'kiosk' && (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          
          {!terminalUnlocked ? (
            <div style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid #334155' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Terminal Protegido</h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '6px 0 20px' }}>Insira o código fornecido pelo Administrador para liberar o tablet/catraca desta sala.</p>

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

      {/* PAINEL DO ADMINISTRADOR (VÊ TODAS AS CONTAS, REGISTROS E CRIA CÓDIGOS DE TERMINAIS) */}
      {currentScreen === 'admin' && (
        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Painel do Administrador (Geral)</h1>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Controle completo de contas, alunos, acessos e códigos de terminais</p>
            </div>
            <button onClick={() => { setCurrentUser(null); setCurrentScreen('login'); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Sair</button>
          </div>

          {/* GERADOR DE CÓDIGOS DE TERMINAL PARA CATRACAS */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>🔑 Gerenciar Códigos de Acesso para Terminais/Tablets</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Crie códigos exclusivos para liberar a catraca de cada sala e evitar acessos falsos externos.</p>
            
            <form onSubmit={handleCreateTerminalCode} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '16px' }}>
              <input type="text" required placeholder="Nome da Sala/Terminal (Ex: Portaria A)" value={newTerminalName} onChange={(e) => setNewTerminalName(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px' }} />
              <input type="text" required placeholder="Código Secreto (Ex: 9876)" value={newTerminalCode} onChange={(e) => setNewTerminalCode(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px' }} />
              <button type="submit" style={{ background: '#059669', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Criar Código</button>
            </form>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(terminalCodes).map(([termName, code], idx) => (
                <div key={idx} style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', border: '1px solid #cbd5e1' }}>
                  <strong>{termName}:</strong> <code>{code}</code>
                </div>
              ))}
            </div>
          </div>

          {/* TODAS AS CONTAS CRIADAS NO APP */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>👥 Todas as Contas Criadas no App</h3>
            {users.map((u, idx) => (
              <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                <div>
                  <strong style={{ fontSize: '14px' }}>{u.name}</strong> <span style={{ fontSize: '11px', color: '#64748b' }}>({u.relation || 'Admin'})</span>
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

          {/* LISTA COMPLETA DE ALUNOS CADASTRADOS */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>👶 Alunos Cadastrados no Sistema</h3>
            {students.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Nenhum aluno cadastrado por responsáveis ainda.</p>
            ) : (
              students.map((s, idx) => (
                <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', marginBottom: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                  <strong>{s.name}</strong> (CPF: {s.cpf}) - Turma: {s.grade}
                  <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                    Responsável: {s.parentName} ({s.relation}) | E-mail: {s.parentEmail} | Tel: {s.parentPhone}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* HISTÓRICO COMPLETO DA CATRACA PARA O ADMIN */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>📋 Histórico Completo de Todos os Registros</h3>
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
                      <div style={{ fontSize: '11px', color: '#0284c7' }}>Resp: {item.parentName} ({item.relation}) - {item.parentEmail}</div>
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

      {/* PAINEL DO PAI (VÊ APENAS O FILHO QUE ELE CADASTROU E OS REGISTROS DELE) */}
      {currentScreen === 'painel-pai' && (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Painel do Responsável</h1>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Bem-vindo, {currentUser?.name} ({currentUser?.relation})</p>
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
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>🕒 Histórico de Acessos e Frequência dos Meus Filhos</h3>
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
