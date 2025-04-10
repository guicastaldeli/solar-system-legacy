import * as THREE from 'three';
import { camera } from './camera.js';

type Body = {
    id: string;
    mesh: THREE.Mesh;
    defaultColor: string;
    hoverColor: string;
    onClick?: (event: MouseEvent) => void;
}

export class ActivateRaycaster {
    private raycaster!: THREE.Raycaster;
    private mouse!: THREE.Vector2;
    private bodies: Body[] = [];
    private currentHoveredId: string | null = null;

    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.setupEvents();
    }

    public registerBody(body: Body): void {
        this.bodies.push(body);
    }

    private mouseMove(e: MouseEvent): void {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, camera.camera);

        let hoveredId: string | null = null;

        for(const body of this.bodies) {
            const intersects = this.raycaster.intersectObject(body.mesh);

            if(intersects.length > 0) {
                hoveredId = body.id;
                break;
            }
        }

        this.updateHoverStates(hoveredId);
    }

    private mouseClick(e: MouseEvent): void {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, camera.camera);

        for(const body of this.bodies) {
            const intersects = this.raycaster.intersectObject(body.mesh);

            if(intersects.length > 0) {
                const event = new CustomEvent('bodyClicked', {
                    detail: {
                        id: body.id,
                        name: '',
                        position: body.mesh.position.clone(),
                        color: body.defaultColor,
                        mesh: body.mesh
                    }
                });
                
                window.dispatchEvent(event);
                
                if(body.onClick) {
                    body.onClick(e);
                }
                break;
            }
        }
    }

    private setupEvents(): void {
        window.addEventListener('mousemove', (e) => this.mouseMove(e));
        window.addEventListener('click', (e) => this.mouseClick(e));
    }

    private updateHoverStates(newHoveredId: string | null): void {
        if(newHoveredId === this.currentHoveredId) return;

        if(this.currentHoveredId) {
            const prevBody = this.bodies.find(b => b.id === this.currentHoveredId);

            if(prevBody) {
                const material = prevBody.mesh.material as THREE.MeshBasicMaterial;
                material.color.setStyle(prevBody.defaultColor);
            }
        }

        if(newHoveredId) {
            const newBody = this.bodies.find(b => b.id === newHoveredId);

            if(newBody) {
                const material = newBody.mesh.material as THREE.MeshBasicMaterial;
                material.color.setStyle(newBody.hoverColor);
            }
        }

        this.currentHoveredId = newHoveredId;
    }

    public getCurrentHovered(): string | null {
        return this.currentHoveredId;
    }
}

export const activateRaycaster = new ActivateRaycaster();
