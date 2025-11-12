// src/scene.ts
/// <reference types="@webgpu/types" />

//      ─────────┐
//     ╱  +Y    ╱│
//    ┌────────┐ │
//    │        │+X
//    │   +Z   │ │
//    │        │╱
//    └────────┘

export interface SceneGeometry {
    vertices: Float32Array;
    indices: Uint16Array;
    vertexCount: number;
    indexCount: number;
}

export function createCornellBox(): SceneGeometry {
    // my vertex format is in th form: [x, y, z, nx, ny, nz, r, g, b]
    // position (3) + normal (3) + color (3) = 9 floats per vertex

    const vertices: number[] = [];
    const indices: number[] = [];
    let indexOffset = 0;

    // add quads tgt, two triangles for now
    function addQuad(
        v0: number[], v1: number[], v2: number[], v3: number[],
        normal: number[],
        color: number[]
    ) {
        // add 4 vertice s
        for (const v of [v0, v1, v2, v3]) {
            vertices.push(...v, ...normal, ...color);
        }

        //  adding 2 triangles means 6 indicies
        indices.push(
            indexOffset + 0, indexOffset + 1, indexOffset + 2,
            indexOffset + 0, indexOffset + 2, indexOffset + 3
        );
        indexOffset += 4;
    }

    const white = [0.73, 0.73, 0.73];
    const red = [0.65, 0.05, 0.05];
    const green = [0.12, 0.45, 0.15];
    const lightColor = [1.0, 1.0, 1.0];

    //      ─────────┐
    //     ╱  +Y    ╱│
    //    ┌────────┐ │
    //    │        │+X
    //    │   +Z   │ │
    //    │        │╱
    //    └────────┘

    // floor (white) - Y = -1
    addQuad(
        [-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1],
        [0, 1, 0],
        white
    );

    // ceiling (white) - Y = 1
    addQuad(
        [-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1],
        [0, -1, 0],
        white
    );

    // back wall (white) 
    // - Z = -1
    addQuad(
        [-1, -1, -1], [-1, 1, -1], [1, 1, -1], [1, -1, -1],
        [0, 0, 1],
        white
    );

    // left wall (red) - X = -1
    addQuad(
        [-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1],
        [1, 0, 0],
        red
    );

    // Right wall (green) - X = 1
    addQuad(
        [1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1],
        [-1, 0, 0],
        green
    );

    // the light on the ceiling is in the shape of
    //a smaller white quad
    const lightSize = 0.3;
    addQuad(
        [-lightSize, 0.99, -lightSize],
        [lightSize, 0.99, -lightSize],
        [lightSize, 0.99, lightSize],
        [-lightSize, 0.99, lightSize],
        [0, -1, 0],
        lightColor
    );

    return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices),
        vertexCount: vertices.length / 9,
        indexCount: indices.length
    };
}