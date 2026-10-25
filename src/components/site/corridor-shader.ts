// The Corridor: an endless run of glass frames receding to a vanishing point.
// Written from scratch for Infiniview — the brand mark is a frame inside a
// frame, so the world is that mark extruded forever.
//
// Geometry: a rounded-square tube. For every pixel we find the superellipse
// "radius" s of its ray; depth is then z = 1/s, which gives exact perspective
// without ray-marching. Frames sit at regular depths, so their thickness in
// z-space is constant and perspective does the rest.

export const VERT = /* glsl */ `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FRAG = /* glsl */ `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uDepth;   // camera travel in frame spacings
uniform vec2  uPtr;     // pointer, -1..1
uniform float uVel;     // damped scroll velocity, -1..1
uniform vec4  uMood;    // x alert, y energy, z portal, w width
uniform vec2  uVP;      // vanishing point, height-normalised
uniform float uStill;   // 1 = reduced motion (no probes in flight)

#define TAU 6.28318530718

float h11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}
float h21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// superellipse norm — n=5 gives a softly rounded square
float sn(vec2 p, float n) {
  vec2 a = pow(abs(p), vec2(n));
  return pow(a.x + a.y, 1.0 / n);
}

// One frame: crisp edge, glass bevel, soft halo. d is the distance to the
// nearest frame in spacing units, pw the pixel footprint in the same units.
vec3 frame(float w, float pw) {
  float d = abs(fract(w + 0.5) - 0.5);
  float lw = 0.009;
  float edge = 1.0 - smoothstep(lw - pw, lw + pw, d);
  float bevel = exp(-d / 0.05) * 0.5;
  float halo = exp(-d / 0.22) * 0.2;
  // sub-pixel frames collapse into an average instead of shimmering
  float vis = 1.0 - smoothstep(0.22, 0.7, pw);
  float avg = 0.035;
  return vec3(mix(avg, edge, vis), mix(avg, bevel, vis), halo);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  vec2 q = uv - uVP - uPtr * vec2(0.045, 0.03);
  float roll = uPtr.x * 0.02 + uVel * 0.045;
  float cr = cos(roll), sr = sin(roll);
  q = mat2(cr, -sr, sr, cr) * q;

  vec2 ext = vec2(0.6 * uMood.w, 0.6);
  vec2 qn = q / ext;
  float s = max(sn(qn, 5.0), 0.0008);
  float z = 1.0 / s;
  float ang = atan(qn.y, qn.x);

  const float SP = 0.92;
  float depth = uDepth;
  float w = z / SP + depth;
  float pw = (z * z) / (uRes.y * ext.y * SP) * 1.25;

  // light comes from the pointer side
  vec2 L = normalize(vec2(0.55 + uPtr.x * 0.7, 0.7 + uPtr.y * 0.5));
  float lit = 0.38 + 0.62 * smoothstep(-0.7, 1.0, dot(normalize(q + 1e-4), L));

  // chromatic dispersion in pixel terms: a fine prismatic fringe, never bands.
  // It swells a little with scroll speed, like a lens under stress.
  float disp = pw * (1.2 + 2.2 * s) + abs(uVel) * 0.02;
  vec3 fr = frame(w + disp, pw);
  vec3 fg = frame(w, pw);
  vec3 fb = frame(w - disp, pw);
  // secondary ribs: a fine, dim frame four times as dense gives the tube grain
  vec3 rib = frame(w * 4.0, pw * 4.0);

  vec3 cool = vec3(0.68, 0.8, 1.0);
  vec3 lime = vec3(0.82, 0.98, 0.35);
  vec3 red = vec3(1.0, 0.33, 0.24);
  vec3 accent = mix(lime, red, uMood.x);

  float fogN = exp(-z * 0.085);

  vec3 col = vec3(0.0);
  // frame edges (rgb split) and bevel
  // blend the split with its own luminance so fringes read as glass, not RGB bars
  col += mix(vec3(fg.x), vec3(fr.x, fg.x, fb.x), 0.6) * cool * lit * 1.05;
  col += mix(vec3(fg.y), vec3(fr.y, fg.y, fb.y), 0.6) * mix(cool, accent, 0.5) * lit * 0.5;
  col += fg.z * mix(cool, accent, 0.25) * 0.5;
  col += rib.x * cool * 0.1 * lit;
  col *= fogN * uMood.y;

  // tunnel walls: faint depth gradient so the glass reads as a volume
  float wallD = abs(fract(w + 0.5) - 0.5);
  col += vec3(0.02, 0.028, 0.05) * (0.35 + wallD) * fogN * (0.4 + 0.6 * lit);

  // depth haze: cool air near the camera, the accent light bleeding in toward the portal
  vec3 hazeC = mix(vec3(0.03, 0.06, 0.14), accent * 0.05 + vec3(0.04, 0.08, 0.16), smoothstep(0.1, 0.9, 1.0 - s));
  col += hazeC * (0.35 + 0.65 * lit) * exp(-s * 0.9) * 0.55 * uMood.y;

  // glass slab between frames: a soft sheen that fades with distance from each frame
  col += cool * exp(-wallD / 0.32) * 0.035 * lit * fogN * uMood.y;

  // lane lines (wall centres) and creases (corners) with a travelling pulse
  float lane = exp(-pow(abs(sin(2.0 * ang)) * 30.0, 2.0));
  float crease = exp(-pow(abs(cos(2.0 * ang)) * 26.0, 2.0));
  float pulse = 0.5 + 0.5 * sin(z * 1.7 - uTime * 1.6 * (1.0 - uStill));
  col += (lane * 0.018 + crease * 0.05) * (0.3 + 0.7 * pulse) * cool * fogN * uMood.y;

  // probes: agents running down the walls toward the app at the far end
  if (uStill < 0.5) {
    for (int i = 0; i < 7; i++) {
      float fi = float(i);
      float lanePos = h11(fi * 7.31 + 1.7) * TAU - 3.14159265;
      float speed = 1.6 + h11(fi * 3.17 + 9.1) * 3.2;
      float zw = (z + depth * SP);                 // world depth of this pixel
      float head = mod(uTime * speed + h11(fi * 5.9) * 90.0, 90.0) + 2.0;
      float dz = zw - head;                        // <0 : trail behind head
      float da = abs(mod(ang - lanePos + 3.14159265, TAU) - 3.14159265);
      float lateral = da * s * 0.55;               // keeps the line width ~constant on screen
      float width = 0.0034 + 0.0016 * h11(fi);
      float body = exp(-pow(lateral / width, 2.0)) + 0.18 * exp(-pow(lateral / (width * 5.0), 2.0));
      float trail = dz < 0.0 ? exp(dz * 0.8) : exp(-dz * dz * 40.0);
      float hit = h11(fi * 11.3 + 4.0) < (0.22 + 0.55 * uMood.x) ? 1.0 : 0.0;
      vec3 pc = mix(lime, red, max(hit, uMood.x * 0.7));
      float near = smoothstep(1.3, 4.5, z);              // never streak across the lens
      col += pc * body * trail * fogN * near * (0.5 + 0.5 * uMood.y) * 1.25;
      // bright head
      col += pc * body * exp(-dz * dz * 18.0) * fogN * near * 1.0;
    }
  }

  // portal at the vanishing point: a clean silver-white core with a cool bloom;
  // the accent only tints the very edge so the lime stays a signal, not a haze
  float core = exp(-s * 9.0);
  float bloom = exp(-s * 2.4);
  vec3 coreC = mix(vec3(0.97, 0.99, 1.0), accent, 0.12);
  col += coreC * core * 1.2 * uMood.z;
  col += (vec3(0.45, 0.62, 1.0) * 0.5 + accent * 0.12) * bloom * 0.16 * uMood.z;

  // tone: soft shoulder so bright cores bloom instead of clipping
  col = 1.0 - exp(-col * 1.35);

  // vignette, a cool ambient lift toward the centre, grain
  float vig = smoothstep(1.35, 0.25, length(uv));
  col += vec3(0.006, 0.014, 0.034) * bloom;
  col *= 0.5 + 0.5 * vig;
  col += (h21(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) * 0.022;

  // keep the ground a hair above pure black so glass has something to sit on
  col = max(col, vec3(0.008, 0.011, 0.02));
  gl_FragColor = vec4(col, 1.0);
}
`;
