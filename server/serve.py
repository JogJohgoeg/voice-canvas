#!/usr/bin/env python3
"""Local-only voice canvas, bounded asynchronous GPT-6 HTML generation. No dependencies."""
import argparse
import ssl
from urllib.parse import urlsplit
import json
import re
from pathlib import Path
import threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = Path(__file__).resolve().parent.parent / 'web'
ALLOWED = {'127.0.0.1:8765', 'localhost:8765'}
SCHEME = 'http'
MODEL_SLOT = threading.BoundedSemaphore(1)

from repertoire_service import repertoire_midi
from backend import SceneBackend
BACKEND = SceneBackend()

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.mjs': 'text/javascript', '.js': 'text/javascript'}
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()
    def local_request(self):
        host = self.headers.get('Host', '')
        origin = self.headers.get('Origin')
        return host in ALLOWED and (not origin or origin == SCHEME+'://'+host)
    def reply(self, data, code=200):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def translate_path(self, path):
        if re.fullmatch(r'/blender_cache/[0-9a-f]{24}/loop\.webm', path):
            return str(ROOT.parent / path.lstrip('/'))
        return super().translate_path(path)
    def do_GET(self):
        if not self.local_request():
            self.reply({'error':'Local requests only'},403)
        elif re.fullmatch(r'/api/repertoire/[A-Za-z0-9_-]+',self.path):
            try:
                body=repertoire_midi(ROOT,self.path.rsplit('/',1)[1])
                self.send_response(200);self.send_header('Content-Type','audio/midi');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
            except Exception as error:
                self.reply({'error':str(error)},400)
        elif self.path == '/api/status':
            self.reply({'status': BACKEND.name, 'backend': BACKEND.name, 'process_id': BACKEND.proc.pid if BACKEND.proc and BACKEND.proc.poll() is None else None})
        elif self.path=='/repertoire/index.json' and (ROOT/'repertoire/local/index.json').is_file():
            self.path='/repertoire/local/index.json';super().do_GET()
        elif re.fullmatch(r'/repertoire/(?:[A-Za-z0-9_-]+/)*[A-Za-z0-9_.-]+\.(?:json|mid|midi)',self.path) and '..' not in self.path and (ROOT/self.path.lstrip('/')).resolve().is_relative_to((ROOT/'repertoire').resolve()):
            super().do_GET()
        elif re.fullmatch(r'/blender_cache/[0-9a-f]{24}/loop\.webm',self.path):
            super().do_GET()
        elif self.path.split('?')[0] in ('/','/index.html','/voice.html','/av_random.html','/piano.html','/piano_projector.html','/app.js','/parser.mjs','/renderer.mjs','/audio.mjs','/particles.mjs','/sound.mjs','/works.mjs','/blender.mjs','/monet.mjs','/cinematic.mjs','/performer.mjs','/av_patch.mjs'):
            super().do_GET()
        else:
            self.send_error(404)
    def do_POST(self):
        if not self.local_request():
            return self.reply({'error': 'Local requests only'},403)
        if self.path not in ('/api/scene','/api/blender','/api/section','/api/plugin'):
            return self.reply({'error':'Not found'},404)
        try:
            length = int(self.headers.get('Content-Length','0'))
            if not 0 < length <= 65536:
                raise ValueError('Invalid body length')
            self.connection.settimeout(5)
            data = json.loads(self.rfile.read(length))
            if self.path == '/api/blender':
                if not isinstance(data,dict) or not isinstance(data.get('scene'),dict):
                    raise ValueError('Invalid scene')
                return self.reply(BACKEND.blender_scene(data['scene']))
            if self.path == '/api/plugin':
                if not isinstance(data,dict) or not isinstance(data.get('prompt'),str) or not 0<len(data['prompt'])<=2000:
                    raise ValueError('Invalid plugin prompt')
                data={**data,'transcript':'','scene':{}}
            if self.path == '/api/section':
                if not isinstance(data,dict) or not isinstance(data.get('piece'),str) or not 0<len(data['piece'])<=300:
                    raise ValueError('Invalid piece name')
                data={**data,'transcript':'','scene':{}}
            if not isinstance(data, dict) or not isinstance(data.get('transcript'), str) or len(data['transcript']) > 4000 or not isinstance(data.get('scene'),dict):
                raise ValueError('Invalid transcript or scene')
        except (ValueError, TypeError, AttributeError, OverflowError, OSError):
            return self.reply({'error':'Invalid request'},400)
        if not MODEL_SLOT.acquire(blocking=False):
            return self.reply({'status':'模型忙；画布继续 / Model busy; canvas active'},429)
        self.send_response(200)
        self.send_header('Content-Type','application/x-ndjson; charset=utf-8')
        self.end_headers()
        try:
            stream=BACKEND.visual_plugin(data['prompt'],data.get('style','fusion')) if self.path=='/api/plugin' else BACKEND.section_brief(data['piece'],data.get('style','fusion')) if self.path=='/api/section' else BACKEND.generate(data['transcript'],data['scene'])
            for event in stream:
                self.wfile.write((json.dumps(event,ensure_ascii=False)+'\n').encode())
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            BACKEND.close()
        except Exception as error:
            BACKEND.close()
            try:
                self.wfile.write((json.dumps({'status':'GPT-6 unavailable ('+type(error).__name__+'); canvas stays live'})+'\n').encode())
            except (BrokenPipeError, ConnectionResetError):
                pass
        finally:
            MODEL_SLOT.release()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--tls', metavar='CERT,KEY')
    parser.add_argument('--allow-host', action='append', default=[], help='Extra LAN hostname or IP (without port)')
    args = parser.parse_args()
    ALLOWED = {f'{h}:{args.port}' for h in ['127.0.0.1','localhost',args.host,*args.allow_host] if h != '0.0.0.0'}
    server = ThreadingHTTPServer((args.host,args.port), Handler)
    if args.tls:
        cert, key = args.tls.split(',',1)
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(cert,key)
        server.socket = context.wrap_socket(server.socket, server_side=True)
        SCHEME = 'https'
    BACKEND.start_blender()
    print(f'Voice Canvas: {SCHEME}://{args.host}:{args.port}', flush=True)
    server.serve_forever()
