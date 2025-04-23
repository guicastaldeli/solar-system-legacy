precision highp float;

uniform sampler2D sunTexture;
uniform vec3 glowColor;
uniform vec3 turbulenceColor;
uniform float time;
uniform float glowIntensity;
uniform float turbulenceSpeed;
uniform float turbulenceScale;
uniform float sunRadius;

uniform vec3 hoverColor;
uniform float isHovered;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;
varying float vReflectionFactor;

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float xy1 = mix(dot(i + vec3(0, 0, 0), vec3(7, 157, 113)), dot(i + vec3(1, 0, 0), vec3(7, 157, 113)), f.x);
    float xy2 = mix(dot(i + vec3(0, 1, 0), vec3(7, 157, 113)), dot(i + vec3(1, 1, 0), vec3(7, 157, 113)), f.x);
    float zw1 = mix(dot(i + vec3(0, 0, 1), vec3(7, 157, 113)), dot(i + vec3(1, 0, 1), vec3(7, 157, 113)), f.x);
    float zw2 = mix(dot(i + vec3(0, 1, 1), vec3(7, 157, 113)), dot(i + vec3(1, 1, 1), vec3(7, 157, 113)), f.x);
    float xyz1 = mix(xy1, xy2, f.y);
    float xyz2 = mix(zw1, zw2, f.y);

    return mix(xyz1, xyz2, f.z);
}

void main() {
    vec3 textureColor = texture(sunTexture, vUv).rgb;
    vec3 normWorldPos = normalize(vWorldPosition);
    vec3 pos = normWorldPos * turbulenceScale;

    float turbulence = 0.0;
    turbulence += noise(vec3(pos.x * 5.0, pos.y * 5.0, time * turbulenceSpeed)) * 0.5;
    turbulence += noise(vec3(pos.y * 8.0, time * turbulenceSpeed * 0.7, pos.z * 8.0)) * 0.3;
    turbulence += noise(vec3(time * turbulenceSpeed * 0.5, pos.z * 10.0, pos.x * 10.0)) * 0.2;
    turbulence = smoothstep(0.2, 0.8, turbulence);

    float innerGlow = dot(vNormal, normWorldPos) * 0.5 + 0.5;
    innerGlow = pow(innerGlow, 3.0) * glowIntensity;

    vec3 color = mix(textureColor, glowColor, 0.7);
    color += mix(color, turbulenceColor, turbulence * 0.5);
    color += glowColor * innerGlow * 2.0;

    vec3 finalColor = mix(color, hoverColor, isHovered * 0.5);

    gl_FragColor = vec4(finalColor, 1.0);
}