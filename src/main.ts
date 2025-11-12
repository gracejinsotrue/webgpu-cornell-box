// src/main.ts
/// <reference types="@webgpu/types" />

interface WebGPUContext {
    device: GPUDevice;
    context: GPUCanvasContext;
    format: GPUTextureFormat;
    canvas: HTMLCanvasElement;
}

async function initWebGPU(): Promise<WebGPUContext> {
    if (!navigator.gpu) {
        throw new Error('WebGPU not supported in this browser. Please use Chrome/Edge 113+ or another WebGPU-compatible browser.');
    }

    //get the canvas element 
    const canvas = document.querySelector('canvas');
    if (!canvas) {
        throw new Error('canvas element not found');
    }
    //adapter and device
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error('failed to get GPU adapter');
    }

    const device = await adapter.requestDevice();
    if (!device) {
        throw new Error('failed to get GPU device');
    }

    // canvas content config 
    const context = canvas.getContext('webgpu');
    if (!context) {
        throw new Error('failed to get WebGPU context from canvas');
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
        console.log('WebGPU initialized successfully');
        console.log('Device:', device);
        console.log('Format:', format);
        //test if ts works
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.1, g: 0.1, b: 0.15, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store'
            }]
        });
        renderPass.end();

        device.queue.submit([commandEncoder.finish()]);

        console.log('should be seeing dark box rendered on screen');

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