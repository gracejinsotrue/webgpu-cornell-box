// src/main.ts
/// <reference types="@webgpu/types" />
//      ─────────┐
//     ╱  +Y    ╱│
//    ┌────────┐ │
//    │        │+X
//    │   +Z   │ │
//    │        │╱
//    └────────┘
import { createCornellBox } from './scene';
import { Camera } from './camera';
import shaderCode from './shaders/basic.wgsl?raw';

interface WebGPUContext {
    device: GPUDevice;
    context: GPUCanvasContext;
    format: GPUTextureFormat;
    canvas: HTMLCanvasElement;
}
//webgpu is an async api so i wrap this shit in
///async function calls 
///https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html
async function initWebGPU(): Promise<WebGPUContext> {
    if (!navigator.gpu) {
        throw new Error('WebGPU not supported in this browser e.g. your browser too old');
    }

    const canvas = document.querySelector('canvas');
    if (!canvas) {
        throw new Error('canvas element not found');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error('failed to get GPU adapter');
    }

    const device = await adapter.requestDevice();
    const context = canvas.getContext('webgpu');
    if (!context) {
        throw new Error('failed to get WebGPU context');
    }

    const format = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device,
        format,
        alphaMode: 'opaque'
    });

    return { device, context, format, canvas };
}

async function main() {
    try {
        const { device, context, format, canvas } = await initWebGPU();
        console.log('init webgpu successfully ');

        //this creates the cornell box scene
        const scene = createCornellBox();
        console.log(`cornell box created: ${scene.vertexCount} vertices, ${scene.indexCount} indices`);

        // create a new camra
        //this camera is positioned outside the box
        const camera = new Camera(canvas.width / canvas.height);

        // 1) create a vertex buffer
        const vertexBuffer = device.createBuffer({
            size: scene.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(vertexBuffer, 0, scene.vertices.buffer);

        // 2) create an index buffer
        const indexBuffer = device.createBuffer({
            size: scene.indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(indexBuffer, 0, scene.indices.buffer);

        // 3) create a unifrom buffer
        // this uniform buffer is mat4x4 (64 bytes) + vec3 + padding of 16 bytes
        const uniformBufferSize = 64 + 16;
        const uniformBuffer = device.createBuffer({
            size: uniformBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        // 4) sahder emodule
        const shaderModule = device.createShaderModule({
            code: shaderCode,
        });

        // 5) create the render pipeline
        const pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: shaderModule,
                entryPoint: 'vertexMain',
                buffers: [{
                    arrayStride: 36, // 9 floats * 4 bytes
                    attributes: [
                        { shaderLocation: 0, offset: 0, format: 'float32x3' },  // position
                        { shaderLocation: 1, offset: 12, format: 'float32x3' }, // normal
                        { shaderLocation: 2, offset: 24, format: 'float32x3' }, // color
                    ]
                }]
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fragmentMain',
                targets: [{ format }]
            },
            primitive: {
                topology: 'triangle-list',
                cullMode: 'back',
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            }
        });

        // 6) create the depth texture
        const depthTexture = device.createTexture({
            size: [canvas.width, canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        // 7)create the bind group
        const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: uniformBuffer }
            }]
        });

        let angle = 0;
        //8) this function does the actual rendering
        function render() {
            // this rotation is 
            //FOR PURPOSES OF THE CAMERA'S ROTATION
            angle += 0.005;
            const radius = 3.5;
            camera.position[0] = Math.sin(angle) * radius;
            camera.position[2] = Math.cos(angle) * radius;
            camera.position[1] = 0.2; //this is just y position

            const vpMatrix = camera.getViewProjectionMatrix(); //update tjhe uniforms
            const uniformData = new Float32Array([
                ...vpMatrix,
                ...camera.position, 0 // vec3 with padding
            ]);
            device.queue.writeBuffer(uniformBuffer, 0, uniformData.buffer);

            // create command encoder
            const commandEncoder = device.createCommandEncoder();
            const textureView = context.getCurrentTexture().createView();

            const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                    view: textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store'
                }],
                depthStencilAttachment: {
                    view: depthTexture.createView(),
                    depthClearValue: 1.0,
                    depthLoadOp: 'clear',
                    depthStoreOp: 'store',
                }
            });

            renderPass.setPipeline(pipeline);
            renderPass.setVertexBuffer(0, vertexBuffer);
            renderPass.setIndexBuffer(indexBuffer, 'uint16');
            renderPass.setBindGroup(0, bindGroup);
            renderPass.drawIndexed(scene.indexCount);
            renderPass.end();

            device.queue.submit([commandEncoder.finish()]);

            requestAnimationFrame(render);
        }

        render();

        // console.log('rendering...');

    } catch (error) {
        const errorDiv = document.getElementById('error');
        if (errorDiv) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
        console.error('failed to initialize:', error);
    }
}

main();