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
