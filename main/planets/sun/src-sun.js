import * as THREE from 'three';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';
export class Sun {
    constructor(scene, options = {}) {
        this.props = Sun.DEFAULT_PROPS;
        const props = Object.assign(Object.assign({}, Sun.DEFAULT_PROPS), options);
        this.scene = scene;
        this.addSun();
        this.raycaster();
    }
    createSun() {
        const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
        //Loader
        const loader = new THREE.TextureLoader();
        const material = new THREE.MeshStandardMaterial({
            map: loader.load(this.props.texture),
            emissive: this.props.emissive,
            emissiveIntensity: this.props.emissiveIntensity
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.receiveShadow = true;
        //Lightning
        const pointLight = new THREE.PointLight();
        pointLight.color = new THREE.Color('rgb(255, 255, 255)');
        pointLight.intensity = 6;
        pointLight.distance = 0;
        pointLight.decay = 0;
        pointLight.position.set(this.props.x, this.props.y, this.props.z);
        this.scene.add(pointLight);
        //
        //Animation
        const _animate = () => {
            requestAnimationFrame(_animate);
            this.mesh.rotation.y += 0.01;
        };
        _animate();
        //
    }
    sunPos() {
        this.mesh.position.x = this.props.x,
            this.mesh.position.y = this.props.y,
            this.mesh.position.z = this.props.z;
    }
    addSun() {
        this.createSun();
        this.sunPos();
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(199, 128, 128)';
        activateRaycaster.registerBody({
            id: 'rc-sun',
            mesh: this.mesh,
            defaultColor: this.props.color || this.props.emissive,
            hoverColor: hoverColor || this.props.emissive,
            onClick: (e) => this.mouseClick(e)
        });
    }
    mouseClick(e) {
        const event = new CustomEvent('bodyClicked', {
            detail: {
                id: 'clk-sun',
                name: 'SUN',
                ts: 1,
                position: this.mesh.position.clone(),
                color: this.props.color,
                mesh: this.mesh,
            }
        });
        window.dispatchEvent(event);
        camera.followObject(this.mesh, this.props.r);
    }
}
Sun.DEFAULT_PROPS = {
    //Size
    r: 30,
    d: 16,
    //Pos
    x: 0,
    y: 0,
    z: -15,
    color: '',
    texture: '../../assets/textures/sun/2k_sun.jpg',
    emissive: 'rgb(255, 208, 127)',
    emissiveIntensity: 0.1,
};
