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
        this.raycaster();
    }
    createNeptune() {
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
    neptunePos() {
        this.mesh.position.x = this.props.x,
            this.mesh.position.y = this.props.y,
            this.mesh.position.z = this.props.z;
    }
    addNeptune() {
        this.createNeptune();
        this.neptunePos();
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(70, 92, 159)';
        activateRaycaster.registerBody({
            id: 'rc-neptune',
            mesh: this.mesh,
            defaultColor: this.props.color,
            hoverColor: hoverColor,
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
    texture: '',
    emissive: 0,
    emissiveIntensity: 0,
    orbitRadius: 305,
    orbitSpeed: 0.0001
};
