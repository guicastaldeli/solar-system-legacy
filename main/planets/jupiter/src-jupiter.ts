import * as THREE from 'three';

import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';

interface JupiterProps {
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
    orbitSpeed?: number,
}

export class Jupiter extends Orbit {
    static DEFAULT_PROPS: Required<JupiterProps> = {
        //Size
        r: 20,
        d: 16,

        //Pos
        x: 205,
        y: 0,
        z: -15,

        color: 'rgb(180, 183, 194)',
        texture: '',
        emissive: 0,
        emissiveIntensity: 0,
        orbitRadius: 180,
        orbitSpeed: 0.001
    }

    protected props: Required<JupiterProps> = Jupiter.DEFAULT_PROPS;
    public mesh!: THREE.Mesh;

    constructor(options: JupiterProps = {}) {
        const props = { ...Jupiter.DEFAULT_PROPS, ...options };
        super(props.orbitRadius, props.orbitSpeed);

        this.addJupiter();
        this.raycaster();
    }

    private createJupiter(): void {
        const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
        const material = new THREE.MeshStandardMaterial({ color: this.props.color });
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.castShadow = true,
        this.mesh.receiveShadow = true;

        //Animation
            const _animate = (): void => {
                requestAnimationFrame(_animate);

                this.mesh.rotation.y += 0.01;
            }

            _animate();
        //
    }

    private jupiterPos(): void {
        this.mesh.position.x = this.props.x,
        this.mesh.position.y = this.props.y,
        this.mesh.position.z = this.props.z
    }

    private addJupiter(): void {
        this.createJupiter();
        this.jupiterPos();
    }

    //Raycaster
        private raycaster(): void {
            const hoverColor: string = 'rgb(136, 138, 148)';

            activateRaycaster.registerBody({
                id: 'ic-jupiter',
                mesh: this.mesh,
                defaultColor: this.props.color,
                hoverColor: hoverColor,
                onClick: (e: MouseEvent) => this.mouseClick(e)
            });
        }

        private mouseClick(e: MouseEvent): void {
            const event = new CustomEvent('bodyClicked', {
                detail: {
                    id: 'clk-jupiter',
                    name: 'JUPITER',
                    ts: 1.3,
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