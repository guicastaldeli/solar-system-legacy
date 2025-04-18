uniform vec3 color1;
uniform vec3 color2;
uniform float colorSpread;

varying float vReflectionFactor;

void main() {
    float f = clamp(vReflectionFactor, 0.0, 1.0);
    f = pow(f, colorSpread);
    vec3 mixedColor = mix(color1, color2, f);
    float alpha = mix(1.0, 0.0, f);
    gl_FragColor = vec4(mixedColor, alpha);
}