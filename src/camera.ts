// src/camera.ts
/// <reference types="@webgpu/types" />
import { mat4, vec3 } from 'gl-matrix';

export class Camera {
    position: vec3;
    target: vec3;
    up: vec3;
    fov: number;
    aspect: number;
    near: number;
    far: number;

    constructor(aspect: number) {
        // repositioned camera to look outside the box
        this.position = vec3.fromValues(0, 0.2, 3.5);
        this.target = vec3.fromValues(0, 0, 0);
        this.up = vec3.fromValues(0, 1, 0);
        this.fov = 45 * Math.PI / 180;
        this.aspect = aspect;
        this.near = 0.1;
        this.far = 100;
    }

    getViewMatrix(): mat4 {
        const view = mat4.create();
        mat4.lookAt(view, this.position, this.target, this.up);
        return view;
    }

    getProjectionMatrix(): mat4 {
        const proj = mat4.create();
        mat4.perspective(proj, this.fov, this.aspect, this.near, this.far);
        return proj;
    }

    getViewProjectionMatrix(): mat4 {
        const vp = mat4.create();
        mat4.multiply(vp, this.getProjectionMatrix(), this.getViewMatrix());
        return vp;
    }

    updateAspect(aspect: number) {
        this.aspect = aspect;
    }
}