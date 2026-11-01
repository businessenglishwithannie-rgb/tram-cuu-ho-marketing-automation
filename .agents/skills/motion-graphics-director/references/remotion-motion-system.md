# Remotion Motion System

Default vertical composition: 1080x1920, 30 FPS. Fonts: Lato (if available), sans-serif fallback.

Use `spring({frame: frame-start, fps, config:{damping:18, stiffness:150}})` for icon/card entrance.
Use `interpolate(frame, [a,b],[v0,v1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})` for controlled timing.
For per-word kinetic type, stagger child words by 3–6 frames; use y, scale and opacity on each word, not the entire poster.
For typed input, use `text.slice(0, Math.floor(progress*text.length))` with a blinking cursor.
For draw-on connectors, SVG path with fixed pathLength and `strokeDasharray`/`strokeDashoffset`; animate offset toward 0.
For animated bars, keep x/width fixed and animate `height` and `y` together; labels appear after bar rise.
For transitions, animate a full-frame diagonal SVG shape, shared object or match cut, not a universal fade after every scene.
Use deterministic particle positions instead of uncontrolled Math.random in render.
Separate data/timing from presentation components; all important objects should be editable. Keep text in safe zones for mobile UI.
