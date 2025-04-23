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
    }
    createUranus() {
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
    uranusPos() {
        this.mesh.position.x = this.props.x,
            this.mesh.position.y = this.props.y,
            this.mesh.position.z = this.props.z;
    }
    addUranus() {
        this.createUranus();
        this.uranusPos();
        this.raycaster();
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(79, 154, 187)';
        activateRaycaster.registerBody({
            id: 'ic-uranus',
            mesh: this.mesh,
            defaultColor: this.props.color || this.props.emissive,
            hoverColor: hoverColor || this.props.emissive,
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
        if (camera.isFollowingObject(this.mesh))
            return;
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
    texture: '../../assets/textures/uranus/2k_uranus.jpg',
    emissive: 'rgb(100, 192, 231)',
    emissiveIntensity: 0.1,
    orbitRadius: 355,
    orbitSpeed: 0.0003
};
