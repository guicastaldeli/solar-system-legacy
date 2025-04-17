import * as THREE from 'three';

import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';

import { Earth } from '../earth/src-earth.js';

interface MoonProps {
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
    orbitSpeed?: number,
}

export class Moon {
    static DEFAULT_PROPS: Required<MoonProps> = {
        //Size
        r: 2,
        d: 16,

        //Pos
        x: 115,
        y: 20,
        z: -15,

        color: 'rgb(161, 161, 161)',
        texture: '../../assets/textures/moon/2k_moon.jpg',
        emissive: 'rgb(161, 161, 161)',
        emissiveIntensity: 0.1,
        orbitRadius: 15,
        orbitSpeed: 0.01
    }

    protected props: Required<MoonProps> = Moon.DEFAULT_PROPS;
    public mesh!: THREE.Mesh;
    private earth!: Earth;
    private angle: number = 0;

    constructor(earth: Earth, options: MoonProps = {}) {
        const props = { ...Moon.DEFAULT_PROPS, ...options };
        this.props = props;
        this.earth = earth;
        this.angle = Math.random() * Math.PI * 2;

        this.addMoon();
        this.initialPos();
    }

    private createMoon(): void {
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

                this.mesh.rotation.y += 0.002;
                this.updateOrbit();
            }

            _animate();
        //
    }

    private initialPos(): void {
        if(!this.earth?.mesh) {
            this.mesh.position.x = this.props.x;
            this.mesh.position.y = this.props.y;
            this.mesh.position.z = this.props.z;
        }
    }

    private updateOrbit(): void {
        if(!this.earth?.mesh) return;

        this.angle += this.props.orbitSpeed;

        const orbitX = Math.cos(this.angle) * this.props.orbitRadius;
        const orbitZ = Math.sin(this.angle) * this.props.orbitRadius;

        this.mesh.position.x = this.earth.mesh.position.x + orbitX;
        this.mesh.position.y = this.earth.mesh.position.y + 5;
        this.mesh.position.z = this.earth.mesh.position.z + orbitZ
    }

    private addMoon(): void {
        this.createMoon();
        this.raycaster();
    }

    private raycaster(): void {
        const hoverColor: string = 'rgb(161, 161, 161)';

        activateRaycaster.registerBody({
            id: 'ic-moon',
            mesh: this.mesh,
            defaultColor: this.props.color || this.props.emissive,
            hoverColor: hoverColor || this.props.emissive,
            onClick: (e: MouseEvent) => this.mouseClick(e)
        });

    }

    private mouseClick(e: MouseEvent): void {
        const event = new CustomEvent('bodyClicked', {
            detail: {
                id: 'clk-moon',
                name: 'MOON',
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
}