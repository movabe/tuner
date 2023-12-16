const ButtonController = function() {
  this.buttonToDiffMap = {
    'E': 19,
    'A': 12,
    'D': 7,
    'G': 2,
  };
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
    const frequency = app.tuner.getStandardFrequency(noteValue);
    app.tuner.play(frequency);

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
