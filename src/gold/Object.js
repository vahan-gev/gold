import { Color } from "./Color";
import { Vector, Matrix4f } from "./Math";
import { computeFaceNormals, computeTriangleNormals, initTextureBuffer, initVertexBuffer, loadTexture, toRawLineArray, toRawTriangleArray } from "./Utilities";
class Object {
    constructor(gl, vertices, facesByIndex, color, position, scale, textureUrl, textureCoordinates, normalCalculation) {
        this.gl = gl;
        this.id = Math.random().toString(36).substring(7);
        if (Array.isArray(vertices)) {
            // Handle existing array format
            this.vertices = vertices;
            this.facesByIndex = facesByIndex;
        } else if (vertices && vertices.vertices) {
            // Handle model data format
            this.vertices = vertices.vertices.map(v => [v[0], v[1], v[2]]);
            this.facesByIndex = [];
            for (let i = 0; i < vertices.indices.length; i += 3) {
                this.facesByIndex.push([
                    vertices.indices[i],
                    vertices.indices[i + 1],
                    vertices.indices[i + 2]
                ]);
            }
            if (vertices.textureCoords) {
                textureCoordinates = vertices.textureCoords;
            }
        }
        this.color = color ?? new Color(1, 1, 1);
        this.isWireframe = false;
        this.rawVertices = toRawTriangleArray(this)
        this.faceNormals = computeFaceNormals(this);
        this.position = position ?? new Vector(0, 0, 0);
        this.scale = scale ?? new Vector(1, 1, 1);
        this.rotation = new Vector(0, 0, 0);
        this.matrix = new Matrix4f();
        this.verticesBuffer = initVertexBuffer(this.gl, this.rawVertices);
        this.normalCalculationValue = normalCalculation ? normalCalculation : computeTriangleNormals;
        this.textureUrl = textureUrl;

        if (this.textureUrl) {
            this.texture = loadTexture(gl, this.textureUrl);
            this.textureCoordBuffer = initTextureBuffer(gl, textureCoordinates);
        }

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
        this.normalsBuffer = initVertexBuffer(this.gl, this.normalCalculationValue(this));
    }

    get wireframe() {
        return this.isWireframe;
    }

    get normalCalculation() {
        return this.normalCalculationValue
    }
    
    set normalCalculation(newNormalCalculationValue) {
        this.normalCalculationValue = newNormalCalculationValue
        this.normalsBuffer = initVertexBuffer(this.gl, newNormalCalculationValue(this))
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
            this.normalsBuffer = initVertexBuffer(this.gl, this.normalCalculation(this));
        }
    }

    draw(gl, globalTransformMatrix, vertexPosition, vertexColor, transform, vertexTexture, useTexture, vertexNormal) {
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
    
        // Set the varying normals
        if (!this.wireframe) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
            gl.vertexAttribPointer(vertexNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vertexNormal);
        } else {
            gl.disableVertexAttribArray(vertexNormal);
        }

        if (this.textureUrl) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
            gl.vertexAttribPointer(vertexTexture, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vertexTexture);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(useTexture, 1);
        } else {
            gl.disableVertexAttribArray(vertexTexture);
            gl.uniform1i(useTexture, 0);
        }

        // Bind buffers and draw the object
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
        gl.vertexAttribPointer(vertexColor, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(this.wireframe ? gl.LINES : gl.TRIANGLES, 0, this.rawVertices.length / 3);
    }
}

export { Object }