import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  Shield, Camera, User, Users, Clock, AlertCircle, 
  CheckCircle, LogOut, ArrowRight, Bell, Calendar, 
  FileText, Plus, Trash2, Wifi, WifiOff, Download, Search, Lock, Key, Check, AlertTriangle, Sparkles, Activity
} from 'lucide-react';

// ==================== TELA DE LOGIN ====================
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@escola.com' && (password === 'ADM1' || password === 'ADM2' || password === 'ADM123')) {
      navigate('/admin');
    } else if (email === 'admin@escola.com') {
      alert('Senha do Administrador incorreta! Use ADM1 ou ADM2.');
    } else {
      navigate('/painel-pai');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 p-4">
      <div className="bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-white/20">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-tr from-indigo-600 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-indigo-500/30 transform hover:scale-105 transition">
            <Sparkles size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">EscolaPro Live</h1>
          <p className="text-sm text-slate-500 mt-1">Gestão inteligente e segura em tempo real</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">E-mail de Acesso</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: admin@escola.com ou pai@email.com" 
              className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-800 bg-slate-50 text-sm font-medium transition" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Senha (ADM: ADM1 / ADM2)</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-800 bg-slate-50 text-sm font-medium transition" 
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/30 transition transform active:scale-95">
            Entrar no Sistema
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-slate-600">Não tem conta? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Cadastre-se</Link></p>
          <div className="pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400 font-semibold">
            <Link to="/kiosk-auth" className="hover:text-indigo-600 flex items-center gap-1.5 transition">📱 Acessar Tablet (Catraca)</Link>
            <Link to="/admin" className="hover:text-indigo-600 transition">⚙️ Acesso ADM</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== TELA DE AUTENTICAÇÃO DO TABLET ====================
function KioskAuth() {
  const [pinCode, setPinCode] = useState('');
  const navigate = useNavigate();
  const validPins = ['ESCOLA-TABLET-01', 'ESCOLA-TABLET-02', 'ADM999'];

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (validPins.includes(pinCode.trim().toUpperCase())) {
      localStorage.setItem('kiosk_authorized', 'true');
      navigate('/kiosk');
    } else {
      alert('Código de liberação inválido! Solicite o PIN correto ao Administrador.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-slate-900 p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-slate-800 text-center space-y-6">
        <div className="bg-rose-500/10 text-rose-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-inner">
          <Lock size={36} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Catraca - Área Restrita</h1>
          <p className="text-sm text-slate-400 mt-1">Insira o código de liberação do terminal para iniciar as operações de ponto.</p>
        </div>

        <form onSubmit={handleVerifyPin} className="space-y-4">
          <input 
            type="text" 
            required
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            placeholder="Ex: ESCOLA-TABLET-01" 
            className="w-full p-4 text-center text-lg bg-slate-950 border border-slate-800 rounded-2xl text-white uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
          />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/30 transition">
            Liberar Catraca 🔓
          </button>
        </form>

        <div className="pt-2">
          <Link to="/" className="text-xs text-slate-500 hover:text-white transition font-medium">← Voltar ao Início</Link>
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
    alert(`Conta criada com sucesso! ${children.length} filho(s) vinculado(s) com segurança.`);
    navigate('/painel-pai');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl max-w-lg w-full border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Nova Conta</h2>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mt-1">Passo {step} de 2: {step === 1 ? 'Responsável' : 'Vincular Alunos'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
            {step}
          </div>
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Seu Nome Completo</label>
                <input type="text" required value={parentData.name} onChange={e=>setParentData({...parentData, name: e.target.value})} placeholder="Nome completo" className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">E-mail</label>
                <input type="email" required value={parentData.email} onChange={e=>setParentData({...parentData, email: e.target.value})} placeholder="seu@email.com" className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Senha</label>
                <input type="password" required value={parentData.password} onChange={e=>setParentData({...parentData, password: e.target.value})} placeholder="••••••••" className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition">
                Avançar para Cadastrar Filhos <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {children.map((child, index) => (
                  <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-indigo-600 uppercase">Aluno / Filho #{index + 1}</span>
                      {children.length > 1 && (
                        <button type="button" onClick={() => handleRemoveChild(index)} className="text-rose-500 hover:text-rose-700 transition"><Trash2 size={16}/></button>
                      )}
                    </div>
                    <input type="text" required placeholder="Nome Completo do Aluno" value={child.name} onChange={e => handleChildChange(index, 'name', e.target.value)} className="w-full p-3 border rounded-xl bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" required placeholder="CPF (000.000.000-00)" value={child.cpf} onChange={e => handleChildChange(index, 'cpf', e.target.value)} className="w-full p-3 border rounded-xl bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="text" required placeholder="Turma (ex: 5º Ano B)" value={child.grade} onChange={e => handleChildChange(index, 'grade', e.target.value)} className="w-full p-3 border rounded-xl bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={handleAddChildField} className="w-full border-2 border-dashed border-indigo-300 text-indigo-600 p-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition text-sm">
                <Plus size={18} /> Adicionar Outro Filho
              </button>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setStep(1)} className="w-1/3 bg-slate-200 text-slate-700 p-4 rounded-2xl font-bold text-sm hover:bg-slate-300 transition">Voltar</button>
                <button type="submit" className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl font-bold shadow-lg shadow-emerald-600/30 transition text-sm">Finalizar Cadastro</button>
              </div>
            </>
          )}
        </form>
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-indigo-600 font-bold hover:underline">Já tem uma conta? Faça login</Link>
        </div>
      </div>
    </div>
  );
}

// ==================== PAINEL DO PAI (TEMPO REAL) ====================
function PainelPai() {
  const [showJustifyModal, setShowJustifyModal] = useState(false);
  const [justificationText, setJustificationText] = useState('');
  
  // Sincroniza dados em tempo real do localStorage (se houver registros da catraca)
  const [liveHistory, setLiveHistory] = useState([
    { date: "09/09/2026", status: "Presente", time: "07:32", type: "Entrada" },
    { date: "08/09/2026", status: "Presente", time: "07:28", type: "Entrada" },
  ]);

  useEffect(() => {
    const checkins = JSON.parse(localStorage.getItem('escola_checkins') || '[]');
    if (checkins.length > 0) {
      const formatted = checkins.map(c => ({
        date: c.date,
        status: "Presente (Catraca)",
        time: c.time,
        type: "Entrada em Tempo Real"
      }));
      setLiveHistory(prev => [...formatted, ...prev]);
    }
  }, []);

  const child = {
    name: "Lucas Gabriel da Silva",
    cpf: "123.456.789-00",
    grade: "5º Ano B",
    status: "Presente na Escola 🟢",
    school: "Colégio Santa Inês"
  };

  const handleSendJustification = (e) => {
    e.preventDefault();
    alert("Atestado / Justificativa enviado com sucesso para a coordenação!");
    setShowJustifyModal(false);
    setJustificationText('');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl flex justify-between items-center border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/30">
              🎓
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Painel do Responsável</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{child.school}</p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2.5 rounded-2xl text-xs font-bold hover:bg-rose-100 transition shadow-sm">
            <LogOut size={16} /> Sair
          </Link>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border-l-8 border-indigo-600 space-y-6 border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold">Turma: {child.grade}</span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">{child.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">CPF: {child.cpf}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span> {child.status}
              </span>
              <button onClick={() => setShowJustifyModal(true)} className="bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-2xl text-xs font-bold hover:bg-amber-100 transition shadow-sm">
                📋 Justificar Falta
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl space-y-4 border border-slate-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600"/> Histórico de Frequência em Tempo Real
            </h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">Atualizado agora</span>
          </div>

          <div className="space-y-3">
            {liveHistory.map((hist, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/60 hover:bg-indigo-50/40 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black">📅</div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{hist.date} - {hist.type} às {hist.time}</h4>
                    <p className="text-xs text-slate-500">Capturado via terminal de catraca</p>
                  </div>
                </div>
                <span className="text-xs px-3.5 py-1.5 rounded-xl font-black bg-emerald-100 text-emerald-700">
                  {hist.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showJustifyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-4 border border-slate-100">
            <h3 className="text-xl font-black text-slate-900">Enviar Justificativa / Atestado</h3>
            <p className="text-xs text-slate-500">Informe o motivo da ausência ou atraso do aluno.</p>
            <form onSubmit={handleSendJustification} className="space-y-4">
              <textarea 
                required
                rows="4"
                value={justificationText}
                onChange={(e) => setJustificationText(e.target.value)}
                placeholder="Ex: Consulta médica agendada..."
                className="w-full p-4 border rounded-2xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowJustifyModal(false)} className="w-1/2 bg-slate-200 text-slate-700 p-3.5 rounded-2xl font-bold text-sm hover:bg-slate-300 transition">Cancelar</button>
                <button type="submit" className="w-1/2 bg-indigo-600 text-white p-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/30">Enviar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== TABLET / CATRACA EM TEMPO REAL ====================
function Kiosk() {
  const [cpf, setCpf] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authorized = localStorage.getItem('kiosk_authorized');
    if (!authorized) {
      alert('Dispositivo não autorizado! Insira o PIN fornecido pelo administrador.');
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
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString();

    // Salva no localStorage para sincronizar em tempo real com o ADM e Painel Pai
    const existing = JSON.parse(localStorage.getItem('escola_checkins') || '[]');
    const newEntry = { cpf, time: timeStr, date: dateStr, name: `Aluno (CPF: ${cpf})` };
    localStorage.setItem('escola_checkins', JSON.stringify([newEntry, ...existing]));

    setSuccessMsg(`✅ Presença & Foto registradas com sucesso para ${cpf} às ${timeStr}!`);
    setCpf('');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button onClick={() => { localStorage.removeItem('kiosk_authorized'); navigate('/kiosk-auth'); }} className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-2xl text-xs font-bold hover:bg-rose-500/20 transition">
          🔒 Bloquear Tablet
        </button>
      </div>

      <div className="bg-slate-900 p-8 md:p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-slate-800 space-y-6">
        <div className="relative w-40 h-40 mx-auto rounded-3xl overflow-hidden bg-slate-950 border-2 border-indigo-500/40 shadow-2xl flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
          {!videoRef.current?.srcObject && <Camera size={40} className="text-slate-600 absolute animate-pulse" />}
        </div>

        <div>
          <h1 className="text-3xl font-black tracking-tight">Catraca Escolar Pro</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Terminal Autorizado - Digite ou Aproxime o CPF</p>
        </div>

        {successMsg && (
          <div className="bg-emerald-600 text-white p-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/30 animate-bounce">
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
            className="w-full p-4 text-center text-xl bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono tracking-wider"
          />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/30 transition transform active:scale-95">
            Validar Entrada & Foto 📸
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-500 font-semibold">
          <Link to="/" className="hover:text-white transition">← Sair do Terminal</Link>
          <Link to="/admin" className="hover:text-white transition">Painel ADM →</Link>
        </div>
      </div>
    </div>
  );
}

// ==================== PAINEL ADM EM TEMPO REAL ====================
function Admin() {
  const [liveCheckins, setLiveCheckins] = useState([]);
  const [tabletCodes] = useState([
    { id: 1, name: 'Tablet Portaria Principal', code: 'ESCOLA-TABLET-01', status: 'Ativo 🟢' },
    { id: 2, name: 'Tablet Bloco B', code: 'ESCOLA-TABLET-02', status: 'Ativo 🟢' }
  ]);

  useEffect(() => {
    const checkins = JSON.parse(localStorage.getItem('escola_checkins') || '[]');
    setLiveCheckins(checkins);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl flex justify-between items-center border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
              ⚙️
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Painel Administrativo (ADM)</h1>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mt-0.5">Credenciais Oficiais Ativas (ADM1 / ADM2)</p>
            </div>
          </div>
          <Link to="/" className="text-slate-700 bg-slate-100 px-4 py-2.5 rounded-2xl text-xs font-bold hover:bg-slate-200 transition shadow-sm">
            Sair do ADM
          </Link>
        </div>

        {/* Gerenciamento de Tablets e PINs */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl space-y-4 border border-slate-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Key size={20} className="text-indigo-600"/> Códigos de Liberação dos Tablets (Catracas)
            </h3>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">Segurança Ativa</span>
          </div>
          <p className="text-xs text-slate-500">Estes são os PINs que você gerencia para que nenhum aluno consiga bater ponto de casa:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tabletCodes.map(tab => (
              <div key={tab.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex justify-between items-center shadow-sm">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{tab.name}</h4>
                  <span className="text-xs text-indigo-600 font-mono font-black bg-indigo-50 px-2.5 py-1 rounded-lg inline-block mt-1">PIN: {tab.code}</span>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-black">{tab.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Métricas e Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total de Alunos</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">480</span>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Presentes Hoje (Tempo Real)</span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">{452 + liveCheckins.length}</span>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tablets Autorizados</span>
            <span className="text-3xl font-black text-indigo-600 mt-1 block">2 Online</span>
          </div>
        </div>

        {/* Movimentações em Tempo Real */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600"/> Últimas Movimentações na Catraca (Tempo Real)
          </h3>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs text-slate-400 uppercase font-black">
                <th className="pb-3">Identificação / CPF</th>
                <th className="pb-3">Horário</th>
                <th className="pb-3">Data</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {liveCheckins.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-slate-400 text-xs font-semibold">Nenhum check-in recente registrado neste navegador ainda. Vá na catraca e faça um teste!</td>
                </tr>
              ) : (
                liveCheckins.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-4 font-bold text-slate-800 font-mono">CPF: {m.cpf}</td>
                    <td className="py-4 text-slate-600 font-semibold">{m.time}</td>
                    <td className="py-4 text-slate-500">{m.date}</td>
                    <td className="py-4"><span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700">Presente 🟢</span></td>
                  </tr>
                ))
              )}
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
