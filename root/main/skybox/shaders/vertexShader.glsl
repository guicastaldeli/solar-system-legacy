attribute float scale;
attribute float phase;
attribute vec3 color;

varying vec3 vColor;
varying float vPhase;

uniform float time;
uniform float size;

void main() {
    vColor = color;
    vPhase = phase;

    float twinkle = sin(time * 2.0 + phase * 10.0) * 0.5 + 1.5;
    float finalSize = size * scale * twinkle;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = finalSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}