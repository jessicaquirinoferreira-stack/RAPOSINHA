// Audio Service com suporte a arquivos MP3/WAV e Sintetizador Encantado Medieval com Web Audio API

type AudioStateListener = (state: {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isSynthesized: boolean;
}) => void;

class EnchantedAudioEngine {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private synthInterval: number | null = null;
  private synthGainNode: GainNode | null = null;
  private listeners: Set<AudioStateListener> = new Set();
  
  private isPlaying = false;
  private currentTime = 0;
  private duration = 300; // default 5 min
  private playbackRate = 1.0;
  private isSynthesized = false;
  private currentStoryId: string | null = null;
  private sleepTimerId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';

      this.audioElement.addEventListener('timeupdate', () => {
        if (!this.isSynthesized && this.audioElement) {
          this.currentTime = this.audioElement.currentTime;
          this.duration = this.audioElement.duration || this.duration;
          this.notify();
        }
      });

      this.audioElement.addEventListener('ended', () => {
        this.stop();
      });

      this.audioElement.addEventListener('loadedmetadata', () => {
        if (this.audioElement && this.audioElement.duration) {
          this.duration = this.audioElement.duration;
          this.notify();
        }
      });
    }
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      playbackRate: this.playbackRate,
      isSynthesized: this.isSynthesized,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  public async loadAndPlay(storyId: string, audioUrl?: string, nominalDuration = 300) {
    if (this.currentStoryId === storyId && (this.isPlaying || this.currentTime > 0)) {
      if (!this.isPlaying) {
        this.resume();
      }
      return;
    }

    this.stop();
    this.currentStoryId = storyId;
    this.duration = nominalDuration || 300;
    this.currentTime = 0;

    // Se houver uma URL de áudio real carregada
    if (audioUrl && audioUrl.trim().length > 5 && !audioUrl.startsWith('synth:')) {
      this.isSynthesized = false;
      if (this.audioElement) {
        this.audioElement.src = audioUrl;
        this.audioElement.playbackRate = this.playbackRate;
        try {
          await this.audioElement.play();
          this.isPlaying = true;
          this.notify();
          return;
        } catch (e) {
          console.warn('Falha ao reproduzir áudio externo, ativando Sintetizador Encantado:', e);
        }
      }
    }

    // Caso não haja URL ou falhe, toca a melodia encantada medieval sintética
    this.startEnchantedSynthesizer();
  }

  public resume() {
    if (this.isPlaying) return;

    if (!this.isSynthesized && this.audioElement && this.audioElement.src) {
      this.audioElement.play().then(() => {
        this.isPlaying = true;
        this.notify();
      }).catch(() => {
        this.startEnchantedSynthesizer();
      });
    } else {
      this.startEnchantedSynthesizer();
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.synthInterval) {
      window.clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.notify();
  }

  public stop() {
    this.pause();
    this.currentTime = 0;
    if (this.audioElement) {
      this.audioElement.currentTime = 0;
    }
    this.notify();
  }

  public seek(seconds: number) {
    const clamped = Math.max(0, Math.min(seconds, this.duration));
    this.currentTime = clamped;
    if (!this.isSynthesized && this.audioElement) {
      this.audioElement.currentTime = clamped;
    }
    this.notify();
  }

  public skip(secondsDelta: number) {
    this.seek(this.currentTime + secondsDelta);
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
    this.notify();
  }

  public setSleepTimer(minutes: number, onFinish?: () => void) {
    if (this.sleepTimerId) {
      window.clearTimeout(this.sleepTimerId);
      this.sleepTimerId = null;
    }

    if (minutes > 0) {
      this.sleepTimerId = window.setTimeout(() => {
        this.pause();
        this.sleepTimerId = null;
        if (onFinish) onFinish();
      }, minutes * 60 * 1000);
    }
  }

  // Sintetizador Mágico de Harpa e Flauta Medieval
  private startEnchantedSynthesizer() {
    this.isSynthesized = true;
    this.isPlaying = true;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Escala pentatônica celta / de conto de fadas (Hz)
      const enchantedNotes = [
        261.63, // C4 (Dó)
        293.66, // D4 (Ré)
        329.63, // E4 (Mi)
        392.00, // G4 (Sol)
        440.00, // A4 (Lá)
        523.25, // C5 (Dó agudo)
        587.33, // D5
        659.25, // E5
        783.99, // G5 (Campanilha)
      ];

      const playChime = () => {
        if (!this.audioCtx || !this.isPlaying) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        // Escolhe notas harmoniosas
        const note = enchantedNotes[Math.floor(Math.random() * enchantedNotes.length)];
        osc.type = Math.random() > 0.4 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(note, this.audioCtx.currentTime);

        // Curva suave de harpa / campana
        gain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, this.audioCtx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 2.2);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 2.3);
      };

      // Toca a primeira nota
      playChime();

      if (this.synthInterval) {
        window.clearInterval(this.synthInterval);
      }

      // Atualiza o tempo e dispara notas
      this.synthInterval = window.setInterval(() => {
        if (!this.isPlaying) return;

        this.currentTime += 0.5 * this.playbackRate;
        if (this.currentTime >= this.duration) {
          this.stop();
          return;
        }

        // 35% de chance a cada meio segundo de soar um acorde de harpa
        if (Math.random() < 0.45) {
          playChime();
        }

        this.notify();
      }, 500);

      this.notify();
    } catch (e) {
      console.error('Erro no Sintetizador de Áudio Encantado:', e);
    }
  }
}

export const audioEngine = new EnchantedAudioEngine();
