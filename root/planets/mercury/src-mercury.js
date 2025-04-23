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
    }
    createMercury() {
        //Loader
        const loader = new THREE.TextureLoader();
        //
        const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
        const material = new THREE.MeshStandardMaterial({
            map: loader.load(this.props.texture),
            emissive: this.props.emissive,
            emissiveIntensity: this.props.emissiveIntensity
        });
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
    mercuryPos() {
        this.mesh.position.x = this.props.x,
            this.mesh.position.y = this.props.y,
            this.mesh.position.z = this.props.z;
    }
    addMercury() {
        this.createMercury();
        this.mercuryPos();
        this.raycaster();
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(75, 75, 75)';
        activateRaycaster.registerBody({
            id: 'rc-mercury',
            mesh: this.mesh,
            defaultColor: this.props.color || this.props.emissive,
            hoverColor: hoverColor || this.props.emissive,
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
        if (camera.isFollowingObject(this.mesh))
            return;
        camera.followObject(this.mesh, this.props.r, this.props.orbitSpeed);
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
    texture: '../../assets/textures/mercury/2k_mercury.jpg',
    emissive: 'rgb(121, 121, 121)',
    emissiveIntensity: 0.1,
    orbitRadius: 55,
    orbitSpeed: 0.005
};
