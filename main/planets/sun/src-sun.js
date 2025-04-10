import * as THREE from 'three';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';
export class Sun {
    constructor(options = {}) {
        this.props = Sun.DEFAULT_PROPS;
        const props = Object.assign(Object.assign({}, Sun.DEFAULT_PROPS), options);
        this.addSun();
        this.raycaster();
    }
    createSun() {
        const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
        const material = new THREE.MeshBasicMaterial({ color: this.props.color, opacity: 1, transparent: true });
        this.mesh = new THREE.Mesh(geometry, material);
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
        const hoverColor = 'rgb(240, 217, 154)';
        activateRaycaster.registerBody({
            id: 'rc-sun',
            mesh: this.mesh,
            defaultColor: this.props.color,
            hoverColor: hoverColor,
            onClick: (e) => this.mouseClick(e)
        });
    }
    mouseClick(e) {
        const event = new CustomEvent('bodyClicked', {
            detail: {
                id: 'clk-sun',
                name: 'SUN',
                position: this.mesh.position.clone(),
                color: this.props.color,
                mesh: this.mesh,
            }
        });
        window.dispatchEvent(event);
        camera.followObject(this.mesh);
    }
}
Sun.DEFAULT_PROPS = {
    //Size
    r: 8,
    d: 1,
    //Pos
    x: 0,
    y: 0,
    z: -15,
    color: 'rgb(219, 180, 24)',
    texture: '',
    emissive: 0,
    emissiveIntensity: 0,
};
