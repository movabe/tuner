var refreshTime = 100; // microseconds
var sensitivity = 2; // + and - interval

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
  tunerContainer.style.backgroundColor = '';  // Reset background color

  var plusElement = tunerContainer.querySelector('.plus');
  var minusElement = tunerContainer.querySelector('.minus');

  if (angle >= -sensitivity && angle <= sensitivity) {
    plusElement.style.color = 'green';
    minusElement.style.color = 'green';
  } else if (angle < -sensitivity) {
    plusElement.style.color = 'gray';
    minusElement.style.color = 'red';
    tunerContainer.style.backgroundColor = '#748291';
  } else if (angle > sensitivity) {
    plusElement.style.color = 'red';
    minusElement.style.color = 'gray';
    tunerContainer.style.backgroundColor = '#748291';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  setInterval(colorChange, refreshTime);
});
