import * as THREE from 'three';

import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';

interface MarsProps {
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

export class Mars extends Orbit {
    static DEFAULT_PROPS: Required<MarsProps> = {
        //Size
        r: 4,
        d: 16,

        //Pos
        x: 155,
        y: 0,
        z: -15,

        color: 'rgb(231, 117, 51)',
        texture: '',
        emissive: 0,
        emissiveIntensity: 0,
        orbitRadius: 145,
        orbitSpeed: 0.003
    }

    protected props: Required<MarsProps> = Mars.DEFAULT_PROPS;
    public mesh!: THREE.Mesh;

    constructor(options: MarsProps = {}) {
        const props = { ...Mars.DEFAULT_PROPS, ...options };
        super(props.orbitRadius, props.orbitSpeed);

        this.addMars();
        this.raycaster();
    }

    private createMars(): void {
        const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
        const material = new THREE.MeshBasicMaterial({ color: this.props.color });
        this.mesh = new THREE.Mesh(geometry, material);

        //Animation
            const _animate = (): void => {
                requestAnimationFrame(_animate);

                this.mesh.rotation.y += 0.01;
            }

            _animate();
        //
    }

    private marsPos(): void {
        this.mesh.position.x = this.props.x,
        this.mesh.position.y = this.props.y,
        this.mesh.position.z = this.props.z
    }

    private addMars(): void {
        this.createMars();
        this.marsPos();
    }

    //Raycaster
        private raycaster(): void {
            const hoverColor: string = 'rgb(179, 91, 40)';

            activateRaycaster.registerBody({
                id: 'ic-mars',
                mesh: this.mesh,
                defaultColor: this.props.color,
                hoverColor: hoverColor,
                onClick: (e: MouseEvent) => this.mouseClick(e)
            });
        }

        private mouseClick(e: MouseEvent): void {
            const event = new CustomEvent('bodyClicked', {
                detail: {
                    id: 'clk-mars',
                    name: 'MARS',
                    ts: 0.9,
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