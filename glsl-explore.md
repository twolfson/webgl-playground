Right now I'm exploring shaders via https://thebookofshaders.com/

and I want to record some of the shaders we're making

I've already lost some but here's the gists...

**Color changing canvas based on mouse position:**

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = u_mouse/u_resolution;
    gl_FragColor = vec4(st.x,st.y,0.0,1.0);
}
```

**Fading colored canvas based on mouse position:**

Unfortunately, this is a bit of a hack since we really should be tweaking alpha

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution * u_mouse/u_resolution;
    gl_FragColor = vec4(st.x,st.y,0.0,1.0);
}
```

**Alpha fading canvas based on mouse position:**

Unfortunately, this is a bit of a hack since we really should be tweaking alpha

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    // TODO: Should normalized mouse be another uniform?
    vec2 normalized_mouse = u_mouse/u_resolution;
    // Initially I was going with `dot` but `length` makes much more sense
    //   Although, it's [0, 1] + [0, 1] so we can hit sqrt(2)
    //   Definitely something is off but I'm pretty tired
    float alpha = length(normalized_mouse);
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
}
```

**Cross-hair like cursor:**

Unfortunately, this is a hack as well due to the colors always hitting their maximums at the mouse position. Would much rather proper cross hairs

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy/u_mouse;
    gl_FragColor = vec4(st.x,st.y,0.0,1.0);
}
```

**A better cross-hair with clipping:**

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    float step_x = step(u_mouse.x, gl_FragCoord.x);
    float step_y = step(u_mouse.y, gl_FragCoord.y);
    gl_FragColor = vec4(step_x, step_y, 0.0, 1.0);
}
```

**An even better cross-hair with hard lines:**

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    // Find the distance between the mouse and the fragment position
    // If it's under 1.0, then render this color. Otherwise, render black
    float step_x = step(abs(u_mouse.x - gl_FragCoord.x), 1.0);
    float step_y = step(abs(u_mouse.y - gl_FragCoord.y), 1.0);
    gl_FragColor = vec4(step_x, step_y, 0.0, 1.0);
}
```

**Understanding smoothstep add/subtract:**

We have 2 functions which clip at 0 and 1. One which increases from 0 to 1 and one that drops from 1 to 0:

```glsl
0 + smoothstep(0.2,0.5,st.x)
1 - smoothstep(0.5,0.8,st.x)
```

When we swap the "1" with the dynamic smooth step, we get a transition that is parabola-like

```glsl
smoothstep(0.2,0.5,st.x) - smoothstep(0.5,0.8,st.x)
```

**Single color cross-hair:**

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    // Find the distance between the mouse and the fragment position
    float x_epsilon = u_mouse.x - gl_FragCoord.x;
    // Example: distance(30 - 20) -> 10
    // If the distance is in our threshold, flag it as 1.0
    // Example: 10.0 > 1.0 -> 1.0 -> 0.0
    // Example: 0.0 > 1.0 -> 0.0 -> 1.0
    float show_x = 1.0 - step(1.0, abs(x_epsilon));
    float y_epsilon = u_mouse.y - gl_FragCoord.y;
    float show_y = 1.0 - step(1.0, abs(y_epsilon));
    float red = max(show_x, show_y);
    gl_FragColor = vec4(red, 0.0, 0.0, 1.0);
}
```

**Time-based color blending:**

```glsl
#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 colorA = vec3(0.162,0.162,0.975);
vec3 colorB = vec3(1.000,0.570,0.244);

void main() {
    // Resolve the normalized [0,1] position of the pixel
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    // Build our [0, 0, 0] default for colors
    vec3 color = vec3(0.0);

    // Determine how much of each color to use at our point
    // At time 0: Range is from x = 0.0 to 0.5
    // At time n: Range is from x = 0.5 to 1.0
    float pct = st.x/2.0 + abs(sin(u_time*PI/4.0))/2.0;

    // Blend our colors based on percentage
    // At time 0: 100% A to 50% A/B
    // At time n: 50% A/B to 100% B
    color = mix(colorA, colorB, pct);

    // Render our colors
    gl_FragColor = vec4(color,1.0);
}
```

**Hard-striped rainbow:**

```glsl
#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 colorR = vec3(1.0, 0.0, 0.0);
vec3 colorG = vec3(0.0, 1.0, 0.0);
vec3 colorB = vec3(0.0, 0.0, 1.0);

void main() {
    // Resolve the normalized [0,1] position of the pixel
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    // Build our [0, 0, 0] default for colors
    vec3 color = vec3(0.0);

    // Determine how much of each color to use at our point
    // r = Between 0 and 1/3, 1.0; Otherwise, 0.0
    float pct_r = step(0.0/3.0, st.x) - step(1.0/3.0, st.x);
    float pct_g = step(1.0/3.0, st.x) - step(2.0/3.0, st.x);
    float pct_b = step(2.0/3.0, st.x) - step(3.0/3.0, st.x);

    // Blend our colors based on percentage
    // rgb = r*100% + g*0% + b*0%
    color = mix(color, color + colorR, pct_r);
    color = mix(color, color + colorG, pct_g);
    color = mix(color, color + colorB, pct_b);

    // Render our colors
    gl_FragColor = vec4(color,1.0);
}
```

**Smoothed rainbow:**

Not feeling great about this, it's more like split bands than a nice blend

I think the issue is I'm trying to do exclusive RGB while rainbows have yellow and such

```glsl
#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 colorR = vec3(1.0, 0.0, 0.0);
vec3 colorG = vec3(0.0, 1.0, 0.0);
vec3 colorB = vec3(0.0, 0.0, 1.0);

void main() {
    // Resolve the normalized [0,1] position of the pixel
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    // Build our [0, 0, 0] default for colors
    vec3 color = vec3(0.0);

    // Determine how much of each color to use at our point
    // r = Fading out from 1.0 to 0.0 between 0 and 3/6
    // g = Fading in from 0.0 to 1.0 between 1/6 and 4/6 and out from
    float pct_r = 1.0 - smoothstep(0.0/3.0, 1.0/4.0, st.x);
    float pct_g = smoothstep(1.0/4.0, 2.0/4.0, st.x) - smoothstep(2.0/4.0, 3.0/4.0, st.x);
    float pct_b = smoothstep(3.0/4.0, 4.0/4.0, st.x) - 0.0;

    // Blend our colors based on percentage
    // rgb = r*100% + g*0% + b*0%
    color = mix(color, color + colorR, pct_r);
    color = mix(color, color + colorG, pct_g);
    color = mix(color, color + colorB, pct_b);

    // Render our colors
    gl_FragColor = vec4(color,1.0);
}
```

Tweaked with scales and it's much better now:

```glsl
    float pct_r = 1.0 - smoothstep(0.0/3.0, 4.184/4.0, st.x);
    float pct_g = smoothstep(0.200/4.0, 2.136/4.0, st.x) - smoothstep(1.832/4.0, 4.384/4.0, st.x);
    float pct_b = smoothstep(1.768/4.0, 4.0/4.0, st.x) - 0.0;
```

**Attempting to expand HSB angle range:**

I'm getting really frustrated at not being able to introspect values to debug them

Definitely need to find a debugging mechanism soon

This code is broken

```glsl
#ifdef GL_ES
precision mediump float;
#endif

#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform float u_time;

//  Function from Iñigo Quiles
//  https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix( vec3(1.0), rgb, c.y);
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(0.0);

    // Use polar coordinates instead of cartesian
    vec2 toCenter = vec2(0.5)-st;
    float angle = atan(toCenter.y,toCenter.x)/TWO_PI/2.0;
    float radius = length(toCenter)*2.0;

    // Map the angle (-PI to PI) to the Hue (from 0 to 1)
    // and the Saturation to the radius
    color = hsb2rgb(vec3(angle,radius,1.0));

    gl_FragColor = vec4(color,1.0);
}
```

**Expanded HSB angle range:**

After re-reading preferred debugging routes, went with the simple "output as fragment color"

This helped me understand the value of "angle" much more accurately with an eager

```glsl
float angle = atan(toCenter.y,toCenter.x)/TWO_PI + 0.5;
gl_FragColor = vec4(vec3(angle), 1.0);
return;
```

After getting that visualization, it was easy to tweak the angle range to expand our colors

```glsl
#ifdef GL_ES
precision mediump float;
#endif

#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform float u_time;

//  Function from Iñigo Quiles
//  https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix( vec3(1.0), rgb, c.y);
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(0.0);

    // Use polar coordinates instead of cartesian
    vec2 toCenter = vec2(0.5)-st;
    float angle = atan(toCenter.y,toCenter.x)/TWO_PI + 0.5;
    angle = pow(angle, 8.0);
    float radius = length(toCenter)*2.0;

    // Map the angle (-PI to PI) to the Hue (from 0 to 1)
    // and the Saturation to the radius
    color = hsb2rgb(vec3(angle,radius,1.0));

    gl_FragColor = vec4(color,1.0);
}
```

**Resizing a rectangle:**

```glsl
// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

    // bottom-left
    // Resize via vector for bottom/left bound
    vec2 bl = step(vec2(0.180,0.150),st);
    float pct = bl.x * bl.y;

    // top-right
    // Resize via vector for top/right bound
    vec2 tr = step(vec2(0.180,0.370),1.0-st);
    pct *= tr.x * tr.y;

    color = vec3(pct);

    gl_FragColor = vec4(color,1.0);
}
```

**Resizing a rectangle via floor:**

```glsl
// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

    // bottom-left
    // Resize via vector for bottom/left bound
    vec2 bl = floor(st*10.0);
    float pct = bl.x * bl.y;

    // top-right
    // Resize via vector for top/right bound
    vec2 tr = floor((1.0-st)*10.0);
    pct *= tr.x * tr.y;

    color = vec3(pct);

    gl_FragColor = vec4(color,1.0);
}
```

**Attempting to draw a floating rectangle:**

```glsl
// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);
    float pct = 1.0;

    // bottom-left
    vec2 blo = step(vec2(0.1),st);
    vec2 bli = step(vec2(0.2),st);
    pct = 1.0 - ((blo.x * blo.y) - (bli.x * bli.y));

    // top-right
    vec2 tro = step(vec2(0.1),1.0-st);
    vec2 tri = step(vec2(0.2),1.0-st);
    pct *= 1.0 - ((tro.x * tro.y) - (tri.x * tri.y));

    color = vec3(pct);

    gl_FragColor = vec4(color,1.0);
}
```

I think the issue is we are doing subtraction on the non-final result so we need to subtract 2 rectangles from another

Tried that out but noope

```glsl
// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);
    float pct = 1.0;

    // bottom-left
    vec2 blo = step(vec2(0.260,0.420),st);
    vec2 bli = step(vec2(0.110,0.200),st);

    // top-right
    vec2 tro = step(vec2(0.130,0.160),1.0-st);
    vec2 tri = step(vec2(0.380,0.310),1.0-st);

    // Calculate what to draw
    pct = 1.0 - (bli.x * bli.y * tri.x * tri.y) - (blo.x * blo.y * tro.x * tro.y);

    color = vec3(pct);

    gl_FragColor = vec4(color,1.0);
}
```

However, that's clearly a union of 2 rectangles

And the non-"1.0" is the intersection

So we can our 2 corners and intersect with their square. Then boom, done. Floating rectangle.

... was getting close but kept on getting quelched. Found this via trial/error/realization though...

Really confused why the parens make it work. Maybe floats are capped in GLSL?

```glsl
// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);
    float pct = 1.0;

    // bottom-left
    vec2 blo = step(vec2(0.1),st);
    vec2 bli = step(vec2(0.2),st);

    // top-right
    vec2 tro = step(vec2(0.3),1.0-st);
    vec2 tri = step(vec2(0.4),1.0-st);
    pct =
        1.0 -
        ((blo.x*blo.y*tro.x*tro.y) -
        (bli.x*bli.y*tri.x*tri.y))

        // (1.0 - ((blo.x * blo.y) - (bli.x * bli.y)) *
        //  1.0 - ((tro.x * tro.y) - (tri.x * tri.y)))
        ;

    color = vec3(pct);

    gl_FragColor = vec4(color,1.0);
}
```

Fixed it up, this makes sense now. It's the damn capped values that are throwing me. Maybe I should work in 1/10 greyscale...

To rephrase it:

- Draw an inner rectangle and an outer rectangle
- Intersect them via subtraction. This intersection is in white (1.0) and the rest is black
- Invert it via `1.0 - x` to get the intersection in black

```glsl
// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);
    float pct = 1.0;

    // bottom-left
    vec2 blo = step(vec2(0.1),st);
    vec2 bli = step(vec2(0.2),st);

    // top-right
    vec2 tro = step(vec2(0.3),1.0-st);
    vec2 tri = step(vec2(0.4),1.0-st);
    pct =
        1.0 - (
            (blo.x*blo.y*tro.x*tro.y) -
            (bli.x*bli.y*tri.x*tri.y)
        );

    color = vec3(pct);

    gl_FragColor = vec4(color,1.0);
}
```

- Intersection: A - B
    - Stays in range: [0, 1] - [0, 1] -> [0, 1]
- Union: A * B
    - Stays in range: [0, 1] * [0, 1] -> [0, 1]
- Not/Invert: 1.0 - A
    - Stays in range: [0, 1] * [0, 1] -> [0, 1]

^ These are the fundamental operations of Boolean algebra. We can find the rest of the Boolean operations from this:

- A not B: A intersecting not B
- B not A: B intersecting not A
- A XOR B
    - Strategy 1: (A union B) not (A intersect B)

Let's demo this in shaders...

Ugh, nvm. I'm wrong but close...

- AND/Intersection: A * B
    - Example: 1.0 intersecting 0.0 = 0.0
    - Example: 0.0 intersecting 0.0 = 0.0
    - Example: 1.0 intersecting 1.0 = 1.0
- NOT/Invert: 1.0 - A
    - Example: Invert 1.0 = 0.0
    - Example: Invert 0.0 = 1.0
- A not B: ~~A - B~~ (use boolean logic instead, maybe `step`)
    - Example: 1.0 not 0.0 =  0.0
    - Example: 1.0 not 1.0 =  0.0
    - Example: 0.0 not 1.0 = -1.0 // Ugh, out of range...
- OR/Union: ~~A + B~~ `max(A, B)`
    - Example: 1.0 union 0.0 = 1.0
    - Example: 0.0 union 0.0 = 0.0
    - Example: 1.0 union 1.0 = 1.0
        - Range issues for `+` here; 1.0 + 1.0 = 2.0
    - Another solution: (A + B)/(A + B) since this normalizes the range
        - 2.0/2.0 -> 1.0
        - 0.0/0.0 -> 0.0 in glsl

Oh, there's boolean operators... wtf...

Maybe there's a performance concern but I'd imagine `max` is slower

Sooo demos:

```glsl
// 2 partially exclusive rectangles
vec2 blo = step(vec2(0.1),st);
vec2 bli = step(vec2(0.2),st);
vec2 tro = step(vec2(0.5),1.0-st);
vec2 tri = step(vec2(0.4),1.0-st);
```

- AND
    ```glsl
    pct = (blo.x*blo.y*tro.x*tro.y) *
        (bli.x*bli.y*tri.x*tri.y);
    ```
- NOT
    ```glsl
    pct = 1.0 - (blo.x*blo.y*tro.x*tro.y);
    ```
- OR
    ```glsl
    pct = (blo.x*blo.y*tro.x*tro.y) + (bli.x*bli.y*tri.x*tri.y);
    pct /= pct;
    ```

Now for the complex versions:

- A - B: A AND NOT B
    ```glsl
    pct = (
        (blo.x*blo.y*tro.x*tro.y)
    ) * (
        1.0 - (bli.x*bli.y*tri.x*tri.y)
    );
    ```
- A XOR B: Strategy 1: (A union B) not (A intersect B); (A OR B) - (A AND B)
    ```glsl
    pct = (blo.x*blo.y*tro.x*tro.y) + (bli.x*bli.y*tri.x*tri.y);
    pct /= pct;
    pct -= (blo.x*blo.y*tro.x*tro.y) *
        (bli.x*bli.y*tri.x*tri.y);
    ```

Yep, everything looks fantastic. It's a little hard to visualize in my head still (especially the 1-D equivalents of these going up to their 2-D counterparts) but I think it all comes with practice

**Proper floating rectangle:**

This one stays in the 0.0 to 1.0 bounds :tada:

```glsl
// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);
    float pct = 1.0;

    // bottom-left
    vec2 blo = step(vec2(0.2),st);
    vec2 bli = step(vec2(0.3),st);

    // top-right
    vec2 tro = step(vec2(0.2),1.0-st);
    vec2 tri = step(vec2(0.3),1.0-st);
    pct = 1.0 - (
        (blo.x*blo.y*tro.x*tro.y)
    ) * (
        1.0 - (bli.x*bli.y*tri.x*tri.y)
    );

    color = vec3(pct);

    gl_FragColor = vec4(color,1.0);
}
```

**Functional floating rectangle:**

```glsl
// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float drawRect(in vec2 st, in float borderWidth, in vec2 blVec2, in vec2 trVec2) {
    // bottom-left
    vec2 blo = step(blVec2,st);
    vec2 bli = step(blVec2 + borderWidth,st);

    // top-right
    vec2 tro = step(trVec2,1.0-st);
    vec2 tri = step(trVec2 + borderWidth,1.0-st);
    float pct = 1.0 - (
        (blo.x*blo.y*tro.x*tro.y)
    ) * (
        1.0 - (bli.x*bli.y*tri.x*tri.y)
    );
    return pct;
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    float pct = drawRect(st, 0.1, vec2(0.1), vec2(0.3));
    vec3 color = vec3(pct);

    gl_FragColor = vec4(color,1.0);
}
```
