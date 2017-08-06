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

  var shaderProgram, vertexPositionAttribute;
  function compileShader(gl, shader) {
    gl.compileShader(shader);
    assert(gl.getShaderParameter(shader, gl.COMPILE_STATUS),
      'Unable to compile shader: ' + gl.getShaderInfoLog(shader));
  }
  (function initShaders () {
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
      uniform mat4 uniformModelViewMatrix;
      uniform mat4 uniformPerspectiveMatrix;
      void main(void) {
        gl_Position = uniformPerspectiveMatrix * uniformModelViewMatrix * vec4(aVertexPosition, 1.0);
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
    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(vertexPositionAttribute);
  }());

  var squareVerticesBuffer;
  (function initBuffers () {
    // Create a buffer for our square's vertices
    squareVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

    // Create our square's vertices
    // squareVertices = [x1, y1, z1, x2, y2, ...];
    var squareVerticesArr = new Float32Array([
       1.0,  1.0, 0.0,
      -1.0,  1.0, 0.0,
       1.0, -1.0, 0.0,
      -1.0, -1.0, 0.0
    ]);

    // Bind our buffer data
    // TODO: How does WebGL know we are referring to `squareVerticesBuffer`?
    //   Can we only hve 1 ARRAY_BUFFER at a time?
    gl.bufferData(gl.ARRAY_BUFFER, squareVerticesArr, gl.STATIC_DRAW);
    // TODO: Do we need to set `itemSize` and `numItems` as in `gpjt` version?
  }());


  var perspectiveMatrix = mat4.create();
  var modelViewMatrix = mat4.create();
  function setMatrixUniforms() {
    var uniformPerspectiveLocation = gl.getUniformLocation(shaderProgram, 'uniformPerspectiveMatrix');
    gl.uniformMatrix4fv(uniformPerspectiveLocation, false, perspectiveMatrix);

    var uniformModelViewLocation = gl.getUniformLocation(shaderProgram, 'uniformModelViewMatrix');
    gl.uniformMatrix4fv(uniformModelViewLocation, false, modelViewMatrix);
  }
  (function drawScene () {
    // Clear our canvas to our configured presets (black canvas)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Estalish our perspective
    // DEV: We have switched from mdn to a mdn/gpjt hybrid here
    mat4.perspective(perspectiveMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    // Update our model view matrix
    // TODO: Verify that `mvMatrix` is "model view matrix"
    mat4.identity(modelViewMatrix);
    // DEV: Translate model-view
    // TODO: Verify this note is accurate
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

    // Draw our square
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }());
}

// Invoke our main function
main();
