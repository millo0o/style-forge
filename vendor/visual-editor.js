var _=[{name:"font-family",label:"\uD3F0\uD2B8",type:"font",group:"\uAE00\uC528"},{name:"font-size",label:"\uD06C\uAE30",type:"number",unit:"px",max:300,group:"\uAE00\uC528"},{name:"font-weight",label:"\uAD75\uAE30",type:"weight",group:"\uAE00\uC528"},{name:"line-height",label:"\uD589\uAC04",type:"number",unit:"px",max:500,group:"\uAE00\uC528"},{name:"letter-spacing",label:"\uC790\uAC04",type:"number",unit:"px",min:-20,max:100,group:"\uAE00\uC528"},{name:"color",label:"\uAE00\uC528 \uC0C9",type:"color",group:"\uC0C9\uC0C1"},{name:"background-color",label:"\uBC30\uACBD \uC0C9",type:"color",group:"\uC0C9\uC0C1"},...["top","right","bottom","left"].map(n=>({name:"padding-"+n,label:{top:"\uC704",right:"\uC624\uB978\uCABD",bottom:"\uC544\uB798",left:"\uC67C\uCABD"}[n],type:"number",unit:"px",max:500,group:"\uC548\uCABD \uC5EC\uBC31"})),...["top","right","bottom","left"].map(n=>({name:"margin-"+n,label:{top:"\uC704",right:"\uC624\uB978\uCABD",bottom:"\uC544\uB798",left:"\uC67C\uCABD"}[n],type:"number",unit:"px",min:-500,max:500,group:"\uBC14\uAE65 \uC5EC\uBC31"})),{name:"width",label:"\uB108\uBE44",type:"number",unit:"px",max:3e3,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"height",label:"\uB192\uC774",type:"number",unit:"px",max:3e3,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-radius",label:"\uBAA8\uC11C\uB9AC",type:"number",unit:"px",max:500,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-width",label:"\uD14C\uB450\uB9AC \uB450\uAED8",type:"number",unit:"px",max:50,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-style",label:"\uD14C\uB450\uB9AC \uC885\uB958",type:"border",group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-color",label:"\uD14C\uB450\uB9AC \uC0C9",type:"color",group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"}],M={all:"",mobile:"(max-width: 767px)",desktop:"(min-width: 768px)"},Ae=()=>({version:"1.2",important:!0,changes:[]}),bt=new Set(_.map(n=>n.name));function Te(n,r){if(typeof n!="string"||n.length>1e3||/[{};\r\n]|\/\*/.test(n))throw Error("\uC62C\uBC14\uB978 CSS \uC120\uD0DD\uC790\uB97C \uC785\uB825\uD558\uC138\uC694.");return r.querySelectorAll(n),n}function je(n,r){if(!n||!Array.isArray(n.changes)||n.changes.length>200)throw Error("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uD3B8\uC9D1 \uD504\uB85C\uC81D\uD2B8\uC785\uB2C8\uB2E4.");let i=[];for(let a of n.changes){if(Te(a.selector,r),!Object.hasOwn(M,a.media))throw Error("\uBBF8\uB514\uC5B4 \uC870\uAC74\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");let d={};for(let[u,f]of Object.entries(a.properties||{})){if(!bt.has(u)||typeof f!="string"||f.length>250||/[{};\r\n]|url\s*\(/i.test(f)||!r.defaultView.CSS.supports(u,f))throw Error("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 CSS \uC18D\uC131: "+u);d[u]=f}Object.keys(d).length&&i.push({...typeof a.important=="boolean"?{important:a.important}:{},selector:a.selector,media:a.media,properties:d})}return{version:"1.2",important:n.important!==!1,changes:i}}function xt(n,r,i,a,d){if(!bt.has(a))throw Error("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uC18D\uC131");let u=structuredClone(n),f=u.changes.find(t=>t.selector===r&&t.media===i);return f||(f={selector:r,media:i,properties:{}},u.changes.push(f)),d===null?delete f.properties[a]:f.properties[a]=d,u.changes=u.changes.filter(t=>Object.keys(t.properties).length),u}function $(n){return`/* STYLE FORGE v1.2 \xB7 \uAC80\uD1A0 \uD6C4 \uBCC4\uB3C4 override CSS\uB85C \uC801\uC6A9 */
`+n.changes.map(i=>{let a=i.selector+` {
`+Object.entries(i.properties).map(([d,u])=>"  "+d+": "+u+(i.important??n.important?" !important":"")+";").join(`
`)+`
}`;return M[i.media]?"@media "+M[i.media]+` {
`+a.split(`
`).map(d=>"  "+d).join(`
`)+`
}`:a}).join(`

`)+`
`}function Pe(n){let r=n.ownerDocument,i=r.defaultView.CSS;if(n.id){let u="#"+i.escape(n.id);if(r.querySelectorAll(u).length===1)return{selector:u,fragile:!1}}let a=[],d=n;for(;d&&d.nodeType===1;){let u=d.tagName.toLowerCase(),f=[...d.classList].filter(y=>!/[{}]/.test(y)).slice(0,3);f.length&&(u+=f.map(y=>"."+i.escape(y)).join(""));let t=d.parentElement?[...d.parentElement.children].filter(y=>y.tagName===d.tagName):[];t.length>1&&(u+=":nth-of-type("+(t.indexOf(d)+1)+")"),a.unshift(u);let m=a.join(" > ");if(r.querySelectorAll(m).length===1)return{selector:m,fragile:m.includes(":nth-of-type")};d=d.parentElement}return{selector:a.join(" > "),fragile:!0}}function yt(n){let r=[...n.classList].filter(i=>!/[{}]/.test(i));return r.length?n.tagName.toLowerCase()+r.map(i=>"."+n.ownerDocument.defaultView.CSS.escape(i)).join(""):null}var de=class{constructor(r=Ae()){this.states=[structuredClone(r)],this.index=0,this.lastKey="",this.lastTime=0}get current(){return structuredClone(this.states[this.index])}commit(r,i="",a=Date.now()){if(JSON.stringify(r)===JSON.stringify(this.states[this.index]))return;let d=i&&i===this.lastKey&&a-this.lastTime<450&&this.index===this.states.length-1&&this.index>0;this.states=this.states.slice(0,this.index+1),d?this.states[this.index]=structuredClone(r):(this.states.push(structuredClone(r)),this.index++),this.states.length>101&&(this.states.shift(),this.index--),this.lastKey=i,this.lastTime=a}undo(){return this.index>0&&this.index--,this.lastKey="",this.current}redo(){return this.index<this.states.length-1&&this.index++,this.lastKey="",this.current}get canUndo(){return this.index>0}get canRedo(){return this.index<this.states.length-1}};function ue(n){if(!n||!Array.isArray(n.rules)||n.rules.length>3e4||!Array.isArray(n.files))throw Error("\uC2A4\uD0A8 \uBD84\uC11D\uAE30\uC5D0\uC11C \uB0B4\uBCF4\uB0B8 JSON\uC744 \uC120\uD0DD\uD558\uC138\uC694.");return{rules:n.rules.filter(r=>typeof r.selector=="string"&&r.selector.length<=1e3&&typeof r.file=="string"&&r.file.length<=2e3&&!/(^|\/)\.\.(\/|$)/.test(r.file)&&Number.isInteger(r.line)&&r.line>0).map(r=>({selector:r.selector,file:r.file,line:r.line,context:String(r.context||"\uAE30\uBCF8").slice(0,2e3)}))}}function Ie(n,r){return!n||!r?[]:r.rules.filter(i=>{try{return n.matches(i.selector)}catch{return!1}}).map(i=>({...i,status:"\uD604\uC7AC DOM \uC120\uD0DD\uC790 \uC77C\uCE58 \xB7 \uC801\uC6A9 \uC6B0\uC120\uC21C\uC704 \uBBF8\uD655\uC778"}))}var Ct=new Set(_.map(n=>n.name));function te(n){let r=new URL(n);if(!["http:","https:"].includes(r.protocol)||r.username||r.password)throw Error("\uC62C\uBC14\uB978 \uD648\uD398\uC774\uC9C0 \uC8FC\uC18C\uAC00 \uC544\uB2D9\uB2C8\uB2E4.");for(let i of r.searchParams.keys())if(/^(password|pass|token|access_token|refresh_token|auth|authorization|session|sessionid|sid|api_key|key)$/i.test(i))throw Error("\uC778\uC99D \uC815\uBCF4\uAC00 \uD3EC\uD568\uB41C \uC8FC\uC18C\uB294 \uC81C\uCD9C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC77C\uBC18 \uD398\uC774\uC9C0 \uC8FC\uC18C\uB97C \uC0AC\uC6A9\uD558\uC138\uC694.");return r.searchParams.sort(),r.origin+r.pathname+r.search}function vt(n,r,i=()=>!0){if(!Array.isArray(n)||!n.length||n.length>200)throw Error("\uC218\uC815 \uD56D\uBAA9\uC740 1\u2013200\uAC1C\uC5EC\uC57C \uD569\uB2C8\uB2E4.");return n.map(a=>{let d=te(a.pageUrl);if(new URL(d).origin!==r)throw Error("\uD504\uB85C\uC81D\uD2B8\uC5D0 \uB4F1\uB85D\uB41C \uC0AC\uC774\uD2B8\uC758 \uC218\uC815\uC548\uB9CC \uC81C\uCD9C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");if(typeof a.selector!="string"||!a.selector||a.selector.length>1e3||/[{};\r\n]|\/\*/.test(a.selector)||!Object.hasOwn(M,a.media))throw Error("\uC798\uBABB\uB41C \uB300\uC0C1 \uC120\uD0DD\uC790 \uB610\uB294 \uD654\uBA74 \uBC94\uC704");let u={};for(let[m,y]of Object.entries(a.properties||{})){if(!Ct.has(m)||typeof y!="string"||y.length>250||/[{};\r\n]|url\s*\(/i.test(y)||!i(m,y))throw Error("\uD5C8\uC6A9\uB418\uC9C0 \uC54A\uC740 CSS \uC18D\uC131: "+m);u[m]=y}if(!Object.keys(u).length)throw Error("\uBCC0\uACBD\uD55C CSS\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");let f={};for(let m of Object.keys(u))typeof a.before?.[m]=="string"&&(f[m]=a.before[m].slice(0,250));let t=Array.isArray(a.sources)?a.sources.slice(0,30).filter(m=>typeof m.file=="string"&&m.file.length<1e3&&!/(^|\/)\.\.(\/|$)/.test(m.file)&&Number.isInteger(m.line)&&m.line>0).map(m=>({file:m.file,line:m.line})):[];return{pageUrl:d,selector:a.selector,media:a.media,properties:u,before:f,sources:t,important:a.important!==!1,label:String(a.label||a.selector).slice(0,160)}})}function wt(n,r,i){let a=[],d=!0,u=n.createElement("div");return u.className="review-overlays",r.append(u),{load(f){if(!["style-forge-review-v1","style-forge-submission-v1"].includes(f?.format))throw Error("\uB2F4\uB2F9\uC790 \uAC80\uD1A0\uD568\uC758 \uD648\uD398\uC774\uC9C0 \uD45C\uC2DC JSON\uC744 \uC120\uD0DD\uD558\uC138\uC694.");let t=vt(f.items,new URL(f.items[0]?.pageUrl).origin,(w,L)=>n.defaultView.CSS.supports(w,L)),m=te(n.defaultView.location.href),y=t.map((w,L)=>({...w,status:f.items[L].status||"pending"})).filter(w=>w.pageUrl===m);if(!y.length)throw Error("\uD604\uC7AC \uD398\uC774\uC9C0\uC5D0 \uD574\uB2F9\uD558\uB294 \uC218\uC815 \uC694\uCCAD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. JSON\uC758 \uD398\uC774\uC9C0 \uC8FC\uC18C\uB97C \uD655\uC778\uD558\uC138\uC694.");a=[],u.replaceChildren();let A=0,v=0;for(let w of y){let L=[];try{L=[...n.querySelectorAll(w.selector)].filter(g=>g.tagName!=="STYLE-FORGE-EDITOR")}catch{}L.length||A++,v+=L.length;for(let g of L.slice(0,10)){if(a.length>=100)break;let S=n.createElement("div");S.className="review-mark";let k=n.createElement("button");k.className="review-badge",k.textContent=(w.status==="approved"?"\uC2B9\uC778":w.status==="applied"?"\uC801\uC6A9 \uC644\uB8CC":w.status==="revision_requested"?"\uC7AC\uC218\uC815 \uC694\uCCAD":"\uC218\uC815 \uC694\uCCAD")+" \xB7 "+w.label,k.title=w.selector,k.addEventListener("click",()=>i(g)),S.append(k),u.append(S),a.push({element:g,box:S})}}return{items:y,total:v,missing:A,displayed:a.length}},draw(){for(let{element:f,box:t}of a){if(!d||!f.isConnected){t.hidden=!0;continue}let m=f.getBoundingClientRect();t.hidden=m.width===0&&m.height===0,Object.assign(t.style,{left:m.left+"px",top:m.top+"px",width:m.width+"px",height:m.height+"px"})}},toggle(){return d=!d,u.hidden=!d,this.draw(),d},clear(){a=[],u.remove()}}}var St=`:host {
  all: initial;
}
.panel {
  box-sizing: border-box;
  position: fixed;
  right: 18px;
  top: 18px;
  width: 350px;
  max-height: calc(100vh - 36px);
  overflow: auto;
  background: #fff;
  color: #262932;
  border: 1px solid #e5e6ed;
  border-radius: 13px;
  box-shadow: 0 12px 50px #15162826;
  pointer-events: auto;
  font:
    12px/1.6 Arial,
    "Malgun Gothic",
    sans-serif;
}
* {
  box-sizing: border-box;
}
button,
input,
select,
textarea {
  font: inherit;
}
button {
  cursor: pointer;
  border: 1px solid #e5e6ed;
  border-radius: 6px;
  background: white;
  color: #676978;
  padding: 7px 10px;
}
button:hover {
  background: #f4f2ff;
}
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
input,
select {
  width: 100%;
  border: 1px solid #e5e6ed;
  border-radius: 5px;
  background: #fff;
  color: #484a57;
  padding: 7px;
  min-width: 0;
}
input:focus,
select:focus,
textarea:focus,
button:focus-visible {
  outline: 2px solid #aaa3ff;
  outline-offset: 1px;
}
input[type="color"] {
  height: 33px;
  padding: 4px;
}
input[type="checkbox"] {
  width: auto;
  accent-color: #635bff;
}
.header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 15px 16px;
  background: #fff;
  border-bottom: 1px solid #eeeef3;
}
.mark {
  font-size: 24px;
  color: #635bff;
}
.header strong {
  font-size: 12px;
  letter-spacing: 0.5px;
  flex: 1;
}
.header small {
  font-size: 9px;
  color: #b0b1b9;
}
.quiet {
  border: 0;
  padding: 3px 6px;
  background: transparent;
}
.body {
  padding: 16px;
}
.toolbar {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.primary {
  background: #635bff;
  border-color: #635bff;
  color: #fff;
}
.primary:hover {
  background: #5047eb;
}
.toolbar .active {
  color: #635bff;
  border-color: #bdb6ff;
  background: #f4f2ff;
}
.hint {
  font-size: 10px;
  color: #9599a5;
  line-height: 1.8;
}
.selection {
  padding: 12px;
  background: #fafafd;
  border: 1px solid #ededf3;
  border-radius: 7px;
  margin-bottom: 12px;
}
.selection strong {
  display: block;
  font: 11px/1.8 monospace;
  overflow-wrap: anywhere;
  color: #756b9a;
}
.selection p {
  font-size: 10px;
  color: #9699a4;
  margin: 5px 0;
  overflow-wrap: anywhere;
}
.selection .meta {
  color: #b0acba;
  font-size: 9px;
}
.ancestor-list {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.ancestor-list button {
  font-size: 9px;
  padding: 3px 5px;
  color: #8a809d;
}
.selector-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 12px 0;
}
.selector-controls label {
  color: #8a8e9c;
  font-size: 10px;
}
.selector-controls select {
  margin-top: 5px;
  font-size: 11px;
}
.selector-row {
  display: flex;
  gap: 5px;
  margin-top: 7px;
}
.selector-row input {
  font: 10px monospace;
}
.selector-row button {
  font-size: 10px;
  white-space: nowrap;
}
.count {
  font-size: 10px;
  color: #918aa7;
  margin-top: 7px;
}
.section {
  border-top: 1px solid #efeff4;
  padding-top: 14px;
  margin-top: 16px;
}
.section h3 {
  font-size: 11px;
  margin: 0 0 12px;
}
.fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 11px 9px;
}
.field label {
  display: block;
  color: #8c909b;
  font-size: 10px;
  margin-bottom: 4px;
}
.field .control {
  display: flex;
  align-items: center;
  gap: 3px;
}
.field .unit {
  font-size: 9px;
  color: #b1b3bc;
}
.field .reset {
  font-size: 12px;
  padding: 3px;
  border: 0;
  color: #b2adc5;
}
.wide {
  grid-column: 1/-1;
}
.footer-actions {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.footer-actions button {
  flex: 1;
  font-size: 10px;
  white-space: nowrap;
}
.code {
  display: block;
  width: 100%;
  height: 140px;
  resize: vertical;
  padding: 10px;
  font: 10px/1.8 monospace;
  color: #77708e;
  border: 1px solid #e8e9ef;
  border-radius: 6px;
  background: #fbfbfd;
}
.important {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 10px;
  color: #8e8b9c;
  margin: 12px 0;
}
.source-card {
  padding: 9px 0;
  border-bottom: 1px solid #ededf4;
  font-size: 10px;
  overflow-wrap: anywhere;
}
.source-card strong {
  font: 10px monospace;
  color: #7e719f;
  display: block;
}
.source-card p {
  font-size: 9px;
  color: #a2a0ad;
  margin: 4px 0;
}
.file-picker {
  position: relative;
  display: block;
  border: 1px dashed #dedbe9;
  border-radius: 6px;
  padding: 10px;
  text-align: center;
  color: #8a809c;
  font-size: 10px;
  cursor: pointer;
  overflow: hidden;
}
.file-picker input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.file-picker:focus-within {
  outline: 2px solid #aaa3ff;
}
.status {
  color: #7f739e;
  font-size: 10px;
  line-height: 1.8;
  margin: 12px 0 0;
  min-height: 18px;
}
.outline {
  position: fixed;
  pointer-events: none;
  border: 2px solid #635bff;
  border-radius: 3px;
  background: #635bff08;
  display: none;
  box-sizing: border-box;
}
.outline-label {
  position: absolute;
  left: -2px;
  bottom: 100%;
  color: white;
  background: #635bff;
  padding: 3px 6px;
  border-radius: 3px 3px 0 0;
  font: 9px monospace;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.empty {
  padding: 18px 5px;
  text-align: center;
  color: #a0a2ae;
  font-size: 11px;
}
.warning {
  padding: 8px 10px;
  color: #a08256;
  background: #fff8eb;
  border-radius: 5px;
  font-size: 9px;
  line-height: 1.8;
  margin: 9px 0;
}
summary {
  cursor: pointer;
  font-size: 11px;
  color: #797284;
  padding: 9px 0;
}
details {
  margin-top: 8px;
}
.changes-item {
  font-size: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  font-family: monospace;
  overflow-wrap: anywhere;
}
.review-list {
  max-height: 160px;
  overflow: auto;
}
.review-list pre {
  font: 10px/1.8 monospace;
  white-space: pre-wrap;
  margin: 6px 0;
  color: #8d839c;
}
[hidden] {
  display: none !important;
}
@media (max-width: 700px) {
  .panel {
    top: auto;
    bottom: 10px;
    right: 10px;
    left: 10px;
    width: auto;
    max-height: 48vh;
  }
  .body {
    padding: 12px;
  }
  .header {
    padding: 10px 12px;
  }
  .hint {
    font-size: 9px;
  }
}

.review-mark {
  position: fixed;
  border: 2px dashed #ab79c8;
  pointer-events: none;
  box-sizing: border-box;
  border-radius: 4px;
  background: #b487cf09;
}
.review-badge {
  position: absolute;
  left: 0;
  top: 0;
  transform: translateY(-100%);
  pointer-events: auto;
  font:
    9px Arial,
    sans-serif;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: #a578c2;
  color: white;
  border: 0;
  padding: 4px 6px;
  border-radius: 4px 4px 0 0;
}

.panel {
  z-index: 2;
}
.review-mark,
.outline {
  z-index: 1;
}
`;function Jt(n=document,r={}){let i=n.defaultView;if(n.querySelector("style-forge-editor"))return null;let a=n.createElement("style-forge-editor");a.style.cssText="all:initial!important;position:fixed!important;inset:0!important;pointer-events:none!important;z-index:2147483647!important;";let d=a.attachShadow({mode:"open"}),u=n.createElement("style");u.textContent=St,d.append(u);let f=n.createElement("style");f.dataset.styleForgePatch="",n.head.append(f);let t=(e,o="",s="")=>{let c=n.createElement(e);return c.textContent=o,c.className=s,c},m=t("section","","panel");m.setAttribute("aria-label","STYLE FORGE \uBE44\uC8FC\uC5BC \uD3B8\uC9D1\uAE30");let y=t("div","","header");y.append(t("span","\u2733","mark"),t("strong","STYLE FORGE"),t("small","VISUAL 1.2"));let A=t("button","\xD7","quiet");A.title="\uD3B8\uC9D1\uAE30 \uB2EB\uAE30 \xB7 \uC784\uC2DC \uBCC0\uACBD \uC81C\uAC70",A.setAttribute("aria-label",A.title),y.append(A);let v=t("div","","body");m.append(y,v);let w=t("div","","outline"),L=t("div","","outline-label");w.append(L),d.append(w,m),n.documentElement.append(a);let g=null,S="",k="all",I=!0,O=!1,T=null,fe=!1,ne=new Map,Y=null,C=new de,p=C.current,Je=new Map,Ue=t("div","","toolbar"),oe=t("button","\u25CE \uC694\uC18C \uC120\uD0DD","primary"),re=t("button","\u21B6",""),ie=t("button","\u21B7",""),H=t("button","\uC6D0\uBCF8 \uBE44\uAD50");re.title="\uC2E4\uD589 \uCDE8\uC18C",ie.title="\uB2E4\uC2DC \uC2E4\uD589",Ue.append(oe,re,ie,H),v.append(Ue,t("p","\uC1FC\uD551\uBAB0\uC758 \uAE00\uC528\xB7\uBC84\uD2BC\xB7\uC601\uC5ED\uC744 \uD074\uB9AD\uD558\uC138\uC694. \uC120\uD0DD \uBAA8\uB4DC\uC5D0\uC11C\uB294 \uB9C1\uD06C \uC774\uB3D9\uACFC \uBC84\uD2BC \uB3D9\uC791\uC744 \uB9C9\uC2B5\uB2C8\uB2E4. Esc\uB85C \uC120\uD0DD \uBAA8\uB4DC\uB97C \uB055\uB2C8\uB2E4.","hint"));let Me=t("div","","selection"),ae=t("strong","\uC120\uD0DD\uD55C \uC694\uC18C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4"),_e=t("p","\uD654\uBA74\uC5D0\uC11C \uBC14\uAFB8\uACE0 \uC2F6\uC740 \uC601\uC5ED\uC744 \uD074\uB9AD\uD558\uC138\uC694."),$e=t("p","","meta"),me=t("div","","ancestor-list");Me.append(ae,_e,$e,me),v.append(Me);let ge=t("div","","selector-controls"),De=t("label","\uB300\uC0C1 \uBC94\uC704"),J=t("select");for(let[e,o]of[["single","\uC120\uD0DD \uC694\uC18C\uB9CC"],["shared","\uAC19\uC740 class\uC758 \uC694\uC18C"]]){let s=t("option",o);s.value=e,J.append(s)}De.append(J);let Fe=t("label","\uC801\uC6A9 \uD654\uBA74"),W=t("select");for(let[e,o]of[["all","\uBAA8\uB4E0 \uD654\uBA74"],["mobile","\uBAA8\uBC14\uC77C \u2264 767px"],["desktop","\uB370\uC2A4\uD06C\uD1B1 \u2265 768px"]]){let s=t("option",o);s.value=e,W.append(s)}Fe.append(W),ge.append(De,Fe),v.append(ge);let Ke=t("div","","selector-row"),D=t("input"),he=t("button","\uC801\uC6A9");D.setAttribute("aria-label","CSS \uB300\uC0C1 \uC120\uD0DD\uC790"),Ke.append(D,he),v.append(Ke);let qe=t("p","","count"),se=t("p","","warning");se.hidden=!0,v.append(qe,se);let Ve=t("div");v.append(Ve);let Be="",be;for(let e of _){if(Be!==e.group){Be=e.group;let x=t("section","","section");x.append(t("h3",e.group)),be=t("div","","fields"),x.append(be),Ve.append(x)}let o=t("div","",e.type==="font"?"field wide":"field"),s=t("label",e.label),c=t("div","","control"),l;if(["font","weight","border"].includes(e.type)){l=t("select");let x=e.type==="font"?[["__current","\uD604\uC7AC \uD3F0\uD2B8"],["system-ui, sans-serif","\uC2DC\uC2A4\uD15C \uC0B0\uC138\uB9AC\uD504"],["Arial, sans-serif","Arial"],["Georgia, serif","Georgia"],["monospace","\uBAA8\uB178\uC2A4\uD398\uC774\uC2A4"]]:e.type==="weight"?[["__current","\uD604\uC7AC \uAD75\uAE30"],...["100","200","300","400","500","600","700","800","900"].map(R=>[R,R])]:["none","solid","dashed","dotted","double"].map(R=>[R,{none:"\uC5C6\uC74C",solid:"\uC2E4\uC120",dashed:"\uB300\uC2DC",dotted:"\uC810\uC120",double:"\uC774\uC911\uC120"}[R]]);for(let[R,z]of x){let P=t("option",z);P.value=R,l.append(P)}}else l=t("input"),l.type=e.type,e.type==="number"&&(l.min=e.min??0,l.max=e.max,l.step=e.name==="letter-spacing"?"0.1":"1");l.dataset.property=e.name,l.id="sf-property-"+e.name,s.htmlFor=l.id,l.setAttribute("aria-label",e.group+" "+e.label);let b=t("button","\u21BA","reset");b.type="button",b.title=e.label+" \uBCC0\uACBD \uC81C\uAC70",b.setAttribute("aria-label",b.title),b.addEventListener("click",()=>Ne(e.name,null)),c.append(l),e.unit&&c.append(t("span",e.unit,"unit")),c.append(b),o.append(s,c),be.append(o),Je.set(e.name,l),l.addEventListener("input",()=>{if(!g)return;let x=l.value;if(x==="__current"){Ne(e.name,null);return}if(e.type==="number"){if(!x||!Number.isFinite(Number(x))||Number(x)<Number(l.min)||Number(x)>Number(l.max))return;x+=e.unit}i.CSS.supports(e.name,x)&&Ne(e.name,x)})}let Ge=t("label","","important"),F=t("input");F.type="checkbox",F.checked=!0,Ge.append(F,n.createTextNode("!important\uB85C \uBBF8\uB9AC\uBCF4\uAE30 \uC6B0\uC120 \uC801\uC6A9")),v.append(Ge);let xe=t("button","\uC120\uD0DD \uBC94\uC704 \uBCC0\uACBD \uC81C\uAC70"),Ye=t("button","\uBAA8\uB4E0 \uBCC0\uACBD \uC81C\uAC70"),He=t("div","","footer-actions");He.append(xe,Ye),v.append(He);let ye=t("section","","section");ye.append(t("h3","\uC2A4\uD0A8 \uD30C\uC77C \uC5F0\uACB0"));let We=t("label","\uC2A4\uD0A8 \uBD84\uC11D JSON \uC5F0\uACB0","file-picker"),K=t("input");K.type="file",K.accept=".json",K.setAttribute("aria-label","\uC2A4\uD0A8 \uBD84\uC11D JSON \uC5F0\uACB0"),We.append(K);let q=t("div");ye.append(We,t("p","\uC2A4\uD0A8 \uBD84\uC11D\uAE30 \u2192 \uBE44\uC8FC\uC5BC \uC5F0\uACB0 JSON \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694. \uC6D0\uBCF8 \uC2A4\uD0A8 \uCF54\uB4DC\uB294 \uC804\uC1A1\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.","hint"),q),v.append(ye);let j=t("details"),Et=t("summary","\uD604\uC7AC \uC801\uC6A9 CSS\uC640 \uAD6C\uC870"),X=t("div");j.append(Et,X),v.append(j);let Xe=t("details"),Qe=t("summary","\uBCC0\uACBD\uC0AC\uD56D \uAC80\uD1A0"),Ze=t("div","","review-list");Xe.append(Qe,Ze),v.append(Xe);let ve=t("section","","section");ve.append(t("h3","\uC218\uC815 \uCF54\uB4DC"));let le=t("textarea","","code");le.readOnly=!0,le.setAttribute("aria-label","\uBCC0\uACBD CSS");let we=t("button","CSS \uBCF5\uC0AC"),Se=t("button","CSS \uB2E4\uC6B4\uB85C\uB4DC","primary"),et=t("div","","footer-actions");et.append(we,Se),ve.append(le,et,t("p","\uAC80\uD1A0\uD55C \uCF54\uB4DC\uB97C \uBCC4\uB3C4 override CSS\uB85C \uC5F0\uACB0\uD558\uC138\uC694. FTP\xB7\uC6B4\uC601 \uD30C\uC77C\uC740 \uC218\uC815\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC778\uB77C\uC778 !important\uAC00 \uC788\uC73C\uBA74 \uC6D0\uBCF8 \uCF54\uB4DC \uC870\uC815\uC774 \uCD94\uAC00\uB85C \uD544\uC694\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.","hint")),v.append(ve);let tt=t("button","\uD3B8\uC9D1 \uC800\uC7A5"),nt=t("button","\uC800\uC7A5 \uBD88\uB7EC\uC624\uAE30"),Ee=t("button","\uD3B8\uC9D1 JSON"),ot=t("label","\uD3B8\uC9D1 JSON \uBD88\uB7EC\uC624\uAE30","file-picker"),V=t("input");V.type="file",V.accept=".json",V.setAttribute("aria-label","\uD3B8\uC9D1 JSON \uBD88\uB7EC\uC624\uAE30"),ot.append(V);let rt=t("div","","footer-actions");rt.append(tt,nt,Ee),v.append(rt,ot);let pe=t("p","","status");pe.setAttribute("role","status"),pe.setAttribute("aria-live","polite"),v.append(pe);let Ce=t("section","","section");Ce.append(t("h3","\uD074\uB77C\uC774\uC5B8\uD2B8 \uC218\uC815 \uC694\uCCAD"));let it=t("button",r.onSubmit?"\uAC80\uD1A0 \uC694\uCCAD \uBCF4\uB0B4\uAE30":"\uAC80\uD1A0 \uC694\uCCAD \uD30C\uC77C","primary"),at=t("label","\uD648\uD398\uC774\uC9C0 \uD45C\uC2DC / \uACE0\uAC1D \uC694\uCCAD JSON \uBD88\uB7EC\uC624\uAE30","file-picker"),B=t("input");B.type="file",B.accept=".json",B.setAttribute("aria-label","\uD648\uD398\uC774\uC9C0 \uD45C\uC2DC JSON"),at.append(B);let Q=t("button","\uC218\uC815 \uC601\uC5ED \uD45C\uC2DC \uB044\uAE30");Q.hidden=!0,Ce.append(it,t("p","\uC694\uCCAD\uC5D0\uB294 \uD398\uC774\uC9C0 \uC8FC\uC18C, \uC218\uC815\uD55C \uC601\uC5ED\uACFC \uC804\uD6C4 \uAC12\uB9CC \uD3EC\uD568\uD569\uB2C8\uB2E4. \uC2A4\uD0A8 \uD30C\uC77C \uBCF8\uBB38\uACFC FTP \uC815\uBCF4\uB294 \uC804\uC1A1\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.","hint"),at,Q),v.insertBefore(Ce,ge);function st(){let e=te(i.location.href);return{format:"style-forge-submission-v1",items:p.changes.map(o=>{let s=ne.get(o.selector+"|"+o.media);return{...o,pageUrl:e,important:o.important??p.important,before:s?.before||{},label:s?.label||o.selector,sources:s?.sources||[]}})}}it.addEventListener("click",async e=>{if(!(r.onSubmit&&!e.isTrusted)){if(!p.changes.length){h("\uBA3C\uC800 \uC694\uC18C\uC758 \uB514\uC790\uC778\uC744 \uBCC0\uACBD\uD558\uC138\uC694.");return}try{r.onSubmit?(await r.onSubmit(st()),h("\uD611\uC5C5 \uAC80\uD1A0\uD568\uC744 \uC5F4\uC5C8\uC2B5\uB2C8\uB2E4. \uD074\uB77C\uC774\uC5B8\uD2B8 \uACC4\uC815\uC73C\uB85C \uB85C\uADF8\uC778 \uD6C4 \uC81C\uBAA9\uACFC \uBA54\uBAA8\uB97C \uB123\uC5B4 \uC81C\uCD9C\uD558\uC138\uC694.")):(Re(JSON.stringify(st(),null,2),"style-forge-submission.json","application/json"),h("\uD611\uC5C5 \uAC80\uD1A0\uD568\uC758 \uD074\uB77C\uC774\uC5B8\uD2B8 \uD654\uBA74\uC5D0\uC11C \uC694\uCCAD \uD30C\uC77C\uC744 \uBD88\uB7EC\uC624\uC138\uC694."))}catch(o){h("\uC694\uCCAD\uC744 \uC900\uBE44\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: "+o.message)}}}),Y=wt(n,d,ce);function ke(e){let o=Y.load(e);for(let s of o.items)ne.set(s.selector+"|"+s.media,{before:s.before,label:s.label,sources:s.sources});p={version:"1.2",important:o.items.every(s=>s.important),changes:o.items.map(({selector:s,media:c,properties:l,important:b})=>({selector:s,media:c,properties:l,important:b}))},C.commit(p),O=!1,N(),E(),Q.hidden=!1,h(`\uC694\uCCAD ${o.items.length}\uAC1C \uC601\uC5ED \xB7 \uC77C\uCE58 ${o.total}\uAC1C \uC694\uC18C \xB7 \uBBF8\uD655\uC778 ${o.missing}\uAC1C \xB7 \uD45C\uC2DC ${o.displayed}\uAC1C. \uC784\uC2DC \uBBF8\uB9AC\uBCF4\uAE30\uC774\uBA70 \uC6B4\uC601 \uBC18\uC601\uC774 \uC544\uB2D9\uB2C8\uB2E4.`)}B.addEventListener("change",async()=>{try{let e=await ze(B);e&&ke(e)}catch(e){h("\uC694\uCCAD \uD45C\uC2DC \uD30C\uC77C\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: "+e.message)}}),Q.addEventListener("click",()=>{let e=Y.toggle();Q.textContent=e?"\uC218\uC815 \uC601\uC5ED \uD45C\uC2DC \uB044\uAE30":"\uC218\uC815 \uC601\uC5ED \uD45C\uC2DC \uCF1C\uAE30"});let lt="style-forge.visual.v1:"+i.location.origin+i.location.pathname,pt=r.storage||{async get(e){return JSON.parse(i.localStorage.getItem(e)||"null")},async set(e,o){i.localStorage.setItem(e,JSON.stringify(o))}};function h(e){pe.textContent=e}function Le(){return p.changes.find(e=>e.selector===S&&e.media===k)}function Oe(){try{return[...n.querySelectorAll(S)].filter(e=>e!==a&&e!==f)}catch{return[]}}function G(){if(Y?.draw(),!g?.isConnected){w.style.display="none";return}let e=g.getBoundingClientRect();w.style.display="block",Object.assign(w.style,{left:e.left+"px",top:e.top+"px",width:e.width+"px",height:e.height+"px"}),L.textContent=g.tagName.toLowerCase()+(g.id?"#"+g.id:"")}function E(){let e=g?i.getComputedStyle(g):null,o=Le()?.properties||{};for(let s of _){let c=Je.get(s.name);c.disabled=!g;let l=o[s.name]??e?.getPropertyValue(s.name)??"";if(c.title="\uD604\uC7AC \uACC4\uC0B0\uAC12: "+l,s.type==="color"){let b=l.match(/rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/);c.value=/^#[\da-f]{6}$/i.test(l)?l:b?"#"+b.slice(1,4).map(x=>Number(x).toString(16).padStart(2,"0")).join(""):"#ffffff"}else s.type==="number"?c.value=/^-?[\d.]+px$/.test(l)?parseFloat(l):"":[...c.options].some(b=>b.value===l)?c.value=l:c.querySelector('option[value="__current"]')&&(c.options[0].textContent=l||"\uD604\uC7AC \uAC12",c.value="__current")}}function Z(){if(q.replaceChildren(),!T){q.append(t("p","\uBD84\uC11D JSON\uC744 \uC5F0\uACB0\uD558\uBA74 \uD604\uC7AC \uC694\uC18C\uC640 \uB9DE\uB294 CSS \uACBD\uB85C\xB7\uC904\uC744 \uBCF4\uC5EC\uC90D\uB2C8\uB2E4.","hint"));return}let e=Ie(g,T);q.append(t("p",e.length+"\uAC1C \uD30C\uC77C \uC704\uCE58 \uD6C4\uBCF4 \xB7 \uC2E4\uC81C \uC801\uC6A9 \uC6B0\uC120\uC21C\uC704\uB294 \uBCC4\uB3C4 \uD655\uC778","hint"));for(let o of e.slice(0,100)){let s=t("div","","source-card");s.append(t("strong",o.file+":"+o.line),t("p",o.selector),t("p",o.context+" \xB7 "+o.status)),q.append(s)}e.length>100&&q.append(t("p","\uCC98\uC74C 100\uAC1C\uB9CC \uD45C\uC2DC\uD569\uB2C8\uB2E4.","hint"))}function ee(){if(X.replaceChildren(),!g)return;let e=i.getComputedStyle(g);for(let b of _)X.append(t("div",b.name+": "+e.getPropertyValue(b.name),"source-card"));let o=0,s=0,c=0;function l(b,x,R="\uAE30\uBCF8"){for(let z of b){if(++c>15e3)return;if(z.selectorText)try{if(g.matches(z.selectorText)&&o++<30){let P=t("div","","source-card");P.append(t("strong",z.selectorText),t("p",x+" \xB7 "+R),t("p",z.style.cssText)),X.append(P)}}catch{}else if(z.cssRules){let P=R;z.conditionText&&(P=z.conditionText),l(z.cssRules,x,P)}}}for(let b of n.styleSheets)if(b.ownerNode!==f)try{l(b.cssRules,b.href||"\uC778\uB77C\uC778 \uC2A4\uD0C0\uC77C")}catch{s++}X.append(t("p",`\uBE0C\uB77C\uC6B0\uC800 CSSOM\uC5D0\uC11C ${o}\uAC1C \uC120\uD0DD\uC790 \uC77C\uCE58 \xB7 \uC678\uBD80 \uC2DC\uD2B8 ${s}\uAC1C \uC77D\uAE30 \uC81C\uD55C. \uC870\uAC74\xB7\uCE90\uC2A4\uCF00\uC774\uB4DC \uC6B0\uC2B9 \uC5EC\uBD80\uB97C \uB2E8\uC815\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`,"hint"))}function U(){let e=Oe().length,o=M[k];qe.textContent=S?`\uB300\uC0C1 ${e}\uAC1C \xB7 \uD604\uC7AC \uD654\uBA74 ${i.innerWidth}px${o&&!i.matchMedia(o).matches?" \xB7 \uBBF8\uB514\uC5B4 \uC870\uAC74 \uBBF8\uCDA9\uC871":""}`:"",le.value=$(p),re.disabled=!C.canUndo,ie.disabled=!C.canRedo,H.disabled=!p.changes.length,H.classList.toggle("active",O),H.textContent=O?"\uBCC0\uACBD \uD654\uBA74 \uBCF4\uAE30":"\uC6D0\uBCF8 \uBE44\uAD50",F.checked=p.important,Qe.textContent=`\uBCC0\uACBD\uC0AC\uD56D \uAC80\uD1A0 (${p.changes.length}\uAC1C \uADDC\uCE59)`,Ze.replaceChildren(...p.changes.map(c=>{let l=t("div",c.selector+" \xB7 "+c.media,"changes-item");return l.append(t("pre",Object.entries(c.properties).map(([b,x])=>b+": "+x).join(`
`))),l})),we.disabled=Se.disabled=Ee.disabled=!p.changes.length,xe.disabled=!g,J.disabled=W.disabled=D.disabled=he.disabled=!g;let s=g&&Object.keys(Le()?.properties||{}).some(c=>g.style.getPropertyPriority(c)==="important");se.hidden=!s&&!S.includes(":nth-of-type"),se.textContent=s?"\uC778\uB77C\uC778 !important\uAC00 \uC788\uC5B4 \uC77C\uBD80 \uAC12\uC774 \uB36E\uC5B4\uC368\uC9C0\uC9C0 \uC54A\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC218\uC815 \uCF54\uB4DC\uC5D0\uC11C \uC6D0\uBCF8 \uC778\uB77C\uC778 \uC2A4\uD0C0\uC77C\uB3C4 \uAC80\uD1A0\uD558\uC138\uC694.":"\uC704\uCE58 \uAE30\uBC18 \uC120\uD0DD\uC790\uC785\uB2C8\uB2E4. \uC0C1\uD488 \uC21C\uC11C\uB098 \uD398\uC774\uC9C0 \uAD6C\uC870\uAC00 \uBC14\uB00C\uBA74 \uB300\uC0C1\uC774 \uB2EC\uB77C\uC9C8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",G()}function N(){let e=$(p);f.textContent=r.applyCSS?"":e,f.disabled=O,r.applyCSS&&r.applyCSS(O?"":e).then(()=>{fe||(G(),j.open&&ee())}).catch(()=>h("\uC784\uC2DC CSS \uC801\uC6A9 \uAD8C\uD55C\uC744 \uD655\uC778\uD558\uC138\uC694. \uD655\uC7A5 \uC544\uC774\uCF58\uC73C\uB85C \uB2E4\uC2DC \uC5F4\uC5B4\uC8FC\uC138\uC694.")),U(),j.open&&ee()}function Ne(e,o){if(!g||!S)return;if(!Oe().includes(g)){h("\uC120\uD0DD \uC694\uC18C\uC640 \uB9DE\uB294 \uC120\uD0DD\uC790\uB97C \uBA3C\uC800 \uC801\uC6A9\uD558\uC138\uC694.");return}if(o!==null&&(!i.CSS.supports(e,o)||/[{};\r\n]/.test(o)))return;if(o!==null&&!Le()&&p.changes.length>=200){h("\uCD5C\uB300 200\uAC1C \uBC94\uC704\uAE4C\uC9C0 \uD3B8\uC9D1\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uAE30\uC874 \uBCC0\uACBD\uC744 \uC815\uB9AC\uD558\uC138\uC694.");return}let s=S+"|"+k,c=ne.get(s);c||(c={before:{},label:ae.textContent,sources:Ie(g,T).slice(0,30).map(({file:l,line:b})=>({file:l,line:b}))},ne.set(s,c)),o!==null&&!Object.hasOwn(c.before,e)&&(c.before[e]=i.getComputedStyle(g).getPropertyValue(e)),p=xt(p,S,k,e,o),C.commit(p,S+"|"+k+"|"+e),O=!1,N(),o===null&&E(),h("\uD654\uBA74\uC5D0 \uC784\uC2DC \uBC18\uC601\uD588\uC2B5\uB2C8\uB2E4. \uC11C\uBC84\uC758 \uD30C\uC77C\uC740 \uBCC0\uACBD\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.")}function ce(e){if(!e||e===a||e===f||["HTML","HEAD","SCRIPT","STYLE","LINK","META"].includes(e.tagName))return;g=e,S=Pe(e).selector,J.value="single",D.value=S,ae.textContent=e.tagName.toLowerCase()+(e.id?"#"+e.id:"")+[...e.classList].map(c=>"."+c).join(""),_e.textContent=(e.textContent||"").replace(/\s+/g," ").slice(0,100)||"(\uD14D\uC2A4\uD2B8 \uC5C6\uC74C)",$e.textContent="module: "+(e.getAttribute("module")||"\uC5C6\uC74C")+" \xB7 "+Math.round(e.getBoundingClientRect().width)+" \xD7 "+Math.round(e.getBoundingClientRect().height)+"px",me.replaceChildren();let s=e.parentElement;for(let c=0;s&&c<5&&s!==n.documentElement;c++,s=s.parentElement){let l=s,b=t("button","\u2191 "+s.tagName.toLowerCase()+(s.id?"#"+s.id:""));b.addEventListener("click",()=>ce(l)),me.append(b)}E(),Z(),U(),j.open&&ee(),h("\uC120\uD0DD\uD55C \uC694\uC18C\uC758 \uC2A4\uD0C0\uC77C\uC744 \uC870\uC808\uD558\uC138\uC694.")}function ct(e){e.composedPath().includes(a)||!I||!(e.target instanceof i.Element)||(e.preventDefault(),e.stopImmediatePropagation(),ce(e.target))}function dt(e){if(!I||e.composedPath().includes(a)||!(e.target instanceof i.Element))return;let o=e.target.getBoundingClientRect();Object.assign(w.style,{display:"block",left:o.left+"px",top:o.top+"px",width:o.width+"px",height:o.height+"px"}),L.textContent=e.target.tagName.toLowerCase()}function ut(e){I=e,oe.textContent=I?"\u25CE \uC694\uC18C \uC120\uD0DD \uC911":"\u25CE \uC694\uC18C \uC120\uD0DD",oe.classList.toggle("primary",I),I||G()}function ft(e){e.key==="Escape"&&(ut(!1),h("\uC120\uD0DD \uBAA8\uB4DC\uB97C \uAED0\uC2B5\uB2C8\uB2E4. \uC1FC\uD551\uBAB0\uC744 \uC815\uC0C1\uC801\uC73C\uB85C \uD0D0\uC0C9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")),(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"&&!e.composedPath().some(o=>["INPUT","TEXTAREA","SELECT"].includes(o.tagName))&&(e.preventDefault(),e.stopImmediatePropagation(),p=e.shiftKey?C.redo():C.undo(),N(),E())}i.addEventListener("click",ct,!0),n.addEventListener("pointermove",dt,!0),n.addEventListener("keydown",ft,!0);function mt(){U(),E(),j.open&&ee()}i.addEventListener("resize",mt),n.addEventListener("scroll",G,!0),oe.addEventListener("click",()=>ut(!I)),re.addEventListener("click",()=>{p=C.undo(),N(),E()}),ie.addEventListener("click",()=>{p=C.redo(),N(),E()}),H.addEventListener("click",()=>{O=!O,N(),h(O?"\uC6D0\uBCF8 \uD654\uBA74\uC785\uB2C8\uB2E4. \uBCC0\uACBD CSS\uB294 \uC720\uC9C0\uB429\uB2C8\uB2E4.":"\uBCC0\uACBD \uD654\uBA74\uC785\uB2C8\uB2E4.")}),J.addEventListener("change",()=>{if(!g)return;let e=J.value==="shared"?yt(g):Pe(g).selector;if(!e){J.value="single",h("class\uAC00 \uC5C6\uB294 \uC694\uC18C\uC785\uB2C8\uB2E4. \uC0C1\uC704 \uC601\uC5ED\uC744 \uC120\uD0DD\uD558\uAC70\uB098 \uC120\uD0DD\uC790\uB97C \uC9C1\uC811 \uC785\uB825\uD558\uC138\uC694.");return}S=e,D.value=S,E(),U()}),W.addEventListener("change",()=>{k=W.value,E(),U()}),he.addEventListener("click",()=>{try{let e=Te(D.value.trim(),n);if(!g?.matches(e))throw Error("\uD604\uC7AC \uC120\uD0DD \uC694\uC18C\uC640 \uC77C\uCE58\uD558\uB294 \uC120\uD0DD\uC790\uB97C \uC785\uB825\uD558\uC138\uC694.");S=e,E(),U(),h("\uB300\uC0C1 "+Oe().length+"\uAC1C\uC5D0 \uC801\uC6A9\uD569\uB2C8\uB2E4.")}catch(e){h(e.message)}}),F.addEventListener("change",()=>{p={...p,important:F.checked,changes:p.changes.map(({important:e,...o})=>o)},C.commit(p),N()}),xe.addEventListener("click",()=>{p={...p,changes:p.changes.filter(e=>e.selector!==S||e.media!==k)},C.commit(p),N(),E()}),Ye.addEventListener("click",()=>{p.changes.length&&!i.confirm("\uBAA8\uB4E0 \uC784\uC2DC \uBCC0\uACBD\uC744 \uC81C\uAC70\uD560\uAE4C\uC694? \uC2E4\uD589 \uCDE8\uC18C\uB85C \uBCF5\uC6D0\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")||(p=Ae(),C.commit(p),O=!1,N(),E())});function Re(e,o,s){let c=i.URL.createObjectURL(new Blob([e],{type:s})),l=t("a");l.href=c,l.download=o,d.append(l),l.click(),l.remove(),i.setTimeout(()=>i.URL.revokeObjectURL(c),1e3)}Se.addEventListener("click",()=>{Re($(p),"style-forge-overrides.css","text/css;charset=utf-8"),h("CSS\uB97C \uB2E4\uC6B4\uB85C\uB4DC\uD588\uC2B5\uB2C8\uB2E4. \uBCC0\uACBD\uC0AC\uD56D \uAC80\uD1A0 \uD6C4 \uBCC4\uB3C4 \uD30C\uC77C\uB85C \uC801\uC6A9\uD558\uC138\uC694.")}),we.addEventListener("click",async()=>{try{if(i.navigator.clipboard&&i.isSecureContext)await i.navigator.clipboard.writeText($(p));else{let e=t("textarea",$(p));e.style.position="fixed",e.style.opacity="0",n.body.append(e),e.select();let o=n.execCommand("copy");if(e.remove(),!o)throw Error("copy")}h("CSS\uB97C \uBCF5\uC0AC\uD588\uC2B5\uB2C8\uB2E4.")}catch{h("\uBCF5\uC0AC \uAD8C\uD55C\uC744 \uD655\uC778\uD558\uAC70\uB098 CSS \uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC0AC\uC6A9\uD558\uC138\uC694.")}});async function ze(e){let o=e.files[0];if(e.value="",!o)return null;if(o.size>50*1024*1024)throw Error("JSON \uD30C\uC77C\uC740 50 MB \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4.");return JSON.parse(await o.text())}K.addEventListener("change",async()=>{try{let e=await ze(K);if(!e)return;T=ue(e),Z(),h("\uC2A4\uD0A8 \uBD84\uC11D \uACB0\uACFC\uB97C \uC5F0\uACB0\uD588\uC2B5\uB2C8\uB2E4.")}catch(e){h("\uBD84\uC11D JSON\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: "+e.message)}}),tt.addEventListener("click",async()=>{try{await pt.set(lt,{state:p,report:T}),h("\uC774 \uD398\uC774\uC9C0\uC758 \uD3B8\uC9D1\uC744 \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.")}catch{h("\uBE0C\uB77C\uC6B0\uC800 \uC800\uC7A5 \uACF5\uAC04 \uB610\uB294 \uAD8C\uD55C\uC744 \uD655\uC778\uD558\uC138\uC694.")}}),nt.addEventListener("click",async()=>{try{let e=await pt.get(lt);if(!e){h("\uC774 \uD398\uC774\uC9C0\uC5D0 \uC800\uC7A5\uB41C \uD3B8\uC9D1\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");return}let o=je(e.state,n);e.report&&(T=ue({...e.report,files:[]})),p=o,C.commit(p),O=!1,N(),E(),Z(),h("\uC800\uC7A5\uB41C \uD3B8\uC9D1\uC744 \uD654\uBA74\uC5D0 \uC784\uC2DC \uC801\uC6A9\uD588\uC2B5\uB2C8\uB2E4.")}catch(e){h("\uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: "+e.message)}}),Ee.addEventListener("click",()=>Re(JSON.stringify({state:p,report:T},null,2),"style-forge-edit.json","application/json")),V.addEventListener("change",async()=>{try{let e=await ze(V);if(!e)return;let o=je(e.state,n),s=e.report?ue({...e.report,files:[]}):null;p=o,T=s,C.commit(p),O=!1,N(),E(),Z(),h("\uD3B8\uC9D1 JSON\uC744 \uBD88\uB7EC\uC654\uC2B5\uB2C8\uB2E4.")}catch(e){h("\uD3B8\uC9D1 JSON\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: "+e.message)}}),j.addEventListener("toggle",()=>{j.open&&ee()});let gt=new i.MutationObserver(()=>{!g?.isConnected&&g?(g=null,ae.textContent="\uC120\uD0DD \uC694\uC18C\uAC00 \uD398\uC774\uC9C0\uC5D0\uC11C \uC81C\uAC70\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",E(),U(),h("\uD398\uC774\uC9C0\uAC00 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC694\uC18C\uB97C \uB2E4\uC2DC \uC120\uD0DD\uD558\uC138\uC694.")):G()});gt.observe(n.body,{childList:!0,subtree:!0});function ht(){fe||(fe=!0,gt.disconnect(),Y?.clear(),i.removeEventListener("click",ct,!0),n.removeEventListener("pointermove",dt,!0),n.removeEventListener("keydown",ft,!0),i.removeEventListener("resize",mt),n.removeEventListener("scroll",G,!0),f.remove(),r.applyCSS&&r.applyCSS("").catch(()=>{}),a.remove(),r.onClose?.())}return A.addEventListener("click",()=>{p.changes.length&&!i.confirm("\uD3B8\uC9D1\uAE30\uB97C \uB2EB\uC73C\uBA74 \uC784\uC2DC \uC801\uC6A9\uC774 \uC81C\uAC70\uB429\uB2C8\uB2E4. \uC800\uC7A5\xB7\uB0B4\uBCF4\uB0B4\uAE30\uB97C \uC644\uB8CC\uD588\uB098\uC694?")||ht()}),N(),E(),Z(),h("\uC694\uC18C\uB97C \uD074\uB9AD\uD574 \uD3B8\uC9D1\uC744 \uC2DC\uC791\uD558\uC138\uC694."),r.reviewPacket&&ke(r.reviewPacket),{host:a,destroy:ht,choose:ce,loadReview:ke,getState:()=>structuredClone(p)}}export{Jt as mountEditor};
