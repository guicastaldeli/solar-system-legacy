import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export class Skybox {
    public points!: THREE.Points;
    private geometries: THREE.BufferGeometry[] = [];
    private material!: THREE.ShaderMaterial | THREE.PointsMaterial;
    private clock: THREE.Clock;

    private readyPromise: Promise<void>;

    constructor(count: number = 1, chunks: number = 1) {
        this.clock = new THREE.Clock();
        
        const starsChunk = Math.ceil(count / chunks);
        this.geometries = [];

        for(let i = 0; i < chunks; i++) {
            const chunkCount = i === chunks - 1 ? count - (i * starsChunk) : starsChunk;
            const geometry = new THREE.BufferGeometry();

            const { pos, color, scale, phase } = this.generateStars(chunkCount);
            geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(color, 3));
            geometry.setAttribute('scale', new THREE.BufferAttribute(scale, 1));
            geometry.setAttribute('phase', new THREE.BufferAttribute(phase, 1));

            this.geometries.push(geometry);
        }

        this.readyPromise = this.createStars();
    }

    private async createStars() {
        try {
            const [vertexShader, fragmentShader] = await Promise.all([
                this.loadShader('./skybox/shaders/vertexShader.glsl'),
                this.loadShader('./skybox/shaders/fragShader.glsl')
            ]);

            this.material = new THREE.ShaderMaterial({
                uniforms: { 
                    time: { value: 0 },
                    size: { value: 1.0 },
                },
                vertexShader,
                fragmentShader,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const mergedGeometry = mergeGeometries(this.geometries);
            this.geometries.forEach(g => g.dispose());
            this.geometries = [];
            this.points = new THREE.Points(mergedGeometry, this.material);
        } catch(error) {
            console.error(error);
        }
    }

    private async loadShader(url: string): Promise<string> {
        const res = await fetch(url);
        if(!res.ok) throw new Error(`Error, ${url}`);

        return await res.text();
    }

    private generateStars(count: number) {
        const pos = new Float32Array(count * 3);
        const color = new Float32Array(count * 3);
        const scale = new Float32Array(count);
        const speed = new Float32Array(count);
        const phase = new Float32Array(count);

        for(let i = 0; i < count; i++) {
            const radius = 500;
            const t = Math.random() * Math.PI * 2;
            const p = Math.acos(2 * Math.random() - 1);
            
            pos[i * 3] = radius * Math.sin(p) * Math.cos(t);
            pos[i * 3 + 1] = radius * Math.sin(p) * Math.sin(t);
            pos[i * 3 + 2] = radius * Math.cos(p);

            if(Math.random() > 0.2) {
                color[i * 3] = 1.0;
                color[i * 3 + 1] = 1.0;
                color[i * 3 + 2] = 1.0;
            } else {
                color[i * 3] = 0.7 + Math.random() * 0.3;
                color[i * 3 + 1] = 0.5 + Math.random() * 0.3;
                color[i * 3 + 2] = 0.5 + Math.random() * 0.3;
            }

            scale[i] = 0.1 + Math.random() * 4;
            phase[i] = Math.random() * Math.PI * 2;
        }

        return { pos, color, scale, speed, phase };
    }

    public async ready(): Promise<void> {
        return this.readyPromise;
    }

    public update() {
        if(!this.points || !this.material) return;

        const rotationSpeed = 0.0001;
        this.points.rotation.y += rotationSpeed;

        if('uniforms' in this.material) {
            const shaderMaterial = this.material as THREE.ShaderMaterial;
            shaderMaterial.uniforms.time.value = this.clock.getElapsedTime();
        }
    }
}