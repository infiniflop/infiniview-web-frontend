// The wall: a sheet of fluted glass with a light far behind it.
//
// Written from scratch for Infiniview. The page's content is hard and square; the world behind it
// is this one soft thing. Each flute is a cylindrical lens: it shows a squeezed, mirrored slice of
// whatever light is behind the wall, so a single soft light becomes a field of vertical ribbons
// whose edges split into colour. The flutes are the page's column rhythm; the light is the mood
// (cool white, vermilion while the agents attack, lime for proof) and it moves with the chapter.
//
// Cost: three evaluations of an analytic light field per pixel, no textures, no loops.

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
uniform vec2  uPtr;     // pointer, -1..1
uniform float uVel;     // damped scroll velocity, -1..1
uniform vec4  uLight;   // x, y (0..1, y up), z intensity, w radius (in screen heights)
uniform vec3  uMood;    // x alert (vermilion), y proof (lime), z scroll drift (screen heights)
uniform float uFlute;   // flute width, in buffer pixels
uniform float uStill;   // 1 = reduced motion

float h21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// The light behind the wall, in aspect-corrected screen space (x: 0..aspect, y: 0..1).
float field(vec2 p, float aspect) {
  float t = uTime * (1.0 - uStill);
  vec2 l = vec2(uLight.x * aspect, uLight.y);
  l += uPtr * vec2(0.035, 0.025);
  float r = uLight.w;
  vec2 d = p - l;
  // a core, a wide halo, and a slow companion light that wanders: the light is never quite still
  float core = exp(-dot(d, d) / (r * r));
  float halo = exp(-dot(d, d) / (r * r * 6.0));
  vec2 d2 = p - (l + vec2(sin(t * 0.13) * 0.42, cos(t * 0.09) * 0.2 - 0.12) * (0.6 + r));
  float mate = exp(-dot(d2, d2) / (r * r * 2.2));
  // a sheet of light, like the edge of a window, drifting with the scroll
  float sheet = exp(-pow((p.y - l.y + 0.18 + sin(p.x * 1.7 + t * 0.21) * 0.05) / (r * 0.55), 2.0)) * exp(-abs(d.x) / (r * 3.2));
  // slow ripples so neighbouring flutes never show the same slice
  float ripple = 0.82 + 0.18 * sin(p.x * 5.3 + p.y * 2.1 + t * 0.34 + uMood.z * 2.6);
  return (core * 0.78 + halo * 0.09 + mate * 0.16 + sheet * 0.1) * ripple;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float aspect = uRes.x / uRes.y;
  vec2 uv = frag / uRes;

  // which flute, and where across it (-0.5 .. 0.5)
  float fx = frag.x / uFlute;
  float u = fract(fx) - 0.5;
  float centre = (floor(fx) + 0.5) * uFlute / uRes.y; // aspect-corrected x of the flute's axis

  // a convex flute mirrors and widens what is behind it; red and blue bend by different amounts.
  // The split grows a little with scroll speed and settles when the page does.
  float spread = uFlute / uRes.y;
  float bend = 2.6;
  float disp = 0.11 + abs(uVel) * 0.3;
  float lens = u * (1.0 + 1.6 * u * u); // steeper toward the groove
  vec2 pr = vec2(centre - lens * spread * bend * (1.0 - disp), uv.y);
  vec2 pg = vec2(centre - lens * spread * bend, uv.y);
  vec2 pb = vec2(centre - lens * spread * bend * (1.0 + disp), uv.y);
  vec3 f = vec3(field(pr, aspect), field(pg, aspect), field(pb, aspect));

  vec3 cool = vec3(0.72, 0.80, 0.96);
  vec3 lime = vec3(0.82, 0.98, 0.35);
  vec3 red = vec3(1.0, 0.36, 0.27);
  vec3 tint = mix(mix(cool, lime, uMood.y), red, uMood.x);

  vec3 col = f * tint * uLight.z;

  // the glass itself: a soft highlight down the side of each flute that faces the light, and a
  // dark groove where two flutes meet
  float facing = clamp(0.5 + (uLight.x * aspect - centre) * 0.9, 0.0, 1.0);
  float side = smoothstep(0.02, 0.0, abs(u - mix(-0.33, 0.33, facing)) - 0.02);
  float lit = dot(f, vec3(0.3333));
  col += tint * side * (0.008 + lit * 0.2) * uLight.z;
  float groove = smoothstep(0.5, 0.46, abs(u));
  col *= 0.55 + 0.45 * groove;
  // a hairline of ambient light on every groove, so the wall is there even in the dark
  col += vec3(0.5, 0.6, 0.8) * (1.0 - groove) * 0.010;

  // soft shoulder: a bright core blooms instead of clipping
  col = 1.0 - exp(-col * 1.25);

  // ground, vignette, grain (the grain also hides banding in the dark gradients)
  float vig = smoothstep(1.25, 0.2, length((uv - 0.5) * vec2(aspect * 0.72, 1.0)));
  col *= 0.42 + 0.58 * vig;
  col += vec3(0.0275, 0.0314, 0.0431); // #07080b
  col += (h21(frag + fract(uTime * (1.0 - uStill)) * 61.0) - 0.5) * 0.014;

  gl_FragColor = vec4(col, 1.0);
}
`;
