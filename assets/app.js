let media=[];let idx=0;

function extractUser(v){
  v=v.trim();
  try{
    if(v.startsWith("http")){
      let u=new URL(v);
      let m=u.pathname.match(/\/(u|user)\/([^\/]+)/);
      if(m) return m[2];
    }
  }catch{}
  return v.replace(/^u\//,'').replace(/^user\//,'');
}

async function loadUser(){
  const raw=document.getElementById("user").value;
  const user=extractUser(raw);
  const url=`https://www.reddit.com/user/${user}/submitted.json?raw_json=1&limit=50`;
  const r=await fetch(url);
  const j=await r.json();
  const posts=j.data.children.map(c=>c.data);

  media=[];
  document.getElementById("posts").innerHTML='';
  for(const p of posts){
    if(p.post_hint==="image" && p.url){
      media.push(p.url);
      addThumb(p.url);
    }
  }
}

function addThumb(u){
  const img=document.createElement("img");
  img.src=u;
  img.onclick=()=>openLb(media.indexOf(u));
  document.getElementById("posts").appendChild(img);
}

function openLb(i){
  idx=i;
  document.getElementById("lightbox").hidden=false;
  document.getElementById("lb-img").src=media[idx];
}

function nav(d){
  const n=idx+d;
  if(n<0||n>=media.length) return;
  openLb(n);
}

document.getElementById("load").onclick=loadUser;
document.getElementById("close").onclick=()=>document.getElementById("lightbox").hidden=true;
document.getElementById("prev").onclick=()=>nav(-1);
document.getElementById("next").onclick=()=>nav(1);
