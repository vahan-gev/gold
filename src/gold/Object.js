import { Color } from "./Color";
import { Vector, Matrix4f } from "./Math";
import { initVertexBuffer, toRawLineArray, toRawTriangleArray } from "./Utilities";
class Object {
    constructor(gl, vertices, facesByIndex, color, position, scale) {
        this.gl = gl;
        this.id = Math.random().toString(36).substring(7);
        this.vertices = vertices ?? [];
        this.facesByIndex = facesByIndex ?? []
        this.color = color ?? { r: 0.5, g: 0.5, b: 0.5 };
        this.isWireframe = false;
        this.rawVertices = toRawTriangleArray(this)
        this.position = position ?? new Vector(0, 0, 0);
        this.scale = scale ?? new Vector(1, 1, 1);
        this.rotation = new Vector(0, 0, 0);
        this.matrix = new Matrix4f();
        this.verticesBuffer = initVertexBuffer(this.gl, this.rawVertices);
        if (Array.isArray(this.color)) {
            // Validate that each color in the array is a valid {r, g, b} object
            if (!this.color.every(c => c && typeof c.r === "number" && typeof c.g === "number" && typeof c.b === "number")) {
                throw new Error("Invalid color array: Each element must be an object with {r, g, b} properties.");
            }
            
            // Proceed with color generation
            const colorsInsteadOfVertices = { facesByIndex: this.facesByIndex, vertices: this.color };
            this.colors = this.wireframeValue ? toRawLineArray(colorsInsteadOfVertices) : toRawTriangleArray(colorsInsteadOfVertices);
        } else {
            // Validate the single color object
            if (!this.color || typeof this.color.r !== "number" || typeof this.color.g !== "number" || typeof this.color.b !== "number") {
                throw new Error("Invalid color: Must be an object with {r, g, b} properties.");
            }
            
            // Fill the colors array with the single color
            this.colors = [];
            for (let i = 0, maxi = this.rawVertices.length / 3; i < maxi; i += 1) {
                this.colors = this.colors.concat(this.color.r, this.color.g, this.color.b);
            }
        }
        this.colorsBuffer = initVertexBuffer(this.gl, this.colors);        
    }

    get wireframe() {
        return this.isWireframe;
    }

    set wireframe(value) {
        if (this.isWireframe !== value) {
            this.isWireframe = value;
            if (Array.isArray(this.color)) {
                // Validate that each color in the array is a valid {r, g, b} object
                if (!this.color.every(c => c && typeof c.r === "number" && typeof c.g === "number" && typeof c.b === "number")) {
                    throw new Error("Invalid color array: Each element must be an object with {r, g, b} properties.");
                }
                
                // Proceed with color generation
                const colorsInsteadOfVertices = { facesByIndex: this.facesByIndex, vertices: this.color };
                this.colors = this.wireframeValue ? toRawLineArray(colorsInsteadOfVertices) : toRawTriangleArray(colorsInsteadOfVertices);
            } else {
                // Validate the single color object
                if (!this.color || typeof this.color.r !== "number" || typeof this.color.g !== "number" || typeof this.color.b !== "number") {
                    throw new Error("Invalid color: Must be an object with {r, g, b} properties.");
                }
                
                // Fill the colors array with the single color
                this.colors = [];
                for (let i = 0, maxi = this.rawVertices.length / 3; i < maxi; i += 1) {
                    this.colors = this.colors.concat(this.color.r, this.color.g, this.color.b);
                }
            }
            this.colorsBuffer = initVertexBuffer(this.gl, this.colors); 
        }
    }

    draw(gl, globalTransformMatrix, vertexPosition, vertexColor, transform) {
        let objectTransformMatrix = this.matrix.createIdentity();
    
        let objectScalingMatrix = this.matrix.createScaling(this.scale.x, this.scale.y, this.scale.z);
        objectTransformMatrix = this.matrix.multiply(objectTransformMatrix, objectScalingMatrix);
    
        let objectRotationMatrixX = this.matrix.createRotation(this.rotation.x, 1, 0, 0);
        let objectRotationMatrixY = this.matrix.createRotation(this.rotation.y, 0, 1, 0);
        let objectRotationMatrixZ = this.matrix.createRotation(this.rotation.z, 0, 0, 1);
        let objectRotationMatrix = this.matrix.multiply(objectRotationMatrixX, objectRotationMatrixY);
        objectRotationMatrix = this.matrix.multiply(objectRotationMatrix, objectRotationMatrixZ);
        objectTransformMatrix = this.matrix.multiply(objectTransformMatrix, objectRotationMatrix);
    
        let objectTranslationMatrix = this.matrix.createTranslation(this.position.x, this.position.y, this.position.z);
        objectTransformMatrix = this.matrix.multiply(objectTransformMatrix, objectTranslationMatrix);
    
        let finalTransformMatrix = this.matrix.multiply(globalTransformMatrix, objectTransformMatrix);
        gl.uniformMatrix4fv(transform, gl.FALSE, new Float32Array(finalTransformMatrix));
    
        // Bind buffers and draw the object
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
        gl.vertexAttribPointer(vertexColor, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(this.wireframe ? gl.LINES : gl.TRIANGLES, 0, this.rawVertices.length / 3);
    }
}

export { Object }