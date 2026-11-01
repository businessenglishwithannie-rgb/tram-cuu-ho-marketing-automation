# Reference MP4 analysis protocol

1. Run ffprobe: duration, resolution, average FPS, audio streams.
2. Sample at 2 FPS for an index with `node scripts/analyze_video.mjs`.
3. Inspect the actual visual media; increase to 10–30 FPS in high-motion transitions. Never call 2 FPS samples "every frame".
4. For each beat record start/end (seconds and frame index), moving objects, background/camera, typography, composition, masks, path animation, start/stop easing, and audio cues.
5. Use labels **OBSERVED** for visible/audible evidence, **INFERRED** for likely method, **PROPOSED** for original reproduction.
6. Identify object continuity: scene transition wipes vs shared objects vs cuts. Note exact on-screen content without claiming to know the hidden source code.
7. Deliver an evidence-backed timeline, motion DNA, storyboard and faithful technical plan.
8. Reference media is third-party content and may be copyright protected: re-create techniques with original creative, not source footage/music/logo.
