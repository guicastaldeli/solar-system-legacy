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
    }
    createMars() {
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
        //Clouds
        const cloudsGeometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
        const cloudsMat = new THREE.MeshStandardMaterial({
            alphaMap: loader.load(this.props.cloudsTexture),
            transparent: true,
            opacity: 1,
            emissive: this.props.emissive,
            emissiveIntensity: this.props.emissiveIntensity
        });
        const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMat);
        cloudsMesh.scale.setScalar(1.015);
        this.mesh.add(cloudsMesh);
        //Animation
        const _animate = () => {
            requestAnimationFrame(_animate);
            this.mesh.rotation.y += 0.01;
            cloudsMesh.rotation.y += 0.015;
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
        this.raycaster();
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(179, 91, 40)';
        activateRaycaster.registerBody({
            id: 'ic-mars',
            mesh: this.mesh,
            defaultColor: this.props.color || this.props.emissive,
            hoverColor: hoverColor || this.props.emissiveIntensity,
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
        if (camera.isFollowingObject(this.mesh))
            return;
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
    texture: '../../assets/textures/mars/2k_mars.jpg',
    cloudsTexture: '../../assets/textures/mars/mars_cloud_texture_by_hmsmaidnelson_ddneq0x-pre.png',
    emissive: 'rgb(231, 117, 51)',
    emissiveIntensity: 0.1,
    orbitRadius: 145,
    orbitSpeed: 0.003
};
