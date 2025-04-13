export class Orbit {
    constructor(orbitRadius, orbitSpeed) {
        this.orbitRadius = 0;
        this.orbitSpeed = 0;
        this.angle = 0;
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
        this.angle = Math.random() * Math.PI * 2;
    }
    updateOrbit() {
        this.angle += this.orbitSpeed;
        this.mesh.position.x = Math.cos(this.angle) * this.orbitRadius;
        this.mesh.position.z = Math.sin(this.angle) * this.orbitRadius;
    }
    update() {
        this.updateOrbit();
    }
}
