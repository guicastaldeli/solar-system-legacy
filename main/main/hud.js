import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { camera } from './camera.js';
export class Hud {
    constructor(scene) {
        this.scene = scene;
        this.textMeshes = {};
        this.lastPlanetId = null;
        this.scene = scene;
        this.fontLoader = new FontLoader();
        this.loadFont();
        this.setupEvents();
        this.exitText();
    }
    loadFont() {
        const path = '../../../assets/fonts/Home Video_Regular.json';
        this.fontLoader.load(path, (loadedFont) => {
            this.font = loadedFont;
        });
    }
    setupEvents() {
        window.addEventListener('bodyClicked', (e) => {
            const event = e;
            const { id, name, position, color, mesh } = event.detail;
            this.createOrUpdateText(id, name, position, color, mesh);
            camera.moveTo(mesh.position);
            this.showUnlockBtn();
        });
    }
    createOrUpdateText(id, content, position, color, mesh) {
        if (this.lastPlanetId === id)
            return;
        this.lastPlanetId = id;
        this.removeAllTexts();
        if (!this.font) {
            console.log('font error');
            return;
        }
        const geometry = new TextGeometry(content, {
            font: this.font,
            size: 1,
            depth: 0.2,
            curveSegments: 4,
            bevelEnabled: false,
        });
        const textMesh = new THREE.Mesh(geometry, [
            new THREE.MeshBasicMaterial({ color: 'rgb(255, 255, 255)' }),
            new THREE.MeshBasicMaterial({ color: 'rgb(43, 43, 43)' }),
        ]);
        const pos = {
            x: 0,
            y: 2,
            z: -5
        };
        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox;
        if (boundingBox) {
            const centerOffset = -0.5 * (boundingBox.max.x - boundingBox.min.x);
            geometry.translate(centerOffset, 0, 0);
        }
        mesh.geometry.computeBoundingSphere();
        const boundingSphere = mesh.geometry.boundingSphere;
        const planetSize = boundingSphere ? boundingSphere.radius : 1;
        textMesh.position.x = pos.x - 0.15;
        textMesh.position.y = planetSize / 4;
        textMesh.position.z = pos.z;
        this.textMeshes[id] = textMesh;
        camera.camera.add(textMesh);
    }
    //Back Btn
    exitText() {
        const exBtn = document.getElementById('unlock-camera');
        if (exBtn)
            exBtn.remove();
        this.unlockButton = document.createElement('button');
        this.unlockButton.id = 'unlock-camera';
        this.unlockButton.textContent = 'Back';
        this.unlockButton.style.display = 'none';
        this.unlockButton.addEventListener('click', () => {
            this.lastPlanetId = null;
            this.hideUnlockBtn();
            this.removeAllTexts();
            camera.unlockCamera();
            camera.returnPos();
            camera.stopFollowing();
        });
        document.body.appendChild(this.unlockButton);
    }
    showUnlockBtn() {
        if (this.unlockButton) {
            this.unlockButton.style.display = 'block';
        }
    }
    hideUnlockBtn() {
        if (this.unlockButton) {
            this.unlockButton.style.display = 'none';
        }
    }
    removeAllTexts() {
        for (const id in this.textMeshes) {
            if (this.textMeshes[id].parent === camera.camera) {
                camera.camera.remove(this.textMeshes[id]);
            }
        }
        this.textMeshes = {};
    }
    //
    removeText(id) {
        if (this.textMeshes[id] && this.textMeshes[id].parent === camera.camera) {
            camera.hudGroup.remove(this.textMeshes[id]);
            delete this.textMeshes[id];
        }
    }
}
