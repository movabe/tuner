var refreshTime = 100; //microseconds
var sensitivity = 2; // + and - interval

function colorChange() {
  var el = document.getElementById("meter-pointer");
  var st = window.getComputedStyle(el, null);
  var tr = st.getPropertyValue("-webkit-transform") ||
    st.getPropertyValue("-moz-transform") ||
    st.getPropertyValue("-ms-transform") ||
    st.getPropertyValue("-o-transform") ||
    st.getPropertyValue("transform") ||
    "FAIL";

  var values = tr.split('(')[1].split(')')[0].split(',');
  var a = values[0];
  var b = values[1];
  var c = values[2];
  var d = values[3];

  var scale = Math.sqrt(a * a + b * b);
  var sin = b / scale;
  var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));

  // Find elements within .tuner-container
  var tunerContainer = document.querySelector('.tuner-container');
  
  // Find .plus, .minus, and .color-change within tunerContainer
  var plusElement = tunerContainer.querySelector('.plus');
  var minusElement = tunerContainer.querySelector('.minus');
  var colorChangeElement = tunerContainer.querySelector('.color-change');

  if (angle >= -sensitivity && angle <= sensitivity) {
    plusElement.style.color = 'green';
    minusElement.style.color = 'green';
    colorChangeElement.style.backgroundColor = 'green';
  } else if (angle < -sensitivity) {
    plusElement.style.color = 'gray';
    minusElement.style.color = 'red';
    colorChangeElement.style.color = '#748291';
    colorChangeElement.style.backgroundColor = '#748291';
  } else if (angle > sensitivity) {
    plusElement.style.color = 'red';
    minusElement.style.color = 'gray';
    colorChangeElement.style.backgroundColor = '#748291';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  setInterval(colorChange, refreshTime);
});
