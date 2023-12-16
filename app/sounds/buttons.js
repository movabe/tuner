const ButtonController = function() {
  this.buttonToDiffMap = {
    'E': 7,
    'A': 0,
    'D': -5,
    'G': -17,
  };
  this.currentlyPlaying = null;
  this.initButtons();
}

ButtonController.prototype.initButtons = function() {
  for (let buttonId in this.buttonToDiffMap) { 
    let button = document.querySelector(`button[data-note='${buttonId}']`);
    this.addClickEvent(button, this.buttonToDiffMap[buttonId]);
  }
}

ButtonController.prototype.addClickEvent = function(button, diffFromA) {
  button.addEventListener('click', (event) => {
    const noteValue = app.tuner.semitone + diffFromA;

    // Stops playing note if this button is clicked again
    if (noteValue === this.currentlyPlaying) {
      app.tuner.stopOscillator();
      this.currentlyPlaying = null;
      return;
    }

    const frequency = app.tuner.getStandardFrequency(noteValue);
    app.tuner.play(frequency);
    this.currentlyPlaying = noteValue;

    const note = {
      'name': button.getAttribute('data-note'),
      'frequency': frequency,
      'octave': Math.floor(noteValue / 12) - 1,
      'value': noteValue,
      'cents': 0 
    }
    app.update(note);
  });
}

new ButtonController();
