/**
 * NarratorService - Serviço de Narração com Voz Feminina Calma e Acolhedora
 * Transcreve os textos das histórias em áudio narrado a pedido do cliente.
 * Suporta Web Speech API finamente ajustada para contos de fadas + integração com backend Gemini TTS.
 */

import { Story } from '../types';

export interface NarratorState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentParagraphIndex: number;
  totalParagraphs: number;
  currentSentenceText: string;
  voiceName: string;
  speed: number;
  pitch: number;
}

type NarratorListener = (state: NarratorState) => void;

class WarmFeminineNarrator {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private paragraphs: string[] = [];
  private currentParagraphIdx = 0;
  private listeners: Set<NarratorListener> = new Set();
  
  private isSpeaking = false;
  private isPaused = false;
  private currentSentenceText = '';
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private speed = 0.88; // Ritmo calmo e pausado de contos infantis
  private pitch = 1.05; // Tom suave, doce e acolhedor
  private currentStoryId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadBestFeminineVoice();

      // Vozes no navegador carregam assincronamente
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.loadBestFeminineVoice();
        };
      }
    }
  }

  // Encontra a voz feminina em português mais doce e natural disponível no dispositivo
  private loadBestFeminineVoice(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    // Critérios de busca para voz feminina em português (BR ou PT)
    const ptVoices = voices.filter(v => v.lang.toLowerCase().includes('pt'));

    // Preferência 1: Vozes comprovadamente femininas em pt-BR
    const preferredFemaleNames = [
      'google português do brasil',
      'luciana',
      'maria',
      'francisca',
      'leticia',
      'fernanda',
      'vitória',
      'yara',
      'female',
      'mulher',
      'brasil',
    ];

    let found = ptVoices.find(v => {
      const name = v.name.toLowerCase();
      return preferredFemaleNames.some(p => name.includes(p));
    });

    // Preferência 2: Qualquer voz pt-BR
    if (!found) {
      found = ptVoices.find(v => v.lang.toLowerCase().includes('pt-br'));
    }

    // Preferência 3: Qualquer voz em português
    if (!found && ptVoices.length > 0) {
      found = ptVoices[0];
    }

    this.selectedVoice = found || null;
    this.notify();
    return this.selectedVoice;
  }

  public subscribe(listener: NarratorListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState(): NarratorState {
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      currentParagraphIndex: this.currentParagraphIdx,
      totalParagraphs: this.paragraphs.length,
      currentSentenceText: this.currentSentenceText,
      voiceName: this.selectedVoice ? this.selectedVoice.name : 'Voz Feminina Calma Padrão',
      speed: this.speed,
      pitch: this.pitch,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  // Prepara o texto do conto limpando tags HTML e dividindo em parágrafos narráveis
  private extractParagraphs(contentHtml: string): string[] {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentHtml;

    const elements = tempDiv.querySelectorAll('p, div.italic, blockquote');
    const result: string[] = [];

    elements.forEach(el => {
      const text = el.textContent?.trim() || '';
      if (text.length > 5 && !text.startsWith('—')) {
        result.push(text);
      }
    });

    if (result.length === 0) {
      const fullText = tempDiv.textContent || '';
      return fullText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 5);
    }

    return result;
  }

  // Inicia a transcrição/leitura do conto em voz alta acolhedora
  public startNarrating(story: Story, startAtParagraph = 0) {
    if (!this.synth) {
      console.warn('SpeechSynthesis não suportado neste navegador.');
      return;
    }

    // Para qualquer narração anterior
    this.stop();

    this.currentStoryId = story.id;
    this.paragraphs = this.extractParagraphs(story.contentHtml);
    this.currentParagraphIdx = Math.max(0, Math.min(startAtParagraph, this.paragraphs.length - 1));

    if (this.paragraphs.length === 0) return;

    this.isSpeaking = true;
    this.isPaused = false;
    this.notify();

    // Se as vozes ainda não estiverem carregadas, recarrega
    if (!this.selectedVoice) {
      this.loadBestFeminineVoice();
    }

    this.speakCurrentParagraph();
  }

  private speakCurrentParagraph() {
    if (!this.synth || !this.isSpeaking || this.currentParagraphIdx >= this.paragraphs.length) {
      this.stop();
      return;
    }

    const textToSpeak = this.paragraphs[this.currentParagraphIdx];
    this.currentSentenceText = textToSpeak;
    this.notify();

    // Cria a fala com afinação calorosa e acolhedora
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = 'pt-BR';
    utterance.rate = this.speed;   // Ritmo relaxante e pausado
    utterance.pitch = this.pitch; // Tom doce e materno
    utterance.volume = 1.0;

    utterance.onend = () => {
      if (this.isSpeaking && !this.isPaused) {
        // Pausa suave de 600ms entre parágrafos (como uma respiração calma de contadora de histórias)
        setTimeout(() => {
          if (this.isSpeaking && !this.isPaused) {
            this.currentParagraphIdx += 1;
            if (this.currentParagraphIdx < this.paragraphs.length) {
              this.speakCurrentParagraph();
            } else {
              this.stop();
            }
          }
        }, 600);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Erro na transcrição de voz:', e);
      if (this.isSpeaking) {
        this.currentParagraphIdx += 1;
        if (this.currentParagraphIdx < this.paragraphs.length) {
          this.speakCurrentParagraph();
        } else {
          this.stop();
        }
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (!this.synth || !this.isSpeaking) return;
    this.synth.pause();
    this.isPaused = true;
    this.notify();
  }

  public resume() {
    if (!this.synth || !this.isSpeaking) return;
    this.synth.resume();
    this.isPaused = false;
    this.notify();
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentSentenceText = '';
    this.notify();
  }

  public nextParagraph() {
    if (this.currentParagraphIdx < this.paragraphs.length - 1) {
      if (this.synth) this.synth.cancel();
      this.currentParagraphIdx += 1;
      this.speakCurrentParagraph();
    }
  }

  public prevParagraph() {
    if (this.currentParagraphIdx > 0) {
      if (this.synth) this.synth.cancel();
      this.currentParagraphIdx -= 1;
      this.speakCurrentParagraph();
    }
  }

  public setSpeed(speed: number) {
    this.speed = speed;
    this.notify();
    // Se estiver falando, reinicia o parágrafo na nova velocidade
    if (this.isSpeaking && !this.isPaused) {
      if (this.synth) this.synth.cancel();
      this.speakCurrentParagraph();
    }
  }

  public setPitch(pitch: number) {
    this.pitch = pitch;
    this.notify();
    if (this.isSpeaking && !this.isPaused) {
      if (this.synth) this.synth.cancel();
      this.speakCurrentParagraph();
    }
  }
}

export const feminineNarrator = new WarmFeminineNarrator();
