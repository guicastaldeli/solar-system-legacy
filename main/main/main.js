var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as THREE from 'three';
import { camera } from './camera.js';
import { Hud } from './hud.js';
import { Skybox } from './skybox/skybox.js';
import { Sun } from '../planets/sun/src-sun.js';
import { Mercury } from '../planets/mercury/src-mercury.js';
import { Venus } from '../planets/venus/src-venus.js';
import { Earth } from '../planets/earth/src-earth.js';
import { Moon } from '../planets/moon/src-moon.js';
import { Mars } from '../planets/mars/src-mars.js';
import { Jupiter } from '../planets/jupiter/src-jupiter.js';
import { Saturn } from '../planets/saturn/src-saturn.js';
import { Uranus } from '../planets/uranus/src-uranus.js';
import { Neptune } from '../planets/neptune/src-neptune.js';
class Main {
    //
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
        return __awaiter(this, void 0, void 0, function* () {
            this.scene = new THREE.Scene();
            //Render Skyboxs
            this.skybox = new Skybox(300);
            yield this.skybox.ready();
            this.scene.add(this.skybox.points);
        });
    }
    renderPlanets() {
        const planetList = [
            { p: Sun, args: [this.scene] },
            { p: Mercury, args: [] },
            { p: Venus, args: [] },
            { p: Earth, args: [] },
            { p: Mars, args: [] },
            { p: Jupiter, args: [] },
            { p: Saturn, args: [] },
            { p: Uranus, args: [] },
            { p: Neptune, args: [] }
        ];
        for (const { p, args } of planetList) {
            const renderPlanets = new p(...args);
            this.planets.push(renderPlanets);
            this.scene.add(renderPlanets.mesh);
        }
        const earth = this.planets.find(p => p instanceof Earth);
        if (earth) {
            this.moon = new Moon(earth);
            this.planets.push(this.moon);
            this.scene.add(this.moon.mesh);
        }
    }
    //Lightning
    setupLightning() {
        //Ambient
        const ambientLight = new THREE.AmbientLight('rgb(108, 108, 108)', 0.5);
        this.scene.add(ambientLight);
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
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        if (!canvas.parentElement)
            document.body.appendChild(this.renderer.domElement);
        //Animation
        const _animate = () => {
            //Animation
            requestAnimationFrame(_animate);
            //Skybox
            this.skybox.update();
            //Planets
            this.planets.forEach(p => {
                if (typeof p.update === 'function')
                    p.update();
            });
            //Camera
            camera.update();
            if (camera.controls)
                camera.controls.update();
            //Render
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
        this.setupLightning();
        this.renderPlanets();
        this.render();
        camera.setupControls(this.renderer);
    }
}
export const main = new Main();
