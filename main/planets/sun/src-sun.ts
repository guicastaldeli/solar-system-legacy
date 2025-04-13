import * as THREE from 'three';

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
    emissive?: number,
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
        
        color: 'rgb(219, 180, 24)',
        texture: '',
        emissive: 0,
        emissiveIntensity: 0,
    }

    private props: Required<SunProps> = Sun.DEFAULT_PROPS;
    public mesh!: THREE.Mesh;
    
    constructor(options: SunProps = {}) {
        const props = { ...Sun.DEFAULT_PROPS, ...options };

        this.addSun();
        this.raycaster();
    }

    private createSun(): void {
        const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
        const material = new THREE.MeshBasicMaterial({ color: this.props.color, opacity: 1, transparent: true });
        this.mesh = new THREE.Mesh(geometry, material);

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
    }

    //Raycaster
       private raycaster(): void {
            const hoverColor: string = 'rgb(240, 217, 154)';

            activateRaycaster.registerBody({
                id: 'rc-sun',
                mesh: this.mesh,
                defaultColor: this.props.color,
                hoverColor: hoverColor,
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
            camera.followObject(this.mesh, this.props.r);
        }
    //
}