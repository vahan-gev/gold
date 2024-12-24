class ModelLoader {
    static async loadOBJ(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const text = await response.text();
            return ModelLoader.parseOBJ(text);
        } catch (error) {
            console.error('Error loading OBJ:', error);
            throw error;
        }
    }

    static parseOBJ(text) {
        const vertices = [];
        const textureCoords = [];
        const normals = [];
        const vertexIndices = [];
        const textureIndices = [];
        const normalIndices = [];
        
        const lines = text.split('\n');

        // First pass: collect raw data
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (!parts[0]) continue;

            switch(parts[0]) {
                case 'v':
                    vertices.push(
                        parseFloat(parts[1] || 0),
                        parseFloat(parts[2] || 0),
                        parseFloat(parts[3] || 0)
                    );
                    break;
                case 'vt':
                    textureCoords.push(
                        parseFloat(parts[1] || 0),
                        parseFloat(parts[2] || 0)
                    );
                    break;
                case 'vn':
                    normals.push(
                        parseFloat(parts[1] || 0),
                        parseFloat(parts[2] || 0),
                        parseFloat(parts[3] || 0)
                    );
                    break;
                case 'f':
                    const faceIndices = parts.slice(1).map(vertex => {
                        const indices = vertex.split('/');
                        return {
                            vertex: parseInt(indices[0]) - 1,
                            texture: indices[1] ? parseInt(indices[1]) - 1 : undefined,
                            normal: indices[2] ? parseInt(indices[2]) - 1 : undefined
                        };
                    });

                    // Triangulate faces
                    for (let i = 0; i < faceIndices.length - 2; i++) {
                        vertexIndices.push(faceIndices[0].vertex);
                        vertexIndices.push(faceIndices[i + 1].vertex);
                        vertexIndices.push(faceIndices[i + 2].vertex);

                        if (faceIndices[0].texture !== undefined) {
                            textureIndices.push(faceIndices[0].texture);
                            textureIndices.push(faceIndices[i + 1].texture);
                            textureIndices.push(faceIndices[i + 2].texture);
                        }

                        if (faceIndices[0].normal !== undefined) {
                            normalIndices.push(faceIndices[0].normal);
                            normalIndices.push(faceIndices[i + 1].normal);
                            normalIndices.push(faceIndices[i + 2].normal);
                        }
                    }
                    break;
            }
        }

        // Second pass: build final arrays
        const finalVertices = [];
        const finalTextureCoords = [];
        const indices = [];
        const vertexMap = new Map();
        let currentIndex = 0;

        // Process all indices
        for (let i = 0; i < vertexIndices.length; i++) {
            const vertexIndex = vertexIndices[i];
            const texIndex = textureIndices[i];
            const normalIndex = normalIndices[i];
            
            const key = `${vertexIndex},${texIndex || 0},${normalIndex || 0}`;
            
            let index = vertexMap.get(key);
            if (index === undefined) {
                index = currentIndex++;
                vertexMap.set(key, index);

                // Add vertex data
                finalVertices.push(
                    vertices[vertexIndex * 3],
                    vertices[vertexIndex * 3 + 1],
                    vertices[vertexIndex * 3 + 2]
                );

                // Add texture coordinates
                if (texIndex !== undefined && textureCoords[texIndex * 2] !== undefined) {
                    finalTextureCoords.push(
                        textureCoords[texIndex * 2],
                        textureCoords[texIndex * 2 + 1]
                    );
                } else {
                    finalTextureCoords.push(0.0, 0.0);
                }
            }
            indices.push(index);
        }

        return {
            vertices: finalVertices,
            textureCoords: finalTextureCoords,
            indices: indices
        };
    }
}

export default ModelLoader;