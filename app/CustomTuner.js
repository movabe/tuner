class CustomTuner extends Tuner {
  play(frequency, volume) {
    if (!this.oscillator) {
      this.oscillator = this.audioContext.createOscillator();
      this.gainNode = this.audioContext.createGain();

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      this.oscillator.start();
    }
    
    this.oscillator.frequency.value = frequency;
    this.gainNode.gain.value = volume;
    console.log(this.audioContext.state)
  }
    
  stopOscillator() {
    if (this.oscillator) {
      this.oscillator.disconnect(this.gainNode);
      this.gainNode.disconnect(this.audioContext.destination);
      this.oscillator.stop();
      this.oscillator = null;
    }
  }
}
