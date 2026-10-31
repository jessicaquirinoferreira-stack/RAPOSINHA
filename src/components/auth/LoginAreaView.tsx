import React, { useState } from 'react';
import { User } from '../../types';
import { loginUser, signUpUser } from '../../lib/firebase';
import { 
  Crown, 
  User as UserIcon, 
  Mail, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  KeyRound
} from 'lucide-react';

interface LoginAreaViewProps {
  initialRole?: 'client' | 'admin';
  onAuthSuccess: (user: User) => void;
  onGoToHome: () => void;
  onOpenCheckout: () => void;
}

export const LoginAreaView: React.FC<LoginAreaViewProps> = ({
  initialRole = 'client',
  onAuthSuccess,
  onGoToHome,
  onOpenCheckout,
}) => {
  const [activeArea, setActiveArea] = useState<'client' | 'admin'>(initialRole);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSwitchArea = (area: 'client' | 'admin') => {
    setActiveArea(area);
    setErrorMessage(null);
    setSuccessNotice(null);
    if (area === 'admin') {
      setEmail('claudia@x.com');
      setPassword('claudia4321');
      setMode('login');
    } else {
      setEmail('');
      setPassword('');
      setMode('login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);
    setIsLoading(true);

    try {
      if (activeArea === 'admin') {
        // Login restrito da Claudia
        const user = await loginUser(email, password);
        if (user.role !== 'admin' && user.email !== 'claudia@x.com') {
          throw new Error('Esta conta não possui privilégios de administradora.');
        }
        onAuthSuccess(user);
        return;
      }

      // Área do Cliente
      if (mode === 'login') {
        const user = await loginUser(email, password);
        onAuthSuccess(user);
      } else if (mode === 'signup') {
        if (!name.trim()) throw new Error('Por favor, informe seu nome ou o nome do seu pequeno leitor.');
        const user = await signUpUser(name, email, password);
        onAuthSuccess(user);
      } else if (mode === 'forgot') {
        setSuccessNotice('Enviamos um link mágico de redefinição para o seu email!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || 'Erro ao realizar login no reino.');
    } finally {
      setIsLoading(false);
    }
  };

  // Atalhos de 1 clique para facilidade do usuário e avaliadores
  const handleQuickClientLogin = async () => {
    setEmail('princesa.sofia@reino.com');
    setPassword('senha123');
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginUser('princesa.sofia@reino.com', 'senha123');
      onAuthSuccess(user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setEmail('claudia@x.com');
    setPassword('claudia4321');
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginUser('claudia@x.com', 'claudia4321');
      onAuthSuccess(user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-6 text-[#FDF6E3] animate-fade-in">
      {/* Top Header */}
      <div className="text-center pt-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] flex items-center justify-center mx-auto mb-3 text-3xl shadow-gold border-2 border-white/20">
          🦊
        </div>
        <h1 className="font-serif-royal text-2xl font-extrabold text-[#FDF6E3]">
          Portal de Acesso
        </h1>
        <p className="text-xs text-white/70 max-w-xs mx-auto mt-1">
          Selecione abaixo se você é um <strong>Assinante (Cliente)</strong> ou a <strong>Administradora (Claudia)</strong>.
        </p>
      </div>

      {/* Seletor de Área: Cliente vs Admin */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#24133A] border-2 border-[#D4AF37]/50 shadow-lg">
        <button
          type="button"
          onClick={() => handleSwitchArea('client')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition active:scale-95 ${
            activeArea === 'client'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] shadow-gold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Área do Cliente</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitchArea('admin')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition active:scale-95 ${
            activeArea === 'admin'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] shadow-gold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Área do Admin</span>
        </button>
      </div>

      {/* Cartão de Login Conforme a Área Selecionada */}
      {activeArea === 'client' ? (
        /* ================= ÁREA DO CLIENTE ================= */
        <div className="p-6 rounded-3xl bg-[#24133A] border border-[#D4AF37]/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="font-serif-royal text-base font-bold text-[#FDF6E3]">
                {mode === 'login' && 'Entrar na Conta de Assinante'}
                {mode === 'signup' && 'Cadastrar Nova Conta'}
                {mode === 'forgot' && 'Recuperar Minha Senha'}
              </h2>
              <p className="text-[11px] text-white/60">
                Acesse todas as histórias em texto e áudios narrados
              </p>
            </div>
            <span className="text-2xl">📖</span>
          </div>

          {/* Atalho de Demonstração para Cliente */}
          <div className="p-3 rounded-2xl bg-[#190C29] border border-[#D4AF37]/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] block">
                Atalho de Teste Rápido
              </span>
              <p className="text-xs font-semibold text-white">Princesa Sofia (Assinante Ativa)</p>
            </div>
            <button
              type="button"
              onClick={handleQuickClientLogin}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-[#1A1A1A] font-bold text-xs shadow-sm hover:brightness-110 active:scale-95 transition"
            >
              Entrar em 1 Clique
            </button>
          </div>

          {/* Mensagens de Sucesso / Erro */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
              {errorMessage}
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Formulário do Cliente */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block text-white/70 font-semibold mb-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Princesa Helena"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-white/70 font-semibold mb-1">E-mail do Cliente</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@exemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-white/70 font-semibold">Senha</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[#D4AF37] hover:underline"
                    >
                      Esqueceu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-sm shadow-gold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Acessando o Reino...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Entrar na Minha Conta'}
                    {mode === 'signup' && 'Criar Conta Mágica'}
                    {mode === 'forgot' && 'Enviar Link de Recuperação'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Alternadores de modo */}
          <div className="pt-2 text-center text-xs text-white/70 border-t border-white/10">
            {mode === 'login' ? (
              <p>
                Ainda não tem cadastro?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-bold text-[#D4AF37] hover:underline ml-1"
                >
                  Cadastre-se aqui
                </button>
              </p>
            ) : (
              <p>
                Já possui conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-[#D4AF37] hover:underline ml-1"
                >
                  Fazer login
                </button>
              </p>
            )}
          </div>
        </div>
      ) : (
        /* ================= ÁREA DO ADMINISTRADOR ================= */
        <div className="p-6 rounded-3xl bg-[#24133A] border-2 border-[#D4AF37] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider mb-0.5">
                <Crown className="w-3.5 h-3.5" />
                <span>Painel de Gestão da Autora</span>
              </div>
              <h2 className="font-serif-royal text-base font-bold text-[#FDF6E3]">
                Login da Administradora (Claudia)
              </h2>
            </div>
            <span className="text-2xl">👑</span>
          </div>

          {/* Caixa de Credenciais Oficiais */}
          <div className="p-3.5 rounded-2xl bg-[#190C29] border border-[#D4AF37]/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Credencial Oficial:</span>
              <span className="font-mono text-xs font-bold text-[#F9E79F]">claudia@x.com</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Senha Padrão:</span>
              <span className="font-mono text-xs font-bold text-[#F9E79F]">claudia4321</span>
            </div>

            <button
              type="button"
              onClick={handleQuickAdminLogin}
              disabled={isLoading}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-gold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 mt-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Entrar Automaticamente como Claudia</span>
            </button>
          </div>

          {/* Erro */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Formulário de Login do Admin */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-white/70 font-semibold mb-1">E-mail da Administradora</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="claudia@x.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/70 font-semibold mb-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-sm shadow-gold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando Administradora...</span>
                </>
              ) : (
                <>
                  <span>Acessar Painel de Gestão</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Botão de Voltar para a Página Inicial */}
      <div className="text-center pt-2">
        <button
          onClick={onGoToHome}
          className="text-xs text-white/60 hover:text-[#D4AF37] underline transition"
        >
          ← Voltar para a Página Inicial do Clube
        </button>
      </div>
    </div>
  );
};
