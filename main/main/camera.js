import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
class Camera {
    constructor() {
        this.hudGroup = new THREE.Group();
        this.targetPosition = new THREE.Vector3();
        this.isMoving = false;
        this.moveSpeed = 0.5;
        this.targetDistance = 3;
        this.isLocked = false;
        //Min and Max distance
        this.minDistance = 0;
        this.maxDistance = 100;
        this.savedState = null;
        //Following Planet...
        this.minLockedDistance = 10;
        this.maxLockedDistance = 20;
        this.followingObject = null;
        this.followSpeed = 0.1;
        this.isFollowing = false;
        this.currentFollowDistance = 10;
    }
    setupCamera(w, h) {
        //Camera Configs
        this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
        this.camera.position.z = 25;
        //Hud Group
        this.hudGroup.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        this.camera.add(this.hudGroup);
    }
    setupControls(renderer) {
        if (renderer)
            this.controls = new OrbitControls(this.camera, renderer.domElement);
        this.controls.minDistance = this.minDistance;
        this.controls.maxDistance = this.maxDistance;
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
        };
        //Pan Speed
        const domElement = renderer.domElement;
        const originalMouseMove = domElement.onmousemove;
        let isPanning = false;
        let lastPos = new THREE.Vector2();
        domElement.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                isPanning = true;
                lastPos.set(e.clientX, e.clientY);
            }
        });
        domElement.addEventListener('mousemove', (e) => {
            if (!isPanning || !this.controls.enabled)
                return;
            const panSpeed = 0.01;
            const deltaX = e.clientX - lastPos.x;
            const deltaY = e.clientY - lastPos.y;
            this.camera.position.x -= deltaX * panSpeed;
            this.camera.position.y += deltaY * panSpeed;
            this.controls.target.x -= deltaX * panSpeed;
            this.controls.target.y += deltaY * panSpeed;
            lastPos.set(e.clientX, e.clientY);
        });
        domElement.addEventListener('mouseup', () => {
            isPanning = false;
        });
        if (originalMouseMove) {
            domElement.onmousemove = originalMouseMove;
        }
        //
        //Dolly
        const controlsDolly = this.controls;
        const dollySpeed = 5;
        controlsDolly.dollyOut = (dollyScale) => {
            if (!this.controls.enabled)
                return;
            const direction = new THREE.Vector3()
                .subVectors(this.camera.position, this.controls.target)
                .normalize();
            const zoomMov = dollyScale * dollySpeed;
            this.camera.position.addScaledVector(direction, zoomMov);
        };
        controlsDolly.dollyIn = (dollyScale) => {
            if (!this.controls.enabled)
                return;
            const direction = new THREE.Vector3()
                .subVectors(this.camera.position, this.controls.target)
                .normalize();
            const zoomMov = dollyScale * dollySpeed;
            this.camera.position.addScaledVector(direction, -zoomMov);
        };
        //Follow Planet (Camera)
        this.controls.addEventListener('change', () => {
            if (this.isFollowing && this.followingObject) {
                this.currentFollowDistance = this.camera.position.distanceTo(this.followingObject.position);
                const clampledDistance = THREE.MathUtils.clamp(this.currentFollowDistance, this.minLockedDistance, this.maxLockedDistance);
                if (this.currentFollowDistance !== clampledDistance) {
                    const direction = new THREE.Vector3()
                        .subVectors(this.camera.position, this.followingObject.position)
                        .normalize();
                    this.camera.position.copy(this.followingObject.position)
                        .add(direction.multiplyScalar(clampledDistance));
                    this.currentFollowDistance = clampledDistance;
                }
            }
        });
        //
    }
    getIsLocked() {
        return this.isLocked;
    }
    moveTo(target) {
        if (this.isLocked)
            return;
        this.savedState = {
            position: this.camera.position.clone(),
            target: this.controls.target.clone()
        };
        this.targetPosition.copy(target);
        this.isMoving = true;
        this.isLocked = true;
        this.targetDistance = THREE.MathUtils.clamp(this.camera.position.distanceTo(target), this.minLockedDistance, this.maxLockedDistance);
        if (this.controls) {
            this.controls.enabled = true;
            this.controls.minDistance = this.minLockedDistance;
            this.controls.maxDistance = this.maxLockedDistance;
        }
    }
    followObject(object) {
        this.followingObject = object;
        this.isFollowing = true;
        this.isLocked = true;
        this.isMoving = false;
        this.currentFollowDistance = this.camera.position.distanceTo(object.position);
        this.currentFollowDistance = THREE.MathUtils.clamp(this.currentFollowDistance, this.minLockedDistance, this.maxLockedDistance);
        const direction = new THREE.Vector3()
            .subVectors(this.camera.position, object.position)
            .normalize();
        this.camera.position.copy(object.position).add(direction.multiplyScalar(this.currentFollowDistance));
        this.controls.target.copy(object.position);
        this.savedState = {
            position: this.camera.position.clone(),
            target: this.controls.target.clone(),
        };
        if (this.controls) {
            this.controls.enableZoom = true;
            this.controls.minDistance = this.minLockedDistance;
            this.controls.maxDistance = this.maxLockedDistance;
        }
    }
    stopFollowing() {
        if (this.isFollowing && this.savedState) {
            this.followingObject = null;
            this.isFollowing = false;
            this.isLocked = false;
            this.isMoving = true;
            this.targetPosition.copy(this.savedState.target);
            if (this.controls) {
                this.controls.enablePan = true;
                this.controls.minDistance = this.minDistance;
                this.controls.maxDistance = this.maxDistance;
            }
        }
    }
    //
    unlockCamera() {
        if (!this.isFollowing) {
            this.isLocked = false;
            if (this.controls) {
                this.controls.minDistance = this.minDistance;
                this.controls.maxDistance = this.maxDistance;
            }
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
        if (this.isFollowing && this.followingObject) {
            this.controls.target.copy(this.followingObject.position);
            const direction = new THREE.Vector3()
                .subVectors(this.camera.position, this.followingObject.position)
                .normalize();
            this.camera.position.copy(this.followingObject.position).add(direction.multiplyScalar(this.currentFollowDistance));
        }
        if (this.controls) {
            this.controls.update();
        }
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
