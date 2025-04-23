var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
export class Skybox {
    constructor(count = 1, chunks = 1) {
        this.geometries = [];
        this.clock = new THREE.Clock();
        const starsChunk = Math.ceil(count / chunks);
        this.geometries = [];
        for (let i = 0; i < chunks; i++) {
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
    createStars() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [vertexShader, fragmentShader] = yield Promise.all([
                    this.loadShader('/root/main/skybox/shaders/vertexShader.glsl'),
                    this.loadShader('/root/main/skybox/shaders/fragShader.glsl')
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
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    loadShader(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(url);
            if (!res.ok)
                throw new Error(`Error, ${url}`);
            return yield res.text();
        });
    }
    generateStars(count) {
        const pos = new Float32Array(count * 3);
        const color = new Float32Array(count * 3);
        const scale = new Float32Array(count);
        const speed = new Float32Array(count);
        const phase = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const radius = 500;
            const t = Math.random() * Math.PI * 2;
            const p = Math.acos(2 * Math.random() - 1);
            pos[i * 3] = radius * Math.sin(p) * Math.cos(t);
            pos[i * 3 + 1] = radius * Math.sin(p) * Math.sin(t);
            pos[i * 3 + 2] = radius * Math.cos(p);
            if (Math.random() > 0.2) {
                color[i * 3] = 1.0;
                color[i * 3 + 1] = 1.0;
                color[i * 3 + 2] = 1.0;
            }
            else {
                color[i * 3] = 0.7 + Math.random() * 0.3;
                color[i * 3 + 1] = 0.5 + Math.random() * 0.3;
                color[i * 3 + 2] = 0.5 + Math.random() * 0.3;
            }
            scale[i] = 0.1 + Math.random() * 4;
            phase[i] = Math.random() * Math.PI * 2;
        }
        return { pos, color, scale, speed, phase };
    }
    ready() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.readyPromise;
        });
    }
    update() {
        if (!this.points || !this.material)
            return;
        const rotationSpeed = 0.0001;
        this.points.rotation.y += rotationSpeed;
        if ('uniforms' in this.material) {
            const shaderMaterial = this.material;
            shaderMaterial.uniforms.time.value = this.clock.getElapsedTime();
        }
    }
}
