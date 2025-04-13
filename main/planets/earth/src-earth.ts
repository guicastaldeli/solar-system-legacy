import * as THREE from 'three';

import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';

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

        color: 'rgb(0, 56, 168)',
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

    private createEarth(): void {
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

    private earthPos(): void {
        this.mesh.position.x = this.props.x,
        this.mesh.position.y = this.props.y,
        this.mesh.position.z = this.props.z
    }

    private addEarth(): void {
        this.createEarth();
        this.earthPos();
    }

    //Raycaster
        private raycaster(): void {
            const hoverColor: string = 'rgb(0, 34, 102)';

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