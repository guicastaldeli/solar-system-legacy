import * as THREE from 'three';
import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';
export class Mercury extends Orbit {
    constructor(options = {}) {
        const props = Object.assign(Object.assign({}, Mercury.DEFAULT_PROPS), options);
        super(props.orbitRadius, props.orbitSpeed);
        this.props = Mercury.DEFAULT_PROPS;
        this.addMercury();
        this.raycaster();
    }
    createMercury() {
        const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
        const material = new THREE.MeshBasicMaterial({ color: this.props.color, opacity: 1, transparent: true });
        this.mesh = new THREE.Mesh(geometry, material);
        //Animation
        const _animate = () => {
            requestAnimationFrame(_animate);
            this.mesh.rotation.y += 0.01;
        };
        _animate();
        //
    }
    mercuryPos() {
        this.mesh.position.x = this.props.x,
            this.mesh.position.y = this.props.y,
            this.mesh.position.z = this.props.z;
    }
    addMercury() {
        this.createMercury();
        this.mercuryPos();
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(75, 75, 75)';
        activateRaycaster.registerBody({
            id: 'rc-mercury',
            mesh: this.mesh,
            defaultColor: this.props.color,
            hoverColor: hoverColor,
            onClick: (e) => this.mouseClick(e)
        });
    }
    mouseClick(e) {
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
        camera.followObject(this.mesh, this.props.r);
    }
}
Mercury.DEFAULT_PROPS = {
    //Size
    r: 3,
    d: 16,
    //Pos
    x: 55,
    y: 0,
    z: -15,
    color: 'rgb(121, 121, 121)',
    texture: '',
    emissive: 0,
    emissiveIntensity: 0,
    orbitRadius: 55,
    orbitSpeed: 0.03
};
