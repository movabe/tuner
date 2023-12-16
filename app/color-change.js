var refreshTime = 250; // microseconds
var sensitivity = 1; // + and - interval

function colorChange() {
  var el = document.querySelector(".tuner-container .meter-pointer");
  var st = window.getComputedStyle(el, null);
  var tr = st.getPropertyValue("transform") || "FAIL";

  var values = tr.split('(')[1].split(')')[0].split(',');
  var a = values[0];
  var b = values[1];
  var scale = Math.sqrt(a * a + b * b);
  var sin = b / scale;
  var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));

  // Apply styles directly to the elements
  var tunerContainer = document.querySelector('.tuner-container');

  var plusElement = tunerContainer.querySelector('.plus');
  var minusElement = tunerContainer.querySelector('.minus');
  var plusImage = tunerContainer.querySelector('.plus-image');
  var minusImage = tunerContainer.querySelector('.minus-image');
  
  // Set the default color to white
  plusElement.style.color = '#DFECDF';
  minusElement.style.color = '#DFECDF';
  plusImage.style.display = 'none'; // Hide plus image by default
  minusImage.style.display = 'none'; // Hide minus image by default

  if (angle >= -sensitivity && angle <= sensitivity) {
    tunerContainer.style.backgroundColor = '#DFECDF';
    plusImage.style.display = 'inline-block';
    minusImage.style.display = 'inline-block';
  } else if (angle < -sensitivity) {
    plusElement.style.color = '#e74c3c';
    tunerContainer.style.backgroundColor = ''; // Reset background color
  } else if (angle > sensitivity) {
    minusElement.style.color = '#e74c3c';
    tunerContainer.style.backgroundColor = ''; // Reset background color
  }
}

document.addEventListener('DOMContentLoaded', function () {
  setInterval(colorChange, refreshTime);
});
