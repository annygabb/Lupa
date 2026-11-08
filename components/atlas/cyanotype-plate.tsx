"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motionAllowed } from "./motion";

/**
 * Prancha em WebGL:
 * 1. "Exposição": ao entrar, a imagem se revela como uma cianotipia — do papel sensibilizado
 *    (amarelo-esverdeado) ao azul-da-prússia, com uma lavagem irregular guiada por ruído.
 * 2. "Lupa": lente refrativa que segue o cursor (aumento com distorção de barril,
 *    aberração cromática leve na borda e aro).
 * Sem WebGL, com movimento reduzido ou em toque: imagem estática (next/image) por baixo.
 */
const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p*0.5+0.5; vUv.y = 1.0-vUv.y; gl_Position = vec4(p,0.0,1.0); }`;

const FRAG = `precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uMouse;      // 0..1
uniform float uLens;      // 0..1 (abertura da lupa)
uniform float uRadius;    // raio em uv
uniform float uExpose;    // 0..1
uniform float uTime;
uniform float uAspect;    // largura/altura do canvas

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=0.5; } return v; }

void main(){
  vec2 uv = vUv;
  vec2 d = uv - uMouse; d.x *= uAspect;
  float r = length(d) / max(uRadius, 0.0001);
  float inLens = (1.0 - smoothstep(0.98, 1.0, r)) * uLens;
  // aumento ~2.1x no centro, com distorção de barril
  float k = mix(1.0, 0.42 + 0.22*r*r, inLens);
  vec2 dd = (uv - uMouse) * k;
  vec2 luv = uMouse + dd;
  float ca = 0.006 * pow(r, 3.0) * inLens;
  vec3 img;
  img.r = texture2D(uTex, luv + dd*ca*8.0).r;
  img.g = texture2D(uTex, luv).g;
  img.b = texture2D(uTex, luv - dd*ca*8.0).b;

  // exposição: lavagem irregular vinda de cima
  float n = fbm(uv*3.2 + vec2(0.0, uTime*0.04));
  float front = uExpose*1.35 - 0.2;
  float m = smoothstep(front - 0.18, front + 0.02, n*0.55 + (1.0-uv.y)*0.45);
  m = 1.0 - m;
  vec3 paper = vec3(0.89, 0.91, 0.78) - 0.04*noise(uv*240.0);
  vec3 unwashed = mix(paper, vec3(0.38,0.55,0.52), 0.55) ;
  vec3 col = mix(paper, mix(unwashed, img, smoothstep(0.0, 1.0, uExpose*1.15 - 0.1)), m);

  // aro da lupa
  float ring = smoothstep(0.90, 0.955, r) * (1.0 - smoothstep(0.985, 1.03, r)) * uLens;
  float edge = smoothstep(1.0, 1.06, r) * (1.0 - smoothstep(1.06, 1.16, r)) * uLens;
  col = mix(col, vec3(1.0), ring*0.9);
  col = mix(col, vec3(0.03,0.10,0.20), edge*0.55);
  // brilho do vidro
  float glint = smoothstep(0.55, 0.0, length((uv-uMouse)*vec2(uAspect,1.0) - vec2(-0.35,-0.35)*uRadius)/uRadius) * 0.12 * inLens;
  col += glint;
  gl_FragColor = vec4(col, 1.0);
}`;

export function CyanotypePlate({ src, alt, priority = false, sizes, lens = true, exposeOnView = false, className }: {
  src: string; alt: string; priority?: boolean; sizes: string; lens?: boolean; exposeOnView?: boolean; className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = wrap.current, cv = canvas.current;
    if (!host || !cv || !motionAllowed()) return;
    const touch = window.matchMedia("(hover: none)").matches;
    const gl = cv.getContext("webgl", { premultipliedAlpha: false, antialias: true });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
      return s;
    };
    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    } catch { return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uMouse = U("uMouse"), uLens = U("uLens"), uRadius = U("uRadius"), uExpose = U("uExpose"), uTime = U("uTime"), uAspect = U("uAspect");

    const tex = gl.createTexture();
    const state = { mx: 0.5, my: 0.5, tx: 0.5, ty: 0.5, lens: 0, lensT: 0, expose: 0, exposeT: 0, ready: false, raf: 0, t0: performance.now() };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = host.clientWidth, h = host.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform1f(uAspect, w / Math.max(h, 1));
      gl.uniform1f(uRadius, Math.min(0.24, 150 / Math.max(h, 1)));
      kick();
    };

    const frame = () => {
      state.raf = 0;
      if (!state.ready) return;
      state.mx += (state.tx - state.mx) * 0.18; state.my += (state.ty - state.my) * 0.18;
      state.lens += (state.lensT - state.lens) * 0.14;
      state.expose += (state.exposeT - state.expose) * 0.03;
      gl.uniform2f(uMouse, state.mx, state.my);
      gl.uniform1f(uLens, state.lens);
      gl.uniform1f(uExpose, state.expose);
      gl.uniform1f(uTime, (performance.now() - state.t0) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!host.classList.contains("is-gl")) host.classList.add("is-gl");
      const moving = Math.abs(state.tx - state.mx) + Math.abs(state.ty - state.my) > 0.0005
        || Math.abs(state.lensT - state.lens) > 0.002 || Math.abs(state.exposeT - state.expose) > 0.002;
      if (moving) kick();
      else if (state.exposeT === 1 && !host.classList.contains("is-developed")) host.classList.add("is-developed");
    };
    function kick() { if (!state.raf) state.raf = requestAnimationFrame(frame); }

    const img = new window.Image();
    img.decoding = "async";
    img.src = src;
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      state.ready = true;
      resize();
      if (!exposeOnView) { state.exposeT = 1; kick(); }
    };

    let io: IntersectionObserver | null = null;
    if (exposeOnView) {
      io = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) { state.exposeT = 1; kick(); io?.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(host);
    }

    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      state.tx = (e.clientX - r.left) / r.width; state.ty = (e.clientY - r.top) / r.height;
      kick();
    };
    const enter = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      state.tx = state.mx = (e.clientX - r.left) / r.width; state.ty = state.my = (e.clientY - r.top) / r.height;
      state.lensT = 1; kick();
    };
    const leave = () => { state.lensT = 0; kick(); };
    if (lens && !touch) {
      host.addEventListener("pointermove", move);
      host.addEventListener("pointerenter", enter);
      host.addEventListener("pointerleave", leave);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    return () => {
      cancelAnimationFrame(state.raf);
      ro.disconnect(); io?.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      host.classList.remove("is-gl", "is-developed");
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [src, lens, exposeOnView]);

  return (
    <div ref={wrap} className={"at-plate-gl " + (lens ? "has-lens " : "") + (className ?? "")}>
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes}/>
      <canvas ref={canvas} aria-hidden="true"/>
    </div>
  );
}
