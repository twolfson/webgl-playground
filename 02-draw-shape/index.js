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

  (function configureWebgl () {
    // Set clear color and depth values (rgba, ranging from 0.0 to 1.0 includes)
    // DEV: This doesn't perform clear, only the "default" values
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    // Enable and configure depth-based obfuscation capability
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // Trigger a clear for colors and depth on our canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }());

  var shaderProgram;
  function compileShader(gl, shader) {
    gl.compileShader(shader);
    assert(gl.getShaderParameter(shader, gl.COMPILE_STATUS),
      'Unable to compile shader: ' + gl.getShaderInfoLog(shader));
  }
  (function initShaders() {
    // Compile our shaders
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
      void main(void) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    `);
    compileShader(gl, fragmentShader);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
      attribute vec3 aVertexPosition;
      uniform mat4 uMVMatrix;
      uniform mat4 uPMatrix;
      void main(void) {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
      }
    `);
    compileShader(gl, vertexShader);

    // Create a shader program with our shaders
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    assert(gl.getProgramParameter(shaderProgram, gl.LINK_STATUS),
      'Unable to link program: ' + gl.getProgramInfoLog(shaderProgram));

    // Complete binding to our shader program
    gl.useProgram(shaderProgram);
    var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(vertexPositionAttribute);
  }());
}

// Invoke our main function
main();
