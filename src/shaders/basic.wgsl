// shaders/basic.wgsl

struct Uniforms {
    modelViewProjection: mat4x4<f32>,
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
    //for lighting 
    let lightPos = vec3<f32>(0.0, 0.9, 0.0); //  ceiling light 
    let lightDir = normalize(lightPos - input.worldPos);
    let diffuse = max(dot(input.normal, lightDir), 0.0);
    
    let ambient = 0.3;
    let lighting = ambient + diffuse * 0.7;
    
    return vec4(input.color * lighting, 1.0);
}