import * as THREE from 'three';

import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';

interface MercuryProps {
    r?: number,
    d?: number,
    x?: number,
    y?: number,
    z?: number,
    color?: string,
    texture?: string,
    emissive?: string | number,
    emissiveIntensity?: number,
    orbitRadius?: number,
    orbitSpeed?: number
}

export class Mercury extends Orbit {
    static DEFAULT_PROPS: Required<MercuryProps> = {
        //Size
        r: 3,
        d: 16,

        //Pos
        x: 55,
        y: 0,
        z: -15,

        color: 'rgb(121, 121, 121)',
        texture: '../../assets/textures/mercury/2k_mercury.jpg',
        emissive: 'rgb(121, 121, 121)',
        emissiveIntensity: 0.1,

        orbitRadius: 55,
        orbitSpeed: 0.005
    }

    protected props: Required<MercuryProps> = Mercury.DEFAULT_PROPS;
    public mesh!: THREE.Mesh;

    constructor(options: MercuryProps = {}) {
        const props = { ...Mercury.DEFAULT_PROPS, ...options };
        super(props.orbitRadius, props.orbitSpeed);

        this.addMercury();
    }

    private createMercury(): void {
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

        //Animation
            const _animate = (): void => {
                requestAnimationFrame(_animate);
                this.mesh.rotation.y += 0.01;
            }

            _animate();
        //
    }

    private mercuryPos(): void {
        this.mesh.position.x = this.props.x,
        this.mesh.position.y = this.props.y,
        this.mesh.position.z = this.props.z
    }

    private addMercury(): void {
        this.createMercury();
        this.mercuryPos();
        this.raycaster();
    }

    //Raycaster
        private raycaster(): void {
            const hoverColor: string = 'rgb(75, 75, 75)';

            activateRaycaster.registerBody({
                id: 'rc-mercury',
                mesh: this.mesh,
                defaultColor: this.props.color || this.props.emissive,
                hoverColor: hoverColor || this.props.emissive,
                onClick: (e: MouseEvent) => this.mouseClick(e)
            });
        }

        private mouseClick(e: MouseEvent): void {
            const event = new CustomEvent('bodyClicked', {
                detail: {
                    id: 'clk-mercury',
                    name: 'MERCURY',
                    ts: 0.8,
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