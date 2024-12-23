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

export { getGL, initVertexBuffer, compileShader, linkShaderProgram, initSimpleShaderProgram }  