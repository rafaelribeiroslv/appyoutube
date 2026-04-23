```react
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { User, Key, Loader2, ChevronRight, LogOut, Clock, Newspaper, LayoutGrid, ShieldCheck, Sparkles, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyDgXEl1AjtMnCrWKUFZ2Aeh9AeUwuwXUhs",
  authDomain: "appvip-77f6d.firebaseapp.com",
  projectId: "appvip-77f6d",
  storageBucket: "appvip-77f6d.firebasestorage.app",
  messagingSenderId: "897414209112",
  appId: "1:897414209112:web:0731b564e9e0b5a48bf42d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Restaurando o Logo Animado
const DimensionalLogo = () => (
  <div className="relative w-24 h-24 mb-6">
    <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse"></div>
    <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500 relative z-10 animate-[spin_15s_linear_infinite]">
      <path d="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M50 20 L76 33 L76 67 L50 80 L24 67 L24 33 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="50" cy="50" r="5" fill="currentColor" />
    </svg>
  </div>
);

const CountdownTimer = ({ expiryDate, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(expiryDate).getTime() - now;
      if (distance < 0) { clearInterval(timer); onExpire(); return; }
      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [expiryDate, onExpire]);
  return (
    <div className="flex gap-2 font-black text-amber-500 italic text-lg">
      <span>{timeLeft.d}d</span> : <span>{timeLeft.h}h</span> : <span>{timeLeft.m}m</span> : <span>{timeLeft.s}s</span>
    </div>
  );
};

const PostItem = ({ post }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const textClass = isExpanded ? "text-zinc-400 text-sm leading-relaxed mb-4 whitespace-pre-wrap" : "text-zinc-400 text-sm leading-relaxed mb-4 whitespace-pre-wrap line-clamp-3";
  
  return (
    <article onClick={() => setIsExpanded(!isExpanded)} className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] overflow-hidden mb-6 transition-all">
      {post.imagem && <img src={post.imagem} className="w-full aspect-video object-cover" />}
      <div className="p-6">
        <h3 className="text-xl font-black text-zinc-100 uppercase italic tracking-tighter mb-3">{post.titulo}</h3>
        <p className={textClass}>{post.conteudo}</p>
        <div className="flex items-center gap-1 text-amber-500 text-[10px] font-black uppercase">
          {isExpanded ? <><ChevronUp size={14} /> Ver Menos</> : <><ChevronDown size={14} /> Ler Completo</>}
        </div>
      </div>
    </article>
  );
};

export default function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [userVipData, setUserVipData] = useState(null);
  const [loginData, setLoginData] = useState({ usuario: "", senha: "" });

  useEffect(() => {
    signInAnonymously(auth).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isLogged) {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snap) => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    }
  }, [isLogged]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");
    try {
      const q = query(collection(db, "usuarios_vip"), where("usuario", "==", loginData.usuario));
      const snap = await getDocs(q);
      if (snap.empty) throw new Error("Acesso não identificado.");
      const userData = snap.docs[0].data();
      if (userData.senha !== loginData.senha) throw new Error("Chave incorreta.");
      
      const expira = new Date(userData.expiracao);
      if (new Date() > expira) throw new Error("Seu tempo expirou.");

      setUserVipData(userData);
      setIsLogged(true);
    } catch (err) { setError(err.message); } finally { setAuthLoading(false); }
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-amber-500 font-black">
      <Loader2 className="animate-spin mb-4" />
      <span className="text-[10px] uppercase tracking-widest">Sincronizando...</span>
    </div>
  );

  if (!isLogged) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <DimensionalLogo />
      <h1 className="text-3xl font-black italic text-zinc-100 uppercase mb-8">Conhecimento <span className="text-amber-500">Vip</span></h1>
      
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <input required className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-5 px-6 text-white outline-none focus:border-amber-500/50 transition-all" placeholder="Usuário Dimensional" value={loginData.usuario} onChange={e => setLoginData({...loginData, usuario: e.target.value})} />
        <input required type="password" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-5 px-6 text-white outline-none focus:border-amber-500/50 transition-all" placeholder="Chave de Acesso" value={loginData.senha} onChange={e => setLoginData({...loginData, senha: e.target.value})} />
        <button className="w-full bg-amber-500 text-black font-black py-5 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2">
          {authLoading ? <Loader2 className="animate-spin" /> : "Aceder à Dimensão"}
        </button>
      </form>
      
      {error && <p className="text-red-500 text-[10px] font-black uppercase mt-4 tracking-tighter">{error}</p>}

      <div className="mt-12 w-full max-w-sm border-t border-zinc-900 pt-8">
        <p className="text-[10px] font-black uppercase text-zinc-600 mb-4 tracking-widest">Suporte e Renovação</p>
        <button onClick={() => window.location.href="https://wa.me/558494792723"} className="flex items-center gap-3 bg-zinc-900 text-zinc-300 px-8 py-4 rounded-2xl border border-zinc-800 mx-auto">
          <MessageCircle size={18} className="text-green-500" />
          <span className="font-black text-xs uppercase">WhatsApp Suporte</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900 p-6 flex justify-between items-center">
        <span className="font-black italic text-xs uppercase text-amber-500">Painel Dimensional</span>
        <button onClick={() => setIsLogged(false)} className="text-zinc-600"><LogOut size={20} /></button>
      </header>

      <div className="bg-zinc-950 border-b border-zinc-900 p-6">
        <p className="text-[9px] font-black text-zinc-600 uppercase mb-2">Tempo Restante de Acesso:</p>
        <CountdownTimer expiryDate={userVipData?.expiracao} onExpire={() => setIsLogged(false)} />
      </div>

      <main className="p-4 pb-28 max-w-2xl mx-auto">
        {posts.map(post => <PostItem key={post.id} post={post} />)}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-zinc-900 p-6 flex justify-around items-center z-50">
        <button className="text-amber-500"><Newspaper size={24} /></button>
        <button className="text-zinc-700"><LayoutGrid size={24} /></button>
        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black">
           <Sparkles size={24} />
        </div>
        <button className="text-zinc-700"><ShieldCheck size={24} /></button>
        <button className="text-zinc-700"><Clock size={24} /></button>
      </nav>
    </div>
  );
}

```
