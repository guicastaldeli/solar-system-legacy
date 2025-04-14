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
    emissive?: number,
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
        texture: '',
        emissive: 0,
        emissiveIntensity: 0,
        orbitRadius: 115,
        orbitSpeed: 0.005
    }

    protected props: Required<EarthProps> = Earth.DEFAULT_PROPS;
    public mesh!: THREE.Mesh;

    constructor(options: EarthProps = {}) {
        const props = { ...Earth.DEFAULT_PROPS, ...options };
        super(props.orbitRadius, props.orbitSpeed);

        this.addEarth();
        this.raycaster();
    }

    private async createEarth(): Promise<void> {
        const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);

        //Texture
        const loader = new THREE.TextureLoader();
        const material = new THREE.MeshStandardMaterial({ map: loader.load('../../assets/textures/earth/00_earthmap1k.jpg') });

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
            map: loader.load('../../assets/textures/earth/cloud_combined_2048.jpg'),
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
    }

    //Raycaster
        private raycaster(): void {
            const hoverColor: string = 'rgb(85, 101, 135)';

            activateRaycaster.registerBody({
                id: 'ic-earth',
                mesh: this.mesh,
                defaultColor: this.props.color,
                hoverColor: hoverColor,
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
            camera.followObject(this.mesh, this.props.r);
        }
    //
}