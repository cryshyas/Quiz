/**
 * ==============================================================================
 * 🔊 Web Audio API 기반 무음향/경량 사운드 엔진 (sound.js)
 * ==============================================================================
 * - 외부 mp3/wav 파일 없이 브라우저 오디오 컨텍스트로 순수 파형 합성
 * - 공개수업 배려: 기본값 음소거(Mute) 상태
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false; // 기본값: 음소거 (공개수업 중 교실 소음 방지)
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.init();
      this.playTap(); // 켜졌음을 알리는 가벼운 비프음
    }
    return this.enabled;
  }

  setSound(enabled) {
    this.enabled = enabled;
    if (this.enabled) {
      this.init();
    }
  }

  // 1. 가벼운 클릭/탭 효과음
  playTap() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // 2. 정답 효과음 (맑고 경쾌한 3화음 아르페지오: 도-미-솔)
  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.08;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }

  // 3. 오답 효과음 (부드럽고 둥글어 학생에게 상처 주지 않는 저음 알림)
  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.25);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // 4. 서류철 도장 쾅! 효과음 (중저음 타격감 + 임팩트)
  playStamp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 타격음 (Kick 느낌)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // 5. 최종 금고 해제 효과음 (철컥 래칫 + 금속성 울림)
  playVaultOpen() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 찰칵 클릭음 2연타
    [0, 0.08].forEach((offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(1200, t + offset);
      osc.frequency.exponentialRampToValueAtTime(200, t + offset + 0.04);

      gain.gain.setValueAtTime(0.15, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + offset);
      osc.stop(t + offset + 0.05);
    });

    // 울려 퍼지는 벨소리
    const bell = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bell.type = "sine";
    bell.frequency.setValueAtTime(880, t + 0.15); // A5
    bellGain.gain.setValueAtTime(0.25, t + 0.15);
    bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    bell.connect(bellGain);
    bellGain.connect(this.ctx.destination);

    bell.start(t + 0.15);
    bell.stop(t + 0.8);
  }
}

// 전역 싱글톤 인스턴스 생성
window.quizSound = new SoundEngine();
