#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(process.argv[2]||'.');const p=path.join(root,'SKILL.md');let errors=[];
if(!fs.existsSync(p)){errors.push('Missing SKILL.md');}
else {const t=fs.readFileSync(p,'utf8');if(!/^---\r?\nname: motion-graphics-director\r?\ndescription: .+\r?\n/m.test(t))errors.push('Invalid metadata');}
for(const f of ['scripts/analyze_video.mjs','references/reference-tiktok-breakdown.md','assets/examples/ai-business-builder-35s.md','assets/remotion/MotionComponents.tsx'])if(!fs.existsSync(path.join(root,f)))errors.push('Missing '+f);
console.log(JSON.stringify({root,errors},null,2));process.exit(errors.length?1:0);
