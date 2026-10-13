// ==UserScript==
// @name         OZE Counter - floating Hi-Lo pill
// @namespace    ozeworks
// @version      1.0
// @description  A small floating Hi-Lo counter that lives on top of the blackjack page. Tap the pill to count cards, drag it anywhere.
// @match        *://*/*
// @grant        none
// ==/UserScript==
(function(){
  'use strict';
  if(window.top!==window.self) return;
  if(document.getElementById('oze-hilo-pill')) return;
  var KEY='oze_hilo_'+location.host;
  var S={rc:0,decks:8,seen:0,x:12,y:120,hidden:false};
  try{var j=JSON.parse(localStorage.getItem(KEY)||'{}');for(var k in j)if(k in S)S[k]=j[k];}catch(e){}
  var hist=[];
  function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
  function rem(){return Math.max(0,S.decks*52-S.seen);}
  function tc(){return S.seen? S.rc/Math.max(0.25,rem()/52) : 0;}
  function fmt(v){return (v>=0?'+':'')+v.toFixed(1);}
  function fcol(v){return v>=1.5?'#39e08f':(v<=-1?'#ff6b6b':'#f3f1e6');}
  var pill,panel,dot;
  var css='position:fixed;z-index:2147483647;touch-action:none;user-select:none;-webkit-user-select:none;box-shadow:0 4px 14px rgba(0,0,0,.55);';
  function place(){pill.style.left=S.x+'px';pill.style.top=S.y+'px';}
  function paint(){
    pill.textContent='TC '+fmt(tc());
    pill.style.color=fcol(tc());
    if(panel.style.display!=='none'){
      document.getElementById('oze-hilo-rc').textContent=(S.rc>=0?'+':'')+S.rc;
      document.getElementById('oze-hilo-tc').textContent=fmt(tc());
      document.getElementById('oze-hilo-tc').style.color=fcol(tc());
      document.getElementById('oze-hilo-left').textContent=(rem()/52).toFixed(1)+' decks left';
      document.getElementById('oze-hilo-decks').textContent=S.decks+(S.decks===1?' deck':' decks');
      document.getElementById('oze-hilo-hint').textContent=tc()>=1.5?'Bet big':'Bet minimum';
    }
  }
  function add(v){hist.push([S.rc,S.seen]);S.rc+=v;S.seen++;save();paint();}
  function undo(){var p=hist.pop();if(p){S.rc=p[0];S.seen=p[1];save();paint();}}
  function reset(){hist=[];S.rc=0;S.seen=0;save();paint();}
  function mk(tag,style,txt){var e=document.createElement(tag);e.style.cssText=style;if(txt!==undefined)e.textContent=txt;return e;}
  pill=mk('div',css+'left:12px;top:120px;background:#0d3b24;border:2px solid #7c3aed;border-radius:999px;padding:8px 16px;font:800 17px/1.2 system-ui,sans-serif;color:#f3f1e6;cursor:grab;display:flex;gap:6px;align-items:center;');
  pill.id='oze-hilo-pill';
  function hidePill(){S.hidden=true;save();pill.style.display='none';if(panel)panel.style.display='none';dot.style.display='block';}
  function showPill(){S.hidden=false;save();dot.style.display='none';pill.style.display='flex';}
  dot=mk('div',css+'left:6px;top:6px;width:28px;height:28px;background:#7c3aed;border-radius:50%;color:#fff;font:800 14px/28px system-ui,sans-serif;text-align:center;cursor:pointer;display:none;');
  dot.id='oze-hilo-dot';dot.textContent='C';dot.addEventListener('click',showPill);
  panel=mk('div',css+'left:8px;top:160px;width:240px;background:#0d3b24;border:2px solid #7c3aed;border-radius:16px;padding:10px;font:700 14px/1.3 system-ui,sans-serif;color:#f3f1e6;display:none;');
  panel.id='oze-hilo-panel';
  var row=function(g){return mk('div','display:flex;gap:'+(g||6)+'px;justify-content:center;margin-top:8px;');};
  var big=function(t,bg,fn,fs){var b=mk('button','flex:1;border:0;border-radius:10px;padding:12px 0;font:800 '+(fs||18)+'px system-ui,sans-serif;background:'+bg+';color:#fff;cursor:pointer;',t);b.addEventListener('click',fn);return b;};
  var top=row();
  var c1=mk('div','flex:1;text-align:center;');c1.innerHTML='<div style="font-size:11px;color:#9fb8a8">RUNNING</div><div id="oze-hilo-rc" style="font-size:22px">+0</div>';
  var c2=mk('div','flex:1;text-align:center;');c2.innerHTML='<div style="font-size:11px;color:#9fb8a8">TRUE</div><div id="oze-hilo-tc" style="font-size:22px">+0.0</div>';
  top.appendChild(c1);top.appendChild(c2);
  var b1=row();b1.appendChild(big('+1','#1f7a4d',function(){add(1);},22));
  b1.appendChild(big('0','#3a3f4b',function(){add(0);},22));
  b1.appendChild(big('-1','#a33333',function(){add(-1);},22));
  var b2=row();
  b2.appendChild(big('Undo','#333a45',undo,14));
  b2.appendChild(big('New shoe','#7c3aed',reset,14));
  var b3=row();
  b3.appendChild(big('-','#333a45',function(){if(S.decks>1){S.decks--;save();paint();}},16));
  var dk=mk('div','flex:1;text-align:center;padding:10px 0;background:#0a2b1b;border-radius:10px;');
  dk.innerHTML='<div id="oze-hilo-decks" style="font-size:16px">8 decks</div><div id="oze-hilo-left" style="font-size:11px;color:#9fb8a8">8 decks left</div>';
  b3.appendChild(dk);
  b3.appendChild(big('+','#333a45',function(){if(S.decks<8){S.decks++;save();paint();}},16));
  var b4=row();
  b4.appendChild(big('Hide','#333a45',hidePill,14));
  var hint=mk('div','text-align:center;margin-top:8px;font-size:12px;color:#f3c14b;','Bet minimum');
  hint.id='oze-hilo-hint';
  panel.appendChild(top);panel.appendChild(b1);panel.appendChild(b2);panel.appendChild(b3);panel.appendChild(b4);panel.appendChild(hint);
  var pid=null,lx=0,ly=0,moved=false;
  pill.addEventListener('pointerdown',function(e){pid=e.pointerId;lx=e.clientX;ly=e.clientY;moved=false;try{pill.setPointerCapture(pid);}catch(x){}});
  pill.addEventListener('pointermove',function(e){if(pid===null)return;var dx=e.clientX-lx,dy=e.clientY-ly;if(Math.abs(dx)+Math.abs(dy)>8)moved=true;if(moved){lx=e.clientX;ly=e.clientY;S.x=Math.max(0,Math.min(window.innerWidth-40,S.x+dx));S.y=Math.max(0,Math.min(window.innerHeight-40,S.y+dy));place();}});
  pill.addEventListener('pointerup',function(){pid=null;if(!moved){panel.style.display=(panel.style.display==='none')?'block':'none';paint();}else{save();}});
  document.documentElement.appendChild(dot);document.documentElement.appendChild(pill);document.documentElement.appendChild(panel);
  if(S.hidden){showPill();hidePill();}
  place();paint();
})();
