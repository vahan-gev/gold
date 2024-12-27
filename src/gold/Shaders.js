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
    uniform vec3 diffuseColor;  // New uniform for diffuse light color
    
    varying vec4 fragColor;
    varying vec2 fragTexture;
    varying vec3 fragDiffuse;
    varying vec3 fragAmbient;
    
    void main(void) {
        // Ambient light
        vec3 ambientLight = vec3(0.3, 0.3, 0.3);
        
        // Calculate normal and lighting
        vec4 transformedNormal = vec4(mat3(transform) * vertexNormal, 1.0);
        vec4 vertexPosition4 = vec4(vertexPosition, 1.0);
        vec3 lightDir = normalize(lightPosition - vec3(transform * vertexPosition4));
        
        float diffuseIntensity = max(dot(normalize(vec3(transformedNormal)), lightDir), 0.0);
        vec3 diffuse = diffuseColor * diffuseIntensity;  // Apply color to diffuse lighting
        
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
    varying vec3 fragDiffuse;
    varying vec3 fragAmbient;
    
    uniform sampler2D uSampler;
    uniform bool useTexture;
    uniform bool useDiffuseLighting;
    
    void main(void) {
        vec3 lighting = fragAmbient + (useDiffuseLighting ? fragDiffuse : vec3(0.0));
        
        if (useTexture) {
            vec4 texColor = texture2D(uSampler, fragTexture);
            vec3 litColor = lighting * texColor.rgb;
            gl_FragColor = vec4(litColor, texColor.a);
        } else {
            gl_FragColor = vec4(lighting * fragColor.rgb, fragColor.a);
        }
    }
`;

export { FRAGMENT_SHADER, VERTEX_SHADER };