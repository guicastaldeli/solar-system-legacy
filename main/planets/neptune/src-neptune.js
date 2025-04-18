import * as THREE from 'three';
import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';
export class Neptune extends Orbit {
    constructor(options = {}) {
        const props = Object.assign(Object.assign({}, Neptune.DEFAULT_PROPS), options);
        super(props.orbitRadius, props.orbitSpeed);
        this.props = Neptune.DEFAULT_PROPS;
        this.addNeptune();
    }
    createNeptune() {
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
    neptunePos() {
        this.mesh.position.x = this.props.x,
            this.mesh.position.y = this.props.y,
            this.mesh.position.z = this.props.z;
    }
    addNeptune() {
        this.createNeptune();
        this.neptunePos();
        this.raycaster();
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(70, 92, 159)';
        activateRaycaster.registerBody({
            id: 'rc-neptune',
            mesh: this.mesh,
            defaultColor: this.props.color || this.props.emissive,
            hoverColor: hoverColor || this.props.emissive,
            onClick: (e) => this.mouseClick(e)
        });
    }
    mouseClick(e) {
        const event = new CustomEvent('bodyClicked', {
            detail: {
                id: 'clk-neptune',
                name: 'NEPTUNE',
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
Neptune.DEFAULT_PROPS = {
    //Size
    r: 12.5,
    d: 16,
    //Pos
    x: 400,
    y: 0,
    z: -15,
    color: 'rgb(98, 132, 230)',
    texture: '../../assets/textures/neptune/2k_neptune.jpg',
    emissive: 'rgb(98, 132, 230)',
    emissiveIntensity: 0.1,
    orbitRadius: 305,
    orbitSpeed: 0.0001
};
