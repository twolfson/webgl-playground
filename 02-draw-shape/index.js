// Depends on `gl-matrix`

// Define helper functions
function assert(val, msg) {
  if (!val) { throw new Error(msg); }
}

// Define our main function
function main() {
  // Resolve our canvas
  var canvasEl = document.getElementById('canvas');
  assert(canvasEl, 'Unable to find element #canvas');
  var canvasWidth = canvasEl.width; assert(canvasWidth);
  assert(typeof canvasWidth === 'number');
  var canvasHeight = canvasEl.height; assert(canvasHeight);
  assert(typeof canvasHeight === 'number');

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
  }());

  var shaderProgram, vertexPositionAttributeLocation;
  function _compileShader(gl, shader) {
    gl.compileShader(shader);
    assert(gl.getShaderParameter(shader, gl.COMPILE_STATUS),
      'Unable to compile shader: ' + gl.getShaderInfoLog(shader));
  }
  (function initShaders () {
    // Compile our shaders
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    // TODO: Document GLSL language
    // TODO: Get deeper explanation of how WebGL relies on vertex/fragment shaders/programs
    //   Current thought is it takes JS bound vars and sets up variables to render with in WebGL engine
    //   Instead of it being done in JS
    gl.shaderSource(fragmentShader, `
      void main(void) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
      }
    `);
    _compileShader(gl, fragmentShader);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
      attribute vec3 aVertexPosition;
      uniform mat4 uniformModelViewMatrix;
      uniform mat4 uniformPerspectiveMatrix;
      void main(void) {
        gl_Position = uniformPerspectiveMatrix * uniformModelViewMatrix * vec4(aVertexPosition, 1.0);
      }
    `);
    _compileShader(gl, vertexShader);

    // Create a shader program with our shaders
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    assert(gl.getProgramParameter(shaderProgram, gl.LINK_STATUS),
      'Unable to link program: ' + gl.getProgramInfoLog(shaderProgram));

    // Complete binding to our shader program
    gl.useProgram(shaderProgram);
    vertexPositionAttributeLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(vertexPositionAttributeLocation);
  }());

  var squareVerticesBuffer;
  (function initBuffers () {
    // Create our square's vertices
    // squareVertices = [x1, y1, z1, x2, y2, ...];
    var squareVerticesArr = new Float32Array([
       1.0,  1.0, 0.0,
      -1.0,  1.0, 0.0,
       1.0, -1.0, 0.0,
      -1.0, -1.0, 0.0
    ]);

    // Create, bind, and update a buffer for our square's vertices
    // DEV: We bind/update via the ARRAY_BUFFER register
    squareVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, squareVerticesArr, gl.STATIC_DRAW);
  }());

  (function drawScene () {
    // Clear our canvas to our configured presets (black canvas)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Estalish our perspective
    // DEV: We have switched from mdn to a mdn/gpjt hybrid here
    var perspectiveMatrix = mat4.create();
    var vertFieldOfViewDegrees = 45;
    mat4.perspective(perspectiveMatrix /* output matrix */,
      (vertFieldOfViewDegrees * 2 * Math.PI) / 180 /* degrees -> radians */,
      canvasWidth / canvasHeight /* aspect */,
      0.1 /* near bound */, 100.0 /* far bound */);

    // Move our content back so we can see it from the camera
    var modelViewMatrix = mat4.create();
    mat4.identity(modelViewMatrix);
    // Translate by [x, y, z]
    // DEV: Under the hood, this will update the `w` (origin) column in our matrix
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);

    // Draw our square
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    var uniformPerspectiveLocation = gl.getUniformLocation(shaderProgram, 'uniformPerspectiveMatrix');
    gl.uniformMatrix4fv(uniformPerspectiveLocation, false, perspectiveMatrix);
    var uniformModelViewLocation = gl.getUniformLocation(shaderProgram, 'uniformModelViewMatrix');
    gl.uniformMatrix4fv(uniformModelViewLocation, false, modelViewMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }());
}

// Invoke our main function
main();
