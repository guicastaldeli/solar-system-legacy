import * as THREE from 'three';
import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';
export class Venus extends Orbit {
    constructor(options = {}) {
        const props = Object.assign(Object.assign({}, Venus.DEFAULT_PROPS), options);
        super(props.orbitRadius, props.orbitSpeed);
        this.props = Venus.DEFAULT_PROPS;
        this.addVenus();
        this.raycaster();
    }
    createVenus() {
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
    venusPos() {
        this.mesh.position.x = this.props.x,
            this.mesh.position.y = this.props.y,
            this.mesh.position.z = this.props.z;
    }
    addVenus() {
        this.createVenus();
        this.venusPos();
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(152, 144, 135)';
        activateRaycaster.registerBody({
            id: 'rc-venus',
            mesh: this.mesh,
            defaultColor: this.props.color,
            hoverColor: hoverColor,
            onClick: (e) => this.mouseClick(e)
        });
    }
    mouseClick(e) {
        const event = new CustomEvent('bodyClicked', {
            detail: {
                id: 'clk-venus',
                name: 'VENUS',
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
Venus.DEFAULT_PROPS = {
    //Size
    r: 5,
    d: 16,
    //Pos
    x: 80,
    y: 0,
    z: -15,
    color: 'rgb(194, 184, 171)',
    texture: '',
    emissive: 0,
    emissiveIntensity: 0,
    orbitRadius: 85,
    orbitSpeed: 0.01
};
