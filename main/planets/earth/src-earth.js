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
        this.resolveReady = () => { };
        //Add Earth
        this._readyPromise = new Promise((res) => {
            this.resolveReady = res;
        });
        this.addEarth().then(() => this.resolveReady());
        //
    }
    createEarth() {
        return __awaiter(this, void 0, void 0, function* () {
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
            //Glow
            const fresnelMat = yield getFresnelMat();
            const glowMesh = new THREE.Mesh(geometry, fresnelMat);
            glowMesh.scale.setScalar(1.015);
            this.mesh.add(glowMesh);
            //Clouds
            const cloudsMat = new THREE.MeshStandardMaterial({
                map: loader.load(this.props.cloudsTexture),
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
            this.raycaster();
        });
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(85, 101, 135)';
        activateRaycaster.registerBody({
            id: 'ic-earth',
            mesh: this.mesh,
            defaultColor: this.props.color || this.props.emissive,
            hoverColor: hoverColor || this.props.emissive,
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
        if (camera.isFollowingObject(this.mesh)) {
            return;
        }
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
    texture: '../../assets/textures/earth/00_earthmap1k.jpg',
    cloudsTexture: '../../assets/textures/earth/cloud_combined_2048.jpg',
    emissive: 'rgb(102, 117, 147)',
    emissiveIntensity: 0.1,
    orbitRadius: 115,
    orbitSpeed: 0.005
};
