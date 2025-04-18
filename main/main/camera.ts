import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { activateRaycaster } from './raycaster.js';

class Camera {
    public camera!: THREE.PerspectiveCamera;
    public controls!: OrbitControls;

    public hudGroup: THREE.Group = new THREE.Group();

    private targetPosition: THREE.Vector3 = new THREE.Vector3();
    private isMoving: boolean = false;
    private moveSpeed: number = 0.5;
    private targetDistance: number = 3;
    private isLocked: boolean = false;

    //Min and Max distance
    private minDistance: number = 0;
    private maxDistance: number = 100;

    //Skybox Collision
    private skyboxRadius: number = 500;
    private preventCollision: boolean = true;

    private checkSkyboxCollision(): void {
        if(!this.preventCollision) return;

        const cameraDistance = this.camera.position.length();
        const maxDistance = this.skyboxRadius * 0.95;

        if(cameraDistance > maxDistance) {
            const direction = this.camera.position.clone().normalize();
            this.camera.position.copy(direction.multiplyScalar(maxDistance));
        }
    }

    public setupCamera(w: number, h: number): void {
        //Camera Configs
        this.camera = new THREE.PerspectiveCamera(80, w / h, 0.1, 1000);
        this.camera.position.z = 100;

        //Hud Group
        this.hudGroup.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        this.camera.add(this.hudGroup);
    }
    
    public setupControls(renderer: THREE.WebGLRenderer): void {
        if(renderer) this.controls = new OrbitControls(this.camera, renderer.domElement);
    
        this.controls.minDistance = this.minDistance;
        this.controls.maxDistance = this.maxDistance;

        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
        }

        //Pan Speed
            const domElement = renderer.domElement;
            const originalMouseMove = domElement.onmousemove;

            let isPanning = false;
            let lastPos = new THREE.Vector2();

            domElement.addEventListener('mousedown', (e) => {
                if(e.button === 0) {
                    isPanning = true;
                    lastPos.set(e.clientX, e.clientY);
                }
            });

            domElement.addEventListener('mousemove', (e) => {
                if(!isPanning || !this.controls.enabled) return;

                const panSpeed = 0.008;
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

            if(originalMouseMove) {
                domElement.onmousemove = originalMouseMove;
            }
        //

        //Dolly
        const controlsDolly = this.controls as any;
        const dollySpeed = 3;

        controlsDolly.dollyOut = (dollyScale: number) => {
            if(!this.controls.enabled) return;

            const direction = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();

            const zoomMov = dollyScale * dollySpeed;
            this.camera.position.addScaledVector(direction, zoomMov);
        }
        
        controlsDolly.dollyIn = (dollyScale: number) => {
            if(!this.controls.enabled) return;

            const direction = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();

            const zoomMov = dollyScale * dollySpeed;
            this.camera.position.addScaledVector(direction, -zoomMov);
        }

        //Follow Planet (Camera)
            this.controls.addEventListener('change', () => {
                this.checkSkyboxCollision();

                if(this.isFollowing && this.followingObject) {
                    this.currentFollowDistance = this.camera.position.distanceTo(this.followingObject.position);

                    const clampledDistance = THREE.MathUtils.clamp(
                        this.currentFollowDistance,
                        this.minLockedDistance,
                        this.maxLockedDistance
                    );

                    if(this.currentFollowDistance !== clampledDistance) {
                        const direction = new THREE.Vector3().subVectors(this.camera.position, this.followingObject.position).normalize();

                        this.camera.position.copy(this.followingObject.position).add(direction.multiplyScalar(clampledDistance));

                        this.currentFollowDistance = clampledDistance;
                    }
                }
            });
        //
    }

    private savedState: {
        position: THREE.Vector3,
        target: THREE.Vector3,
    } | null = null;

    public getIsLocked(): boolean {
        return this.isLocked;
    }

    public moveTo(target: THREE.Vector3, planetRadius: number = 1): void {
        if(this.isLocked) return;

        this.savedState = {
            position: this.camera.position.clone(),
            target: this.controls.target.clone()
        }

        this.targetPosition.copy(target);
        this.isMoving = true;
        this.isLocked = true;

        const actualMinDistance = this.minLockedDistance * planetRadius;
        const actualMaxDistance = this.maxLockedDistance * planetRadius;

        this.targetDistance = THREE.MathUtils.clamp(
            this.camera.position.distanceTo(target),
            actualMinDistance,
            actualMaxDistance,
        );

        if(this.controls) {
            this.controls.enabled = true;
            this.controls.minDistance = actualMinDistance;
            this.controls.maxDistance = actualMaxDistance;
        }
    }

    //Following Planet...
        private planetRadius: number = 1;
        private minLockedDistance: number = 1;
        private maxLockedDistance: number = 1;

        private followingObject: THREE.Object3D | null = null;
        private isFollowing: boolean = false;

        private currentOrbitSpeed: number = 0;
        private baseFollowSpeed: number = 0.1;

        private currentFollowDistance: number = 10;

        public isFollowingObject(object: THREE.Object3D): boolean {
            return this.isFollowing && this.followingObject === object;
        }

        public followObject(object: THREE.Object3D, planetRadius: number = 1, orbitSpeed: number = 0.005): void {
            this.followingObject = object;
            this.planetRadius = planetRadius;
            this.isFollowing = true;
            this.isLocked = true;
            this.isMoving = false;
            this.currentOrbitSpeed = orbitSpeed;
            this.baseFollowSpeed = orbitSpeed;

            this.savedState = {
                position: this.camera.position.clone(),
                target: this.controls.target.clone(),
            }

            this.minLockedDistance = planetRadius * 1.8;
            this.maxLockedDistance = planetRadius * 2.5;
            this.currentFollowDistance = this.camera.position.distanceTo(object.position);
            this.currentFollowDistance = THREE.MathUtils.clamp(
                this.currentFollowDistance,
                this.minLockedDistance,
                this.maxLockedDistance
            );

            const direction = new THREE.Vector3().subVectors(this.camera.position, object.position).normalize();
            const newPos = object.position.clone().add(direction.multiplyScalar(this.currentFollowDistance));
            this.camera.position.copy(newPos);
            this.controls.target.copy(object.position);

            if(this.controls) {
                this.controls.enableZoom = true;
                this.controls.minDistance = this.minLockedDistance;
                this.controls.maxDistance = this.maxLockedDistance;
            }
        }

        public stopFollowing(): void {
            if(this.isFollowing && this.savedState) {
                this.followingObject = null;
                this.isFollowing = false;
                this.isLocked = false;
                this.isMoving = true;

                this.targetPosition.copy(this.savedState.target);
                this.targetDistance = this.savedState.position.distanceTo(this.savedState.target);
        
                activateRaycaster.clearLastClicked();

                if(this.controls) {
                    this.controls.enablePan = false;
                    this.controls.enableRotate = true;
                    this.controls.minDistance = this.minDistance;
                    this.controls.maxDistance = this.maxDistance;
                }
            }
        }
    //

    public returnPos(): void {
        if(this.savedState) {
            this.isMoving = true;
            this.isLocked = true;
            this.isFollowing = false;

            this.targetPosition.copy(this.savedState.target);
            this.targetDistance = this.savedState.position.distanceTo(this.savedState.target);
            this.controls.target.copy(this.savedState.target);

            if(this.controls) {
                this.controls.minDistance = this.minDistance;
                this.controls.maxDistance = this.maxDistance;
            }
        }
    }

    public unlockCamera(): void {
        if(!this.isFollowing) {
            this.isLocked = false;
    
            if(this.controls) {
                this.controls.minDistance = this.minDistance;
                this.controls.maxDistance = this.maxDistance;
            }
        }
    }

    public update(): void {
        if(this.isFollowing && this.followingObject) {
            this.controls.target.copy(this.followingObject.position);
            const direction = new THREE.Vector3().subVectors(this.camera.position, this.followingObject.position).normalize();
            this.camera.position.copy(this.followingObject.position).add(direction.multiplyScalar(this.currentFollowDistance));
        }

        this.checkSkyboxCollision();
        if(this.controls) this.controls.update();
        
        if(this.isMoving) {
            let targetPos!: THREE.Vector3;
            let targetLookAt!: THREE.Vector3;

            if(this.isLocked) {
                targetPos = new THREE.Vector3().copy(this.targetPosition);
                targetPos.z += this.targetDistance;
                targetLookAt = this.targetPosition;
            } else if(this.savedState) {
                targetPos = this.savedState.position;
                targetLookAt = this.savedState.target;
            }

            if(targetPos && targetLookAt) {
                this.camera.position.lerp(targetPos, this.moveSpeed);
                this.controls.target.lerp(targetLookAt, this.moveSpeed);

                if(this.camera.position.distanceTo(targetPos) < 0.1) {
                    this.camera.position.copy(targetPos);
                    this.controls.target.copy(targetLookAt);
                    this.isMoving = false;
                    this.controls.enabled = true;
                }
            }

            this.checkSkyboxCollision();
        }

        if(this.controls) this.controls.update();
    }
}

export const camera = new Camera();