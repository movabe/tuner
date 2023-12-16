import aubio from './aubio.js';

// Tuner
const Tuner = function (a4) {
  this.middleA = a4 || 440;
  this.semitone = 69;
  this.bufferSize = 4096;
  this.playing = {
    status: false,
    semitone: 0,
  };
  this.noteStrings = [
    'C',
    'C♯',
    'D',
    'D♯',
    'E',
    'F',
    'F♯',
    'G',
    'G♯',
    'A',
    'A♯',
    'B'
  ];

  this.initGetUserMedia();
}

// Get user media
Tuner.prototype.initGetUserMedia = function () {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!window.AudioContext) {
    return alert('AudioContext not supported');
  }

  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        alert('getUserMedia is not implemented in this browser');
      }

      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }
}

// Start recording
Tuner.prototype.startRecording = function () {
  const self = this;

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(function (stream) {
      self.audioContext.createMediaStreamSource(stream).connect(self.analyser)
      self.analyser.connect(self.scriptProcessor)
      self.scriptProcessor.connect(self.audioContext.destination)
      self.scriptProcessor.addEventListener('audioprocess', function (event) {
        const frequency = self.pitchDetector.do(
          event.inputBuffer.getChannelData(0)
        )
        if (frequency && self.onNoteDetected) {
          const note = self.getNote(frequency)
          self.onNoteDetected({
            name: self.noteStrings[note % 12],
            value: note,
            cents: self.getCents(frequency, note),
            octave: parseInt(note / 12) - 1,
            frequency: frequency,
          });
        }
      });
    })
    .catch(function (error) {
      console.log(error.name + ': ' + error.message);
    });
}

// Initialise tuner
Tuner.prototype.init = function () {
  if (!this.audioContext) { this.audioContext = new window.AudioContext(); }
  this.analyser = this.audioContext.createAnalyser();
  this.scriptProcessor = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1);

  const self = this;

  aubio().then(function (aubio) {
    self.pitchDetector = new aubio.Pitch('default', self.bufferSize, 1, self.audioContext.sampleRate);
    self.startRecording();
  });
}

// Get note
Tuner.prototype.getNote = function (frequency) {
  const note = 12 * (Math.log(frequency / this.middleA) / Math.log(2))
  return Math.round(note) + this.semitone;
}

// Get reference frequency
Tuner.prototype.getReferenceFrequency = function (note) {
  return this.middleA * Math.pow(2, (note - this.semitone) / 12);
}

// Get cents
Tuner.prototype.getCents = function (frequency, note) {
  return Math.floor(
    (1200 * Math.log(frequency / this.getReferenceFrequency(note))) / Math.log(2)
  );
}

// Play reference note
Tuner.prototype.play = function (frequency) {
  if (!this.synth) {
    this.synth = new Tone.FMSynth().toDestination();
    this.reverb = new Tone.Reverb('1').toDestination();
    this.synth.connect(this.reverb);
  }
  
  this.synth.triggerAttack(frequency);
}

// Stop reference note
Tuner.prototype.stop = function () {
  if (this.synth) {
    this.synth.triggerRelease('+0.1');
  }
}

// Oscilloscope
const Oscilloscope = function (middle) {
  this.$canvas = document.querySelector('.t_oscilloscope');
  const { width, height } = middle.getBoundingClientRect();
  this.$canvas.width = width;
  this.$canvas.height = height;

  window.addEventListener('resize', () => {
    const { width, height } = middle.getBoundingClientRect();
    this.$canvas.width = width;
    this.$canvas.height = height;
  });

  this.ctx = this.$canvas.getContext('2d');
}

// Oscilloscope update
Oscilloscope.prototype.update = function (dataArray) {
  this.ctx.fillStyle = '#fff';
  this.ctx.fillRect(0, 0, this.$canvas.width, this.$canvas.height);
  this.ctx.strokeStyle = '#B58AAC';
  this.ctx.lineWidth = 2;
  this.ctx.beginPath();

  const sliceWidth = this.$canvas.width * 1.0 / dataArray.length;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * this.$canvas.height / 2;

    if (i === 0) {
      this.ctx.moveTo(x, y);
    } else {
      this.ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  this.ctx.lineTo(this.$canvas.width, this.$canvas.height / 2);
  this.ctx.stroke();
}

// App
const App = function () {
  this.$a4 = document.querySelector('.t_base_freq');
  this.$container = document.querySelector('.t_container');
  this.$listener = document.querySelector('.t_listener');
  this.$overlay = document.querySelector('.t_overlay');
  this.$tune = document.querySelector('.t_tune');
  this.$middle = document.querySelector('.t_listener_middle');
  this.$bearing = document.querySelector('.t_listener_bearing');
  this.$note = document.querySelector('.t_note_played');
  this.$frequency = document.querySelector('.t_note_frequency');
  this.$accuracy = document.querySelector('.t_note_accuracy');
  this.$mode = document.querySelector('.t_mode');

  this.note = {
    name: 'A',
    frequency: this.a4,
    octave: 4,
    value: 69,
    cents: 0,
  };

  this.initA4();
  this.tuner = new Tuner(this.a4);
  this.oscilloscope = new Oscilloscope(this.$middle);
  this.mode = 'violin';

  this.references = {
    g: this.a4 * Math.pow(2, -14 / 12),
    d: this.a4 * Math.pow(2, -7 / 12),
    a: this.a4,
    e: this.a4 * Math.pow(2, 7 / 12),
  };
}

// Change base frequency
App.prototype.initA4 = function () {
  this.a4 = parseInt(localStorage.getItem('a4')) || 440;
  this.$a4.value = this.a4;
}

// Start app
App.prototype.start = function () {
  const self = this;

  this.tuner.onNoteDetected = function (note) {
    if (!self.tuner.playing.status) {
      if (self.lastNote === note.name) {
        self.update(note);
        self.updateUI();
        self.checkAccuracy();
      } else {
        self.lastNote = note.name;
      }
    }
  }

  this.$tune.addEventListener('click', function () {
    self.$overlay.setAttribute('style', 'display: none');
    self.tuner.init();
    self.dataArray = new Uint8Array(self.tuner.analyser.frequencyBinCount);
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('t_ref')) {
      const refs = document.querySelectorAll('.t_ref');
      const { semitone } = e.target.dataset;

      if (self.tuner.playing.status && self.tuner.playing.semitone === semitone) {
        self.tuner.stop();
        self.tuner.playing = {
          status: false,
          semitone: 0,
        };
        refs.forEach((ref) => ref.classList.remove('active'));
        self.$listener.classList.remove('disabled');
      } else {
        const { semitone } = e.target.dataset;
        const refFreq = self.a4 / Math.pow(2, -semitone / 12);
        self.tuner.play(refFreq);
        self.tuner.playing = {
          status: true,
          semitone,
        };
        refs.forEach((ref) => ref.classList.remove('active'));
        e.target.classList.add('active');
        self.note = {
          name: 'A',
          frequency: this.a4,
          octave: 4,
          value: 69,
          cents: 0,
        };
        self.$listener.classList.add('disabled');
      }
    }
  });

  this.$a4.addEventListener('change', function () {
    const { value } = this;

    if (!parseInt(value) || parseInt(value) === self.a4) {
      return;
    }

    self.a4 = parseInt(value);
    self.$a4.value = value;
    self.tuner.middleA = parseInt(value);
    self.update({
      name: 'A',
      frequency: self.a4,
      octave: 4,
      value: 69,
      cents: 0,
    });
    localStorage.setItem('a4', parseInt(value));
  });

  this.$mode.addEventListener('change', () => {
    const { value } = this.$mode;
    self.mode = value;
  });

  this.updateOscilloscope();
}

// Update app
App.prototype.update = function (note) {
  this.note = note;
}

// Update UI
App.prototype.updateUI = function () {
  const { width } = this.$bearing.getBoundingClientRect();
  this.$bearing.setAttribute('style', `left: calc(${this.note.cents + 50}% - ${width / 2}px)`);
  if (this.note.cents >= -3 && this.note.cents <= 3) {
    this.$bearing.classList.add('in-tune');
  } else {
    this.$bearing.classList.remove('in-tune');
  }
  this.$note.innerText = this.note.name;
  this.$frequency.innerText = `${this.note.frequency.toFixed(2)}hz`;

  requestAnimationFrame(this.updateUI.bind(this));
}

// Update oscilloscope
App.prototype.updateOscilloscope = function () {
  if (!this.tuner.playing.status) {
    if (this.tuner.analyser) {
      this.tuner.analyser.getByteTimeDomainData(this.dataArray);
      this.oscilloscope.update(this.dataArray);
    }
  }
  requestAnimationFrame(this.updateOscilloscope.bind(this));
}

// Update references
App.prototype.updateReferences = function () {}

// Check Accuracy
App.prototype.checkAccuracy = function () {
  if (this.mode === 'violin') {
    const { g, d, a, e } = this.references;
    const { frequency } = this.note;
    let baseNote;
    let baseFreq;
    let accuracy;

    const nearG = frequency < (g + ((d - g) / 2));
    const nearD = frequency > (g + ((d - g) / 2)) && frequency < (d + ((a - d) / 2));
    const nearA = frequency > (d + ((a - d) / 2)) && frequency < (a + ((e - a) / 2));
    const nearE = frequency > (a + ((e - a) / 2));

    if (nearG) { baseFreq = g; baseNote = 'G'; }
    else if (nearD) { baseFreq = d; baseNote = 'D'; }
    else if (nearA) { baseFreq = a; baseNote = 'A'; }
    else if (nearE) { baseFreq = e; baseNote = 'E'; }

    const cents = (1200 * Math.log(frequency / baseFreq)) / Math.log(2);
    
    if (cents < -3) {
      accuracy = `Too low from ${baseNote}`;
    } else if (cents >= -3 && cents <= 3) {
      accuracy = 'Good!';
    } else if (cents > 3) {
      accuracy = `Too high from ${baseNote}`;
    } else {
      accuracy = '';
    }

    if (accuracy === 'Good!') { 
      this.$middle.classList.add('accurate');
    } else { 
      this.$middle.classList.remove('accurate');
    }

    this.$accuracy.innerText = accuracy;
  } else {
    this.$accuracy.innerText = '';
    this.$middle.classList.remove('accurate');
  }
}

// Execute
const app = new App();
app.start();
