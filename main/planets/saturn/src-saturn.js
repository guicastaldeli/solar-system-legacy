import * as THREE from 'three';
import { Orbit } from '../../main/orbit.js';
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';
export class Saturn extends Orbit {
    constructor(options = {}) {
        const props = Object.assign(Object.assign({}, Saturn.DEFAULT_PROPS), options);
        super(props.orbitRadius, props.orbitSpeed);
        this.props = Saturn.DEFAULT_PROPS;
        this.addSaturn();
    }
    createSaturn() {
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
    saturnPos() {
        this.mesh.position.x = this.props.x,
            this.mesh.position.y = this.props.y,
            this.mesh.position.z = this.props.z;
    }
    //Rings
    createRings() {
        //Loader
        const loader = new THREE.TextureLoader();
        //
        const innerRadius = this.props.r + 3.5;
        const outerRadius = this.props.r + 15;
        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 256);
        const pos = geometry.attributes.position;
        const uvs = [];
        const center = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < pos.count; i++) {
            const vertex = new THREE.Vector3().fromBufferAttribute(pos, i);
            const radius = vertex.distanceTo(center);
            const u = (radius - innerRadius) / (outerRadius - innerRadius);
            uvs.push(u, 0.5);
        }
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        const texture = loader.load(this.props.ringsTexture);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
            emissive: this.props.emissive,
            emissiveIntensity: this.props.emissiveIntensity
        });
        this.ringsMesh = new THREE.Mesh(geometry, material);
        this.ringsMesh.castShadow = true;
        this.ringsMesh.receiveShadow = true;
        this.ringsMesh.rotation.set(-Math.PI / 2.1, 0, 0);
        //Animation
        const _animate = () => {
            requestAnimationFrame(_animate);
            this.ringsMesh.rotation.y = 0.001;
        };
        _animate();
        //
        this.mesh.add(this.ringsMesh);
    }
    //
    addSaturn() {
        this.createSaturn();
        this.saturnPos();
        this.createRings();
        this.raycaster();
    }
    //Raycaster
    raycaster() {
        const hoverColor = 'rgb(135, 115, 83))';
        activateRaycaster.registerBody({
            id: 'ic-saturn',
            mesh: this.mesh,
            defaultColor: this.props.color || this.props.emissive,
            hoverColor: hoverColor || this.props.emissiveIntensity,
            onClick: (e) => this.mouseClick(e)
        });
        activateRaycaster.registerBody({
            id: 'ic-saturn--rings',
            mesh: this.ringsMesh,
            defaultColor: this.props.emissive,
            hoverColor: this.props.emissive,
        });
    }
    mouseClick(e) {
        const event = new CustomEvent('bodyClicked', {
            detail: {
                id: 'clk-saturn',
                name: 'SATURN',
                ts: 1.15,
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
Saturn.DEFAULT_PROPS = {
    //Size
    r: 18,
    d: 16,
    //Pos
    x: 275,
    y: 0,
    z: -15,
    color: 'rgb(167, 143, 105)',
    texture: '../../assets/textures/saturn/2k_saturn.jpg',
    ringsTexture: '../../assets/textures/saturn/2k_saturn_ring_alpha.png',
    emissive: 'rgb(167, 143, 105)',
    emissiveIntensity: 0.1,
    orbitRadius: 245,
    orbitSpeed: 0.0005
};
