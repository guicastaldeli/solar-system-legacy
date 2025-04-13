import * as THREE from 'three';

import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';

interface NeptuneProps {
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

export class Neptune extends Orbit {
    static DEFAULT_PROPS: Required<NeptuneProps> = {
        //Size
        r: 12.5,
        d: 16,

        //Pos
        x: 400,
        y: 0,
        z: -15,

        color: 'rgb(98, 132, 230)',
        texture: '',
        emissive: 0,
        emissiveIntensity: 0,
        orbitRadius: 305,
        orbitSpeed: 0.0001
    }

    protected props: Required<NeptuneProps> = Neptune.DEFAULT_PROPS;
    public mesh!: THREE.Mesh;

    constructor(options: NeptuneProps = {}) {
        const props = { ...Neptune.DEFAULT_PROPS, ...options };
        super(props.orbitRadius, props.orbitSpeed);

        this.addNeptune();
        this.raycaster();
    }

    private createNeptune(): void {
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

    private neptunePos(): void {
        this.mesh.position.x = this.props.x,
        this.mesh.position.y = this.props.y,
        this.mesh.position.z = this.props.z
    }

    private addNeptune(): void {
        this.createNeptune();
        this.neptunePos();
    }

    //Raycaster
        private raycaster(): void {
            const hoverColor: string = 'rgb(70, 92, 159)';

            activateRaycaster.registerBody({
                id: 'rc-neptune',
                mesh: this.mesh,
                defaultColor: this.props.color,
                hoverColor: hoverColor,
                onClick: (e: MouseEvent) => this.mouseClick(e)
            });
        }

        private mouseClick(e: MouseEvent): void {
            const event = new CustomEvent('bodyClicked', {
                detail: {
                    id: 'clk-neptune',
                    name: 'NEPTUNE',
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