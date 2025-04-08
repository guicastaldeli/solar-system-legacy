import * as THREE from 'three';

import { camera } from './camera.js';
import { Hud } from './hud.js';
import { Sun } from '../planets/sun/src-sun.js';

class Main {
    private scene!: THREE.Scene;
    public renderer!: THREE.WebGLRenderer;

    private hud!: Hud;

    private sun!: Sun;

    //Resolution
        public w: number = window.innerWidth;
        public h: number = window.innerHeight;
    //

    constructor() {
        this.init();
    }

    private initScene(): void {
        this.scene = new THREE.Scene();
    }

    //Render
    private resize = (): void => {
        this.w = window.innerWidth;
        this.h = window.innerHeight;

        camera.camera.aspect = this.w / this.h;
        camera.camera.updateProjectionMatrix();

        this.renderer.setSize(this.w, this.h);
    }

    private renderPlanets(): void {
        //Sun
        const renderSun = new Sun();
        this.scene.add(renderSun.mesh);

        //Mercury
    }

    private render(): void {
        this.scene.add(camera.camera);
        this.hud = new Hud();
        
        const canvas = <HTMLCanvasElement>(document.getElementById('main--context'));
        if(!canvas) throw new Error('Canvas not found');
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
        this.renderer.setSize(this.w, this.h);

        if(!canvas.parentElement) document.body.appendChild(this.renderer.domElement);

        //Animation
            const _animate = (): void => {
                requestAnimationFrame(_animate);

                camera.update();

                if(camera.controls) camera.controls.update();
                this.renderer.render(this.scene, camera.camera);
            }

            _animate();
        //

        window.addEventListener('resize', this.resize.bind(this));
    }

    //Init
    private init() {
        this.initScene();
        camera.setupCamera(this.w, this.h);

        this.renderPlanets();

        this.render();
        camera.setupControls(this.renderer);
    }
}

export const main = new Main();
