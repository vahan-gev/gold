import { Object } from './Object';
import { Vector } from './Math';
import ModelLoader from './ModelLoader';
import { computeVertexNormals } from './Utilities';

class Model extends Object {
    static async create(gl, color, position = new Vector(0, 0, 0), scale = new Vector(1, 1, 1), modelUrl, textureUrl = null) {
        try {
            const modelData = await ModelLoader.loadOBJ(modelUrl);
            
            if (!modelData || !modelData.vertices.length) {
                throw new Error('Invalid model data received');
            }

            // Ensure texture coordinates exist for each vertex
            if (textureUrl && (!modelData.textureCoords || modelData.textureCoords.length !== (modelData.vertices.length / 3) * 2)) {
                modelData.textureCoords = new Array(modelData.vertices.length / 3 * 2).fill(0);
            }

            return new Model(gl, modelData, color, position, scale, textureUrl);
        } catch (error) {
            console.error('Error creating model:', error);
            return null;
        }
    }

    constructor(gl, modelData, color, position, scale, textureUrl = null) {
        if (!modelData || !modelData.vertices.length) {
            throw new Error('Invalid model data');
        }

        const vertices = [];
        const faces = [];
        
        // Process vertices
        for (let i = 0; i < modelData.vertices.length; i += 3) {
            vertices.push([
                modelData.vertices[i] || 0,
                modelData.vertices[i + 1] || 0,
                modelData.vertices[i + 2] || 0
            ]);
        }

        // Process faces
        for (let i = 0; i < modelData.indices.length; i += 3) {
            faces.push([
                modelData.indices[i] || 0,
                modelData.indices[i + 1] || 0,
                modelData.indices[i + 2] || 0
            ]);
        }

        super(gl, vertices, faces, color, position, scale, textureUrl, modelData.textureCoords, computeVertexNormals);
    }
}

export { Model };