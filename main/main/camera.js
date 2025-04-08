import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
class Camera {
    constructor() {
        this.hudGroup = new THREE.Group();
    }
    setupCamera(w, h) {
        this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
        this.camera.position.z = 5;
        this.camera.add(this.hudGroup);
    }
    setupControls(renderer) {
        if (renderer)
            this.controls = new OrbitControls(this.camera, renderer.domElement);
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
        };
    }
}
export const camera = new Camera();
