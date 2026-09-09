
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Shield, Camera, Lock, ArrowRight, LogOut, Calendar, Smartphone } from 'lucide-react';

// ==================== TELA DE LOGIN ====================
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@escola.com') {
      navigate('/admin');
    } else {
      navigate('/painel-pai');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Frequência Escolar</h1>
          <p className="text-sm text-slate-400 mt-1">Faça login para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">E-mail ou Usuário</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: admin@escola.com" 
              className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 bg-white text-sm" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha" 
              className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 bg-white text-sm" 
            />
          </div>

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 transition text-sm">
            Entrar no Sistema
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-slate-400 font-bold tracking-wider">OU</span></div>
        </div>

        <div>
          <Link to="/kiosk" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition text-sm flex items-center justify-center gap-2">
            <Smartphone size={18} /> Acessar Painel do Tablet (Catraca)
          </Link>
        </div>
      </div>
    </div>
  );
}

// ==================== TABLET / CATRACA COM FOTO REAL ====================
function Kiosk() {
  const [cpf, setCpf] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch((err) => console.error("Erro na câmera:", err));
  }, []);

  const handleCheckin = async (e) => {
    e.preventDefault();

    // Tira a foto da câmera do tablet em tempo real
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (videoRef.current) ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('cpf', cpf);
      formData.append('photo', blob, 'catraca.jpg');

      try {
        // Envia de verdade para o servidor Node.js que criamos
        const response = await fetch('http://localhost:5000/api/checkin', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();

        if (data.success) {
          setStatusMsg(`✅ Presença e foto salvas no banco para o CPF ${cpf} às ${data.time}!`);
          setCpf('');
          setTimeout(() => setStatusMsg(null), 5000);
        }
      } catch (err) {
        alert('Erro ao conectar com o servidor backend.');
      }
    }, 'image/jpeg');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-800 text-center space-y-6">
        <div className="relative w-40 h-40 mx-auto rounded-3xl overflow-hidden bg-black border-2 border-blue-500/50 shadow-2xl flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
        </div>

        <div>
          <h1 className="text-2xl font-black">Catraca Escolar</h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Digite o CPF para bater ponto</p>
        </div>

        {statusMsg && (
          <div className="bg-emerald-600 text-white p-3 rounded-2xl font-bold text-xs shadow-lg animate-bounce">
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleCheckin} className="space-y-4">
          <input 
            type="text" 
            required
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Digite o CPF..." 
            className="w-full p-4 text-center text-lg bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none font-mono"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-bold shadow-lg transition">
            Validar Entrada & Foto 📸
          </button>
        </form>

        <div className="pt-2">
          <Link to="/" className="text-xs text-slate-500 hover:text-white transition">← Voltar ao Início</Link>
        </div>
      </div>
    </div>
  );
}

// ==================== PAINEL DO PAI ====================
function PainelPai() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Busca do banco de dados real os registros da catraca
    fetch('http://localhost:5000/api/checkins')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl flex justify-between items-center border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Painel do Responsável</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Acompanhamento em Tempo Real</p>
          </div>
          <Link to="/" className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-2xl text-xs font-bold hover:bg-rose-100 transition">
            <LogOut size={16} /> Sair
          </Link>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600"/> Histórico de Acessos com Fotos Reais
          </h3>
          
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-4">Nenhum acesso registrado na catraca ainda.</p>
            ) : (
              history.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {item.photo_url && (
                      <img src={item.photo_url} alt="Foto da Catraca" className="w-14 h-14 rounded-xl object-cover border border-slate-300 shadow-sm" />
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Aluno (CPF: {item.student_cpf})</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Entrada registrada em {item.date} às {item.time}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl font-black bg-emerald-100 text-emerald-700 text-xs">Presente 🟢</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== PAINEL ADM ====================
function Admin() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl flex justify-between items-center border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Painel Administrativo</h1>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-1">Controle Total do Sistema</p>
          </div>
          <Link to="/" className="text-slate-700 bg-slate-100 px-4 py-2 rounded-2xl text-xs font-bold hover:bg-slate-200 transition">
            Sair
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/kiosk" element={<Kiosk />} />
        <Route path="/painel-pai" element={<PainelPai />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
