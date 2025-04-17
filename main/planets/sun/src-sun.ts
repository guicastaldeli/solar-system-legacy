import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';

interface SunProps {
    r?: number,
    d?: number,
    x?: number,
    y?: number,
    z?: number,
    color?: string,
    texture?: string,
    emissive?: string | number,
    emissiveIntensity?: number
}

export class Sun {
    static DEFAULT_PROPS: Required<SunProps> = {
        //Size
        r: 30,
        d: 16,

        //Pos
        x: 0,
        y: 0,
        z: -15,
        
        color: 'rgb(255, 174, 0)',
        texture: '../../assets/textures/sun/2k_sun.jpg',
        emissive: 'rgb(255, 174, 0)',
        emissiveIntensity: 0.1,
    }

    private props: Required<SunProps> = Sun.DEFAULT_PROPS;
    public mesh!: THREE.Mesh;
    private scene: THREE.Scene;
    
    constructor(scene: THREE.Scene, options: SunProps = {}) {
        const props = { ...Sun.DEFAULT_PROPS, ...options };
        this.scene = scene;

        this.addSun();
    }

    private createSun(): void {
        //Loader
            const loader = new THREE.TextureLoader();
        //

        const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
        const material = new THREE.MeshStandardMaterial({ 
            map: loader.load(this.props.texture),
            color: this.props.color,
            emissive: this.props.emissive, 
            emissiveIntensity: this.props.emissiveIntensity 
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.receiveShadow = true;

        //Lightning
            const pointLight = new THREE.PointLight();
            pointLight.color = new THREE.Color('rgb(255, 255, 255)');
            pointLight.intensity = 2;
            pointLight.distance = 0;
            pointLight.decay = 0;

            pointLight.position.set(this.props.x, this.props.y, this.props.z);
            
            this.scene.add(pointLight);
        //

        //Animation
            const _animate = (): void => {
                requestAnimationFrame(_animate);

                this.mesh.rotation.y += 0.01;
            }

            _animate();
        //
    }

    private sunPos(): void {
        this.mesh.position.x = this.props.x,
        this.mesh.position.y = this.props.y,
        this.mesh.position.z = this.props.z
    }

    private addSun(): void {
        this.createSun();
        this.sunPos();
        this.raycaster();
    }

    //Raycaster
       private raycaster(): void {
            const hoverColor: string = 'rgb(199, 128, 128)';

            activateRaycaster.registerBody({
                id: 'rc-sun',
                mesh: this.mesh,
                defaultColor: this.props.color || this.props.emissive,
                hoverColor: hoverColor || this.props.emissive,
                onClick: (e: MouseEvent) => this.mouseClick(e)
            });
       }

        private mouseClick(e: MouseEvent): void {
            const event = new CustomEvent('bodyClicked', {
                detail: {
                    id: 'clk-sun',
                    name: 'SUN',
                    ts: 1,
                    position: this.mesh.position.clone(),
                    color: this.props.color,
                    mesh: this.mesh,
                }
            });
            window.dispatchEvent(event);

            if(camera.isFollowingObject(this.mesh)) {
                return;
            }
            
            camera.followObject(this.mesh, this.props.r);
        }
    //
}