import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

    public setupCamera(w: number, h: number): void {
        this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
        this.camera.position.z = 25;
        this.hudGroup.position.set(0, 0, -10);

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

            if(originalMouseMove) {
                domElement.onmousemove = originalMouseMove;
            }
        //

        //Dolly *ARRUMAR
        const controlsDolly = this.controls as any;
        const dollySpeed = 5;

        controlsDolly.dollyOut = (dollyScale: number) => {
            if(!this.controls.enabled) return;

            const direction = new THREE.Vector3()
                .subVectors(this.camera.position, this.controls.target)
                .normalize()
            ;

            const zoomMov = dollyScale * dollySpeed;
            this.camera.position.addScaledVector(direction, zoomMov);
        }
        
        controlsDolly.dollyIn = (dollyScale: number) => {
            if(!this.controls.enabled) return;

            const direction = new THREE.Vector3()
                .subVectors(this.camera.position, this.controls.target)
                .normalize()
            ;

            const zoomMov = dollyScale * dollySpeed;
            this.camera.position.addScaledVector(direction, -zoomMov);
        }

        //Follow Planet (Camera)
            this.controls.addEventListener('change', () => {
                if(this.isFollowing) {
                    const currentDistance = this.camera.position.distanceTo(this.controls.target);

                    if(currentDistance < this.minLockedDistance) {
                        const direction = new THREE.Vector3()
                            .subVectors(this.camera.position, this.controls.target)
                            .normalize();
                        this.camera.position.copy(this.controls.target)
                            .add(direction.multiplyScalar(this.minLockedDistance)
                        );
                    } else if(currentDistance > this.maxLockedDistance) {
                        const direction = new THREE.Vector3()
                            .subVectors(this.camera.position, this.controls.target)
                            .normalize();
                        this.camera.position.copy(this.controls.target)
                            .add(direction.multiplyScalar(this.maxLockedDistance)
                        );
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

    public moveTo(target: THREE.Vector3): void {
        if(this.isLocked) return;

        this.savedState = {
            position: this.camera.position.clone(),
            target: this.controls.target.clone()
        }

        let distance: number = 25;

        this.targetPosition.copy(target);
        this.isMoving = true;
        this.isLocked = true;

        this.targetDistance = THREE.MathUtils.clamp(
            distance,
            this.minLockedDistance,
            this.maxLockedDistance,
        );

        if(this.controls) {
            this.controls.enabled = true;
            this.controls.minDistance = this.minLockedDistance;
            this.controls.maxDistance = this.maxLockedDistance;
        }
    }

    //Following Planet... *ARRUMAR O ZOOM
        private minLockedDistance: number = 20;
        private maxLockedDistance: number = 25;

        private followingObject: THREE.Object3D | null = null;
        private followSpeed: number = 0.1;
        private isFollowing: boolean = false;

        public followObject(object: THREE.Object3D): void {
            this.followingObject = object;
            this.isFollowing = true;
            this.isLocked = true;
            this.isMoving = false;

            this.savedState = {
                position: this.camera.position.clone(),
                target: this.controls.target.clone(),
            }

            if(this.controls) {
                this.controls.enablePan = false;
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
        
                if(this.controls) {
                    this.controls.enablePan = true;
                    this.controls.minDistance = this.minDistance;
                    this.controls.maxDistance = this.maxDistance;
                }
            }
        }

    //

    public unlockCamera(): void {
        if(!this.isFollowing) {
            this.isLocked = false;
    
            if(this.controls) {
                this.controls.minDistance = 0.1;
                this.controls.maxDistance = Infinity;
            }
        }
    }

    public returnPos(): void {
        if(this.savedState) {
            this.isMoving = true;
            this.isLocked = false;

            this.targetPosition.copy(this.savedState.target);
            this.targetDistance = this.camera.position.distanceTo(this.savedState.target);

            if(this.controls) {
                this.controls.minDistance = this.minDistance;
                this.controls.maxDistance = this.maxDistance;
            }
        }
    }

    public update(): void {
        if(this.isFollowing && this.followingObject) {
            const targetPos = new THREE.Vector3().copy(this.followingObject.position);

            this.camera.position.lerp(targetPos, this.followSpeed);
            this.controls.target.copy(this.followingObject.position);
        }
        
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
        }

        if(this.controls) {
            this.controls.update();
        }
    }
}

export const camera = new Camera();