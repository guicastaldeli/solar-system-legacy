import * as THREE from 'three';
import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';
export class Uranus extends Orbit {
    constructor(options = {}) {
        const props = Object.assign(Object.assign({}, Uranus.DEFAULT_PROPS), options);
        super(props.orbitRadius, props.orbitSpeed);
        this.props = Uranus.DEFAULT_PROPS;
        this.addUranus();
        this.raycaster();
    }
    createUranus() {
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
    uranusPos() {
        this.mesh.position.x = this.props.x,
            this.mesh.position.y = this.props.y,
            this.mesh.position.z = this.props.z;
    }
    addUranus() {
        this.createUranus();
        this.uranusPos();
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(79, 154, 187)';
        activateRaycaster.registerBody({
            id: 'ic-uranus',
            mesh: this.mesh,
            defaultColor: this.props.color,
            hoverColor: hoverColor,
            onClick: (e) => this.mouseClick(e)
        });
    }
    mouseClick(e) {
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
}
Uranus.DEFAULT_PROPS = {
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
};
