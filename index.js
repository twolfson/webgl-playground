// Based on https://github.com/mdn/webgl-examples
// Define helper functions
function assert(val, msg) {
  if (!val) { throw new Error(msg); }
}

// Define our main function
function main() {
  // Resolve our canvas
  var canvasEl = document.getElementById('canvas');
  assert(canvasEl, 'Unable to find element #canvas');

  // Draw on our canvas
  var ctx2d = canvas.getContext('2d');
  ctx2d.fillRect(0, 0, 100, 100);
}

// Invoke our main function
main();
