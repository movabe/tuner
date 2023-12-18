class CustomButtonController extends ButtonController {
  addClickEvent(button, diffFromA) {
    button.addEventListener('click', (event) => {
      const noteValue = app.tuner.semitone + diffFromA;

      const volumeMap = {
        'E': 0.8,
        'A': 0.9,
        'D': 0.7,
        'G': 0.6,
      };

      const volume = volumeMap[button.getAttribute('data-note')];

      if (noteValue === this.currentlyPlaying) {
        app.tuner.stopOscillator();
        this.currentlyPlaying = null;
        return;
      }

      const frequency = app.tuner.getStandardFrequency(noteValue);
      app.tuner.play(frequency, volume);
      this.currentlyPlaying = noteValue;

      const note = {
        'name': button.getAttribute('data-note'),
        'frequency': frequency,
        'octave': Math.floor(noteValue / 12) - 1,
        'value': noteValue,
        'cents': 0 
      };
      
      app.update(note);
    });
  }
}
new CustomButtonController();
