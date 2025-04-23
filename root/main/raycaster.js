import * as THREE from 'three';
import { camera } from './camera.js';
export class ActivateRaycaster {
    constructor() {
        this.bodies = [];
        this.currentHoveredId = null;
        this.lastClickedId = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.setupEvents();
    }
    registerBody(body) {
        this.bodies.push(body);
    }
    mouseMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, camera.camera);
        let hoveredId = null;
        for (const body of this.bodies) {
            const intersects = this.raycaster.intersectObject(body.mesh);
            if (intersects.length > 0) {
                hoveredId = body.id;
                break;
            }
        }
        this.updateHoverStates(hoveredId);
    }
    mouseClick(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, camera.camera);
        for (const body of this.bodies) {
            const intersects = this.raycaster.intersectObject(body.mesh);
            if (intersects.length > 0) {
                if (body.id === this.lastClickedId) {
                    return;
                }
                if (body.onClick) {
                    body.onClick(e);
                }
                break;
            }
        }
    }
    clearLastClicked() {
        this.lastClickedId = null;
    }
    setupEvents() {
        window.addEventListener('mousemove', (e) => this.mouseMove(e));
        window.addEventListener('click', (e) => this.mouseClick(e));
    }
    updateHoverStates(newHoveredId) {
        if (newHoveredId === this.currentHoveredId)
            return;
        if (this.currentHoveredId) {
            const prevBody = this.bodies.find(b => b.id === this.currentHoveredId);
            if (prevBody) {
                const material = prevBody.mesh.material;
                material.emissiveIntensity = 0.1;
            }
            if (prevBody && prevBody.onHoverEnd) {
                prevBody.onHoverEnd();
            }
        }
        if (newHoveredId) {
            const newBody = this.bodies.find(b => b.id === newHoveredId);
            if (newBody) {
                const material = newBody.mesh.material;
                material.emissiveIntensity = 0.5;
            }
            if (newBody && newBody.onHoverStart) {
                newBody.onHoverStart();
            }
        }
        this.currentHoveredId = newHoveredId;
    }
    getCurrentHovered() {
        return this.currentHoveredId;
    }
}
export const activateRaycaster = new ActivateRaycaster();
