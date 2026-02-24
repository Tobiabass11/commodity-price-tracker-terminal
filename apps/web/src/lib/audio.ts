let audioContext: AudioContext | null = null;

export function playAlertSound(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) {
    return;
  }

  audioContext ??= new Ctx();

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.value = 880;

  gainNode.gain.value = 0.08;

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
  oscillator.stop(audioContext.currentTime + 0.2);
}
