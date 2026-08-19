export const baseVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const noiseFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = rot * p * 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vUv * 2.5;
    float n = fbm(p + uTime * 0.03);
    n = smoothstep(0.3, 0.78, n);
    vec3 col = mix(uColorA, uColorB, n);
    float vig = smoothstep(1.4, 0.4, length(vUv - 0.5) * 1.6);
    gl_FragColor = vec4(col * (0.55 + 0.45 * vig), uOpacity);
  }
`;

export const portalFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  void main() {
    vec2 p = vUv - 0.5;
    float d = length(p);
    float ring = 1.0 - smoothstep(0.32, 0.5, d);
    float swirl = sin(atan(p.y, p.x) * 6.0 + uTime * 0.8 + d * 8.0) * 0.5 + 0.5;
    float n = noise(p * 6.0 + uTime * 0.1);
    float core = smoothstep(0.42, 0.05, d);
    vec3 col = mix(uColorA, uColorB, swirl * 0.6 + n * 0.4);
    col *= ring * 0.75 + core;
    float edge = 1.0 - smoothstep(0.4, 0.5, d);
    col += uColorB * edge * 0.6;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const moonFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.1 + vec2(3.3, 1.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 lightDir = normalize(vec3(0.6, 0.8, 0.4));
    float diff = max(dot(n, lightDir), 0.0);
    float craters = fbm(vPos.xy * 1.6 + uTime * 0.01);
    vec3 base = mix(uColorA, uColorB, craters);
    float rim = pow(1.0 - max(dot(n, normalize(vec3(0.0, 0.0, 1.0))), 0.0), 2.0);
    vec3 col = base * (0.35 + 0.65 * diff);
    col += vec3(0.08) * rim;
    gl_FragColor = vec4(col, 1.0);
  }
`;
