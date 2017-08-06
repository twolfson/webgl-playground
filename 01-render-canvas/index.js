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

  // Resolve our WebGL context
  var gl = canvas.getContext('webgl');
  assert(gl, 'Unable to load webgl context');

  // Set clear color and depth values (rgba, ranging from 0.0 to 1.0 includes)
  // DEV: This doesn't perform clear, only the "default" values
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);

  // Enable and configure depth-based obfuscation capability
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // Trigger a clear for colors and depth on our canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

// Invoke our main function
main();
