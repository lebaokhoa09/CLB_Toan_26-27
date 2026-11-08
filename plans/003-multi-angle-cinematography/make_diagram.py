"""Technical camera-position schematic only; no 3D scene/assets are modified."""
from pathlib import Path
import math
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parent
im=Image.new('RGB',(1600,1180),'#101b2a');d=ImageDraw.Draw(im)
INK='#edf0ec';MUTED='#abb8c9';GOLD='#e4bb6b';CYAN='#7ecbda';FAINT='#304257'
def font(n,bold=False):
    return ImageFont.truetype('C:/Windows/Fonts/'+('segoeuib.ttf' if bold else 'segoeui.ttf'),n)
def txt(x,y,s,n=24,fill=INK,anchor='mm',bold=False):
    d.text((x,y),s,font=font(n,bold),fill=fill,anchor=anchor)
def arrow(a,b,fill=MUTED,width=3,head=13):
    d.line([a,b],fill=fill,width=width)
    ang=math.atan2(b[1]-a[1],b[0]-a[0])
    p=[b,(b[0]-head*math.cos(ang-.45),b[1]-head*math.sin(ang-.45)),
       (b[0]-head*math.cos(ang+.45),b[1]-head*math.sin(ang+.45))]
    d.polygon(p,fill=fill)
def camera(x,y,label,color=INK):
    d.rounded_rectangle((x-25,y-20,x+25,y+20),radius=6,fill='#1f3247',outline=color,width=2)
    txt(x,y,label,24,color,bold=True)
def lines(x,y,items,anchor='mm',fill=INK):
    for i,s in enumerate(items):txt(x,y+i*32,s,23,fill,anchor)

txt(800,55,'KẾ HOẠCH ĐA GÓC MÁY CHO 10 CHẶNG',38,bold=True)
txt(800,102,'Rà soát 2 · nhìn từ trên xuống · vị trí tương đối · chưa phải storyboard render',23,MUTED)
txt(440,315,'MẠN TRÁI',26,CYAN,bold=True);txt(1160,315,'MẠN PHẢI',26,GOLD,bold=True)

# Boat bow points upward. Port is left and starboard is right in this view.
d.polygon([(800,394),(861,470),(861,695),(844,729),(756,729),(739,695),(739,470)],fill='#574b3d',outline=GOLD,width=3)
d.polygon([(800,420),(844,477),(844,688),(830,711),(770,711),(756,688),(756,477)],fill='#897353')
for y in range(485,700,20):d.line((758,y,842,y),fill='#67553f',width=2)
for y in [500,572,645]:
    d.line((730,y,870,y),fill=INK,width=4);d.ellipse((793,y-7,807,y+7),fill=GOLD)
txt(800,369,'MŨI / HƯỚNG TIẾN',21,GOLD,bold=True)
txt(800,758,'ĐUÔI',22,GOLD,bold=True)

# Forward-facing exterior camera and stern chase.
camera(800,218,'3');arrow((800,245),(800,344))
lines(800,153,['3 · Máy trước mũi nhìn ngược về tàu'])
camera(800,967,'2');arrow((800,939),(800,783))
lines(800,1021,['2 · Bám từ đuôi, nhìn về phía trước'])

# Exterior starboard establishing and port tracking views.
camera(1200,670,'1',GOLD);arrow((1166,654),(910,600),GOLD)
lines(1280,716,['1 · Toàn cảnh chếch mạn phải'],fill=GOLD)
camera(425,630,'6',CYAN);arrow((458,625),(700,586),CYAN)
lines(310,684,['6 · Bám song song mạn trái'],fill=CYAN)
camera(560,365,'10',CYAN);arrow((587,389),(715,477),CYAN)
lines(355,235,['10 · Góc thấp chếch trước trái','rồi nâng và lùi thành cảnh rộng'],fill=CYAN)

# POV foreground marker and overhead camera marker.
camera(807,451,'8');arrow((838,437),(870,386))
d.line((838,457,1000,415),fill=MUTED,width=2)
lines(1230,402,['8 · Nhìn từ mũi tàu về trước','(camera trên boong)'])
d.ellipse((778,550,822,594),outline=CYAN,width=3);txt(800,572,'9',24,CYAN,bold=True)
d.line((778,572,625,506),fill=MUTED,width=2)
lines(402,478,['9 · Góc cao nhìn xuống','(camera ở phía trên tàu)'])

# A short rear arc changes sides within ONE self-contained clip.
cx,cy,r=800,570,265
for lo,hi,color in [(45,135,GOLD)]:
    pts=[(cx+r*math.cos(math.radians(a)),cy+r*math.sin(math.radians(a))) for a in range(lo,hi+1)]
    d.line(pts,fill=color,width=5)
    a=math.radians((lo+hi)/2);p=(cx+r*math.cos(a),cy+r*math.sin(a))
    arrow((p[0]+16*math.sin(a),p[1]-16*math.cos(a)),(p[0]-16*math.sin(a),p[1]+16*math.cos(a)),color,5,18)
lines(1220,827,['4 · Vòng qua đuôi để đổi mạn','Cung ngắn, dự kiến khoảng 90°'],fill=GOLD)
camera(470,784,'5',CYAN);arrow((500,768),(709,667),CYAN)
lines(335,833,['5 · Bám 3/4 mạn trái','Tàu đi trên lục địa'],fill=CYAN)

# A separate mini diagram makes the stationary-camera shot unambiguous.
d.rounded_rectangle((60,904,525,1100),radius=14,outline=FAINT,width=2)
txt(292,934,'7 · Máy đứng yên, tàu đi qua',23,bold=True)
arrow((458,980),(128,980),CYAN,3)
for x in [410,295,180]:d.polygon([(x-20,980),(x+12,965),(x+12,995)],outline=CYAN,fill='#304d5a')
camera(292,1044,'7');arrow((292,1016),(292,998),MUTED,2,9)
txt(1230,963,'Mỗi chặng tự đủ ý',27,GOLD,bold=True)
lines(1230,1008,['4: Đổi mạn và hé lộ bờ','5: Nhìn rõ tàu trên đất','180° chỉ là phương án phụ.'],fill=MUTED)

txt(800,1147,'Góc máy được chọn theo ý đồ cảnh; không yêu cầu mọi cảnh đều thấy trọn con tàu.',23,MUTED)
target=ROOT/'camera-angle-plan.png';im.save(target)
print(str(target).encode('ascii','backslashreplace').decode())
