import * as THREE from 'three';
import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';
export class Earth extends Orbit {
    constructor(options = {}) {
        const props = Object.assign(Object.assign({}, Earth.DEFAULT_PROPS), options);
        super(props.orbitRadius, props.orbitSpeed);
        this.props = Earth.DEFAULT_PROPS;
        this.addEarth();
        this.raycaster();
    }
    createEarth() {
        const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
        const material = new THREE.MeshBasicMaterial({ color: this.props.color });
        this.mesh = new THREE.Mesh(geometry, material);
        //Animation
        const _animate = () => {
            requestAnimationFrame(_animate);
            this.mesh.rotation.y += 0.01;
        };
        _animate();
        //
    }
    earthPos() {
        this.mesh.position.x = this.props.x,
            this.mesh.position.y = this.props.y,
            this.mesh.position.z = this.props.z;
    }
    addEarth() {
        this.createEarth();
        this.earthPos();
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(0, 34, 102)';
        activateRaycaster.registerBody({
            id: 'ic-earth',
            mesh: this.mesh,
            defaultColor: this.props.color,
            hoverColor: hoverColor,
            onClick: (e) => this.mouseClick(e)
        });
    }
    mouseClick(e) {
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
}
Earth.DEFAULT_PROPS = {
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
};
