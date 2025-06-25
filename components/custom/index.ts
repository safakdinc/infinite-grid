import { Uniform, Vector3, Vector4, Vector2 } from 'three';
import { BlendFunction, Effect } from 'postprocessing';

/**
 * ScreenSpaceCurvatureShaderEffect - A custom PostProcessing effect
 * that renders a 3D shoe model with curvature-based shading.
 * This effect is a self-contained ray-marching shader inspired by Shadertoy.
 */
export class ScreenSpaceCurvatureShaderEffect extends Effect {
  /**
   * Creates a new ScreenSpaceCurvatureShaderEffect instance.
   *
   * @param {object} [options] - Configuration options for the effect.
   * @param {BlendFunction} [options.blendFunction] - Blend mode for the effect.
   */
  constructor({ blendFunction = BlendFunction.NORMAL } = {}) {
    // Call the super constructor with the effect name and the GLSL shader code.
    // The GLSL code is directly embedded here.
    // Uniforms iResolution, iTime, and iMouse are added to allow communication
    // between the JavaScript and the shader.
    super(
      'ScreenSpaceCurvatureShaderEffect',
      `
        // Required GLSL precision declarations
        precision highp float;
        precision highp int;

        // Shadertoy-like uniforms required by the embedded GLSL shader
        uniform vec3 iResolution; // Viewport resolution (width, height, pixel ratio)
        uniform float iTime;      // Shader playback time in seconds
        uniform vec4 iMouse;     // Mouse coordinates (x,y) and click state (z,w)

        // "Screen Space Curvature Shader" by Evan Wallace:
        // http://madebyevan.com/shaders/curvature/
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Change shading type
        #define CURVATURE 0
        #define METAL 0
        #define RED_WAX 1


        // Shoe Model from my shader.
        // "A man from 'A LOST MEMORY'" by iYOYi:
        // https://www.shadertoy.com/view/Ws3yW4
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        #define PI 3.14159265
        #define TAU (2.0*PI)
        #define saturate(x) clamp(x, 0.0, 1.0)

        #define MIN_DIST 0.001
        #define MAX_DIST 30.0
        #define ITERATION 100

        #define SHOW_ANIM 0
        vec3 ro = vec3(0), rd = vec3(0);

        // Cheap Rotation by las:
        // http://www.pouet.net/topic?which=7931&page=1
        #define R(p, a) p=cos(a)*p+sin(a)*vec2(p.y,-p.x)
        vec3 rot(vec3 p,vec3 r){
            R(p.xz, r.y);
            R(p.yx, r.z);
            R(p.zy, r.x);
            return p;
        }

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        float noise (in vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);

            float a = rand(i);
            float b = rand(i + vec2(1.0, 0.0));
            float c = rand(i + vec2(0.0, 1.0));
            float d = rand(i + vec2(1.0, 1.0));

            vec2 u = f * f * (3.0 - 2.0 * f);

            return mix(a, b, u.x) +
                        (c - a)* u.y * (1.0 - u.x) +
                        (d - b) * u.x * u.y;
        }

        float fbm(vec2 n, int rep){
            float sum = 0.0;
            float amp= 1.0;
            for (int i = 0; i <rep; i++){
                sum += noise(n) * amp;
                n += n*4.0;
                amp *= 0.25;
            }
            return sum;
        }

        // SDF functions by iq and HG_SDF
        // https://iquilezles.org/articles/distfunctions
        // https://mercury.sexy/hg_sdf/
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        float vmax(vec3 v){
            return max(max(v.x, v.y), v.z);
        }

        float sdBox( in vec2 p, in vec2 b ) {
            vec2 d = abs(p)-b;
            return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
        }

        float sdEllipsoid(in vec3 p, in vec3 r) {
            return (length(p/r)-1.0)*min(min(r.x,r.y),r.z);
        }

        float sdCappedTorus(vec3 p, vec2 r, float per) {
            p.x = abs(p.x);
            vec2 sc = vec2(sin(per),cos(per));
            float k = (sc.y*p.x>sc.x*p.z) ? dot(p.xz,sc) : length(p.xz);
            return sqrt( dot(p,p) + r.x*r.x - 2.0*r.x*k ) - r.y;
        }

        float sdBox(vec3 p,vec3 b) {
            vec3 d=abs(p)-b;
            return length(max(d,vec3(0)))+vmax(min(d,vec3(0.0)));
        }

        float fOpUnion(in float a,in float b) {
            return a<b?a:b;
        }

        vec4 v4OpUnion(in vec4 a,in vec4 b) {
            return a.x<b.x?a:b;
        }

        float fOpUnionSmooth(float a,float b,float r) {
            vec2 u = max(vec2(r - a,r - b), vec2(0));
            return max(r, min (a, b)) - length(u);
        }

        float fOpSubstraction(in float a,in float b) {
            return max(-a, b);
        }

        float fOpSubstractionSmooth( float a,float b,float r) {
            vec2 u = max(vec2(r + b,r + -a), vec2(0));
            return min(-r, max (b, -a)) + length(u);
        }

        void pElongate(inout float p, in float h ) {
            p = p-clamp(p,-h,h);
        }

        float sdFoot(vec3 p) {
            float d = MAX_DIST;
            float bsd = length(p), bsr=0.2500;
            if (bsd > 2.*bsr) return bsd-bsr;
            
            vec3 cpFoot = p;
            {
                vec3 q = cpFoot;
        #if SHOW_ANIM
                float patapata = -q.z*(sin(iTime*5.)*.5+.05)+cos(iTime*5.)*.5;
        #else
                float patapata = -.3;
        #endif
                q.yz*=mat2(cos(-q.z*1.25+patapata+vec4(0,11,33,0)));
                cpFoot=q;
            }
            vec3 cpFoot_Main = cpFoot;
            cpFoot_Main.xyz += vec3(0.0000, 0.0000, 0.1273);
            pElongate(cpFoot_Main.y, 0.0125);
            {
                vec3 q=cpFoot_Main;
                vec3 pq=q;pq.yz *= mat2(cos(.6 + vec4(0, 11, 33, 0)));
                float ycl = smoothstep(.002,.2,q.y);
                float zcl = 1.-smoothstep(-.2,.5,q.z);
                float zcl2 = smoothstep(-.2,.0,q.z);
                q.z+=fbm(vec2(pq.x*20.5,pq.y*80.), 1)*.075*ycl*zcl*zcl2;
                cpFoot_Main=q;
            }

            // Shoe
            float d1,d2;
            d1 = sdEllipsoid(rot(cpFoot_Main+vec3(-0.0005, 0.0274, 0.1042), vec3(0.0818, -0.6861, 0.0566)), vec3(0.1102, 0.1233, 0.1214));
            d1 = fOpUnionSmooth(sdEllipsoid(rot(cpFoot_Main+vec3(0.0028, -0.0093, -0.1258), vec3(-0.0291, -0.2744, -0.0364)), vec3(0.0870, 0.2295, 0.0880)), d1, 0.1438);
            d1 = fOpSubstractionSmooth(sdBox(cpFoot+vec3(0.0000, -0.194, 0.0019), vec3(0.1676, 0.0551, 0.1171)), d1, 0.0100);
            d1 = fOpSubstractionSmooth(dot(cpFoot_Main, vec3(0,1,0)) - .001, d1, 0.0080);
            d1 = fOpSubstraction(sdBox(rot(cpFoot+vec3(0.0000, 0.0171, 0.1521), vec3(-1.4413, 0.0000, 0.0000)), vec3(0.1676, 0.0912, 0.0116)), d1);
            d1 = fOpUnionSmooth(sdCappedTorus(cpFoot+vec3(0.0028, -0.1578, 0.0014), vec2(0.0519, 0.0264), 3.1413), d1, 0.0100);
            
            // Shoe lace
            d2 = sdCappedTorus(rot(cpFoot+vec3(0.0000, -0.0579, 0.1827), vec3(1.5708, 0.0000, 0.0000)), vec2(0.0636, 0.0064), 0.6283);
            d2 = fOpUnion(sdCappedTorus(rot(cpFoot+vec3(0.0000, -0.1001, 0.0608), vec3(2.2401, -0.3407, 0.2843)), vec2(0.0636, 0.0064), 0.6283), d2);
            d2 = fOpUnion(sdCappedTorus(rot(cpFoot+vec3(0.0000, -0.0639, 0.1321), vec3(1.7335, 0.4446, -0.0513)), vec2(0.0636, 0.0064), 0.6283), d2);
            d2 = fOpUnion(sdCappedTorus(rot(cpFoot+vec3(0.0000, -0.1001, 0.0608), vec3(2.2463, 0.3180, -0.2669)), vec2(0.0636, 0.0064), 0.6283), d2);
            d2 = fOpUnion(sdCappedTorus(rot(cpFoot+vec3(0.0000, -0.0639, 0.1321), vec3(1.7334, -0.4468, 0.0515)), vec2(0.0636, 0.0064), 0.6283), d2);
            
            return min(d1,d2);
        }

        float sdScene(vec3 p) {
            return sdFoot(p);
        }

        float intersect() {
            float d = MIN_DIST;

            for (int i = 0; i < ITERATION; i++) {
                vec3 p = ro + d * rd;
                float res = sdScene(p);
                res*=.5;
                if (abs(res) < MIN_DIST)break;
                d += res;
                if (d >= MAX_DIST) return MAX_DIST;
            }
            if(d>MAX_DIST) return MAX_DIST;
            return d;
        }

        // from iq's shader
        vec3 normal(vec3 p) {
            // inspired by tdhooper and klems - a way to prevent the compiler from inlining map() 4 times
            vec3 n = vec3(0.0);
            for( int i=0; i<4; i++ ) {
                vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
                n += e*sdScene(p+0.0005*e);
            }
            return normalize(n);
        }

        // Camera localized normal
        vec3 campos, camup;
        vec3 localNormal(vec3 p) {
            vec3 n = normal(p), ln;
            vec3 side = cross(campos, camup);
            return vec3(dot(n,  side), dot(n,  camup), dot(n,  -rd));
        }

        // "camera": create camera vectors.
        void camera(vec2 current_uv) { // Renamed parameter to avoid conflict
            const float pY = .5;
            const float cL = 10.;
            const vec3 forcus = vec3(0,.08,-.137);
            const float fov = .015;

            vec3 up = vec3(0,1,0);
            vec3 pos = vec3(0,0,0);
            pos.xz = vec2(sin(iTime*.6),cos(iTime*.6))*cL;
            // The iMouse.z check determines if mouse input is active
            if(iMouse.z > 0.5) // Using iMouse.z for click state (Shadertoy's convention for mouse button down)
                pos = vec3(sin(iMouse.x/iResolution.x*TAU), sin(iMouse.y/iResolution.y*TAU), cos(iMouse.x/iResolution.x*TAU))*cL;
            vec3 dir = normalize(forcus-pos);
            vec3 target = pos-dir;
            vec3 cw = normalize(target - pos);
            vec3 cu = normalize(cross(cw, up));
            vec3 cv = normalize(cross(cu, cw));
            campos = cw, camup = cv;
            mat3 camMat = mat3(cu, cv, cw);
            rd = normalize(camMat * normalize(vec3(sin(fov) * current_uv.x, sin(fov) * current_uv.y, -cos(fov))));
            ro = pos;
        }

        // mainImage is the entry point for the fragment shader in postprocessing.Effect
        // It receives the input color (from previous pass, not used here), UV coordinates, and outputs the final color.
        void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
            // Re-derive fragCoord-like UVs for the original shader's logic
            vec2 fragCoord_like_uv = uv * iResolution.xy;

            vec2 processed_uv = fragCoord_like_uv.xy / iResolution.xy;
            processed_uv = (processed_uv * 2.0 - 1.0); // Normalize UVs to -1 to 1 range
            processed_uv.x *= iResolution.x / iResolution.y; // Apply aspect ratio correction

            camera(processed_uv); // Calculate camera rays based on time/mouse
            float hit = intersect(); // Perform ray marching to find intersection with the scene
            vec3 p = ro + hit * rd; // Calculate the hit point

            vec3 n = localNormal(p); // Compute the normal at the hit point
            float depth = distance(ro, p)/MAX_DIST; // Calculate depth for shading

            // I've mostly just copied and pasted Evan's code.
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // Compute curvature
            vec3 dx = dFdx(n);
            vec3 dy = dFdy(n);
            vec3 xneg = n - dx;
            vec3 xpos = n + dx;
            vec3 yneg = n - dy;
            vec3 ypos = n + dy;
            float curvature = (cross(xneg, xpos).y - cross(yneg, ypos).x) * 2.0 / (depth*5.);

            // Compute surface properties based on selected shading type
            #if CURVATURE
                vec3 light = vec3(0.0);
                vec3 ambient = vec3(curvature + 0.5);
                vec3 diffuse = vec3(0.0);
                vec3 specular = vec3(0.0);
                float shininess = 0.0;
            #elif METAL
                float corrosion = clamp(-curvature * 3.0, 0.0, 1.0);
                float shine = clamp(curvature * 5.0, 0.0, 1.0);
                vec3 light = normalize(vec3(0.0, 1.0, 10.0));
                vec3 ambient = vec3(0.15, 0.1, 0.1)*.5;
                vec3 diffuse = mix(mix(vec3(0.3, 0.25, 0.2), vec3(0.45, 0.5, 0.5), corrosion),
                vec3(0.5, 0.4, 0.3), shine) - ambient;
                vec3 specular = mix(vec3(0.0), vec3(1.0) - ambient - diffuse, shine);
                float shininess = 128.0;
            #elif RED_WAX
                float dirt = clamp(0.25 - curvature * 4.0, 0.0, 1.0);
                vec3 light = normalize(vec3(0.0, 1.0, 10.0));
                vec3 ambient = vec3(0.05, 0.015, 0.0);
                vec3 diffuse = mix(vec3(0.4, 0.15, 0.1), vec3(0.4, 0.3, 0.3), dirt) - ambient;
                vec3 specular = mix(vec3(0.15) - ambient, vec3(0.0), dirt);
                float shininess = 32.0;
            #endif
            
            // Compute final color using Phong-like illumination model
            float cosAngle = dot(n, light);
            outputColor.rgb = ambient +
            diffuse * max(0.0, cosAngle) +
            specular * pow(max(0.0, cosAngle), shininess);
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            
            // Post-processing and depth fading
            outputColor.rgb = pow(outputColor.rgb*1.5, vec3(.9));
            if(depth > 0.9) outputColor.rgb = vec3(.125); // Fade to dark at far distances
            outputColor.a = 1.; // Ensure full opacity
        }
      `,
      {
        blendFunction,
        // Define the uniforms that will be passed to the GLSL shader
        uniforms: new Map([
          ['iResolution', new Uniform(new Vector3())], // x, y for width/height, z often 1.0 for pixel ratio
          ['iTime', new Uniform(0.0)], // Current time in seconds
          ['iMouse', new Uniform(new Vector4())] // Mouse X, Y coordinates and click state (z for button down)
        ])
      }
    );
  }

  /**
   * The current time in seconds, managed by the effect's update loop.
   * You can get this value but typically don't need to set it manually.
   *
   * @type {number}
   */
  get iTime(): number {
    return this.uniforms.get('iTime')!.value;
  }

  set iTime(value: number) {
    this.uniforms.get('iTime')!.value = value;
  }

  /**
   * The resolution of the rendering target, managed by the effect's update loop.
   * You can get this value but typically don't need to set it manually.
   *
   * @type {Vector3}
   */
  get iResolution(): Vector3 {
    return this.uniforms.get('iResolution')!.value as Vector3;
  }

  set iResolution(value: Vector3) {
    this.uniforms.get('iResolution')!.value = value;
  }

  /**
   * The mouse input uniform.
   * Use this to set the mouse coordinates and click state if you want to enable
   * interactive camera movement.
   *
   * The Vector4 should be structured as:
   * x: mouse X coordinate (pixel)
   * y: mouse Y coordinate (pixel)
   * z: 1.0 if mouse button is pressed, 0.0 otherwise
   * w: 1.0 if mouse button was pressed, 0.0 otherwise (for a "last click" state, though not used in this specific shader)
   *
   * @type {Vector4}
   */
  get iMouse(): Vector4 {
    return this.uniforms.get('iMouse')!.value as Vector4;
  }

  set iMouse(value: Vector4) {
    this.uniforms.get('iMouse')!.value = value;
  }

  /**
   * Updates the effect's uniforms for time and resolution.
   * This method is called automatically by the `EffectComposer`.
   *
   * @param {WebGLRenderer} renderer - The Three.js WebGLRenderer instance.
   * @param {WebGLRenderTarget} inputBuffer - The input render target (usually the scene render).
   * @param {number} deltaTime - The time elapsed since the last frame in seconds.
   */
  update(renderer: THREE.WebGLRenderer, inputBuffer: THREE.WebGLRenderTarget, deltaTime: number): void {
    // Accumulate time for the shader's iTime uniform
    this.iTime += deltaTime;

    // Update iResolution with the current renderer size
    const size = new Vector2();
    renderer.getSize(size);
    // Set iResolution.x to width, iResolution.y to height, and iResolution.z (pixel ratio) to 1.0
    // The shader primarily uses x and y, but a Vector3 is common for iResolution in Shadertoy.
    this.iResolution.set(size.x, size.y, 1.0);
  }
}
