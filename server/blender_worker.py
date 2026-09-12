"""Bounded offline EEVEE jobs. Imported by backend; also executed inside Blender."""
import hashlib
import json
import math
import os
from pathlib import Path
import queue
import random
import shutil
import subprocess
import sys
import threading
import time

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / 'blender_cache'
BLENDER = os.environ.get('VOICE_BLENDER') or shutil.which('blender') or ''
FFMPEG = os.environ.get('VOICE_FFMPEG') or shutil.which('ffmpeg') or ''


def specification(scene):
    style = scene.get('workStyle', {})
    colours = style.get('palette', ['#168eff', '#70ffe6'])
    if not isinstance(colours, list) or len(colours) != 2 or any(not isinstance(c,str) or len(c)!=7 or c[0]!='#' or any(x not in '0123456789abcdefABCDEF' for x in c[1:]) for c in colours):
        colours = ['#168eff', '#70ffe6']
    family = int(style.get('family', 1))
    objects=scene.get('objects',[])
    if isinstance(objects,list) and objects:
        subject=next((o for o in objects if isinstance(o,dict) and o.get('kind') not in ('star','moon')),objects[0])
        if isinstance(subject,dict):
            kind=subject.get('kind');family=0 if kind in ('sun','fire','heart') else 1 if kind in ('sea','rain','snow','fish','cloud') else 2 if kind in ('tree','mountain','house') else 3 if kind in ('star','moon') else 4
            tint=subject.get('tint')
            if isinstance(tint,str) and len(tint)==7 and tint[0]=='#' and all(c in '0123456789abcdefABCDEF' for c in tint[1:]):colours=[tint,tint]
    seed = int(scene.get('variation', {}).get('seed', 317)) % (2**32)
    mode='fusion' if scene.get('style')=='fusion' else 'moyers'
    if mode=='fusion':colours=['#e5b433' if seed%2 else '#2859cd','#657075']
    mood = scene.get('audioMood', {})
    return {'style':mode,'family':max(0,min(7,family)), 'palette':colours, 'seed':seed,
            'mood':{k:max(0,min(1,float(mood.get(k,0)))) for k in ('level','warmth')}}


def key_for(spec):
    return hashlib.sha256(json.dumps(([spec['style']] if spec.get('style')=='fusion' else [])+[spec['family'],spec['palette'],spec['seed']],sort_keys=True).encode()).hexdigest()[:24]


class BlenderWorker:
    def __init__(self):
        self.jobs = queue.Queue(maxsize=8)
        self.pending = set()
        self.lock = threading.Lock()
        self.status = 'idle'
        self.available = bool(BLENDER and FFMPEG) and Path(BLENDER).is_file() and Path(FFMPEG).is_file()
        if self.available:
            CACHE.mkdir(exist_ok=True)
            threading.Thread(target=self.run,daemon=True).start()
    def request(self, scene):
        spec = specification(scene); key = key_for(spec)
        path = CACHE / key / 'manifest.json'
        if path.exists():
            return json.loads(path.read_text())
        if not self.available:
            return {'status':'unavailable'}
        failure = CACHE / key / 'failure.json'
        if failure.exists() and time.time()-failure.stat().st_mtime<60:
            return {'status':'cooldown','key':key}
        with self.lock:
            if key not in self.pending:
                try:
                    self.jobs.put_nowait((key,spec));self.pending.add(key)
                except queue.Full:
                    return {'status':'busy'}
        # Any already-warmed matching family can play while this exact seed renders.
        for manifest in CACHE.glob('*/manifest.json'):
            data=json.loads(manifest.read_text())
            if data['spec']['family']==spec['family'] and data['spec'].get('style','moyers')==spec['style']:
                return {**data,'approximate':True,'requested_key':key}
        return {'status':'queued','key':key}
    def prewarm(self):
        for family in (1,4):self.request({'style':'fusion','workStyle':{'family':family}})
        for family in range(6):
            palette=['#e63832','#ffe1a0'] if family==0 else ['#bbc3ce','#f3eee2'] if family==2 else ['#168eff','#70ffe6']
            self.request({'workStyle':{'family':family,'palette':palette}})
    def run(self):
        while True:
            key,spec=self.jobs.get();start=time.monotonic();folder=CACHE/key;folder.mkdir(exist_ok=True)
            (folder/'job.json').write_text(json.dumps(spec));self.status='rendering'
            try:
                with (folder/'render.log').open('w') as log:
                    proc=subprocess.Popen([BLENDER,'-b','--python-exit-code','1','-t','2','-P',str(Path(__file__).resolve()),'--',str(folder)],stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
                    try:
                        code=proc.wait(timeout=27)
                    except subprocess.TimeoutExpired:
                        proc.kill();proc.wait();raise TimeoutError('27s render budget')
                    if code: raise RuntimeError('Blender exit '+str(code))
                    subprocess.run([FFMPEG,'-y','-loglevel','error','-framerate','24','-i',str(folder/'frame_%04d.png'),'-c:v','libvpx-vp9','-deadline','realtime','-cpu-used','8','-b:v','1200k','-pix_fmt','yuv420p','-an',str(folder/'loop.webm')],stdout=log,stderr=log,check=True,timeout=max(.2,30-(time.monotonic()-start)))
                data={'status':'ready','key':key,'url':'/blender_cache/'+key+'/loop.webm','spec':spec,'render_ms':round((time.monotonic()-start)*1000),'frames':48,'fps':24,'width':960,'height':540}
                temporary=folder/'manifest.tmp';temporary.write_text(json.dumps(data));temporary.replace(folder/'manifest.json')
                for frame in folder.glob('frame_*.png'):frame.unlink()
                self.status='ready'
                failure=folder/'failure.json'
                if failure.exists():failure.unlink()
                completed=sorted(CACHE.glob('*/manifest.json'),key=lambda p:p.stat().st_mtime)
                for old in completed[:-64]:shutil.rmtree(old.parent)
            except Exception as error:
                self.status=type(error).__name__
                (folder/'failure.json').write_text(json.dumps({'error':str(error),'elapsed_ms':round((time.monotonic()-start)*1000)}))
                for frame in folder.glob('frame_*.png'):frame.unlink()
            finally:
                with self.lock:self.pending.discard(key)
                self.jobs.task_done()


def render(folder):
    import bpy
    from mathutils import Vector
    spec=json.loads((folder/'job.json').read_text());rng=random.Random(spec['seed']);family=spec['family'];fusion=spec.get('style')=='fusion'
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE';scene.render.resolution_x=960;scene.render.resolution_y=540;scene.render.resolution_percentage=100
    scene.eevee.taa_render_samples=4;scene.eevee.volumetric_samples=8;scene.eevee.volumetric_tile_size='16';scene.render.image_settings.file_format='PNG';scene.render.fps=24
    scene.world.use_nodes=True;scene.world.node_tree.nodes.get('Background').inputs['Color'].default_value=(0,0,0,1);scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=0;scene.view_settings.view_transform='Standard'
    # Native mesh point-cloud: mirrored octahedra share one mesh and two emission materials.
    vertices=[];faces=[];indices=[]
    for i in range(1300):
        u=rng.random()*math.tau;v=rng.random();radius=.5+.25*math.sin(u*5)*math.sin(v*9)
        x=abs(math.sin(u))*radius;y=(v-.5)*.6;z=math.cos(u)*radius*1.6
        if family==1:z=(v-.5)*2.3;x=.15+abs(math.sin(u))*(.15+v*.5)
        elif family==2:x=rng.random()*.9;z=(v-.5)*2+.15*math.sin(x*20+v*9)
        elif family==3:x*=1.7;z*=1.3;y*=2
        elif family==4:x*=.7;z*=.7
        elif family==5:x=.5*abs(math.sin(u*3));z=.9*math.sin(u*2+v*.3)
        size=.005+rng.random()*.009
        for sign in (-1,1):
            base=len(vertices)
            if fusion:
                angle=u+math.sin(v*13)*.3;tx,tz=math.cos(angle),-math.sin(angle);nx,nz=-tz,tx
                for j in range(5):
                    along=(j/4-.5)*size*6;bend=(1-(j/2-1)**2)*size*1.2
                    for edge in (-1,1):
                        across=bend+edge*size*(.3+.3*math.sin(j*math.pi/4))
                        vertices.append((sign*(x*.72+tx*along+nx*across),y,z*.72+tz*along+nz*across))
                for j in range(4):
                    a=base+j*2;faces.extend([(a,a+1,a+2),(a+1,a+3,a+2)]);indices.extend([i%7==0]*2)
            else:
                vertices.extend([(sign*x+dx*size,y+dy*size,z+dz*size) for dx,dy,dz in [(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]])
                for a,b,c in [(0,2,4),(2,1,4),(1,3,4),(3,0,4),(2,0,5),(1,2,5),(3,1,5),(0,3,5)]:faces.append((base+a,base+b,base+c));indices.append(i%5==0)
    mesh=bpy.data.meshes.new('Mirrored point cloud');mesh.from_pydata(vertices,[],faces);mesh.update();obj=bpy.data.objects.new('Organic field',mesh);scene.collection.objects.link(obj)
    for material_index,colour in enumerate(['#657075',spec['palette'][0]] if fusion else spec['palette']):
        material=bpy.data.materials.new(colour);material.use_nodes=True;nodes=material.node_tree.nodes;nodes.clear();output=nodes.new('ShaderNodeOutputMaterial');emit=nodes.new('ShaderNodeEmission');emit.inputs[0].default_value=tuple((int(colour[k:k+2],16)/255)**2.2 for k in (1,3,5))+(1,);emit.inputs[1].default_value=2.5;emit.inputs[1].default_value=1.5+spec['mood']['warmth'];material.node_tree.links.new(emit.outputs[0],output.inputs[0]);mesh.materials.append(material)
        if fusion:
            emit.inputs[1].default_value=.25 if material_index==0 else 2.3
            noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=85
            ramp=nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.3;ramp.color_ramp.elements[0].color=(.001,.001,.001,1);ramp.color_ramp.elements[1].position=.65;ramp.color_ramp.elements[1].color=emit.inputs[0].default_value
            material.node_tree.links.new(noise.outputs['Fac'],ramp.inputs[0]);material.node_tree.links.new(ramp.outputs['Color'],emit.inputs[0])
    for poly,index in zip(mesh.polygons,indices):poly.material_index=int(index)
    bpy.ops.object.camera_add(location=(0,-6,0));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=5.2;scene.camera=camera
    # Gentle native volume with an area light; no world/ground plane.
    bpy.ops.mesh.primitive_cube_add(size=3);fog=bpy.context.object
    material=bpy.data.materials.new('Fog');material.use_nodes=True;nodes=material.node_tree.nodes;nodes.clear();output=nodes.new('ShaderNodeOutputMaterial');volume=nodes.new('ShaderNodeVolumePrincipled');volume.inputs['Density'].default_value=.045 if fusion else .025;volume.inputs['Color'].default_value=(.12,.14,.16,1) if fusion else (.5,.5,.5,1);material.node_tree.links.new(volume.outputs['Volume'],output.inputs['Volume']);fog.data.materials.append(material)
    bpy.ops.object.light_add(type='AREA',location=(0,-2,2));bpy.context.object.data.energy=35
    scene.compositing_node_group=bpy.data.node_groups.new('Bloom','CompositorNodeTree');tree=scene.compositing_node_group;nodes=tree.nodes;nodes.clear();layers=nodes.new('CompositorNodeRLayers');glare=nodes.new('CompositorNodeGlare');glare.inputs['Type'].default_value='Fog Glow';glare.inputs['Quality'].default_value='Low';glare.inputs['Threshold'].default_value=.03;glare.inputs['Strength'].default_value=1.4;tree.interface.new_socket(name='Image',in_out='OUTPUT',socket_type='NodeSocketColor');out=nodes.new('NodeGroupOutput');tree.links.new(layers.outputs['Image'],glare.inputs['Image']);tree.links.new(glare.outputs['Image'],out.inputs['Image'])
    for frame in range(48):
        phase=math.tau*frame/48;breath=1+(.07+spec['mood']['level']*.08)*math.sin(phase);obj.scale=(breath,1,1+.04*math.cos(phase));obj.scale.y=1+.03*math.sin(phase)
        scene.render.filepath=str(folder/f'frame_{frame:04d}.png');bpy.ops.render.render(write_still=True)


if __name__=='__main__':
    render(Path(sys.argv[sys.argv.index('--')+1]))
