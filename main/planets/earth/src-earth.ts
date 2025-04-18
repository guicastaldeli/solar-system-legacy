import * as THREE from 'three';

import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';

import { getFresnelMat } from './shaders/fresnelMat.js';

interface EarthProps {
    r?: number,
    d?: number,
    x?: number,
    y?: number,
    z?: number,
    color?: string,
    texture?: string,
    cloudsTexture?: string,
    emissive?: string | number,
    emissiveIntensity?: number,
    orbitRadius?: number,
    orbitSpeed?: number
}

export class Earth extends Orbit {
    static DEFAULT_PROPS: Required<EarthProps> = {
        //Size
        r: 8,
        d: 16,

        //Pos
        x: 115,
        y: 0,
        z: -15,

        color: 'rgb(115, 138, 184)',
        texture: '../../assets/textures/earth/00_earthmap1k.jpg',
        cloudsTexture: '../../assets/textures/earth/cloud_combined_2048.jpg',
        emissive: 'rgb(102, 117, 147)',
        emissiveIntensity: 0.1,
        orbitRadius: 115,
        orbitSpeed: 0.005
    }

    protected props: Required<EarthProps> = Earth.DEFAULT_PROPS;
    public mesh!: THREE.Mesh;
    private _readyPromise: Promise<void>;
    private resolveReady: (value: void | PromiseLike<void>) => void = () => {};

    constructor(options: EarthProps = {}) {
        const props = { ...Earth.DEFAULT_PROPS, ...options };
        super(props.orbitRadius, props.orbitSpeed);

        //Add Earth
            this._readyPromise = new Promise((res) => {
                this.resolveReady = res;
            });

            this.addEarth().then(() => this.resolveReady());
        //
    }

    private async createEarth(): Promise<void> {
        //Loader
            const loader = new THREE.TextureLoader();
        //

        const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
        const material = new THREE.MeshStandardMaterial({ 
            map: loader.load(this.props.texture),
            emissive: this.props.emissive,
            emissiveIntensity: this.props.emissiveIntensity
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        //Glow
        const fresnelMat = await getFresnelMat();
        const glowMesh = new THREE.Mesh(geometry, fresnelMat);
        glowMesh.scale.setScalar(1.015)
        this.mesh.add(glowMesh);

        //Clouds
        const cloudsMat = new THREE.MeshStandardMaterial({ 
            map: loader.load(this.props.cloudsTexture),
            opacity: 0.4, 
            blending: THREE.AdditiveBlending
        });
        const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
        cloudsMesh.scale.setScalar(1.015);
        this.mesh.add(cloudsMesh);

        //Animation
            const _animate = (): void => {
                requestAnimationFrame(_animate);

                this.mesh.rotation.y += 0.002;
                cloudsMesh.rotation.y += 0.002;
                glowMesh.rotation.y += 0.002;
            }

            _animate();
        //
    }

    private earthPos(): void {
        this.mesh.position.x = this.props.x,
        this.mesh.position.y = this.props.y,
        this.mesh.position.z = this.props.z
    }

    private async addEarth(): Promise<void> {
        this.createEarth();
        this.earthPos();
        this.raycaster();
    }

    //Raycaster
        private raycaster(): void {
            const hoverColor: string = 'rgb(85, 101, 135)';

            activateRaycaster.registerBody({
                id: 'ic-earth',
                mesh: this.mesh,
                defaultColor: this.props.color || this.props.emissive,
                hoverColor: hoverColor || this.props.emissive,
                onClick: (e: MouseEvent) => this.mouseClick(e)
            });
        }

        private mouseClick(e: MouseEvent): void {
            const event = new CustomEvent('bodyClicked', {
                detail: {
                    id: 'clk-earth',
                    name: 'EARTH',
                    ts: 1.2,
                    position: this.mesh.position.clone(),
                    color: this.props.color,
                    mesh: this.mesh
                }
            });
            window.dispatchEvent(event);
            if(camera.isFollowingObject(this.mesh)) return;
            camera.followObject(this.mesh, this.props.r, this.props.orbitSpeed);
        }
    //
}