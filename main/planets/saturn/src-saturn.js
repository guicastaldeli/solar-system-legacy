import * as THREE from 'three';
import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';
export class Saturn extends Orbit {
    constructor(options = {}) {
        const props = Object.assign(Object.assign({}, Saturn.DEFAULT_PROPS), options);
        super(props.orbitRadius, props.orbitSpeed);
        this.props = Saturn.DEFAULT_PROPS;
        this.addSaturn();
        this.raycaster();
    }
    createSaturn() {
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
    saturnPos() {
        this.mesh.position.x = this.props.x,
            this.mesh.position.y = this.props.y,
            this.mesh.position.z = this.props.z;
    }
    //Rings
    createRings() {
        const innerRadius = this.props.r + 3;
        const outerRadius = this.props.r + 12;
        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        const material = new THREE.MeshStandardMaterial({ color: 'rgb(193, 184, 157)', side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
        const ring = new THREE.Mesh(geometry, material);
        ring.castShadow = true;
        ring.receiveShadow = true;
        ring.rotation.x = 30;
        //Animation
        const _animate = () => {
            requestAnimationFrame(_animate);
            ring.rotation.y = 0.05;
        };
        _animate();
        //
        this.mesh.add(ring);
    }
    //
    addSaturn() {
        this.createSaturn();
        this.saturnPos();
        this.createRings();
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(135, 115, 83))';
        activateRaycaster.registerBody({
            id: 'ic-saturn',
            mesh: this.mesh,
            defaultColor: this.props.color,
            hoverColor: hoverColor,
            onClick: (e) => this.mouseClick(e)
        });
    }
    mouseClick(e) {
        const event = new CustomEvent('bodyClicked', {
            detail: {
                id: 'clk-saturn',
                name: 'SATURN',
                ts: 1.15,
                position: this.mesh.position.clone(),
                color: this.props.color,
                mesh: this.mesh
            }
        });
        window.dispatchEvent(event);
        camera.followObject(this.mesh, this.props.r);
    }
}
Saturn.DEFAULT_PROPS = {
    //Size
    r: 18,
    d: 16,
    //Pos
    x: 275,
    y: 0,
    z: -15,
    color: 'rgb(167, 143, 105)',
    texture: '',
    emissive: 0,
    emissiveIntensity: 0,
    orbitRadius: 245,
    orbitSpeed: 0.0005
};
