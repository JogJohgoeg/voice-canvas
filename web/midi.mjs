// Standard MIDI Files type 0/1 with PPQ timing, tempo maps and running status.
export function readMidi(buffer){
 const b=new Uint8Array(buffer);if(b.length>8_000_000)throw Error('MIDI file exceeds 8 MB');const v=new DataView(b.buffer,b.byteOffset,b.byteLength);let p=0,order=0;const raw=[];
 function need(n){if(p+n>b.length)throw Error('Truncated MIDI file')}
 function u16(){need(2);const n=v.getUint16(p);p+=2;return n}function u32(){need(4);const n=v.getUint32(p);p+=4;return n}function text(){need(4);const s=String.fromCharCode(...b.slice(p,p+4));p+=4;return s}
 function vlq(){let n=0;for(let k=0;k<4;k++){need(1);const c=b[p++];n=n*128+(c&127);if(!(c&128))return n;}throw Error('Invalid MIDI delta')}
 if(text()!=='MThd')throw Error('Not a Standard MIDI File');const size=u32(),format=u16(),tracks=u16(),division=u16();if(size<6||format>1||!division||(division&32768))throw Error('Use type 0/1 MIDI with PPQ timing');p+=size-6;
 for(let track=0;track<tracks;track++){if(text()!=='MTrk')throw Error('Missing MIDI track');const length=u32(),end=p+length;need(length);let tick=0,running=0;
  while(p<end){tick+=vlq();need(1);let status=b[p];if(status<128){if(!running)throw Error('Invalid running status');status=running;}else p++;
   if(status===255){running=0;need(1);const kind=b[p++],len=vlq();need(len);if(kind===81&&len===3)raw.push({tick,tempo:b[p]*65536+b[p+1]*256+b[p+2],order:order++});p+=len;}
   else if(status===240||status===247){running=0;const len=vlq();need(len);p+=len;}
   else if(status>=128&&status<240){running=status;const len=[192,208].includes(status&240)?1:2;need(len);const data=[status,...b.slice(p,p+len)];if(data.slice(1).some(x=>x>=128))throw Error('Invalid MIDI data byte');p+=len;raw.push({tick,data,order:order++});}
   else throw Error('Unsupported MIDI status');if(p>end)throw Error('MIDI event exceeds track');if(raw.length>250000)throw Error('Too many MIDI events');
  }
 }
 raw.sort((a,b)=>a.tick-b.tick||a.order-b.order);let tempo=500000,tick=0,time=0;const events=[];for(const event of raw){time+=(event.tick-tick)*tempo/division/1e6;tick=event.tick;if(event.tempo){tempo=event.tempo;continue;}events.push({time,data:event.data});}
 return {events,duration:time,format,division};
}
export async function midiAccess(onMessage,onPorts){if(!navigator.requestMIDIAccess)throw Error('Web MIDI unavailable; use a MIDI file or audio input');const access=await navigator.requestMIDIAccess({sysex:false});const refresh=()=>{for(const port of access.inputs.values())port.onmidimessage=e=>onMessage([...e.data],e.timeStamp);onPorts([...access.inputs.values()].map(p=>({id:p.id,name:p.name,state:p.state})));};access.onstatechange=refresh;refresh();return ()=>{access.onstatechange=null;for(const port of access.inputs.values())port.onmidimessage=null;};}
