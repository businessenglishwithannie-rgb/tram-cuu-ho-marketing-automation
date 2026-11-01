#!/usr/bin/env node
// Node 18+, ffmpeg and ffprobe. Frame samples are NOT every source frame.
import fs from 'node:fs'; import path from 'node:path'; import {spawnSync} from 'node:child_process';
const a=process.argv.slice(2); if(a.length<2){console.error('Usage: node scripts/analyze_video.mjs input.mp4 outdir --fps 2');process.exit(2);}
const source=path.resolve(a[0]), out=path.resolve(a[1]); const ix=a.indexOf('--fps'); const fps=ix>=0?Number(a[ix+1]):2;
if(!fs.existsSync(source) || !(fps>0&&fps<=60)){console.error('Missing video or invalid FPS');process.exit(2);}
function run(bin,args){const r=spawnSync(bin,args,{encoding:'utf8',maxBuffer:32*1024*1024});if(r.error||r.status!==0){console.error(r.stderr||r.error?.message);process.exit(1);}return r.stdout;}
const metadata=JSON.parse(run('ffprobe',['-v','quiet','-show_entries','format=duration:stream=codec_type,width,height,avg_frame_rate','-of','json',source]));
fs.mkdirSync(path.join(out,'frames'),{recursive:true});
run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',source,'-vf',`fps=${fps}`,'-q:v','4',path.join(out,'frames','frame_%05d.jpg')]);
const names=fs.readdirSync(path.join(out,'frames')).filter(s=>s.endsWith('.jpg')).sort();
fs.writeFileSync(path.join(out,'metadata.json'),JSON.stringify({source:path.basename(source),metadata,sample_fps:fps,sample_count:names.length,note:'Sampling, not all original frames'},null,2));
const rows=names.map((n,i)=>`<figure><img src="frames/${n}"><figcaption>${(i/fps).toFixed(2)}s</figcaption></figure>`).join('');
fs.writeFileSync(path.join(out,'contact_sheet.html'),`<!doctype html><meta charset="utf-8"><style>body{background:#132029;color:white;font:16px Arial}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}img{width:100%;height:240px;object-fit:contain}figure{margin:0}</style><h2>Frame samples: ${path.basename(source)}</h2><div class="grid">${rows}</div>`);
fs.writeFileSync(path.join(out,'frame_index.csv'),'index,approx_seconds,filename\n'+names.map((n,i)=>`${i+1},${(i/fps).toFixed(3)},${n}`).join('\n'));
console.log(JSON.stringify({frames:names.length,fps,out},null,2));
