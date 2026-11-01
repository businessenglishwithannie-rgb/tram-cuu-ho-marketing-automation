import React from "react";
import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

const clamp = {extrapolateLeft:"clamp" as const, extrapolateRight:"clamp" as const};
export function PopCard({start=0,children}:{start?:number;children:React.ReactNode}) {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const k=spring({frame:frame-start,fps,config:{damping:18,stiffness:145}});
  return <div style={{opacity:Math.max(0,Math.min(1,k)),transform:`scale(${0.82+0.18*k}) translateY(${(1-k)*28}px)`}}>{children}</div>;
}
export function TypedText({text,start=0,duration=30}:{text:string;start?:number;duration?:number}) {
  const f=useCurrentFrame(); const p=interpolate(f,[start,start+duration],[0,1],clamp);
  const n=Math.max(0,Math.min(text.length,Math.floor(p*text.length)));
  return <span>{text.slice(0,n)}<span style={{opacity:Math.floor(f/10)%2===0?1:0}}>▍</span></span>;
}
export function DrawConnector({path,start=0,duration=24,color="#04b7b1",width=7}:{path:string;start?:number;duration?:number;color?:string;width?:number}) {
  const f=useCurrentFrame(); const p=interpolate(f,[start,start+duration],[0,1],clamp);
  return <svg viewBox="0 0 1080 1920" style={{position:"absolute",inset:0,width:"100%",height:"100%",overflow:"visible"}}><path d={path} pathLength={100} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray="100" strokeDashoffset={100*(1-p)}/></svg>;
}
export function AnimatedBar({value,max,start=0,width=65,height=500}:{value:number;max:number;start?:number;width?:number;height?:number}) {
  const f=useCurrentFrame(); const p=interpolate(f,[start,start+30],[0,1],clamp); const h=Math.max(0,(value/max)*height*p);
  return <div style={{position:"relative",height,width,display:"flex",alignItems:"flex-end"}}><div style={{width:"100%",height:h,background:"#00b9b4",borderRadius:"12px 12px 0 0"}}/></div>;
}
export function KineticWords({words,start=0}:{words:string[];start?:number}) {
  const f=useCurrentFrame(); return <div style={{display:"flex",flexWrap:"wrap",gap:14}}>{words.map((w,i)=>{const p=interpolate(f,[start+i*5,start+i*5+10],[0,1],clamp);return <span key={i} style={{opacity:p,transform:`translateY(${(1-p)*28}px) scale(${0.86+0.14*p})`,display:"inline-block",fontWeight:900}}>{w}</span>})}</div>;
}
