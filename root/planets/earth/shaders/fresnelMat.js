var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as THREE from "three";
let readyPromise = null;
export function getFresnelMat() {
    return __awaiter(this, arguments, void 0, function* ({ rimHex = 'rgb(15, 131, 214)', facingHex = 'rgb(0, 0, 0)' } = {}) {
        try {
            const [vertexShader, fragmentShader] = yield Promise.all([
                loadShader('/root/planets/earth/shaders/vertexShader.glsl'),
                loadShader('/root/planets/earth/shaders/fragShader.glsl')
            ]);
            const uniforms = {
                color1: { value: new THREE.Color(rimHex) },
                color2: { value: new THREE.Color(facingHex) },
                fresnelBias: { value: 0.1 },
                fresnelScale: { value: 1.0 },
                fresnelPower: { value: 4.0 }
            };
            const fresnelMat = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: true,
                blending: THREE.AdditiveBlending
            });
            return fresnelMat;
        }
        catch (error) {
            console.error(error);
        }
    });
}
function initReady() {
    readyPromise = Promise.resolve();
}
export function ready() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!readyPromise)
            initReady();
        return readyPromise;
    });
}
function loadShader(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(url);
        if (!res.ok)
            throw new Error(`Error ${url}`);
        return yield res.text();
    });
}
