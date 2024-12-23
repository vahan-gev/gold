const VERTEX_SHADER = `
    #ifdef GL_ES
    precision highp float;
    #endif

    attribute vec3 vertexPosition;
    attribute vec3 vertexColor;

    uniform mat4 transform;
    uniform mat4 cameraMatrix;
    uniform mat4 projectionMatrix;
    
    varying vec3 fragColor;
    
    void main(void) {
        gl_Position = projectionMatrix * cameraMatrix * transform * vec4(vertexPosition, 1.0);
        fragColor = vertexColor;
    }
`

const FRAGMENT_SHADER = `
    #ifdef GL_ES
    precision highp float;
    #endif

    varying vec3 fragColor;

    void main(void) {
        gl_FragColor = vec4(fragColor, 1.0);
    }
`
export { FRAGMENT_SHADER, VERTEX_SHADER }