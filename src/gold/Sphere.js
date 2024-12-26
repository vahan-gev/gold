import { Vector } from "./Math";
import { Object } from "./Object";
import { computeVertexNormals } from "./Utilities";

class Sphere extends Object {
    constructor(gl, color, position = new Vector(0, 0, 0), scale = new Vector(1, 1, 1), resolution = 20, textureUrl = null) {
        const vertices = [];
        const faces = [];
        const textureCoordinates = [];

        // Generate vertices
        for (let latNumber = 0; latNumber <= resolution; latNumber++) {
            const theta = latNumber * Math.PI / resolution;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let longNumber = 0; longNumber <= resolution; longNumber++) {
                const phi = longNumber * 2 * Math.PI / resolution;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                vertices.push([x, y, z]);
            }
        }

        // Generate faces and their texture coordinates
        for (let latNumber = 0; latNumber < resolution; latNumber++) {
            for (let longNumber = 0; longNumber < resolution; longNumber++) {
                const first = (latNumber * (resolution + 1)) + longNumber;
                const second = first + resolution + 1;

                // First triangle
                faces.push([first, first + 1, second]);

                // Texture coordinates for first triangle
                const u1 = longNumber / resolution;
                const v1 = latNumber / resolution;
                const u2 = (longNumber + 1) / resolution;
                const v2 = latNumber / resolution;
                const u3 = longNumber / resolution;
                const v3 = (latNumber + 1) / resolution;

                textureCoordinates.push(
                    u1, v1,
                    u2, v2,
                    u3, v3
                );

                // Second triangle
                faces.push([second, first + 1, second + 1]);

                // Texture coordinates for second triangle
                const u4 = longNumber / resolution;
                const v4 = (latNumber + 1) / resolution;
                const u5 = (longNumber + 1) / resolution;
                const v5 = latNumber / resolution;
                const u6 = (longNumber + 1) / resolution;
                const v6 = (latNumber + 1) / resolution;

                textureCoordinates.push(
                    u4, v4,
                    u5, v5,
                    u6, v6
                );
            }
        }

        super(gl, vertices, faces, color, position, scale, textureUrl, textureCoordinates, computeVertexNormals);
    }
}

export { Sphere }