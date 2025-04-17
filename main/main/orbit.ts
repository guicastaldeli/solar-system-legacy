import * as THREE from 'three';

export abstract class Orbit {
    public mesh: THREE.Mesh | null = null;
    protected orbitRadius: number = 0;
    protected orbitSpeed: number = 0;
    protected angle: number = 0;
    protected props: any;

    constructor(orbitRadius: number, orbitSpeed: number) {
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
        this.angle = Math.random() * Math.PI * 2;
    }

    protected updateOrbit(): void {
        if(!this.mesh) return;
        
        this.angle += this.orbitSpeed;
        this.mesh.position.x = Math.cos(this.angle) * this.orbitRadius;
        this.mesh.position.z = Math.sin(this.angle) * this.orbitRadius;
    }

    public update(): void {
        this.updateOrbit();
    }
}