import * as THREE from "three";

interface FresnelMatOptions {
    rimHex?: string;
    facingHex: string;
}

let readyPromise: Promise<void> | null = null;

export async function getFresnelMat({ rimHex = 'rgb(15, 131, 214)', facingHex = 'rgb(0, 0, 0)' } = {} as FresnelMatOptions) {
    try {
        const [vertexShader, fragmentShader] = await Promise.all([
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
    } catch(error) {
        console.error(error);
    }
}

function initReady(): void {
    readyPromise = Promise.resolve();
}

export async function ready(): Promise<void> {
    if(!readyPromise) initReady();
    return readyPromise!;
}

async function loadShader(url: string): Promise<string> {
    const res = await fetch(url);
    if(!res.ok) throw new Error(`Error ${url}`);

    return await res.text();
}