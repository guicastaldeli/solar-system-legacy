import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Line2 } from 'three/addons/lines/Line2.js';

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
    emissive?: number,
    emissiveIntensity?: number
}

export class Mercury {
    static DEFAULT_PROPS: Required<MercuryProps> = {
        //Size
        r: 3,
        d: 1,

        //Pos
        x: 15,
        y: 0,
        z: -15,

        color: 'rgb(121, 121, 121)',
        texture: '',
        emissive: 0,
        emissiveIntensity: 0,
    }

    private props: Required<MercuryProps> = Mercury.DEFAULT_PROPS;
    public mesh!: THREE.Mesh;

    constructor(options: MercuryProps = {}) {
        const props = { ...Mercury.DEFAULT_PROPS, ...options };

        this.addMercury();
        this.raycaster();
    }

    private createMercury(): void {
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

    private mercuryPos(): void {
        this.mesh.position.x = this.props.x,
        this.mesh.position.y = this.props.y,
        this.mesh.position.z = this.props.z
    }

    private addMercury(): void {
        this.createMercury();
        this.mercuryPos();
    }

    //Raycaster
        private raycaster(): void {
            const hoverColor: string = 'rgb(75, 75, 75)';

            activateRaycaster.registerBody({
                id: 'mercury',
                mesh: this.mesh,
                defaultColor: this.props.color,
                hoverColor: hoverColor
            });
        }

        private mouseClick(e: MouseEvent): void {
            const event = new CustomEvent('bodyClicked', {
                detail: {
                    id: 'mercury',
                    name: 'MERCURY',
                    position: this.mesh.position.clone(),
                    color: this.props.color,
                    mesh: this.mesh
                }
            });
            window.dispatchEvent(event);
        }
    //
}