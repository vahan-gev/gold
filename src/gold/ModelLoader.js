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
        const uniqueVertices = new Map();
        const finalVertices = [];
        const finalTextureCoords = [];
        const finalIndices = [];
        let currentIndex = 0;

        const lines = text.split('\n');
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (!parts[0]) continue;

            switch(parts[0]) {
                case 'v':
                    vertices.push([
                        parseFloat(parts[1] || 0),
                        parseFloat(parts[2] || 0),
                        parseFloat(parts[3] || 0)
                    ]);
                    break;
                case 'vt':
                    textureCoords.push([
                        parseFloat(parts[1] || 0),
                        parseFloat(parts[2] || 0)
                    ]);
                    break;
                case 'vn':
                    normals.push([
                        parseFloat(parts[1] || 0),
                        parseFloat(parts[2] || 0),
                        parseFloat(parts[3] || 0)
                    ]);
                    break;
                case 'f':
                    const faceVertices = [];
                    for (let i = 1; i < parts.length; i++) {
                        const indices = parts[i].split('/').map(index => parseInt(index) - 1);
                        faceVertices.push(indices);
                    }

                    // Triangulate if necessary
                    for (let i = 1; i < faceVertices.length - 1; i++) {
                        const vertexData = [faceVertices[0], faceVertices[i], faceVertices[i + 1]];
                        
                        vertexData.forEach(([vIdx, vtIdx]) => {
                            const key = `${vIdx}/${vtIdx}`;
                            if (!uniqueVertices.has(key)) {
                                uniqueVertices.set(key, currentIndex);
                                
                                // Add vertex
                                const vertex = vertices[vIdx] || [0, 0, 0];
                                finalVertices.push(...vertex);
                                
                                // Add texture coordinate
                                const texCoord = textureCoords[vtIdx] || [0, 0];
                                finalTextureCoords.push(...texCoord);
                                
                                currentIndex++;
                            }
                            finalIndices.push(uniqueVertices.get(key));
                        });
                    }
                    break;
            }
        }

        return {
            vertices: finalVertices,
            textureCoords: finalTextureCoords,
            indices: finalIndices
        };
    }
}

export default ModelLoader;