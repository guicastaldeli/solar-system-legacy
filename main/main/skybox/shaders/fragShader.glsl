varying vec3 vColor;
varying float vPhase;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    if(length(coord) > 0.5) discard;

    float glow = pow(1.0 - length(coord) * 1.5, 2.0);
    float center = smoothstep(0.4, 0.2, length(coord));

    gl_FragColor = vec4(vColor * (glow + center * 2.0), 1.0);
}