import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
class Camera {
    constructor() {
        this.targetPosition = new THREE.Vector3();
        this.isMoving = false;
        this.moveSpeed = 0.5;
        this.targetDistance = 3;
        this.isLocked = false;
        this.hudGroup = new THREE.Group();
        this.minDistance = 1;
        this.maxDistance = 100;
        this.originalPos = new THREE.Vector3();
        this.originalTarget = new THREE.Vector3(0, 0, 0);
        this.savedState = null;
        this.minLockedDistance = 20;
        this.maxLockedDistance = 25;
    }
    setupCamera(w, h) {
        this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
        this.camera.position.z = 25;
        this.camera.add(this.hudGroup);
    }
    setupControls(renderer) {
        if (renderer)
            this.controls = new OrbitControls(this.camera, renderer.domElement);
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
        };
        this.controls.minDistance = this.minDistance;
        this.controls.maxDistance = this.maxDistance;
        this.controls.addEventListener('change', () => {
            if (this.isLocked) {
                const currentDistance = this.camera.position.distanceTo(this.controls.target);
                if (currentDistance < this.minLockedDistance) {
                    const direction = new THREE.Vector3()
                        .subVectors(this.camera.position, this.controls.target)
                        .normalize();
                    this.camera.position.copy(this.controls.target)
                        .add(direction.multiplyScalar(this.minLockedDistance));
                }
                else if (currentDistance > this.maxLockedDistance) {
                    const direction = new THREE.Vector3()
                        .subVectors(this.camera.position, this.controls.target)
                        .normalize();
                    this.camera.position.copy(this.controls.target)
                        .add(direction.multiplyScalar(this.maxLockedDistance));
                }
            }
        });
    }
    moveTo(target) {
        this.savedState = {
            position: this.camera.position.clone(),
            target: this.controls.target.clone()
        };
        let distance = 25;
        this.targetPosition.copy(target);
        this.isMoving = true;
        this.isLocked = true;
        this.targetDistance = THREE.MathUtils.clamp(distance, this.minLockedDistance, this.maxLockedDistance);
        if (this.controls) {
            this.controls.enabled = true;
            this.controls.minDistance = this.minLockedDistance;
            this.controls.maxDistance = this.maxLockedDistance;
        }
    }
    unlockCamera() {
        this.isLocked = false;
        if (this.controls) {
            this.controls.minDistance = this.targetDistance;
            this.controls.maxDistance = this.maxDistance;
        }
    }
    returnPos() {
        if (this.savedState) {
            this.isMoving = true;
            this.isLocked = false;
            this.targetPosition.copy(this.savedState.target);
            this.targetDistance = this.camera.position.distanceTo(this.savedState.target);
            if (this.controls) {
                this.controls.minDistance = this.minDistance;
                this.controls.maxDistance = this.maxDistance;
            }
        }
    }
    update() {
        if (this.isMoving) {
            let targetPos;
            let targetLookAt;
            if (this.isLocked) {
                targetPos = new THREE.Vector3().copy(this.targetPosition);
                targetPos.z += this.targetDistance;
                targetLookAt = this.targetPosition;
            }
            else if (this.savedState) {
                targetPos = this.savedState.position;
                targetLookAt = this.savedState.target;
            }
            if (targetPos && targetLookAt) {
                this.camera.position.lerp(targetPos, this.moveSpeed);
                this.controls.target.lerp(targetLookAt, this.moveSpeed);
                if (this.camera.position.distanceTo(targetPos) < 0.1) {
                    this.camera.position.copy(targetPos);
                    this.controls.target.copy(targetLookAt);
                    this.isMoving = false;
                    this.controls.enabled = true;
                }
            }
        }
        if (this.controls) {
            this.controls.update();
        }
    }
}
export const camera = new Camera();
