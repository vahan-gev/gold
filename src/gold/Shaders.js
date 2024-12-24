const VERTEX_SHADER = `
    #ifdef GL_ES
    precision highp float;
    #endif

    attribute vec3 vertexPosition;
    attribute vec3 vertexColor;
    attribute vec2 vertexTexture;

    uniform mat4 transform;
    uniform mat4 cameraMatrix;
    uniform mat4 projectionMatrix;
    
    varying vec3 fragColor;
    varying vec2 fragTexture;
    
    void main(void) {
        gl_Position = projectionMatrix * cameraMatrix * transform * vec4(vertexPosition, 1.0);
        fragColor = vertexColor;
        fragTexture = vertexTexture;
    }
`;

const FRAGMENT_SHADER = `
    #ifdef GL_ES
    precision highp float;
    #endif

    varying vec3 fragColor;
    varying vec2 fragTexture;

    uniform sampler2D uSampler;
    uniform bool useTexture;

    void main(void) {
        if (useTexture) {
            gl_FragColor = texture2D(uSampler, fragTexture);
        } else {
            gl_FragColor = vec4(fragColor, 1.0);
        }
    }
`;

export { FRAGMENT_SHADER, VERTEX_SHADER };
