import * as THREE from 'three';

import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';

interface UranusProps {
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

export class Uranus extends Orbit {
    static DEFAULT_PROPS: Required<UranusProps> = {
        //Size
        r: 14,
        d: 16,

        //Pos
        x: 340,
        y: 0,
        z: -15,

        color: 'rgb(100, 192, 231)',
        texture: '',
        emissive: 0,
        emissiveIntensity: 0,
        orbitRadius: 355,
        orbitSpeed: 0.0003
    }

    protected props: Required<UranusProps> = Uranus.DEFAULT_PROPS;
    public mesh!: THREE.Mesh;

    constructor(options: UranusProps = {}) {
        const props = { ...Uranus.DEFAULT_PROPS, ...options };
        super(props.orbitRadius, props.orbitSpeed);

        this.addUranus();
        this.raycaster();
    }

    private createUranus(): void {
        const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
        const material = new THREE.MeshStandardMaterial({ color: this.props.color });
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

    private uranusPos(): void {
        this.mesh.position.x = this.props.x,
        this.mesh.position.y = this.props.y,
        this.mesh.position.z = this.props.z
    }

    private addUranus(): void {
        this.createUranus();
        this.uranusPos();
    }

    //Raycaster
        private raycaster(): void {
            const hoverColor: string = 'rgb(79, 154, 187)';

            activateRaycaster.registerBody({
                id: 'ic-uranus',
                mesh: this.mesh,
                defaultColor: this.props.color,
                hoverColor: hoverColor,
                onClick: (e: MouseEvent) => this.mouseClick(e)
            });
        }

        private mouseClick(e: MouseEvent): void {
            const event = new CustomEvent('bodyClicked', {
                detail: {
                    id: 'clk-uranus',
                    name: 'URANUS',
                    ts: 1,
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