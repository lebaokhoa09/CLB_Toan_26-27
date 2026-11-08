"""Keep numerical RGBA motion vectors out of browser image alpha conversion."""
from pathlib import Path
import gzip,json
from PIL import Image
base=Path(__file__).resolve().parent/'dist/assets/reference-ship-motion'
raw=Image.open(base/'ship-flows.png').convert('RGBA').tobytes()
assert len(raw)==2560*2080*4
(base/'ship-flows.rgba.gz').write_bytes(gzip.compress(raw,compresslevel=9,mtime=0))
metadata=json.loads((base/'metadata.json').read_text('utf-8'))
metadata['flows']['runtimeFile']='ship-flows.rgba.gz'
metadata['flows']['runtimeEncoding']='gzip-compressed raw RGBA8 bytes; native decompression then THREE.DataTexture; no image-alpha conversion'
metadata['flows']['rawByteLength']=len(raw)
(base/'metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Raw motion bytes:',len(raw),'compressed:',(base/'ship-flows.rgba.gz').stat().st_size)
