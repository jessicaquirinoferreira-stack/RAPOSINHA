import React, { useState } from 'react';
import { User, AppSettings } from '../../types';
import { logoutUser } from '../../lib/firebase';
import { PWAInstallPrompt } from '../pwa/PWAInstallPrompt';
import { 
  User as UserIcon, 
  Crown, 
  Sparkles, 
  LogOut, 
  ShieldAlert, 
  Smartphone, 
  Heart, 
  BookOpen, 
  Info,
  Check
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: User;
  settings: AppSettings;
  onLogout: () => void;
  onOpenAdmin: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  settings,
  onLogout,
  onOpenAdmin,
}) => {
  const [selectedBadge, setSelectedBadge] = useState(currentUser.avatarBadge || 'fox');
  const isAdmin = currentUser.role === 'admin' || currentUser.email === 'claudia@x.com';

  const badges = [
    { id: 'fox', icon: '🦊', label: 'Raposinha' },
    { id: 'crown', icon: '👑', label: 'Princesa' },
    { id: 'wand', icon: '🪄', label: 'Fadinha' },
    { id: 'star', icon: '⭐', label: 'Estrela' },
    { id: 'rose', icon: '🌹', label: 'Rosa Real' },
  ];

  const handleSelectBadge = (badgeId: any) => {
    setSelectedBadge(badgeId);
    currentUser.avatarBadge = badgeId;
    localStorage.setItem('raposinhas_current_user', JSON.stringify(currentUser));
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = async () => {
    await logoutUser();
    onLogout();
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="font-serif-royal text-2xl font-bold text-[#FDF6E3]">
          Meu Perfil Real
        </h1>
        <p className="text-xs text-white/70">
          Dados da sua conta no Clube das Raposinhas e preferências do aplicativo.
        </p>
      </div>

      {/* Cartão de Perfil */}
      <div className="p-6 rounded-3xl bg-[#24133A] border-2 border-[#D4AF37]/50 shadow-xl text-center relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] flex items-center justify-center mx-auto mb-3 text-4xl shadow-gold border-2 border-white/30">
          {badges.find(b => b.id === selectedBadge)?.icon || '🦊'}
        </div>

        <h2 className="font-serif-royal text-lg font-bold text-[#FDF6E3]">
          {currentUser.name}
        </h2>
        <p className="text-xs text-[#D4AF37] font-medium">{currentUser.email}</p>

        <div className="mt-3 flex items-center justify-center gap-2">
          {isAdmin ? (
            <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-xs font-bold text-[#F9E79F] flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Administradora Claudia</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300">
              Assinante Oficial
            </span>
          )}
        </div>

        {/* Escolha de Avatar Mágico */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <label className="text-[11px] font-bold text-white/70 block mb-2 uppercase tracking-wider">
            Escolha seu Brasão de Avatar
          </label>
          <div className="flex items-center justify-center gap-2">
            {badges.map((b) => (
              <button
                key={b.id}
                onClick={() => handleSelectBadge(b.id)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition active:scale-95 ${
                  selectedBadge === b.id
                    ? 'bg-[#D4AF37] border-2 border-white shadow-gold scale-110'
                    : 'bg-[#190C29] border border-white/10 hover:border-[#D4AF37]/50'
                }`}
                title={b.label}
              >
                {b.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Acesso Especial de Administradora */}
      {isAdmin && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#4A2C6A] via-[#351952] to-[#200E33] border-2 border-[#D4AF37] shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] text-[#1A1A1A] flex items-center justify-center text-2xl shadow-gold shrink-0">
              👑
            </div>
            <div>
              <h3 className="font-serif-royal text-sm font-bold text-[#FDF6E3]">
                Painel Administrativo da Claudia
              </h3>
              <p className="text-[11px] text-white/70">
                Gerencie contos, uploads de áudio, assinantes e preço mensal.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAdmin}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-gold hover:brightness-110 active:scale-95 transition shrink-0"
          >
            Abrir Painel
          </button>
        </div>
      )}

      {/* PWA & Instalação */}
      <PWAInstallPrompt compact={false} />

      {/* Informações da Versão */}
      <div className="p-4 rounded-2xl bg-[#1C0D2E] border border-white/10 text-xs text-white/70 space-y-2">
        <div className="flex justify-between">
          <span>Aplicativo:</span>
          <span className="font-semibold text-white">Clube das Raposinhas PWA</span>
        </div>
        <div className="flex justify-between">
          <span>Modo de Operação:</span>
          <span className="text-emerald-400 font-semibold">Mobile-First Nativo</span>
        </div>
        <div className="flex justify-between">
          <span>Plano Ativo:</span>
          <span className="text-[#F9E79F] font-semibold">{settings.planName}</span>
        </div>
      </div>

      {/* Logout */}
      {showLogoutConfirm ? (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-center space-y-3 animate-fade-in">
          <p className="text-xs font-semibold text-rose-200">
            Deseja realmente sair da sua conta mágica?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 py-2 rounded-xl border border-white/20 text-xs font-medium text-white hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              onClick={handleLogoutClick}
              className="flex-1 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
            >
              Sim, Sair
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-300 font-bold text-xs hover:bg-rose-500/20 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Minha Conta</span>
        </button>
      )}
    </div>
  );
};
