"""Recover the footprint of the source ship's shadow; do not redraw its shape."""
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

base = Path(__file__).resolve().parent
source = np.array(Image.open(base.parent / 'ship-video-2026-10-21/frame-06.81s.png').convert('RGB')).astype(float)
clean = np.array(Image.open(base / 'dist/assets/reference-map/map-original-clean.png').convert('RGB')).astype(float)
ship = Image.open(base / 'dist/assets/reference-ship/ship-side.png').getchannel('A')
mask = Image.new('L', (1280,720)); mask.paste(ship, (470,130))
mask = np.array(mask.filter(ImageFilter.MaxFilter(11))) / 255
weights = np.array([.2126,.7152,.0722])
sl = source @ weights; cl = clean @ weights
alpha = np.clip((cl-sl)/np.maximum(1,cl),0,.55) * (1-mask)
y,x = np.mgrid[:720,:1280]
region = (x>300)&(x<880)&(y>350)&(y<585)
alpha *= region & (sl>65) # Exclude the original black dashed route from the shadow.
alpha = np.array(Image.fromarray(np.uint8(alpha*255)).filter(ImageFilter.GaussianBlur(1)))
rgba = np.zeros((720,1280,4), dtype=np.uint8)
rgba[:,:,:3] = [4,6,18]; rgba[:,:,3] = alpha
Image.fromarray(rgba).save(base/'dist/assets/reference-ship/ship-shadow.png')

# The fallback is a still from the same restored layers, with matching hull colour grade.
plate=Image.open(base/'dist/assets/reference-map/map-purple-clean.png').convert('RGBA')
plate=Image.alpha_composite(plate,Image.fromarray(rgba))
boat=np.array(Image.open(base/'dist/assets/reference-ship/ship-side-canvas.png')).astype(float)/255
rgb=boat[:,:,:3]; l=rgb@weights
def smooth(a,b,t):
    t=np.clip((t-a)/(b-a),0,1); return t*t*(3-2*t)
w=smooth(.035,.19,rgb[:,:,0]-rgb[:,:,2])*(1-smooth(.48,.76,l))*.86
violet=np.array([.19,.17,.34])*(l[:,:,None]/.27)
boat[:,:,:3]=rgb*(1-w[:,:,None])+violet*w[:,:,None]
boat=np.uint8(np.clip(boat,0,1)*255)
layer=Image.new('RGBA',(1280,720));layer.paste(Image.fromarray(boat),(317,-43))
Image.alpha_composite(plate,layer).convert('RGB').save(base/'dist/assets/voyage-poster.png')
