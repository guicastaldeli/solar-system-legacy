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
    }
    createVenus() {
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
        //Atmosphere
        const aGeometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
        const aMat = new THREE.MeshStandardMaterial({
            map: loader.load(this.props.atmosphereTexture),
            transparent: true,
            opacity: 0.4,
        });
        const aMesh = new THREE.Mesh(aGeometry, aMat);
        aMesh.scale.setScalar(1.015);
        this.mesh.add(aMesh);
        //Animation
        const _animate = () => {
            requestAnimationFrame(_animate);
            this.mesh.rotation.y += 0.002;
            aMesh.rotation.y += 0.05;
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
        this.raycaster();
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(152, 144, 135)';
        activateRaycaster.registerBody({
            id: 'rc-venus',
            mesh: this.mesh,
            defaultColor: this.props.color || this.props.emissive,
            hoverColor: hoverColor || this.props.emissive,
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
        if (camera.isFollowingObject(this.mesh)) {
            return;
        }
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
    texture: '../../assets/textures/venus/2k_venus_surface.jpg',
    atmosphereTexture: '../../assets/textures/venus/2k_venus_atmosphere.jpg',
    emissive: 'rgb(194, 184, 171)',
    emissiveIntensity: 0.1,
    orbitRadius: 85,
    orbitSpeed: 0.01
};
