import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Camera {
    public camera!: THREE.PerspectiveCamera;
    public controls!: OrbitControls;

    private renderer!: THREE.WebGLRenderer;

    private targetPosition: THREE.Vector3 = new THREE.Vector3();
    private isMoving: boolean = false;
    private moveSpeed: number = 0.5;
    private targetDistance: number = 3;
    private isLocked: boolean = false;

    public hudGroup: THREE.Group = new THREE.Group();

    public setupCamera(w: number, h: number): void {
        this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
        this.camera.position.z = 25;

        this.camera.add(this.hudGroup);
    }

    private minDistance: number = 1;
    private maxDistance: number = 100;
    
    public setupControls(renderer: THREE.WebGLRenderer): void {
        if(renderer) this.controls = new OrbitControls(this.camera, renderer.domElement);
    
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
        }

        this.controls.minDistance = this.minDistance;
        this.controls.maxDistance = this.maxDistance;

        this.controls.addEventListener('change', () => {
            if(this.isLocked) {
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
    }

    private originalPos: THREE.Vector3 = new THREE.Vector3();
    private originalTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    private savedState: {
        position: THREE.Vector3,
        target: THREE.Vector3,
    } | null = null;

    private minLockedDistance: number = 20;
    private maxLockedDistance: number = 25;

    public moveTo(target: THREE.Vector3): void {
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

    public unlockCamera(): void {
        this.isLocked = false;

        if(this.controls) {
            this.controls.minDistance = this.targetDistance;
            this.controls.maxDistance = this.maxDistance;
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