import * as THREE from 'three';
import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';
export class Mars extends Orbit {
    constructor(options = {}) {
        const props = Object.assign(Object.assign({}, Mars.DEFAULT_PROPS), options);
        super(props.orbitRadius, props.orbitSpeed);
        this.props = Mars.DEFAULT_PROPS;
        this.addMars();
        this.raycaster();
    }
    createMars() {
        const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
        const material = new THREE.MeshStandardMaterial({ color: this.props.color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        //Animation
        const _animate = () => {
            requestAnimationFrame(_animate);
            this.mesh.rotation.y += 0.01;
        };
        _animate();
        //
    }
    marsPos() {
        this.mesh.position.x = this.props.x,
            this.mesh.position.y = this.props.y,
            this.mesh.position.z = this.props.z;
    }
    addMars() {
        this.createMars();
        this.marsPos();
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(179, 91, 40)';
        activateRaycaster.registerBody({
            id: 'ic-mars',
            mesh: this.mesh,
            defaultColor: this.props.color,
            hoverColor: hoverColor,
            onClick: (e) => this.mouseClick(e)
        });
    }
    mouseClick(e) {
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
}
Mars.DEFAULT_PROPS = {
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
};
