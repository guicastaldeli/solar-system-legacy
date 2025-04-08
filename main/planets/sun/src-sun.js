import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { camera } from '../../main/camera.js';
export class Sun {
    constructor(options = {}) {
        this.props = Sun.DEFAULT_PROPS;
        this.isHovered = false;
        const props = Object.assign(Object.assign({}, Sun.DEFAULT_PROPS), options);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.addSun();
        this.setupEvents();
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
    mouseHover(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        if (!this.raycaster)
            return;
        this.raycaster.setFromCamera(this.mouse, camera.camera);
        const intersects = this.raycaster.intersectObject(this.mesh, true);
        const validIntersects = intersects.filter(i => i.object === this.mesh);
        const meshMaterial = this.mesh.material;
        meshMaterial.transparent = true;
        if (validIntersects.length > 0) {
            if (!this.isHovered) {
                this.isHovered = true;
                meshMaterial.color.setStyle('rgb(228, 208, 129)');
                meshMaterial.opacity = 1;
            }
        }
        else {
            if (this.isHovered) {
                this.isHovered = false;
                meshMaterial.color.setStyle(this.props.color);
                meshMaterial.opacity = 1;
            }
        }
    }
    mouseClick(e) {
        if (this.isHovered) {
            const loader = new FontLoader();
            const path = '../../../assets/fonts/Home Video_Regular.json';
            const content = 'SUN';
            const pos = {
                x: -1.25,
                y: 2,
                z: -5
            };
            loader.load(path, (font) => {
                const geometry = new TextGeometry(content, {
                    font: font,
                    size: 1,
                    depth: 0.5,
                    curveSegments: 4,
                    bevelEnabled: false
                });
                const textMesh = new THREE.Mesh(geometry, [
                    new THREE.MeshBasicMaterial({ color: 'rgb(255, 255, 255)' }),
                    new THREE.MeshBasicMaterial({ color: 'rgb(43, 43, 43)' })
                ]);
                textMesh.position.x = pos.x;
                textMesh.position.y = pos.y;
                textMesh.position.z = pos.z;
                textMesh.rotation.x += 0.3;
                camera.hudGroup.add(textMesh);
                camera.camera.updateMatrixWorld(true);
            });
        }
    }
    setupEvents() {
        window.addEventListener('mousemove', (e) => this.mouseHover(e));
        window.addEventListener('click', (e) => this.mouseClick(e));
    }
}
Sun.DEFAULT_PROPS = {
    //Size
    r: 1,
    d: 16,
    //Pos
    x: 0,
    y: 0,
    z: 0,
    color: 'rgb(219, 180, 24)',
    texture: '',
    emissive: 0,
    emissiveIntensity: 0,
};
