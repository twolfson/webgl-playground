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
      uniform mat4 uniformProjectionMatrix;
      void main(void) {
        gl_Position = uniformProjectionMatrix * uniformModelViewMatrix * vec4(aVertexPosition, 1.0);
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

    // Retrieve the index/id/location of our `aVertexPosition` variable in our shader
    vertexPositionAttributeLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    assert(vertexPositionAttributeLocation !== -1);
    // Flag our index/id/location of `aVertexPosition` as a vertex attribute array
    // TODO: Look up "vertex attrib array" in GL terminology
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

    // Estalish our projection matrix
    // DEV: This is "projection" in "model-view-projection"
    // DEV: We have switched from mdn to a mdn/gpjt hybrid here
    var projectionMatrix = mat4.create();
    var vertFieldOfViewDegrees = 45;
    mat4.perspective(projectionMatrix /* output matrix */,
      (vertFieldOfViewDegrees * 2 * Math.PI) / 180 /* degrees -> radians */,
      canvasWidth / canvasHeight /* aspect */,
      0.1 /* near bound */, 100.0 /* far bound */);

    // Move our content back so we can see it from the camera
    // DEV: Technically, a model-view matrix is a collapsed "model to world" and "world to view" matrix
    //   https://www.youtube.com/watch?v=-tonZsbHty8
    var modelViewMatrix = mat4.create();
    mat4.identity(modelViewMatrix);
    // Translate by [x, y, z]
    // DEV: Under the hood, this will update the `w` (origin) column in our matrix
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);

    // Bind square vertices to the ARRAY_BUFFER register
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

    // Update the size info for our `aVertexPosition` variable
    gl.vertexAttribPointer(vertexPositionAttributeLocation, 3 /* vertex size */, gl.FLOAT /* type */,
      false /* normalized */, 0 /* stride */, 0 /* offset */);

    // Resolve and update our id/index/location for our matrix variables
    // TODO: Look up "uniform location" in GL terminology
    var uniformProjectionLocation = gl.getUniformLocation(shaderProgram, 'uniformProjectionMatrix');
    assert(uniformProjectionLocation);
    gl.uniformMatrix4fv(uniformProjectionLocation, false /* transpose */, projectionMatrix /* value */);
    var uniformModelViewLocation = gl.getUniformLocation(shaderProgram, 'uniformModelViewMatrix');
    assert(uniformModelViewLocation);
    gl.uniformMatrix4fv(uniformModelViewLocation,  false /* transpose */, modelViewMatrix /* value */);

    // Perform our draw with the linked shaders and given variables
    gl.drawArrays(gl.TRIANGLE_STRIP /* mode */, 0 /* first (vertex) */, 4 /* count (vertices) */);
  }());
}

// Invoke our main function
main();
