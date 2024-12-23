import { getGL, initSimpleShaderProgram } from "./Utilities";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./Shaders";
import { Matrix4f, Vector } from "./Math";

class Mine {
    constructor(canvas, camera) {
        const gl = getGL(canvas);
        if (!gl) {
            throw new Error("[Mine.js] > WebGL not supported");
        }

        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.viewport(0, 0, canvas.width, canvas.height);

        // Initializing the shaders
        let abort = false;
        const shaderProgram = initSimpleShaderProgram(
            gl,
            VERTEX_SHADER,
            FRAGMENT_SHADER,
            error => {
                console.error("[Mine.js] > Shader compile error:", error);
                abort = true;
            },
            error => {
                console.error("[Mine.js] > Shader link error:", error);
                abort = true;
            }
        )

        if (abort) {
            throw new Error("[Mine.js] > Shader error");
        }

        gl.useProgram(shaderProgram);

        this.gl = gl;
        this.canvas = canvas;
        this.shaderProgram = shaderProgram;
        this.position = new Vector(0, 0, -1);
        this.scale = new Vector(1, 1, 1);
        this.rotation = new Vector(0, 0, 0);
        this.matrix = new Matrix4f();
        this.aspectRatio = this.canvas.width / this.canvas.height
        this.camera = camera;
        
        // Shader attributes and uniforms
        this.vertexPosition = gl.getAttribLocation(this.shaderProgram, 'vertexPosition');
        this.gl.enableVertexAttribArray(this.vertexPosition);
        this.vertexColor = gl.getAttribLocation(this.shaderProgram, 'vertexColor')
        this.gl.enableVertexAttribArray(this.vertexColor)
        this.transform = gl.getUniformLocation(shaderProgram, "transform");
        this.projectionMatrix = gl.getUniformLocation(this.shaderProgram, 'projectionMatrix')
        this.cameraLocation = gl.getUniformLocation(shaderProgram, "cameraMatrix");

    }

    draw() {
        const gl = this.gl;
        gl.useProgram(this.shaderProgram);

        let transformMatrix = this.matrix.createIdentity();

        let scalingMatrix = this.matrix.createScaling(this.scale.x, this.scale.y, this.scale.z);
        
        let rotationMatrixX = this.matrix.createRotation(this.rotation.x, 1, 0, 0);
        let rotationMatrixY = this.matrix.createRotation(this.rotation.y, 0, 1, 0);
        let rotationMatrixZ = this.matrix.createRotation(this.rotation.z, 0, 0, 1);
        let rotationMatrix = this.matrix.multiply(rotationMatrixX, rotationMatrixY);
        rotationMatrix = this.matrix.multiply(rotationMatrix, rotationMatrixZ);

        let translationMatrix = this.matrix.createTranslation(this.position.x, this.position.y, this.position.z);
        transformMatrix = this.matrix.multiply(transformMatrix, scalingMatrix);
        transformMatrix = this.matrix.multiply(transformMatrix, rotationMatrix);
        transformMatrix = this.matrix.multiply(transformMatrix, translationMatrix);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniformMatrix4fv(this.projectionMatrix, gl.FALSE, new Float32Array(this.matrix.createPerspective(75, this.aspectRatio, 0.1, 1000)));
        gl.uniformMatrix4fv(this.cameraLocation, gl.FALSE, new Float32Array(this.camera.matrix));
        gl.uniformMatrix4fv(this.transform, gl.FALSE, new Float32Array(transformMatrix));

        // Vertex positions
        const vertices = [
            -0.5, 0.5, 0.0,    // top left
            -0.5, -0.5, 0.0,   // bottom left
            0.5, -0.5, 0.0,    // bottom right
            0.5, 0.5, 0.0      // top right
        ];
        
        // Add colors for each vertex (RGBA)
        const colors = [
            0.0, 1.0, 0.0, 1.0, // top left
            1.0, 0.0, 1.0, 1.0, // bottom left
            1.0, 1.0, 0.0, 1.0, // bottom right
            0.0, 1.0, 1.0, 1.0 // top right
        ];

        // Set up vertex positions
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(this.shaderProgram, "vertexPosition");
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(position);

        // Set up vertex colors
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        const color = gl.getAttribLocation(this.shaderProgram, "vertexColor");
        gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(color);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        gl.flush();
    }
}

export default Mine;