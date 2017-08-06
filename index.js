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
  var glCtx = canvas.getContext('webgl');
  assert(glCtx, 'Unable to load webgl context');

  // Draw on our canvas
  glCtx.clearColor(0.0, 0.0, 0.0, 1.0);
  glCtx.clearDepth(1.0);
  glCtx.enable(glCtx.DEPTH_TEST);
  glCtx.depthFunc(glCtx.LEQUAL);
}

// Invoke our main function
main();
