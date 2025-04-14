var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as THREE from 'three';
import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';
import { getFresnelMat } from './shaders/fresnelMat.js';
export class Earth extends Orbit {
    constructor(options = {}) {
        const props = Object.assign(Object.assign({}, Earth.DEFAULT_PROPS), options);
        super(props.orbitRadius, props.orbitSpeed);
        this.props = Earth.DEFAULT_PROPS;
        this.addEarth();
        this.raycaster();
    }
    createEarth() {
        return __awaiter(this, void 0, void 0, function* () {
            const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
            //Texture
            const loader = new THREE.TextureLoader();
            const material = new THREE.MeshStandardMaterial({ map: loader.load('../../assets/textures/earth/00_earthmap1k.jpg') });
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
            //Glow
            const fresnelMat = yield getFresnelMat();
            const glowMesh = new THREE.Mesh(geometry, fresnelMat);
            glowMesh.scale.setScalar(1.015);
            this.mesh.add(glowMesh);
            //Clouds
            const cloudsMat = new THREE.MeshStandardMaterial({
                map: loader.load('../../assets/textures/earth/cloud_combined_2048.jpg'),
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            });
            const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
            cloudsMesh.scale.setScalar(1.015);
            this.mesh.add(cloudsMesh);
            //Animation
            const _animate = () => {
                requestAnimationFrame(_animate);
                this.mesh.rotation.y += 0.002;
                cloudsMesh.rotation.y += 0.002;
                glowMesh.rotation.y += 0.002;
            };
            _animate();
            //
        });
    }
    earthPos() {
        this.mesh.position.x = this.props.x,
            this.mesh.position.y = this.props.y,
            this.mesh.position.z = this.props.z;
    }
    addEarth() {
        return __awaiter(this, void 0, void 0, function* () {
            this.createEarth();
            this.earthPos();
        });
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(85, 101, 135)';
        activateRaycaster.registerBody({
            id: 'ic-earth',
            mesh: this.mesh,
            defaultColor: this.props.color,
            hoverColor: hoverColor,
            onClick: (e) => this.mouseClick(e)
        });
    }
    mouseClick(e) {
        const event = new CustomEvent('bodyClicked', {
            detail: {
                id: 'clk-earth',
                name: 'EARTH',
                ts: 1.2,
                position: this.mesh.position.clone(),
                color: this.props.color,
                mesh: this.mesh
            }
        });
        window.dispatchEvent(event);
        camera.followObject(this.mesh, this.props.r);
    }
}
Earth.DEFAULT_PROPS = {
    //Size
    r: 8,
    d: 16,
    //Pos
    x: 115,
    y: 0,
    z: -15,
    color: 'rgb(115, 138, 184)',
    texture: '',
    emissive: 0,
    emissiveIntensity: 0,
    orbitRadius: 115,
    orbitSpeed: 0.005
};
