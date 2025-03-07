import { Vector } from "./Math";

const getGL = canvas => canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

const initVertexBuffer = (gl, vertices) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    return buffer;
}

const compileShader = (gl, shaderSource, shaderType, compileError) => {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw Object.assign(
            new Error(compileError(gl.getShaderInfoLog(shader))),
            { code: 400 }
        );
    }

    return shader;
}

const linkShaderProgram = (gl, vertexShader, fragmentShader) => {
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    return shaderProgram;
}

const initSimpleShaderProgram = (gl, vertexShaderSource, fragmentShaderSource, compileError, linkError) => {
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER, compileError)
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER, compileError)

    // If either shader is null, we just bail out.  An error would have
    // been reported to the compileError function.
    if (!vertexShader || !fragmentShader) {
        return null
    }

    // Link the shader program.
    const shaderProgram = linkShaderProgram(gl, vertexShader, fragmentShader)
    if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        return shaderProgram
    }

    // If we get here, something must have gone wrong.
    if (linkError) {
        linkError(shaderProgram)
    }

    return null
}

/**
 * Utility function for turning our nascent geometry object into a “raw” coordinate array
 * arranged as triangles.
 */
const toRawTriangleArray = protoGeometry => {
    const result = []

    protoGeometry.facesByIndex.forEach(face => {
        face.forEach(vertexIndex => {
            result.push(...protoGeometry.vertices[vertexIndex])
        })
    })

    return result
}

/*
 * Utility function for turning indexed vertices into a “raw” coordinate array
 * arranged as line segments.
 */
const toRawLineArray = protoGeometry => {
    const result = []
    protoGeometry.facesByIndex.forEach(face => {
        for (let i = 0, maxI = face.length; i < maxI; i += 1) {
            // “Connect the dots.”
            result.push(
                ...protoGeometry.vertices[face[i]],
                ...protoGeometry.vertices[face[(i + 1) % maxI]] // Lets us wrap around to 0.
            )
        }
    })
  
    return result
}

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Fill with a blue pixel until the image loads
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Generate mipmaps only if power-of-2
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function initTextureBuffer(gl, textureCoordinates) {
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    return textureCoordBuffer;
}

const computeFaceNormals = protoGeometry =>
    protoGeometry.facesByIndex.map(face => {
        // Compute the triangle normal...
        const p0 = new Vector(...protoGeometry.vertices[face[0]])
        const p1 = new Vector(...protoGeometry.vertices[face[1]])
        const p2 = new Vector(...protoGeometry.vertices[face[2]])

        const v1 = p1.subtract(p0)
        const v2 = p2.subtract(p0)

        // Formula from book "Real-time 3D Graphics" "Normals" section.
        return v1.cross(v2)
    })

const computeTriangleNormals = protoGeometry => {
    const result = []

    // For every triangle...
    protoGeometry.facesByIndex.forEach((face, faceIndex) => {
        const N = protoGeometry.faceNormals[faceIndex]

        // Every vertex in the triangle gets the same normal.
        result.push(...N.elements)
        result.push(...N.elements)
        result.push(...N.elements)
    })

    return result
}

const computeVertexNormals = protoGeometry => {
    const result = [];
    // For every triangle...
    protoGeometry.facesByIndex.forEach(face => {
        // For every vertex in that triangle...
        face.forEach(vertexIndex => {
            let totalVector = new Vector(0, 0, 0);

            // Grab every face the vertex is in.
            protoGeometry.facesByIndex.forEach((face, faceIndex) => {
                if(face.includes(vertexIndex)) {
                    totalVector = totalVector.add(protoGeometry.faceNormals[faceIndex]);
                }
            })
            result.push(...totalVector.unit.elements);
        })
    })

    return result;
}

export { getGL, initVertexBuffer, compileShader, linkShaderProgram, initSimpleShaderProgram, toRawLineArray, toRawTriangleArray, loadTexture, initTextureBuffer, computeFaceNormals, computeTriangleNormals, computeVertexNormals }  