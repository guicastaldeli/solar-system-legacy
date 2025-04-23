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
    public scene!: THREE.Scene;
    public renderer!: THREE.WebGLRenderer;

    //Resolution
    public w: number = window.innerWidth;
    public h: number = window.innerHeight;

    private hud!: Hud;

    //Skybox
    private skybox!: Skybox;

    //Planets
        private planets: any[] = [];

        //List
            private sun?: Sun;
            private mercury?: Mercury;
            private venus?: Venus;
            private earth?: Earth;
            private moon?: Moon;
            private mars?: Mars;
            private jupiter?: Jupiter;
            private saturn?: Saturn;
            private uranus?: Uranus;
            private neptune?: Neptune;
        //
    //

    constructor() {
        this.init();
    }

    private async initScene(): Promise<void> {
        this.scene = new THREE.Scene();

        //Render Skyboxs
        this.skybox = new Skybox(300);
        await this.skybox.ready();
        this.scene.add(this.skybox.points);
    }

    private async renderPlanets(): Promise<void> {
        type Planets = new (...args: any[]) => any;
        interface initPlanets { p: Planets, args: any[]; }

        const planetList : initPlanets[] = [
            { p: Sun, args: [this.scene, this.renderer] },
            { p: Mercury, args: [] },
            { p: Venus, args: [] },
            { p: Earth, args: [] },
            { p: Moon, args: [this.planets] },
            { p: Mars, args: [] },
            { p: Jupiter, args: [] },
            { p: Saturn, args: [] },
            { p: Uranus, args: [] },
            { p: Neptune, args: [] }
        ];

        for(const { p, args } of planetList) {
            const renderPlanet = new p(...args);
            this.planets.push(renderPlanet);
            
            if(renderPlanet.ready && typeof renderPlanet.ready === 'function') {
                await renderPlanet.ready();
            }

            this.scene.add(renderPlanet.mesh);
        }
    }

    //Lightning
    private setupLightning(): void {
        const ambientLight = new THREE.AmbientLight('rgb(108, 108, 108)', 0.5);
        this.scene.add(ambientLight);
    }

    //Render
    private resize = (): void => {
        this.w = window.innerWidth;
        this.h = window.innerHeight;

        camera.camera.aspect = this.w / this.h;
        camera.camera.updateProjectionMatrix();

        this.renderer.setSize(this.w, this.h);
    }

    private render(): void {
        ///Scene
        this.scene.add(camera.camera);

        //Hud
        this.hud = new Hud(this.scene);
        
        //Canvas
        const canvas = <HTMLCanvasElement>(document.getElementById('main--context'));
        if(!canvas) throw new Error('Canvas not found');
        
        //Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
        this.renderer.setSize(this.w, this.h);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        if(!canvas.parentElement) document.body.appendChild(this.renderer.domElement);

        //Animation
            const _animate = (): void => {
                //Animation
                requestAnimationFrame(_animate);

                //Skybox
                this.skybox.update();

                //Planets
                this.planets.forEach(p => { 
                    if(typeof p.update === 'function') p.update();
                });

                //Camera
                camera.update();
                if(camera.controls) camera.controls.update();
                
                //Render
                this.renderer.render(this.scene, camera.camera);
            }

            _animate();
        //

        window.addEventListener('resize', this.resize.bind(this));
    }

    //Init
    private async init() {
        await this.initScene();
        camera.setupCamera(this.w, this.h);
        this.render();
        camera.setupControls(this.renderer);

        this.setupLightning();

        await this.renderPlanets();
    }
}

export const main = new Main();