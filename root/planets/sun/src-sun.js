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
import { camera } from '../../main/camera.js';
import { activateRaycaster } from '../../main/raycaster.js';
export class Sun {
    constructor(scene, options = {}) {
        this.props = Sun.DEFAULT_PROPS;
        this.time = 0;
        const props = Object.assign(Object.assign({}, Sun.DEFAULT_PROPS), options);
        this.scene = scene;
        this._readyPromise = this.addSun();
    }
    createSun() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [vertexShader, fragShader] = yield Promise.all([
                    this.loadShader('/root/planets/sun/shaders/vertexShader.glsl'),
                    this.loadShader('/root/planets/sun/shaders/fragShader.glsl')
                ]);
                //Loader
                const loader = new THREE.TextureLoader();
                //
                const geometry = new THREE.IcosahedronGeometry(this.props.r, this.props.d);
                const material = new THREE.ShaderMaterial({
                    uniforms: {
                        time: { value: 0 },
                        sunTexture: { value: loader.load(this.props.texture) },
                        glowColor: { value: new THREE.Color(this.props.color) },
                        glowIntensity: { value: this.props.glowIntensity },
                        turbulenceSpeed: { value: this.props.turbulenceSpeed },
                        turbulenceScale: { value: 1.0 },
                        turbulenceColor: { value: new THREE.Color(this.props.turbulenceColor) },
                        sunRadius: { value: this.props.r },
                        fresnelBias: { value: 0.3 },
                        fresnelScale: { value: 1.0 },
                        fresnelPower: { value: 2.0 },
                        fresnelFadeStart: { value: 0.0 },
                        fresnelFadeEnd: { value: 0.5 },
                        fresnelColor: { value: new THREE.Color(this.props.emissive) },
                        hoverColor: { value: new THREE.Color(this.props.emissive) },
                        isHovered: { value: 0.0 }
                    },
                    vertexShader: vertexShader,
                    fragmentShader: fragShader,
                    side: THREE.DoubleSide,
                    depthFunc: THREE.LessEqualDepth,
                });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.receiveShadow = true;
                //Halo
                const [hVertexShader, hFragShader] = yield Promise.all([
                    this.loadShader('/root/planets/sun/shaders/hVertexShader.glsl'),
                    this.loadShader('/root/planets/sun/shaders/hFragShader.glsl')
                ]);
                const haloGeometry = new THREE.IcosahedronGeometry(this.props.r, 3);
                const haloMat = new THREE.ShaderMaterial({
                    uniforms: {
                        color1: { value: new THREE.Color(this.props.emissive) },
                        color2: { value: new THREE.Color('rgb(0, 0, 0)') },
                        colorSpread: { value: 0.8 },
                        fresnelBias: { value: 0.1 },
                        fresnelScale: { value: 2.0 },
                        fresnelPower: { value: 6.0 }
                    },
                    vertexShader: hVertexShader,
                    fragmentShader: hFragShader,
                    transparent: true,
                    blending: THREE.AdditiveBlending
                });
                const halo = new THREE.Mesh(haloGeometry, haloMat);
                halo.scale.setScalar(1.18);
                this.mesh.add(halo);
                //
                //Lightning
                const pointLight = new THREE.PointLight();
                pointLight.color = new THREE.Color('rgb(255, 255, 255)');
                pointLight.intensity = 2.5;
                pointLight.distance = 0;
                pointLight.decay = 0;
                pointLight.position.set(this.props.x, this.props.y, this.props.z);
                this.scene.add(pointLight);
                //
                //Animation
                const _animate = () => {
                    requestAnimationFrame(_animate);
                    this.time += 0.01;
                    this.mesh.rotation.y += 0.01;
                    halo.rotation.z += 0.005;
                    halo.rotation.x += 0.005;
                    halo.rotation.y += 0.005;
                    this.mesh.material.uniforms.time.value = this.time;
                };
                _animate();
                //
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    sunPos() {
        this.mesh.position.x = this.props.x,
            this.mesh.position.y = this.props.y,
            this.mesh.position.z = this.props.z;
    }
    loadShader(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(url);
            if (!res.ok)
                throw new Error(`Error ${url}`);
            return yield res.text();
        });
    }
    addSun() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createSun();
            this.sunPos();
            this.raycaster();
        });
    }
    ready() {
        return this._readyPromise;
    }
    //Raycaster
    raycaster() {
        let hoverColor = this.mesh.material;
        activateRaycaster.registerBody({
            id: 'rc-sun',
            mesh: this.mesh,
            defaultColor: '',
            hoverColor: '',
            onClick: (e) => this.mouseClick(e),
            onHoverStart: () => { hoverColor.uniforms.isHovered.value = 1.0; },
            onHoverEnd: () => { hoverColor.uniforms.isHovered.value = 0.0; }
        });
    }
    mouseClick(e) {
        const event = new CustomEvent('bodyClicked', {
            detail: {
                id: 'clk-sun',
                name: 'SUN',
                ts: 1,
                position: this.mesh.position.clone(),
                color: this.props.color,
                mesh: this.mesh,
            }
        });
        window.dispatchEvent(event);
        if (camera.isFollowingObject(this.mesh))
            return;
        camera.followObject(this.mesh, this.props.r);
    }
}
Sun.DEFAULT_PROPS = {
    //Size
    r: 30,
    d: 16,
    //Pos
    x: 0,
    y: 0,
    z: -15,
    color: 'rgb(132, 70, 0)',
    texture: '../../assets/textures/sun/sunmap.jpg',
    emissive: 'rgb(195, 120, 0)',
    emissiveIntensity: 0.1,
    glowIntensity: 3.5,
    turbulenceSpeed: 0.5,
    turbulenceColor: 'rgb(230, 153, 19)'
};
