import * as THREE from 'three';
import { camera } from './camera.js';
import { Hud } from './hud.js';
import { Sun } from '../planets/sun/src-sun.js';
import { Mercury } from '../planets/mercury/src-mercury.js';
class Main {
    //
    constructor() {
        this.planets = [];
        //Resolution
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        //Render
        this.resize = () => {
            this.w = window.innerWidth;
            this.h = window.innerHeight;
            camera.camera.aspect = this.w / this.h;
            camera.camera.updateProjectionMatrix();
            this.renderer.setSize(this.w, this.h);
        };
        this.init();
    }
    initScene() {
        this.scene = new THREE.Scene();
    }
    renderPlanets() {
        //Sun
        const renderSun = new Sun();
        this.scene.add(renderSun.mesh);
        //Mercury
        const renderMercury = new Mercury();
        this.planets.push(renderMercury);
        this.scene.add(renderMercury.mesh);
    }
    render() {
        ///Scene
        this.scene.add(camera.camera);
        //Hud
        this.hud = new Hud(this.scene);
        //Canvas
        const canvas = (document.getElementById('main--context'));
        if (!canvas)
            throw new Error('Canvas not found');
        //Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
        this.renderer.setSize(this.w, this.h);
        if (!canvas.parentElement)
            document.body.appendChild(this.renderer.domElement);
        //Animation
        const _animate = () => {
            //Animation
            requestAnimationFrame(_animate);
            //Planets
            this.planets.forEach(p => p.update());
            //Camera
            camera.update();
            if (camera.controls)
                camera.controls.update();
            //Render
            camera.camera.updateProjectionMatrix();
            this.renderer.render(this.scene, camera.camera);
        };
        _animate();
        //
        window.addEventListener('resize', this.resize.bind(this));
    }
    //Init
    init() {
        this.initScene();
        camera.setupCamera(this.w, this.h);
        this.renderPlanets();
        this.render();
        camera.setupControls(this.renderer);
    }
}
export const main = new Main();
