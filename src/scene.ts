// scene.ts - Cornell Box vertices
export function createCornellBox() {
    // each wall is 2 triangles therefore 6 verticies per wall

    // white floor
    const floor = [
        // pos (xyz), normal (xyz), color (rgb)
        -1, -1, -1, 0, 1, 0, 0.73, 0.73, 0.73,  // bottom-left
        1, -1, -1, 0, 1, 0, 0.73, 0.73, 0.73,  // bottom-right
        1, -1, 1, 0, 1, 0, 0.73, 0.73, 0.73,  // top-right
        -1, -1, 1, 0, 1, 0, 0.73, 0.73, 0.73,  // top-left
    ];

    // white celing
    const ceiling = [
        -1, 1, -1, 0, -1, 0, 0.73, 0.73, 0.73,
        1, 1, -1, 0, -1, 0, 0.73, 0.73, 0.73,
        1, 1, 1, 0, -1, 0, 0.73, 0.73, 0.73,
        -1, 1, 1, 0, -1, 0, 0.73, 0.73, 0.73,
    ];

    // white back wall
    const backWall = [
        -1, -1, -1, 0, 0, 1, 0.73, 0.73, 0.73,
        1, -1, -1, 0, 0, 1, 0.73, 0.73, 0.73,
        1, 1, -1, 0, 0, 1, 0.73, 0.73, 0.73,
        -1, 1, -1, 0, 0, 1, 0.73, 0.73, 0.73,
    ];

    // red left wall
    const leftWall = [
        -1, -1, -1, 1, 0, 0, 0.65, 0.05, 0.05,
        -1, -1, 1, 1, 0, 0, 0.65, 0.05, 0.05,
        -1, 1, 1, 1, 0, 0, 0.65, 0.05, 0.05,
        -1, 1, -1, 1, 0, 0, 0.65, 0.05, 0.05,
    ];

    // green right wall
    const rightWall = [
        1, -1, -1, -1, 0, 0, 0.12, 0.45, 0.15,
        1, -1, 1, -1, 0, 0, 0.12, 0.45, 0.15,
        1, 1, 1, -1, 0, 0, 0.12, 0.45, 0.15,
        1, 1, -1, -1, 0, 0, 0.12, 0.45, 0.15,
    ];

    // indices for each quad 
    // each quad also composed of 2 triangles
    const indices = [
        // each quad uses the same index pattern
        0, 1, 2, 0, 2, 3,  // floor
        4, 5, 6, 4, 6, 7,  // ceiling
        8, 9, 10, 8, 10, 11, // back
        12, 13, 14, 12, 14, 15, // left
        16, 17, 18, 16, 18, 19, // right
    ];

    return {
        vertices: new Float32Array([
            ...floor, ...ceiling, ...backWall, ...leftWall, ...rightWall
        ]),
        indices: new Uint16Array(indices)
    };
}