import * as THREE from 'three';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';
import { Earth } from '../earth/src-earth.js';
export class Moon {
    constructor(planets, options = {}) {
        this.planets = planets;
        this.props = Moon.DEFAULT_PROPS;
        this.angle = 0;
        const props = Object.assign(Object.assign({}, Moon.DEFAULT_PROPS), options);
        this.props = props;
        this.earth = this.findEarth();
        this.angle = Math.random() * Math.PI * 2;
        this.addMoon();
        this.initialPos();
    }
    //Find Earth
    findEarth() {
        const earth = this.planets.find(p => p instanceof Earth);
        if (!earth)
            throw new Error('Earth not found');
        return earth;
    }
    createMoon() {
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
            this.mesh.rotation.y += 0.002;
            this.updateOrbit();
        };
        _animate();
        //
    }
    initialPos() {
        var _a;
        if (!((_a = this.earth) === null || _a === void 0 ? void 0 : _a.mesh)) {
            this.mesh.position.x = this.props.x;
            this.mesh.position.y = this.props.y;
            this.mesh.position.z = this.props.z;
        }
    }
    updateOrbit() {
        var _a;
        if (!((_a = this.earth) === null || _a === void 0 ? void 0 : _a.mesh))
            return;
        this.angle += this.props.orbitSpeed;
        const orbitX = Math.cos(this.angle) * this.props.orbitRadius;
        const orbitZ = Math.sin(this.angle) * this.props.orbitRadius;
        this.mesh.position.x = this.earth.mesh.position.x + orbitX;
        this.mesh.position.y = this.earth.mesh.position.y + 5;
        this.mesh.position.z = this.earth.mesh.position.z + orbitZ;
    }
    addMoon() {
        this.createMoon();
        this.raycaster();
    }
    raycaster() {
        const hoverColor = 'rgb(161, 161, 161)';
        activateRaycaster.registerBody({
            id: 'ic-moon',
            mesh: this.mesh,
            defaultColor: this.props.color || this.props.emissive,
            hoverColor: hoverColor || this.props.emissive,
            onClick: (e) => this.mouseClick(e)
        });
    }
    mouseClick(e) {
        const event = new CustomEvent('bodyClicked', {
            detail: {
                id: 'clk-moon',
                name: 'MOON',
                ts: 1,
                position: this.mesh.position.clone(),
                color: this.props.color,
                mesh: this.mesh,
            }
        });
        window.dispatchEvent(event);
        if (camera.isFollowingObject(this.mesh))
            return;
        camera.followObject(this.mesh, this.props.r);
    }
}
Moon.DEFAULT_PROPS = {
    //Size
    r: 2,
    d: 16,
    //Pos
    x: 115,
    y: 20,
    z: -15,
    color: 'rgb(161, 161, 161)',
    texture: '../../assets/textures/moon/2k_moon.jpg',
    emissive: 'rgb(161, 161, 161)',
    emissiveIntensity: 0.1,
    orbitRadius: 15,
    orbitSpeed: 0.01
};
