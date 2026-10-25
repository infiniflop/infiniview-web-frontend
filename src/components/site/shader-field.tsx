"use client";

import { useEffect, useRef } from "react";

/**
 * A slow, dark field of light behind the hero: layered value noise, a soft
 * source that follows the lens, and ordered dithering so nothing bands.
 * Raw WebGL, no dependencies. Renders at half resolution, pauses when
 * off-screen, and draws a single frame under reduced motion.
 */
const VERT = `
attribute vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_lens;   // 0..1, y up
uniform float u_glow;  // 0..1
uniform vec3 u_ink;
uniform vec3 u_red;

float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for(int i=0;i<5;i++){ v += a*noise(p); p = r*p*2.03 + 7.1; a *= 0.5; }
  return v;
}
// 4x4 Bayer
float bayer(vec2 p){
  vec2 q = floor(mod(p, 4.0));
  float i = q.x + q.y*4.0;
  float m[16];
  m[0]=0.0;m[1]=8.0;m[2]=2.0;m[3]=10.0;m[4]=12.0;m[5]=4.0;m[6]=14.0;m[7]=6.0;
  m[8]=3.0;m[9]=11.0;m[10]=1.0;m[11]=9.0;m[12]=15.0;m[13]=7.0;m[14]=13.0;m[15]=5.0;
  float v = 0.0;
  for(int k=0;k<16;k++){ if(float(k)==i) v = m[k]; }
  return (v + 0.5) / 16.0;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float asp = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * asp, uv.y);
  float t = u_time * 0.025;

  // two drifting layers of fog
  float n1 = fbm(p * 1.6 + vec2(t, -t*0.6));
  float n2 = fbm(p * 3.1 - vec2(t*0.7, t*0.4) + n1);
  float fog = smoothstep(0.35, 0.95, n1 * 0.7 + n2 * 0.5);

  // vertical weighting: more light toward the upper right, where the stage is
  float wgt = smoothstep(-0.2, 1.2, uv.x * 0.6 + uv.y * 0.7);

  // the lens source
  vec2 lp = vec2(u_lens.x * asp, u_lens.y);
  float d = distance(p, lp);
  float src = exp(-d * d * 5.5) * u_glow;

  vec3 col = vec3(0.0);
  col += u_ink * fog * 0.13 * wgt;
  col += u_red * src * (0.40 + 0.30 * n2);
  col += u_ink * src * 0.08;

  // ordered dither, ~1 step of 8-bit
  col += (bayer(gl_FragCoord.xy) - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

export function ShaderField({
  className,
  lensRef,
}: {
  className?: string;
  /** Shared mutable lens position in CSS pixels relative to the canvas, plus glow. */
  lensRef?: React.RefObject<{ x: number; y: number; glow: number }>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      canvas.style.display = "none";
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("ShaderField: program failed to link", gl.getProgramInfoLog(prog));
      }
      canvas.style.display = "none";
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uLens = gl.getUniformLocation(prog, "u_lens");
    const uGlow = gl.getUniformLocation(prog, "u_glow");
    gl.uniform3f(gl.getUniformLocation(prog, "u_ink"), 0.93, 0.94, 0.96);
    gl.uniform3f(gl.getUniformLocation(prog, "u_red"), 0.9, 0.28, 0.3);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let cssW = 0;
    let cssH = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      cssW = r.width;
      cssH = r.height;
      const scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
      w = Math.max(2, Math.round(r.width * scale));
      h = Math.max(2, Math.round(r.height * scale));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let visible = true;
    const start = performance.now();
    const frame = () => {
      raf = 0;
      if (!visible) return;
      const t = (performance.now() - start) / 1000;
      gl.uniform1f(uTime, t);
      const l = lensRef?.current;
      if (l && cssW > 0 && cssH > 0) {
        gl.uniform2f(uLens, l.x / cssW, 1 - l.y / cssH);
        gl.uniform1f(uGlow, l.glow);
      } else {
        gl.uniform2f(uLens, 0.7, 0.55);
        gl.uniform1f(uGlow, 0.6);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);
    raf = requestAnimationFrame(frame);

    return () => {
      ro.disconnect();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [lensRef]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
