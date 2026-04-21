/* MusicVerse v1.0 — Part 1: Core, Artists, Releases, Streams, Tracks */
const PL=['spotify','appleMusic','youtube','audiomack','pandora','amazonMusic','soundcloud','youtubeMusic'];
const PN={spotify:'Spotify',appleMusic:'Apple Music',youtube:'YouTube',audiomack:'Audiomack',pandora:'Pandora',amazonMusic:'Amazon Music',soundcloud:'SoundCloud',youtubeMusic:'YouTube Music'};
function dd(){return{artists:[],releases:[],features:[],bank:{usd:0,ngn:0,tx:[]},settings:{rates:{spotify:.003,appleMusic:.005,youtube:.002,audiomack:.001,pandora:.004,amazonMusic:.004,soundcloud:.002,youtubeMusic:.002},splits:{personal:70,label:20,tax:10},exRate:1500,cur:{usd:'$',ngn:'\u20A6'}}}}

const MV={
data:null,_img:null,_ctx:null,

init(){this.data=this.load();this.go('artists')},
save(){localStorage.setItem('mv',JSON.stringify(this.data))},
load(){try{const d=localStorage.getItem('mv');return d?JSON.parse(d):dd()}catch(e){return dd()}},
uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)},
fmt(n){return(n||0).toLocaleString()},
fmtM(n,c){const s=this.data.settings.cur;return(c==='ngn'?s.ngn:s.usd)+(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})},

toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)},
openMo(title,body,foot){document.getElementById('mo-t').textContent=title;document.getElementById('mo-b').innerHTML=body;document.getElementById('mo-f').innerHTML=foot||'';document.getElementById('mo').classList.remove('hidden')},
closeMo(e){if(e&&e.target!==document.getElementById('mo'))return;document.getElementById('mo').classList.add('hidden');this._img=null;this._ctx=null},

go(tab){
document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.tab===tab));
const map={'artists':()=>this.renderArtists(),'releases':()=>this.renderReleases(),'features':()=>this.renderFeatures(),'most-streamed':()=>this.renderMostStreamed(),'royalties':()=>this.renderRoyalties(),'bank':()=>this.renderBank(),'settings':()=>this.renderSettings()};
if(map[tab])map[tab]();
},

emptyS(){const o={};PL.forEach(p=>o[p]=0);return o},
totalS(s){return PL.reduce((t,p)=>t+(s[p]||0),0)},
relTotal(r){return(r.tracks||[]).reduce((t,tr)=>t+this.totalS(tr.streams),0)},
handleImage(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{this._img=ev.target.result};r.readAsDataURL(f)},
artistName(id){const a=this.data.artists.find(x=>x.id===id);return a?a.name:'Unknown'},
typeClass(t){return{single:'ts',ep:'te',album:'ta',feature:'tf'}[t]||'ts'},

/* ===== ARTISTS ===== */
renderArtists(){
const m=document.getElementById('main'),a=this.data.artists;
let h='<div class="thdr"><div><h2>Artists</h2><div class="sub">'+a.length+' artist'+(a.length!==1?'s':'')+'</div></div><button class="btn bp" onclick="MV.showAddArtist()">+ Add Artist</button></div>';
if(!a.length){h+='<div class="empty"><div class="ei">\uD83C\uDFA4</div><p>No artists yet. Add your first artist.</p></div>'}
else{h+='<div class="cgrid">';
a.forEach(ar=>{
const rc=this.data.releases.filter(r=>r.artistId===ar.id).length;
const fc=this.data.features.filter(f=>f.artistId===ar.id).length;
h+='<div class="card acard" onclick="MV.go(\'releases\')"><div class="cacts"><button class="bi bsm" onclick="event.stopPropagation();MV.showAddArtist(\''+ar.id+'\')">&#9998;</button><button class="bi bsm" onclick="event.stopPropagation();MV.deleteArtist(\''+ar.id+'\')">&#128465;</button></div><div class="aimg">'+(ar.image?'<img src="'+ar.image+'">':'\uD83C\uDFA4')+'</div><div class="aname">'+ar.name+'</div><div class="arel">'+rc+' release'+(rc!==1?'s':'')+' &middot; '+fc+' feature'+(fc!==1?'s':'')+'</div></div>';
});h+='</div>';}
m.innerHTML=h;
},
showAddArtist(eid){
const a=eid?this.data.artists.find(x=>x.id===eid):null;
this._ctx={editId:eid};
const b='<div class="fg"><label>Artist Name</label><input id="f-name" value="'+(a?a.name:'')+'" placeholder="Enter name"></div><div class="fg"><label>Artist Photo</label><input type="file" accept="image/*" onchange="MV.handleImage(event)"></div>';
const f='<button class="btn bs" onclick="MV.closeMo()">Cancel</button><button class="btn bp" onclick="MV.saveArtist()">'+(eid?'Update':'Add')+' Artist</button>';
this.openMo(eid?'Edit Artist':'Add Artist',b,f);
},
saveArtist(){
const name=document.getElementById('f-name').value.trim();
if(!name){this.toast('Enter a name');return}
const ctx=this._ctx;
if(ctx.editId){const a=this.data.artists.find(x=>x.id===ctx.editId);if(a){a.name=name;if(this._img)a.image=this._img}}
else{this.data.artists.push({id:this.uid(),name:name,image:this._img||null})}
this.save();this.closeMo();this.renderArtists();this.toast(ctx.editId?'Artist updated':'Artist added');
},
deleteArtist(id){
if(!confirm('Delete this artist and all their releases?'))return;
this.data.artists=this.data.artists.filter(x=>x.id!==id);
this.data.releases=this.data.releases.filter(x=>x.artistId!==id);
this.data.features=this.data.features.filter(x=>x.artistId!==id);
this.save();this.renderArtists();this.toast('Artist deleted');
},

/* ===== RELEASES ===== */
renderReleases(){
const m=document.getElementById('main'),rels=this.data.releases;
let h='<div class="thdr"><div><h2>Releases</h2><div class="sub">'+rels.length+' release'+(rels.length!==1?'s':'')+'</div></div><button class="btn bp" onclick="MV.showAddRelease()">+ Add Release</button></div>';
if(!rels.length){h+='<div class="empty"><div class="ei">\uD83D\uDCBF</div><p>No releases yet. Add your first release.</p></div>'}
else{h+='<div class="cgrid">';
rels.forEach(r=>{
const ts=this.relTotal(r);
h+='<div class="card rcard" onclick="MV.viewRelease(\''+r.id+'\')"><div class="cacts"><button class="bi bsm" onclick="event.stopPropagation();MV.showAddRelease(\''+r.id+'\')">&#9998;</button><button class="bi bsm" onclick="event.stopPropagation();MV.deleteRelease(\''+r.id+'\')">&#128465;</button></div><div class="rcov">'+(r.coverArt?'<img src="'+r.coverArt+'">':'\uD83D\uDCBF')+'</div><span class="rtype '+this.typeClass(r.type)+'">'+r.type+'</span><div class="rtit">'+r.title+'</div><div class="rart">'+this.artistName(r.artistId)+'</div><div class="rstr">'+this.fmt(ts)+' streams</div>'+(r.releaseDate?'<div class="rdat">'+r.releaseDate+'</div>':'')+'</div>';
});h+='</div>';}
m.innerHTML=h;
},
showAddRelease(eid){
const r=eid?this.data.releases.find(x=>x.id===eid):null;
this._ctx={editId:eid};
const arts=this.data.artists;
let oa=arts.map(a=>'<option value="'+a.id+'"'+(r&&r.artistId===a.id?' selected':'')+'>'+a.name+'</option>').join('');
if(!arts.length)oa='<option value="">No artists yet</option>';
const b='<div class="fg"><label>Title</label><input id="f-title" value="'+(r?r.title:'')+'" placeholder="Release title"></div><div class="fr"><div class="fg"><label>Artist</label><select id="f-artist">'+oa+'</select></div><div class="fg"><label>Type</label><select id="f-type"><option value="single"'+(r&&r.type==='single'?' selected':'')+'>Single</option><option value="ep"'+(r&&r.type==='ep'?' selected':'')+'>EP</option><option value="album"'+(r&&r.type==='album'?' selected':'')+'>Album</option></select></div></div><div class="fg"><label>Release Date</label><input id="f-date" type="date" value="'+(r?r.releaseDate:'')+'"></div><div class="fg"><label>Cover Art</label><input type="file" accept="image/*" onchange="MV.handleImage(event)"></div>';
const f='<button class="btn bs" onclick="MV.closeMo()">Cancel</button><button class="btn bp" onclick="MV.saveRelease()">'+(eid?'Update':'Add')+' Release</button>';
this.openMo(eid?'Edit Release':'Add Release',b,f);
},
saveRelease(){
const title=document.getElementById('f-title').value.trim();
const artistId=document.getElementById('f-artist').value;
const type=document.getElementById('f-type').value;
const releaseDate=document.getElementById('f-date').value;
if(!title){this.toast('Enter a title');return}
if(!artistId){this.toast('Select an artist');return}
const ctx=this._ctx;
if(ctx.editId){const r=this.data.releases.find(x=>x.id===ctx.editId);if(r){r.title=title;r.artistId=artistId;r.type=type;r.releaseDate=releaseDate;if(this._img)r.coverArt=this._img}}
else{const tracks=type==='single'?[{id:this.uid(),title:title,trackNumber:1,streams:this.emptyS()}]:[];this.data.releases.push({id:this.uid(),title:title,artistId:artistId,type:type,releaseDate:releaseDate,coverArt:this._img||null,tracks:tracks})}
this.save();this.closeMo();this.renderReleases();this.toast(ctx.editId?'Release updated':'Release added');
},
deleteRelease(id){
if(!confirm('Delete this release?'))return;
this.data.releases=this.data.releases.filter(x=>x.id!==id);
this.save();this.renderReleases();this.toast('Release deleted');
},

/* ===== RELEASE DETAIL VIEW ===== */
viewRelease(id){
const r=this.data.releases.find(x=>x.id===id);if(!r)return;
const m=document.getElementById('main'),ts=this.relTotal(r);
let h='<div class="det"><div class="detb" onclick="MV.renderReleases()">&#8592; Back to Releases</div><div class="deth"><div class="detc">'+(r.coverArt?'<img src="'+r.coverArt+'">':'\uD83D\uDCBF')+'</div><div class="deti"><span class="rtype '+this.typeClass(r.type)+'">'+r.type+'</span><h2>'+r.title+'</h2><div class="meta"><span>'+this.artistName(r.artistId)+'</span>'+(r.releaseDate?'<span>'+r.releaseDate+'</span>':'')+'<span>'+r.tracks.length+' track'+(r.tracks.length!==1?'s':'')+'</span></div><div class="tot">'+this.fmt(ts)+' total streams</div><div style="margin-top:.6rem;display:flex;gap:.4rem;flex-wrap:wrap"><button class="btn bp bsm" onclick="MV.showAddRelease(\''+r.id+'\')">Edit Info</button><button class="btn bd bsm" onclick="if(confirm(\'Delete?\')){MV.deleteRelease(\''+r.id+'\');MV.renderReleases()}">Delete</button></div></div></div>';

if(r.type==='single'&&r.tracks.length===1){
const tr=r.tracks[0];
h+='<div class="stit">Streams <button class="btn bp bsm" style="margin-left:auto" onclick="MV.showEditStreams(\''+r.id+'\',0)">Edit Streams</button><button class="btn bg bsm" onclick="MV.showAddStreams(\''+r.id+'\',0)">+ Add Streams</button></div><div class="sgrid">';
PL.forEach(p=>{h+='<div class="sitm"><div class="splat">'+PN[p]+'</div><div class="sval">'+this.fmt(tr.streams[p])+'</div></div>'});
h+='</div>';
}else{
h+='<div class="stit">Tracklist <button class="btn bp bsm" style="margin-left:auto" onclick="MV.showAddTrack(\''+r.id+'\')">+ Add Track</button></div>';
if(!r.tracks.length){h+='<div class="empty"><p>No tracks yet.</p></div>'}
else{h+='<div class="tlist">';
r.tracks.forEach((tr,i)=>{
const tts=this.totalS(tr.streams);
h+='<div class="trow" onclick="MV.showTrackStreams(\''+r.id+'\','+i+')"><div class="tnum">'+(tr.trackNumber||i+1)+'</div><div class="ttit">'+tr.title+'</div><div class="tstr">'+this.fmt(tts)+'</div><div class="tacts"><button class="bi bsm" onclick="event.stopPropagation();MV.showEditStreams(\''+r.id+'\','+i+')" title="Edit">&#9998;</button><button class="bi bsm" onclick="event.stopPropagation();MV.showAddStreams(\''+r.id+'\','+i+')" title="Add">+</button><button class="bi bsm" onclick="event.stopPropagation();MV.showAddTrack(\''+r.id+'\','+i+')" title="Rename">&#9881;</button>'+(i>0?'<button class="bi bsm" onclick="event.stopPropagation();MV.moveTrack(\''+r.id+'\','+i+',-1)" title="Up">&#8593;</button>':'')+(i<r.tracks.length-1?'<button class="bi bsm" onclick="event.stopPropagation();MV.moveTrack(\''+r.id+'\','+i+',1)" title="Down">&#8595;</button>':'')+'<button class="bi bsm" onclick="event.stopPropagation();MV.deleteTrack(\''+r.id+'\','+i+')" title="Delete">&#128465;</button></div></div>';
});h+='</div>';}
}
h+='</div>';m.innerHTML=h;
},

/* ===== TRACK STREAMS POPUP ===== */
showTrackStreams(rid,idx){
const r=this.data.releases.find(x=>x.id===rid);if(!r||!r.tracks[idx])return;
const tr=r.tracks[idx];
const b='<p style="margin-bottom:.8rem;font-weight:600">'+tr.title+'</p><div class="sgrid">'+PL.map(p=>'<div class="sitm"><div class="splat">'+PN[p]+'</div><div class="sval">'+this.fmt(tr.streams[p])+'</div></div>').join('')+'</div><p style="margin-top:.8rem;color:var(--acc2);font-weight:600">Total: '+this.fmt(this.totalS(tr.streams))+'</p>';
const f='<button class="btn bp bsm" onclick="MV.closeMo();MV.showEditStreams(\''+rid+'\','+idx+')">Edit</button><button class="btn bg bsm" onclick="MV.closeMo();MV.showAddStreams(\''+rid+'\','+idx+')">+ Add</button><button class="btn bs bsm" onclick="MV.closeMo()">Close</button>';
this.openMo('Track Streams',b,f);
},

/* ===== EDIT STREAMS ===== */
showEditStreams(rid,ti){
const r=this.data.releases.find(x=>x.id===rid);if(!r||!r.tracks[ti])return;
const tr=r.tracks[ti];this._ctx={rid:rid,ti:ti};
const b='<p style="margin-bottom:.7rem;font-size:.82rem;color:var(--tx2)">Set total streams per platform:</p>'+PL.map(p=>'<div class="fg"><label>'+PN[p]+'</label><input id="se-'+p+'" type="number" min="0" value="'+(tr.streams[p]||0)+'"></div>').join('');
const f='<button class="btn bs" onclick="MV.closeMo()">Cancel</button><button class="btn bp" onclick="MV.saveEditStreams()">Save Streams</button>';
this.openMo('Edit Streams \u2014 '+tr.title,b,f);
},
saveEditStreams(){
const c=this._ctx,r=this.data.releases.find(x=>x.id===c.rid);if(!r)return;
const tr=r.tracks[c.ti];
PL.forEach(p=>{tr.streams[p]=Math.max(0,parseInt(document.getElementById('se-'+p).value)||0)});
this.save();this.closeMo();this.viewRelease(c.rid);this.toast('Streams updated');
},

/* ===== ADD STREAMS ===== */
showAddStreams(rid,ti){
const r=this.data.releases.find(x=>x.id===rid);if(!r||!r.tracks[ti])return;
const tr=r.tracks[ti];this._ctx={rid:rid,ti:ti};
const b='<p style="margin-bottom:.7rem;font-size:.82rem;color:var(--tx2)">Enter streams to ADD on top of current:</p>'+PL.map(p=>'<div class="fg"><label>'+PN[p]+' (current: '+this.fmt(tr.streams[p]||0)+')</label><input id="sa-'+p+'" type="number" min="0" value="0"></div>').join('');
const f='<button class="btn bs" onclick="MV.closeMo()">Cancel</button><button class="btn bg" onclick="MV.saveAddStreams()">Add Streams</button>';
this.openMo('Add Streams \u2014 '+tr.title,b,f);
},
saveAddStreams(){
const c=this._ctx,r=this.data.releases.find(x=>x.id===c.rid);if(!r)return;
const tr=r.tracks[c.ti];let added=0;
PL.forEach(p=>{const v=parseInt(document.getElementById('sa-'+p).value)||0;if(v>0){tr.streams[p]=(tr.streams[p]||0)+v;added+=v}});
this.save();this.closeMo();this.viewRelease(c.rid);this.toast(added>0?'+'+this.fmt(added)+' streams added':'No streams added');
},

/* ===== TRACKS ===== */
showAddTrack(rid,ei){
const r=this.data.releases.find(x=>x.id===rid);if(!r)return;
const tr=(ei!==undefined)?r.tracks[ei]:null;this._ctx={rid:rid,ei:ei};
const b='<div class="fg"><label>Track Title</label><input id="f-tn" value="'+(tr?tr.title:'')+'" placeholder="Track title"></div><div class="fg"><label>Track Number</label><input id="f-tnum" type="number" min="1" value="'+(tr?tr.trackNumber:r.tracks.length+1)+'"></div>';
const f='<button class="btn bs" onclick="MV.closeMo()">Cancel</button><button class="btn bp" onclick="MV.saveTrack()">'+(tr?'Update':'Add')+' Track</button>';
this.openMo(tr?'Edit Track':'Add Track',b,f);
},
saveTrack(){
const title=document.getElementById('f-tn').value.trim();
const num=parseInt(document.getElementById('f-tnum').value)||1;
if(!title){this.toast('Enter a title');return}
const c=this._ctx,r=this.data.releases.find(x=>x.id===c.rid);if(!r)return;
if(c.ei!==undefined){r.tracks[c.ei].title=title;r.tracks[c.ei].trackNumber=num}
else{r.tracks.push({id:this.uid(),title:title,trackNumber:num,streams:this.emptyS()})}
this.save();this.closeMo();this.viewRelease(c.rid);this.toast(c.ei!==undefined?'Track updated':'Track added');
},
deleteTrack(rid,idx){
if(!confirm('Delete this track?'))return;
const r=this.data.releases.find(x=>x.id===rid);if(!r)return;
r.tracks.splice(idx,1);r.tracks.forEach((t,i)=>t.trackNumber=i+1);
this.save();this.viewRelease(rid);this.toast('Track deleted');
},
moveTrack(rid,idx,dir){
const r=this.data.releases.find(x=>x.id===rid);if(!r)return;
const ni=idx+dir;if(ni<0||ni>=r.tracks.length)return;
[r.tracks[idx],r.tracks[ni]]=[r.tracks[ni],r.tracks[idx]];
r.tracks.forEach((t,i)=>t.trackNumber=i+1);
this.save();this.viewRelease(rid);
}
};


/* MusicVerse v1.0 — Part 2: Features, Most Streamed, Royalties, Bank, Settings, Init */

/* ===== FEATURES ===== */
MV.renderFeatures=function(){
const m=document.getElementById('main'),feats=this.data.features;
let h='<div class="thdr"><div><h2>Features</h2><div class="sub">'+feats.length+' feature'+(feats.length!==1?'s':'')+'</div></div><button class="btn bp" onclick="MV.showAddFeature()">+ Add Feature</button></div>';
if(!feats.length){h+='<div class="empty"><div class="ei">\uD83E\uDD1D</div><p>No features yet.</p></div>'}
else{h+='<div class="cgrid">';
feats.forEach(function(f){
var ts=MV.totalS(f.streams);
h+='<div class="card rcard" onclick="MV.viewFeature(\''+f.id+'\')"><div class="cacts"><button class="bi bsm" onclick="event.stopPropagation();MV.showAddFeature(\''+f.id+'\')">&#9998;</button><button class="bi bsm" onclick="event.stopPropagation();MV.deleteFeature(\''+f.id+'\')">&#128465;</button></div><div class="rcov">'+(f.coverArt?'<img src="'+f.coverArt+'">':'\uD83E\uDD1D')+'</div><span class="rtype tf">feature</span><div class="rtit">'+f.title+'</div><div class="rart">'+MV.artistName(f.artistId)+' &middot; on '+( f.mainArtist||'\u2014')+'</div><div class="rstr">'+MV.fmt(ts)+' streams</div>'+(f.featurePct?'<div class="rdat">'+f.featurePct+'% split</div>':'')+'</div>';
});h+='</div>';}
m.innerHTML=h;
};
MV.showAddFeature=function(eid){
var f=eid?this.data.features.find(function(x){return x.id===eid}):null;
this._ctx={editId:eid};
var arts=this.data.artists;
var oa=arts.map(function(a){return'<option value="'+a.id+'"'+(f&&f.artistId===a.id?' selected':'')+'>'+a.name+'</option>'}).join('');
if(!arts.length)oa='<option value="">No artists</option>';
var b='<div class="fg"><label>Song Title</label><input id="f-ft" value="'+(f?f.title:'')+'" placeholder="Song title"></div><div class="fr"><div class="fg"><label>Your Artist</label><select id="f-fa">'+oa+'</select></div><div class="fg"><label>Main Artist</label><input id="f-fm" value="'+(f?f.mainArtist:'')+'" placeholder="e.g. Drake"></div></div><div class="fg"><label>Feature % Split</label><input id="f-fp" type="number" min="0" max="100" value="'+(f?f.featurePct||0:0)+'"></div><div class="fg"><label>Cover Art</label><input type="file" accept="image/*" onchange="MV.handleImage(event)"></div>';
var fo='<button class="btn bs" onclick="MV.closeMo()">Cancel</button><button class="btn bp" onclick="MV.saveFeature()">'+(eid?'Update':'Add')+' Feature</button>';
this.openMo(eid?'Edit Feature':'Add Feature',b,fo);
};
MV.saveFeature=function(){
var title=document.getElementById('f-ft').value.trim();
var artistId=document.getElementById('f-fa').value;
var mainArtist=document.getElementById('f-fm').value.trim();
var featurePct=parseInt(document.getElementById('f-fp').value)||0;
if(!title){this.toast('Enter a title');return}
if(!artistId){this.toast('Select an artist');return}
var ctx=this._ctx;
if(ctx.editId){var f=this.data.features.find(function(x){return x.id===ctx.editId});if(f){f.title=title;f.artistId=artistId;f.mainArtist=mainArtist;f.featurePct=featurePct;if(MV._img)f.coverArt=MV._img}}
else{this.data.features.push({id:this.uid(),title:title,artistId:artistId,mainArtist:mainArtist,featurePct:featurePct,coverArt:this._img||null,streams:this.emptyS()})}
this.save();this.closeMo();this.renderFeatures();this.toast(ctx.editId?'Feature updated':'Feature added');
};
MV.deleteFeature=function(id){
if(!confirm('Delete this feature?'))return;
this.data.features=this.data.features.filter(function(x){return x.id!==id});
this.save();this.renderFeatures();this.toast('Feature deleted');
};
MV.viewFeature=function(id){
var f=this.data.features.find(function(x){return x.id===id});if(!f)return;
var m=document.getElementById('main'),ts=this.totalS(f.streams);
var h='<div class="det"><div class="detb" onclick="MV.renderFeatures()">&#8592; Back to Features</div><div class="deth"><div class="detc">'+(f.coverArt?'<img src="'+f.coverArt+'">':'\uD83E\uDD1D')+'</div><div class="deti"><span class="rtype tf">feature</span><h2>'+f.title+'</h2><div class="meta"><span>'+this.artistName(f.artistId)+'</span><span>on '+(f.mainArtist||'\u2014')+'</span>'+(f.featurePct?'<span>'+f.featurePct+'% split</span>':'')+'</div><div class="tot">'+this.fmt(ts)+' total streams</div></div></div>';
h+='<div class="stit">Streams <button class="btn bp bsm" style="margin-left:auto" onclick="MV.showEditFS(\''+f.id+'\')">Edit Streams</button><button class="btn bg bsm" onclick="MV.showAddFS(\''+f.id+'\')">+ Add Streams</button></div>';
h+='<div class="sgrid">'+PL.map(function(p){return'<div class="sitm"><div class="splat">'+PN[p]+'</div><div class="sval">'+MV.fmt(f.streams[p])+'</div></div>'}).join('')+'</div></div>';
m.innerHTML=h;
};
MV.showEditFS=function(fid){
var f=this.data.features.find(function(x){return x.id===fid});if(!f)return;
this._ctx={fid:fid};
var b='<p style="margin-bottom:.7rem;font-size:.82rem;color:var(--tx2)">Set total streams per platform:</p>'+PL.map(function(p){return'<div class="fg"><label>'+PN[p]+'</label><input id="sfe-'+p+'" type="number" min="0" value="'+(f.streams[p]||0)+'"></div>'}).join('');
var fo='<button class="btn bs" onclick="MV.closeMo()">Cancel</button><button class="btn bp" onclick="MV.saveEditFS()">Save</button>';
this.openMo('Edit Feature Streams',b,fo);
};
MV.saveEditFS=function(){
var f=this.data.features.find(function(x){return x.id===MV._ctx.fid});if(!f)return;
PL.forEach(function(p){f.streams[p]=Math.max(0,parseInt(document.getElementById('sfe-'+p).value)||0)});
this.save();this.closeMo();this.viewFeature(f.id);this.toast('Streams updated');
};
MV.showAddFS=function(fid){
var f=this.data.features.find(function(x){return x.id===fid});if(!f)return;
this._ctx={fid:fid};
var b='<p style="margin-bottom:.7rem;font-size:.82rem;color:var(--tx2)">Enter streams to ADD:</p>'+PL.map(function(p){return'<div class="fg"><label>'+PN[p]+' (current: '+MV.fmt(f.streams[p]||0)+')</label><input id="sfa-'+p+'" type="number" min="0" value="0"></div>'}).join('');
var fo='<button class="btn bs" onclick="MV.closeMo()">Cancel</button><button class="btn bg" onclick="MV.saveAddFS()">Add Streams</button>';
this.openMo('Add Feature Streams',b,fo);
};
MV.saveAddFS=function(){
var f=this.data.features.find(function(x){return x.id===MV._ctx.fid});if(!f)return;
var added=0;
PL.forEach(function(p){var v=parseInt(document.getElementById('sfa-'+p).value)||0;if(v>0){f.streams[p]=(f.streams[p]||0)+v;added+=v}});
this.save();this.closeMo();this.viewFeature(f.id);this.toast(added>0?'+'+this.fmt(added)+' streams added':'No streams added');
};

/* ===== MOST STREAMED ===== */
MV._msType='all';
MV._msSort='total';
MV.renderMostStreamed=function(){
var m=document.getElementById('main'),items=[],self=this;
this.data.releases.forEach(function(r){r.tracks.forEach(function(tr){items.push({title:tr.title,artist:self.artistName(r.artistId),type:r.type,streams:tr.streams,total:self.totalS(tr.streams)})})});
this.data.features.forEach(function(f){items.push({title:f.title,artist:self.artistName(f.artistId)+' (feat)',type:'feature',streams:f.streams,total:self.totalS(f.streams)})});
var h='<div class="thdr"><div><h2>Most Streamed</h2><div class="sub">'+items.length+' item'+(items.length!==1?'s':'')+'</div></div></div>';
h+='<div class="fbar"><select id="ms-t" onchange="MV._msType=this.value;MV.renderMostStreamed()"><option value="all">All Types</option><option value="single">Singles</option><option value="ep">EP Tracks</option><option value="album">Album Tracks</option><option value="feature">Features</option></select>';
h+='<select id="ms-s" onchange="MV._msSort=this.value;MV.renderMostStreamed()"><option value="total">Total Streams</option>'+PL.map(function(p){return'<option value="'+p+'">'+PN[p]+'</option>'}).join('')+'</select></div>';
if(this._msType!=='all')items=items.filter(function(x){return x.type===self._msType});
var sb=this._msSort;
items.sort(function(a,b){return sb==='total'?b.total-a.total:(b.streams[sb]||0)-(a.streams[sb]||0)});
if(!items.length){h+='<div class="empty"><p>No streams data yet.</p></div>'}
else{h+='<div class="tw"><table><thead><tr><th>#</th><th>Title</th><th>Artist</th><th>Type</th><th>Total</th>';
PL.forEach(function(p){h+='<th>'+PN[p]+'</th>'});
h+='</tr></thead><tbody>';
items.forEach(function(it,i){
var rc=i<3?'r'+(i+1):'';
h+='<tr><td><span class="rb '+rc+'">'+(i+1)+'</span></td><td style="font-weight:600">'+it.title+'</td><td class="tmut">'+it.artist+'</td><td><span class="rtype '+self.typeClass(it.type)+'">'+it.type+'</span></td><td class="tacc" style="font-weight:700">'+self.fmt(it.total)+'</td>';
PL.forEach(function(p){h+='<td>'+self.fmt(it.streams[p])+'</td>'});
h+='</tr>';
});
h+='</tbody></table></div>';}
m.innerHTML=h;
var te=document.getElementById('ms-t'),se=document.getElementById('ms-s');
if(te)te.value=this._msType;if(se)se.value=this._msSort;
};

/* ===== ROYALTIES ===== */
MV.renderRoyalties=function(){
var m=document.getElementById('main'),s=this.data.settings,self=this,all=[];
this.data.releases.forEach(function(r){r.tracks.forEach(function(tr){
var gross=0;PL.forEach(function(p){gross+=(tr.streams[p]||0)*(s.rates[p]||0)});
all.push({title:tr.title,release:r.title,artist:self.artistName(r.artistId),type:r.type,gross:gross,fp:0});
})});
this.data.features.forEach(function(f){
var gross=0;PL.forEach(function(p){gross+=(f.streams[p]||0)*(s.rates[p]||0)});
all.push({title:f.title,release:f.title,artist:self.artistName(f.artistId),type:'feature',gross:gross,fp:f.featurePct||0});
});
var tg=0,tp=0,tl=0,tt=0,tf=0;
all.forEach(function(it){
var af=it.fp>0?it.gross*(it.fp/100):it.gross;
it.fc=it.fp>0?it.gross-af:0;
it.pe=af*(s.splits.personal/100);it.la=af*(s.splits.label/100);it.tx=af*(s.splits.tax/100);
tg+=it.gross;tp+=it.pe;tl+=it.la;tt+=it.tx;tf+=it.fc;
});
var h='<div class="thdr"><div><h2>Royalties</h2><div class="sub">Calculated from streams &times; payout rates</div></div><button class="btn bg" onclick="MV.depositRoy('+tp+')">Deposit '+this.fmtM(tp,'usd')+' to Bank</button></div>';
h+='<div class="rsum"><div class="rbox"><div class="lb">Gross</div><div class="vl vgr">'+this.fmtM(tg,'usd')+'</div></div><div class="rbox"><div class="lb">Personal ('+s.splits.personal+'%)</div><div class="vl vpe">'+this.fmtM(tp,'usd')+'</div></div><div class="rbox"><div class="lb">Label ('+s.splits.label+'%)</div><div class="vl vla">'+this.fmtM(tl,'usd')+'</div></div><div class="rbox"><div class="lb">Tax ('+s.splits.tax+'%)</div><div class="vl vtx">'+this.fmtM(tt,'usd')+'</div></div>'+(tf>0?'<div class="rbox"><div class="lb">Feature Cuts</div><div class="vl vfe">'+this.fmtM(tf,'usd')+'</div></div>':'')+'</div>';
if(!all.length){h+='<div class="empty"><p>Add releases or features to see royalties.</p></div>'}
else{h+='<div class="tw"><table><thead><tr><th>Title</th><th>Release</th><th>Type</th><th>Gross</th><th>Personal</th><th>Label</th><th>Tax</th></tr></thead><tbody>';
all.forEach(function(it){
h+='<tr><td style="font-weight:600">'+it.title+'</td><td class="tmut">'+it.release+'</td><td><span class="rtype '+self.typeClass(it.type)+'">'+it.type+'</span></td><td>'+self.fmtM(it.gross,'usd')+'</td><td class="tacc">'+self.fmtM(it.pe,'usd')+'</td><td>'+self.fmtM(it.la,'usd')+'</td><td>'+self.fmtM(it.tx,'usd')+'</td></tr>';
});
h+='</tbody></table></div>';}
m.innerHTML=h;
};
MV.depositRoy=function(amt){
if(amt<=0){this.toast('No royalties to deposit');return}
this.data.bank.usd+=amt;
this.data.bank.tx.unshift({id:this.uid(),date:new Date().toISOString().slice(0,10),type:'deposit',amount:amt,currency:'usd',desc:'Royalty deposit',bal:this.data.bank.usd});
this.save();this.toast('Deposited '+this.fmtM(amt,'usd')+' to USD bank');this.renderRoyalties();
};

/* ===== BANK ===== */
MV.renderBank=function(){
var m=document.getElementById('main'),b=this.data.bank,s=this.data.settings;
var h='<div class="thdr"><div><h2>Bank</h2><div class="sub">Manage your earnings</div></div></div>';
h+='<div class="bcards"><div class="bcard"><div class="bcur">US Dollars (USD)</div><div class="bbal">'+this.fmtM(b.usd,'usd')+'</div><div class="bacts"><button class="btn bp bsm" onclick="MV.showBank(\'add\',\'usd\')">+ Add</button><button class="btn bs bsm" onclick="MV.showBank(\'withdraw\',\'usd\')">- Withdraw</button><button class="btn bs bsm" onclick="MV.showBank(\'transfer\',\'usd\')">Transfer to NGN</button></div></div>';
h+='<div class="bcard"><div class="bcur">Nigerian Naira (NGN)</div><div class="bbal">'+this.fmtM(b.ngn,'ngn')+'</div><div class="bacts"><button class="btn bp bsm" onclick="MV.showBank(\'add\',\'ngn\')">+ Add</button><button class="btn bs bsm" onclick="MV.showBank(\'withdraw\',\'ngn\')">- Withdraw</button><button class="btn bs bsm" onclick="MV.showBank(\'transfer\',\'ngn\')">Transfer to USD</button></div></div></div>';
h+='<div class="stit">Transaction History</div>';
if(!b.tx.length){h+='<div class="empty"><p>No transactions yet.</p></div>'}
else{h+='<div class="tw"><table><thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Currency</th><th>Description</th><th>Balance</th></tr></thead><tbody>';
var self=this;
b.tx.forEach(function(t){
var cls=t.type==='deposit'||t.type==='add'?'style="color:var(--grn)"':'style="color:var(--red)"';
h+='<tr><td>'+t.date+'</td><td style="text-transform:capitalize">'+t.type+'</td><td '+cls+'>'+self.fmtM(t.amount,t.currency)+'</td><td style="text-transform:uppercase">'+t.currency+'</td><td>'+t.desc+'</td><td>'+self.fmtM(t.bal,t.currency)+'</td></tr>';
});
h+='</tbody></table></div>';}
m.innerHTML=h;
};
MV.showBank=function(type,cur){
this._ctx={btype:type,bcur:cur};
var label=type==='add'?'Add Money':type==='withdraw'?'Withdraw Money':'Transfer';
var toCur=cur==='usd'?'NGN':'USD';
var b='<div class="fg"><label>Amount ('+cur.toUpperCase()+')</label><input id="f-bamt" type="number" min="0" step="0.01" value="0" placeholder="Enter amount"></div>';
if(type==='transfer'){b+='<p style="font-size:.82rem;color:var(--tx2)">Rate: 1 USD = '+this.data.settings.exRate+' NGN</p>'}
if(type!=='transfer'){b+='<div class="fg"><label>Description</label><input id="f-bdesc" value="" placeholder="Optional note"></div>'}
var fo='<button class="btn bs" onclick="MV.closeMo()">Cancel</button><button class="btn bp" onclick="MV.processBank()">'+label+'</button>';
this.openMo(label+' — '+cur.toUpperCase(),b,fo);
};
MV.processBank=function(){
var c=this._ctx,amt=parseFloat(document.getElementById('f-bamt').value)||0;
if(amt<=0){this.toast('Enter a valid amount');return}
var b=this.data.bank,s=this.data.settings;
var desc=document.getElementById('f-bdesc')?document.getElementById('f-bdesc').value.trim():'';
if(c.btype==='add'){
b[c.bcur]+=amt;
b.tx.unshift({id:this.uid(),date:new Date().toISOString().slice(0,10),type:'add',amount:amt,currency:c.bcur,desc:desc||'Manual deposit',bal:b[c.bcur]});
this.toast('Added '+this.fmtM(amt,c.bcur));
}else if(c.btype==='withdraw'){
if(amt>b[c.bcur]){this.toast('Insufficient balance');return}
b[c.bcur]-=amt;
b.tx.unshift({id:this.uid(),date:new Date().toISOString().slice(0,10),type:'withdraw',amount:amt,currency:c.bcur,desc:desc||'Withdrawal',bal:b[c.bcur]});
this.toast('Withdrew '+this.fmtM(amt,c.bcur));
}else if(c.btype==='transfer'){
if(amt>b[c.bcur]){this.toast('Insufficient balance');return}
var toCur=c.bcur==='usd'?'ngn':'usd';
var converted=c.bcur==='usd'?amt*s.exRate:amt/s.exRate;
b[c.bcur]-=amt;b[toCur]+=converted;
b.tx.unshift({id:this.uid(),date:new Date().toISOString().slice(0,10),type:'transfer',amount:amt,currency:c.bcur,desc:'Transfer to '+toCur.toUpperCase()+': '+this.fmtM(converted,toCur),bal:b[c.bcur]});
this.toast('Transferred '+this.fmtM(amt,c.bcur)+' \u2192 '+this.fmtM(converted,toCur));
}
this.save();this.closeMo();this.renderBank();
};

/* ===== SETTINGS ===== */
MV.renderSettings=function(){
var m=document.getElementById('main'),s=this.data.settings,self=this;
var h='<div class="thdr"><div><h2>Settings</h2><div class="sub">Configure your MusicVerse</div></div></div>';
h+='<div class="ssec"><h3>Per-Stream Payout Rates (USD)</h3>';
PL.forEach(function(p){h+='<div class="srow"><label>'+PN[p]+'</label><input id="sr-'+p+'" type="number" step="0.001" min="0" value="'+s.rates[p]+'" style="max-width:140px"></div>'});
h+='<div style="margin-top:.6rem"><button class="btn bp bsm" onclick="MV.saveRates()">Save Rates</button></div></div>';
h+='<div class="ssec"><h3>Royalty Splits (%)</h3><div class="srow"><label>Personal %</label><input id="ss-p" type="number" min="0" max="100" value="'+s.splits.personal+'" style="max-width:100px"></div><div class="srow"><label>Label %</label><input id="ss-l" type="number" min="0" max="100" value="'+s.splits.label+'" style="max-width:100px"></div><div class="srow"><label>Tax %</label><input id="ss-t" type="number" min="0" max="100" value="'+s.splits.tax+'" style="max-width:100px"></div><div style="margin-top:.6rem"><button class="btn bp bsm" onclick="MV.saveSplits()">Save Splits</button></div></div>';
h+='<div class="ssec"><h3>Exchange Rate</h3><div class="srow"><label>1 USD =</label><input id="ss-ex" type="number" min="0" value="'+s.exRate+'" style="max-width:140px"><label style="min-width:auto;margin-left:.4rem">NGN</label></div><div style="margin-top:.6rem"><button class="btn bp bsm" onclick="MV.saveExRate()">Save Rate</button></div></div>';
h+='<div class="ssec"><h3>Currency Symbols</h3><div class="srow"><label>USD Symbol</label><input id="ss-cu" value="'+s.cur.usd+'" style="max-width:80px"></div><div class="srow"><label>NGN Symbol</label><input id="ss-cn" value="'+s.cur.ngn+'" style="max-width:80px"></div><div style="margin-top:.6rem"><button class="btn bp bsm" onclick="MV.saveCurSymbols()">Save Symbols</button></div></div>';
h+='<div class="ssec"><h3>Data Management</h3><div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="btn bp" onclick="MV.exportData()">Export All Data</button><button class="btn bs" onclick="document.getElementById(\'imp-file\').click()">Import Data</button><input type="file" id="imp-file" accept=".json" style="display:none" onchange="MV.importData(event)"><button class="btn bd" onclick="MV.resetSystem()">Reset Everything</button></div></div>';
m.innerHTML=h;
};
MV.saveRates=function(){
var s=this.data.settings;
PL.forEach(function(p){s.rates[p]=parseFloat(document.getElementById('sr-'+p).value)||0});
this.save();this.toast('Payout rates saved');
};
MV.saveSplits=function(){
var s=this.data.settings;
s.splits.personal=parseInt(document.getElementById('ss-p').value)||0;
s.splits.label=parseInt(document.getElementById('ss-l').value)||0;
s.splits.tax=parseInt(document.getElementById('ss-t').value)||0;
this.save();this.toast('Splits saved');
};
MV.saveExRate=function(){
this.data.settings.exRate=parseFloat(document.getElementById('ss-ex').value)||1;
this.save();this.toast('Exchange rate saved');
};
MV.saveCurSymbols=function(){
this.data.settings.cur.usd=document.getElementById('ss-cu').value||'$';
this.data.settings.cur.ngn=document.getElementById('ss-cn').value||'\u20A6';
this.save();this.toast('Currency symbols saved');
};
MV.exportData=function(){
var blob=new Blob([JSON.stringify(this.data,null,2)],{type:'application/json'});
var a=document.createElement('a');a.href=URL.createObjectURL(blob);
a.download='musicverse-backup-'+new Date().toISOString().slice(0,10)+'.json';
a.click();URL.revokeObjectURL(a.href);this.toast('Data exported');
};
MV.importData=function(e){
var file=e.target.files[0];if(!file)return;
var r=new FileReader();
r.onload=function(ev){
try{var d=JSON.parse(ev.target.result);MV.data=d;MV.save();MV.go('artists');MV.toast('Data imported successfully')}
catch(err){MV.toast('Invalid file')}
};r.readAsText(file);e.target.value='';
};
MV.resetSystem=function(){
if(!confirm('This will DELETE all your data. Are you sure?'))return;
if(!confirm('Really? This cannot be undone.'))return;
localStorage.removeItem('mv');this.data=dd();this.save();this.go('artists');this.toast('System reset');
};

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded',function(){MV.init()});
