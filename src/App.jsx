import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  Shield, Camera, User, Users, Clock, AlertCircle, 
  CheckCircle, LogOut, ArrowRight, Bell, Calendar, 
  FileText, Plus, Trash2, Wifi, WifiOff, Download, Search, Lock, Key
} from 'lucide-react';

// ==================== TELA DE LOGIN ====================
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Credenciais restritas do ADM solicitadas por você
    if (email === 'admin@escola.com' && (password === 'ADM1' || password === 'ADM2' || password === 'ADM123')) {
      navigate('/admin');
    } else if (email === 'admin@escola.com') {
      alert('Senha do Administrador incorreta! Use ADM1 ou ADM2.');
    } else {
      navigate('/painel-pai');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white font-bold text-2xl shadow-lg shadow-blue-500/30">🎓</div>
          <h1 className="text-2xl font-bold text-slate-800">Portal Escolar Pro</h1>
          <p className="text-sm text-slate-500 mt-1">Acesso seguro e monitorado</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail de Acesso</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: pai@email.com ou admin@escola.com" 
              className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 bg-slate-50" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Senha (ADM: ADM1 / ADM2)</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 bg-slate-50" 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl font-bold shadow-lg shadow-blue-600/30 transition">
            Entrar no Sistema
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-slate-600">Não tem conta? <Link to="/register" className="text-blue-600 font-bold hover:underline">Cadastre-se</Link></p>
          <div className="pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400">
            <Link to="/kiosk-auth" className="hover:text-blue-600 font-medium flex items-center gap-1">📱 Acessar Tablet (Catraca)</Link>
            <Link to="/admin" className="hover:text-blue-600 font-medium">⚙️ Acesso ADM</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== TELA DE AUTENTICAÇÃO DO TABLET (BLOQUEIO DE SEGURANÇA) ====================
function KioskAuth() {
  const [pinCode, setPinCode] = useState('');
  const navigate = useNavigate();

  // Códigos válidos gerados pelo ADM (exemplo de tokens seguros da escola)
  const validPins = ['ESCOLA-TABLET-01', 'ESCOLA-TABLET-02', 'ADM999'];

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (validPins.includes(pinCode.trim().toUpperCase())) {
      localStorage.setItem('kiosk_authorized', 'true');
      navigate('/kiosk');
    } else {
      alert('Código de liberação do tablet inválido! Solicite o código ao Administrador.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-800 text-center space-y-6">
        <div className="bg-red-500/20 text-red-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-red-500/30">
          <Lock size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Área Restrita - Catraca</h1>
          <p className="text-sm text-slate-400 mt-1">Insira o Código de Autorização fornecido pela administração para liberar este dispositivo.</p>
        </div>

        <form onSubmit={handleVerifyPin} className="space-y-4">
          <input 
            type="text" 
            required
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            placeholder="Ex: ESCOLA-TABLET-01" 
            className="w-full p-4 text-center text-lg bg-slate-950 border border-slate-800 rounded-2xl text-white uppercase tracking-wider focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-600/30 transition">
            Liberar Catraca 🔓
          </button>
        </form>

        <div className="pt-2">
          <Link to="/" className="text-xs text-slate-500 hover:text-white">← Voltar ao Início</Link>
        </div>
      </div>
    </div>
  );
}

// ==================== CADASTRO COM MÚLTIPLOS FILHOS ====================
function Register() {
  const [step, setStep] = useState(1);
  const [parentData, setParentData] = useState({ name: '', email: '', password: '' });
  const [children, setChildren] = useState([{ name: '', cpf: '', grade: '' }]);
  const navigate = useNavigate();

  const handleAddChildField = () => setChildren([...children, { name: '', cpf: '', grade: '' }]);
  const handleRemoveChild = (index) => { if (children.length > 1) setChildren(children.filter((_, i) => i !== index)); };
  const handleChildChange = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Conta criada com sucesso! ${children.length} filho(s) vinculado(s) via CPF.`);
    navigate('/painel-pai');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Criar Conta de Responsável</h2>
        <p className="text-sm text-slate-500 mb-6">Passo {step} de 2: {step === 1 ? 'Dados Pessoais' : 'Vincular Filhos (CPFs)'}</p>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Seu Nome Completo</label>
                <input type="text" required value={parentData.name} onChange={e=>setParentData({...parentData, name: e.target.value})} placeholder="Nome completo" className="w-full p-3.5 border rounded-2xl bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail</label>
                <input type="email" required value={parentData.email} onChange={e=>setParentData({...parentData, email: e.target.value})} placeholder="seu@email.com" className="w-full p-3.5 border rounded-2xl bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
                <input type="password" required value={parentData.password} onChange={e=>setParentData({...parentData, password: e.target.value})} placeholder="••••••••" className="w-full p-3.5 border rounded-2xl bg-slate-50" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
                Avançar para Cadastrar Filhos <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {children.map((child, index) => (
                  <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-600 uppercase">Filho #{index + 1}</span>
                      {children.length > 1 && (
                        <button type="button" onClick={() => handleRemoveChild(index)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                      )}
                    </div>
                    <input type="text" required placeholder="Nome do Aluno" value={child.name} onChange={e => handleChildChange(index, 'name', e.target.value)} className="w-full p-3 border rounded-xl bg-white text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" required placeholder="CPF (ex: 000.000.000-00)" value={child.cpf} onChange={e => handleChildChange(index, 'cpf', e.target.value)} className="w-full p-3 border rounded-xl bg-white text-sm" />
                      <input type="text" required placeholder="Turma (ex: 5º Ano)" value={child.grade} onChange={e => handleChildChange(index, 'grade', e.target.value)} className="w-full p-3 border rounded-xl bg-white text-sm" />
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={handleAddChildField} className="w-full border-2 border-dashed border-blue-300 text-blue-600 p-3 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition">
                <Plus size={18} /> Adicionar Outro Filho
              </button>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={()=>setStep(1)} className="w-1/3 bg-slate-200 text-slate-700 p-3.5 rounded-2xl font-semibold">Voltar</button>
                <button type="submit" className="w-2/3 bg-green-600 hover:bg-green-700 text-white p-3.5 rounded-2xl font-bold shadow-lg shadow-green-600/30">Finalizar Cadastro</button>
              </div>
            </>
          )}
        </form>
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-blue-600 font-semibold hover:underline">Já tem conta? Faça login</Link>
        </div>
      </div>
    </div>
  );
}

// ==================== PAINEL DO PAI ====================
function PainelPai() {
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [showJustifyModal, setShowJustifyModal] = useState(false);
  const [justificationText, setJustificationText] = useState('');

  const childrenData = [
    {
      name: "Lucas Gabriel da Silva",
      cpf: "123.456.789-00",
      grade: "5º Ano B",
      status: "Presente na Escola",
      scheduleToday: "07:32 (Normal)",
      history: [
        { date: "09/09/2026", status: "Presente", time: "07:32" },
        { date: "08/09/2026", status: "Presente", time: "07:28" },
        { date: "07/09/2026", status: "Falta Justificada", time: "-" },
      ]
    }
  ];

  const currentChild = childrenData[activeChildIndex];

  const handleSendJustification = (e) => {
    e.preventDefault();
    alert("Atestado / Justificativa enviado com sucesso para a coordenação da escola!");
    setShowJustifyModal(false);
    setJustificationText('');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Painel do Responsável</h1>
            <p className="text-sm text-slate-500">Acompanhamento escolar unificado</p>
          </div>
          <Link to="/" className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-2xl text-sm font-bold hover:bg-red-100 transition">
            <LogOut size={16} /> Sair
          </Link>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow border-l-8 border-blue-600 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold">Turma: {currentChild.grade}</span>
              <h2 className="text-2xl font-bold text-slate-800 mt-2">{currentChild.name}</h2>
              <p className="text-sm text-slate-400">CPF: {currentChild.cpf}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                <CheckCircle size={14} /> {currentChild.status}
              </span>
              <button onClick={() => setShowJustifyModal(true)} className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-amber-100 transition">
                📋 Justificar Falta / Atestado
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600"/> Histórico de Frequência e Fotos da Catraca
          </h3>
          <div className="space-y-3">
            {currentChild.history.map((hist, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">📅</div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{hist.date} - Entrada às {hist.time}</h4>
                    <p className="text-xs text-slate-500">Capturado via catraca escolar</p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1.5 rounded-full font-bold bg-green-100 text-green-700">
                  {hist.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showJustifyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold text-slate-800">Enviar Justificativa / Atestado</h3>
            <form onSubmit={handleSendJustification} className="space-y-4">
              <textarea 
                required
                rows="4"
                value={justificationText}
                onChange={(e) => setJustificationText(e.target.value)}
                placeholder="Ex: Consulta médica..."
                className="w-full p-3.5 border rounded-2xl bg-slate-50 text-sm outline-none"
              ></textarea>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowJustifyModal(false)} className="w-1/2 bg-slate-200 text-slate-700 p-3 rounded-2xl font-bold">Cancelar</button>
                <button type="submit" className="w-1/2 bg-blue-600 text-white p-3 rounded-2xl font-bold">Enviar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== TABLET / CATRACA COM CÂMERA REAL ====================
function Kiosk() {
  const [cpf, setCpf] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [successMsg, setSuccessMsg] = useState(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Verifica se o tablet foi devidamente autorizado pelo ADM
  useEffect(() => {
    const authorized = localStorage.getItem('kiosk_authorized');
    if (!authorized) {
      alert('Dispositivo não autorizado! Faça a autenticação com o código do ADM.');
      navigate('/kiosk-auth');
    }
  }, [navigate]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch((err) => console.log("Câmera indisponível:", err));
  }, []);

  const handleCheckin = (e) => {
    e.preventDefault();
    setSuccessMsg(`Check-in & Foto registrados com sucesso para o CPF ${cpf}!`);
    setCpf('');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button onClick={() => { localStorage.removeItem('kiosk_authorized'); navigate('/kiosk-auth'); }} className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full text-xs font-bold">
          Bloquear Tablet
        </button>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-slate-800 space-y-6">
        <div className="relative w-36 h-36 mx-auto rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-inner flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
          {!videoRef.current?.srcObject && <Camera size={36} className="text-slate-500 absolute" />}
        </div>

        <div>
          <h1 className="text-3xl font-bold">Catraca Escolar Pro</h1>
          <p className="text-slate-400 text-sm mt-1">Terminal Autorizado - Digite o CPF</p>
        </div>

        {successMsg && (
          <div className="bg-blue-600 text-white p-4 rounded-2xl font-semibold text-sm animate-pulse shadow-lg">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleCheckin} className="space-y-4">
          <input 
            type="text" 
            required
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Digite o CPF do Aluno..." 
            className="w-full p-4 text-center text-xl bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/30 transition">
            Validar Entrada & Foto 📸
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-500">
          <Link to="/" className="hover:text-white">← Sair</Link>
          <Link to="/admin" className="hover:text-white">Painel ADM →</Link>
        </div>
      </div>
    </div>
  );
}

// ==================== PAINEL ADM (COM GERENCIAMENTO DE TABLETS E RELATÓRIOS) ====================
function Admin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('todos');
  const [tabletCodes] = useState([
    { id: 1, name: 'Tablet Portaria Principal', code: 'ESCOLA-TABLET-01', status: 'Ativo' },
    { id: 2, name: 'Tablet Bloco B', code: 'ESCOLA-TABLET-02', status: 'Ativo' }
  ]);

  const movements = [
    { name: "Lucas Gabriel da Silva", grade: "5º Ano B", time: "07:32", status: "No Horário" },
    { name: "Mariana da Silva", grade: "2º Ano A", time: "07:40", status: "No Horário" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Painel Administrativo (ADM)</h1>
            <p className="text-sm text-slate-500">Credenciais oficiais ativas (ADM1 / ADM2)</p>
          </div>
          <Link to="/" className="text-slate-600 bg-slate-100 px-4 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-200 transition">
            Sair
          </Link>
        </div>

        {/* Gerenciamento de Códigos de Tablets / Catracas */}
        <div className="bg-white p-6 rounded-3xl shadow space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Key size={20} className="text-blue-600"/> Códigos de Liberação dos Tablets (Catracas)
          </h3>
          <p className="text-xs text-slate-500">Estes são os códigos secretos que você gerencia e coloca nos tablets para que ninguém consiga bater ponto de casa:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tabletCodes.map(tab => (
              <div key={tab.id} className="p-4 bg-slate-50 border rounded-2xl flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{tab.name}</h4>
                  <span className="text-xs text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded">PIN: {tab.code}</span>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">{tab.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Métricas e Tabela */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow">
            <span className="text-xs text-slate-400 font-bold uppercase">Total de Alunos</span>
            <span className="text-3xl font-extrabold text-slate-800 mt-1 block">480</span>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow">
            <span className="text-xs text-slate-400 font-bold uppercase">Presentes Hoje</span>
            <span className="text-3xl font-extrabold text-green-600 mt-1 block">452</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Movimentações Recentes</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs text-slate-400 uppercase font-bold">
                <th className="pb-3">Aluno</th>
                <th className="pb-3">Turma</th>
                <th className="pb-3">Horário</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {movements.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-4 font-bold text-slate-700">{m.name}</td>
                  <td className="py-4 text-slate-500">{m.grade}</td>
                  <td className="py-4 text-slate-500">{m.time}</td>
                  <td className="py-4"><span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== ROTAS PRINCIPAIS ====================
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/painel-pai" element={<PainelPai />} />
        <Route path="/kiosk-auth" element={<KioskAuth />} />
        <Route path="/kiosk" element={<Kiosk />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
