class CustomButtonController extends ButtonController {
  // Constructor that calls the parent constructor
  constructor() {
    super();
  }

  // Overriding the original addClickEvent method
  addClickEvent(button, diffFromA) {
    button.addEventListener('click', (event) => {
      const noteValue = app.tuner.semitone + diffFromA;

      const volumeMap = {
        'E': 0.8,
        'A': 0.9,
        'D': 0.7,
        'G': 0.6,
      };

      // Get volume from volume map
      const volume = volumeMap[button.getAttribute('data-note')];

       // Stops playing note if this button is clicked again
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
        'cents': 0,
      };
      
      app.update(note);
    });
  }
}

// Create an instance of the new CustomButtonController
new CustomButtonController();
