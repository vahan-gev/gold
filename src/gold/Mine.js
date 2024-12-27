import { getGL, initSimpleShaderProgram } from "./Utilities";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./Shaders";
import { Matrix4f, Vector } from "./Math";
import { Light } from "./Lights/Light";
import { DiffuseLighting } from "./Lights/DiffuseLighting";

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
        this.position = new Vector(0, 0, 0);
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
        this.useTexture = gl.getUniformLocation(this.shaderProgram, 'useTexture');
        this.vertexTexture = gl.getAttribLocation(this.shaderProgram, 'vertexTexture');
        gl.enableVertexAttribArray(this.vertexTexture);
        this.uSampler = gl.getUniformLocation(this.shaderProgram, 'uSampler');

        // Lighting and Normals
        this.vertexNormal = gl.getAttribLocation(this.shaderProgram, 'vertexNormal');
        this.gl.enableVertexAttribArray(this.vertexNormal);

        this.lightPositionUniform = gl.getUniformLocation(this.shaderProgram, 'lightPosition');
        this.lightDirectionUniform = gl.getUniformLocation(this.shaderProgram, 'lightDirection');
        this.useDiffuseLighting = gl.getUniformLocation(this.shaderProgram, 'useDiffuseLighting');
        this.diffuseColor = gl.getUniformLocation(this.shaderProgram, 'diffuseColor');
    }

    draw(scene) {
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
        gl.uniform1i(this.uSampler, 0);
        scene.forEach(object => {
            if(object instanceof Light) {
                if(object instanceof DiffuseLighting) {
                    this.lightPosition = object.position;
                    this.lightDirection = object.direction;
                    this.normalizedLightDirection = this.lightDirection.normalize(this.lightDirection);    
                    gl.uniform3fv(this.lightPositionUniform, [this.lightPosition.x, this.lightPosition.y, this.lightPosition.z]);
                    gl.uniform3fv(this.lightDirectionUniform, [this.normalizedLightDirection.x, this.normalizedLightDirection.y, this.normalizedLightDirection.z]);
                    gl.uniform1i(this.useDiffuseLighting, 1);
                    gl.uniform3f(this.diffuseColor, object.color.r, object.color.g, object.color.b);
                } else {
                    gl.uniform1i(this.useDiffuseLighting, 0);
                }
            } else if(object instanceof Object) {
                object.draw(gl, transformMatrix, this.vertexPosition, this.vertexColor, this.transform, this.vertexTexture, this.useTexture, this.vertexNormal);
            }
        });
        
        gl.flush();
    }
}

export default Mine;