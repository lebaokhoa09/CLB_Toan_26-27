from pathlib import Path
import json,subprocess,hashlib
from PIL import Image
base=Path(__file__).resolve().parent
cli=Path.home()/'.impeccable/bin/0.1.11/impeccable.exe'
opening=json.loads((base/'asset-prompts.json').read_text('utf-8-sig'))
provenance=json.loads((base/'dist/assets/voyage-v2/provenance.json').read_text('utf-8-sig'))
panorama=json.loads((base/'dist/assets/voyage-panorama/provenance.json').read_text('utf-8-sig'))
count=0
for image in (base/'dist/assets').rglob('*.png'):
    if image.parent.name=='voyage-panorama':
        prompt='\n\n'.join(g['prompt'] for g in panorama['generations'])
    elif image.parent.name=='voyage-v2':
        if image.name=='chart-clean.png': prompt=provenance['chart']['prompt']
        elif image.name=='ship-clean.png': prompt=provenance['ship']['prompt']
        else: prompt='Origin: exact user-supplied reference2 codex-clipboard-b1d9b82b-c5ed-4013-97cd-b0c9428224fe.png. No pixel edits.'
    elif image.name=='opening-background.png': prompt=opening['openingBackground']
    elif image.name=='opening-title.png': prompt=opening['openingTitleCleanup']
    elif image.name=='opening-reference.png': prompt='Origin: exact user opening artwork codex-clipboard-f348097b-68ff-417f-9dc0-4b36e099aa57.png.'
    elif image.name=='question-background.png': prompt='Origin: exact user question artwork codex-clipboard-2130a0fc-e3bc-4aad-931d-1e19dc203fa6.png. RGB unchanged.'
    else: raise ValueError('Unknown asset origin: '+str(image))
    before=hashlib.sha256(Image.open(image).tobytes()).hexdigest()
    subprocess.run([str(cli),'embed-prompt',str(image),'--prompt',prompt],check=True,capture_output=True)
    assert before==hashlib.sha256(Image.open(image).tobytes()).hexdigest(),'Metadata altered pixels'
    count+=1
print(f'{count} shipped images: provenance embedded, decoded pixels unchanged.')
