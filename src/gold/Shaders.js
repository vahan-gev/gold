const VERTEX_SHADER = `
    #ifdef GL_ES
    precision highp float;
    #endif
    
    attribute vec3 vertexPosition;
    attribute vec3 vertexColor;
    attribute vec2 vertexTexture;
    attribute vec3 vertexNormal;
    
    uniform mat4 transform;
    uniform mat4 cameraMatrix;
    uniform mat4 projectionMatrix;
    uniform vec3 lightPosition;
    uniform vec3 lightDirection;
    
    varying vec4 fragColor;
    varying vec2 fragTexture;
    varying float fragDiffuse;
    varying vec3 fragAmbient;
    
    void main(void) {
        // Ambient light
        vec3 ambientLight = vec3(0.3, 0.3, 0.3);
        
        // Calculate normal and lighting
        vec4 transformedNormal = vec4(mat3(transform) * vertexNormal, 1.0);
        vec4 vertexPosition4 = vec4(vertexPosition, 1.0);
        vec3 lightDir = normalize(lightPosition - vec3(transform * vertexPosition4));
        
        float diffuse = max(dot(normalize(vec3(transformedNormal)), lightDir), 0.0);
        
        // Pass lighting information to fragment shader
        fragDiffuse = diffuse;
        fragAmbient = ambientLight;
        fragColor = vec4(vertexColor, 1.0);
        fragTexture = vertexTexture;
        
        gl_Position = projectionMatrix * cameraMatrix * transform * vec4(vertexPosition, 1.0);
    }
`;

const FRAGMENT_SHADER = `
    #ifdef GL_ES
    precision highp float;
    #endif
    
    varying vec4 fragColor;
    varying vec2 fragTexture;
    varying float fragDiffuse;
    varying vec3 fragAmbient;
    
    uniform sampler2D uSampler;
    uniform bool useTexture;
    
    void main(void) {
        if (useTexture) {
            vec4 texColor = texture2D(uSampler, fragTexture);
            vec3 litColor = (fragAmbient + fragDiffuse) * texColor.rgb;
            gl_FragColor = vec4(litColor, texColor.a);
        } else {
            gl_FragColor = vec4((fragAmbient + fragDiffuse) * fragColor.rgb, fragColor.a);
        }
    }
`;

export { FRAGMENT_SHADER, VERTEX_SHADER };