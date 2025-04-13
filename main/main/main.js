import * as THREE from 'three';
import { camera } from './camera.js';
import { Hud } from './hud.js';
import { Sun } from '../planets/sun/src-sun.js';
import { Mercury } from '../planets/mercury/src-mercury.js';
import { Venus } from '../planets/venus/src-venus.js';
import { Earth } from '../planets/earth/src-earth.js';
import { Mars } from '../planets/mars/mars.js';
import { Jupiter } from '../planets/jupiter/src-jupiter.js';
import { Saturn } from '../planets/saturn/src-saturn.js';
import { Uranus } from '../planets/uranus/src-uranus.js';
import { Neptune } from '../planets/neptune/src-neptune.js';
class Main {
    //
    constructor() {
        //Resolution
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        //Planets
        this.planets = [];
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
        //Venus
        const renderVenus = new Venus();
        this.planets.push(renderVenus);
        this.scene.add(renderVenus.mesh);
        //Earth
        const renderEarth = new Earth();
        this.planets.push(renderEarth);
        this.scene.add(renderEarth.mesh);
        //Mars
        const renderMars = new Mars();
        this.planets.push(renderMars);
        this.scene.add(renderMars.mesh);
        //Jupiter
        const renderJupiter = new Jupiter();
        this.planets.push(renderJupiter);
        this.scene.add(renderJupiter.mesh);
        //Saturn
        const renderSaturn = new Saturn();
        this.planets.push(renderSaturn);
        this.scene.add(renderSaturn.mesh);
        //Uranus
        const renderUranus = new Uranus();
        this.planets.push(renderUranus);
        this.scene.add(renderUranus.mesh);
        //Neptune
        const renderNeptune = new Neptune();
        this.planets.push(renderNeptune);
        this.scene.add(renderNeptune.mesh);
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
