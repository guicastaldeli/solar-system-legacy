import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { camera } from './camera.js';
export class Hud {
    constructor() {
        this.textMeshes = {};
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
            this.createOrUpdateText(id, name, position, color);
            camera.moveTo(mesh.position);
            this.showUnlockBtn();
        });
    }
    createOrUpdateText(id, content, position, color) {
        this.removeAllTexts();
        if (!this.font) {
            console.log('font error');
            return;
        }
        const pos = {
            x: -1.25,
            y: 2,
            z: -5,
            rx: 0.3
        };
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
        textMesh.position.copy(position);
        textMesh.position.x = pos.x;
        textMesh.position.y = pos.y;
        textMesh.position.z = pos.z;
        textMesh.rotation.x = pos.rx;
        this.textMeshes[id] = textMesh;
        camera.hudGroup.add(textMesh);
        camera.camera.updateMatrixWorld(true);
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
            camera.unlockCamera();
            camera.returnPos();
            this.hideUnlockBtn();
            this.removeAllTexts();
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
        while (camera.hudGroup.children.length > 0) {
            camera.hudGroup.remove(camera.hudGroup.children[0]);
        }
    }
    //
    removeText(id) {
        if (this.textMeshes[id]) {
            camera.hudGroup.remove(this.textMeshes[id]);
            delete this.textMeshes[id];
        }
    }
}
export const hud = new Hud();
