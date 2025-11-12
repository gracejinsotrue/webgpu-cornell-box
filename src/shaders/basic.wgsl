// src/shaders/basic.wgsl

struct Uniforms {
    modelViewProjection: mat4x4<f32>,
    cameraPosition: vec3<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) color: vec3<f32>,
};

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) worldPos: vec3<f32>,
};

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.position = uniforms.modelViewProjection * vec4(input.position, 1.0);
    output.color = input.color;
    output.normal = input.normal;
    output.worldPos = input.position;
    return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
    // cieling light position
    let lightPos = vec3<f32>(0.0, 0.99, 0.0);
    let lightColor = vec3<f32>(1.0, 1.0, 0.9);
    let lightIntensity = 2.0;

    let lightDir = normalize(lightPos - input.worldPos);
    let normal = normalize(input.normal);
    
    // definition of diffuse lighting 
    let diffuse = max(dot(normal, lightDir), 0.0);
    
    // aistance attenuation
    let distance = length(lightPos - input.worldPos);
    let attenuation = 1.0 / (1.0 + 0.5 * distance * distance);
    
    // for ambient lighting
    //todo: tweak if it looks like shit
    let ambient = 0.2;
    
    //overall lighting is the sum of the different lightings
    let lighting = ambient + diffuse * attenuation * lightIntensity;
    let finalColor = input.color * lighting * lightColor;
    
    return vec4<f32>(finalColor, 1.0);
}