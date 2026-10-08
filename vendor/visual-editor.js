var at=`:host {
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
`;var W=[{name:"font-family",label:"\uD3F0\uD2B8",type:"font",group:"\uAE00\uC528"},{name:"font-size",label:"\uD06C\uAE30",type:"number",unit:"px",max:300,group:"\uAE00\uC528"},{name:"font-weight",label:"\uAD75\uAE30",type:"weight",group:"\uAE00\uC528"},{name:"line-height",label:"\uD589\uAC04",type:"number",unit:"px",max:500,group:"\uAE00\uC528"},{name:"letter-spacing",label:"\uC790\uAC04",type:"number",unit:"px",min:-20,max:100,group:"\uAE00\uC528"},{name:"color",label:"\uAE00\uC528 \uC0C9",type:"color",group:"\uC0C9\uC0C1"},{name:"background-color",label:"\uBC30\uACBD \uC0C9",type:"color",group:"\uC0C9\uC0C1"},...["top","right","bottom","left"].map(n=>({name:"padding-"+n,label:{top:"\uC704",right:"\uC624\uB978\uCABD",bottom:"\uC544\uB798",left:"\uC67C\uCABD"}[n],type:"number",unit:"px",max:500,group:"\uC548\uCABD \uC5EC\uBC31"})),...["top","right","bottom","left"].map(n=>({name:"margin-"+n,label:{top:"\uC704",right:"\uC624\uB978\uCABD",bottom:"\uC544\uB798",left:"\uC67C\uCABD"}[n],type:"number",unit:"px",min:-500,max:500,group:"\uBC14\uAE65 \uC5EC\uBC31"})),{name:"width",label:"\uB108\uBE44",type:"number",unit:"px",max:3e3,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"height",label:"\uB192\uC774",type:"number",unit:"px",max:3e3,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-radius",label:"\uBAA8\uC11C\uB9AC",type:"number",unit:"px",max:500,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-width",label:"\uD14C\uB450\uB9AC \uB450\uAED8",type:"number",unit:"px",max:50,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-style",label:"\uD14C\uB450\uB9AC \uC885\uB958",type:"border",group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-color",label:"\uD14C\uB450\uB9AC \uC0C9",type:"color",group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"}],H={all:"",mobile:"(max-width: 767px)",desktop:"(min-width: 768px)"},ve=()=>({version:"1.2",important:!0,changes:[]}),st=new Set(W.map(n=>n.name));function we(n,i){if(typeof n!="string"||n.length>1e3||/[{};\r\n]|\/\*/.test(n))throw Error("\uC62C\uBC14\uB978 CSS \uC120\uD0DD\uC790\uB97C \uC785\uB825\uD558\uC138\uC694.");return i.querySelectorAll(n),n}function Ce(n,i){if(!n||!Array.isArray(n.changes)||n.changes.length>200)throw Error("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uD3B8\uC9D1 \uD504\uB85C\uC81D\uD2B8\uC785\uB2C8\uB2E4.");let o=[];for(let c of n.changes){if(we(c.selector,i),!Object.hasOwn(H,c.media))throw Error("\uBBF8\uB514\uC5B4 \uC870\uAC74\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");let d={};for(let[h,g]of Object.entries(c.properties||{})){if(!st.has(h)||typeof g!="string"||g.length>250||/[{};\r\n]|url\s*\(/i.test(g)||!i.defaultView.CSS.supports(h,g))throw Error("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 CSS \uC18D\uC131: "+h);d[h]=g}Object.keys(d).length&&o.push({selector:c.selector,media:c.media,properties:d})}return{version:"1.2",important:n.important!==!1,changes:o}}function pt(n,i,o,c,d){if(!st.has(c))throw Error("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uC18D\uC131");let h=structuredClone(n),g=h.changes.find(t=>t.selector===i&&t.media===o);return g||(g={selector:i,media:o,properties:{}},h.changes.push(g)),d===null?delete g.properties[c]:g.properties[c]=d,h.changes=h.changes.filter(t=>Object.keys(t.properties).length),h}function F(n){return`/* STYLE FORGE v1.2 \xB7 \uAC80\uD1A0 \uD6C4 \uBCC4\uB3C4 override CSS\uB85C \uC801\uC6A9 */
`+n.changes.map(o=>{let c=o.selector+` {
`+Object.entries(o.properties).map(([d,h])=>"  "+d+": "+h+(n.important?" !important":"")+";").join(`
`)+`
}`;return H[o.media]?"@media "+H[o.media]+` {
`+c.split(`
`).map(d=>"  "+d).join(`
`)+`
}`:c}).join(`

`)+`
`}function Ee(n){let i=n.ownerDocument,o=i.defaultView.CSS;if(n.id){let h="#"+o.escape(n.id);if(i.querySelectorAll(h).length===1)return{selector:h,fragile:!1}}let c=[],d=n;for(;d&&d.nodeType===1;){let h=d.tagName.toLowerCase(),g=[...d.classList].filter(L=>!/[{}]/.test(L)).slice(0,3);g.length&&(h+=g.map(L=>"."+o.escape(L)).join(""));let t=d.parentElement?[...d.parentElement.children].filter(L=>L.tagName===d.tagName):[];t.length>1&&(h+=":nth-of-type("+(t.indexOf(d)+1)+")"),c.unshift(h);let z=c.join(" > ");if(i.querySelectorAll(z).length===1)return{selector:z,fragile:z.includes(":nth-of-type")};d=d.parentElement}return{selector:c.join(" > "),fragile:!0}}function lt(n){let i=[...n.classList].filter(o=>!/[{}]/.test(o));return i.length?n.tagName.toLowerCase()+i.map(o=>"."+n.ownerDocument.defaultView.CSS.escape(o)).join(""):null}var oe=class{constructor(i=ve()){this.states=[structuredClone(i)],this.index=0,this.lastKey="",this.lastTime=0}get current(){return structuredClone(this.states[this.index])}commit(i,o="",c=Date.now()){if(JSON.stringify(i)===JSON.stringify(this.states[this.index]))return;let d=o&&o===this.lastKey&&c-this.lastTime<450&&this.index===this.states.length-1&&this.index>0;this.states=this.states.slice(0,this.index+1),d?this.states[this.index]=structuredClone(i):(this.states.push(structuredClone(i)),this.index++),this.states.length>101&&(this.states.shift(),this.index--),this.lastKey=o,this.lastTime=c}undo(){return this.index>0&&this.index--,this.lastKey="",this.current}redo(){return this.index<this.states.length-1&&this.index++,this.lastKey="",this.current}get canUndo(){return this.index>0}get canRedo(){return this.index<this.states.length-1}};function re(n){if(!n||!Array.isArray(n.rules)||n.rules.length>3e4||!Array.isArray(n.files))throw Error("\uC2A4\uD0A8 \uBD84\uC11D\uAE30\uC5D0\uC11C \uB0B4\uBCF4\uB0B8 JSON\uC744 \uC120\uD0DD\uD558\uC138\uC694.");return{rules:n.rules.filter(i=>typeof i.selector=="string"&&i.selector.length<=1e3&&typeof i.file=="string"&&i.file.length<=2e3&&!/(^|\/)\.\.(\/|$)/.test(i.file)&&Number.isInteger(i.line)&&i.line>0).map(i=>({selector:i.selector,file:i.file,line:i.line,context:String(i.context||"\uAE30\uBCF8").slice(0,2e3)}))}}function ct(n,i){return!n||!i?[]:i.rules.filter(o=>{try{return n.matches(o.selector)}catch{return!1}}).map(o=>({...o,status:"\uD604\uC7AC DOM \uC120\uD0DD\uC790 \uC77C\uCE58 \xB7 \uC801\uC6A9 \uC6B0\uC120\uC21C\uC704 \uBBF8\uD655\uC778"}))}function xt(n=document,i={}){let o=n.defaultView;if(n.querySelector("style-forge-editor"))return null;let c=n.createElement("style-forge-editor");c.style.cssText="all:initial!important;position:fixed!important;inset:0!important;pointer-events:none!important;z-index:2147483647!important;";let d=c.attachShadow({mode:"open"}),h=n.createElement("style");h.textContent=at,d.append(h);let g=n.createElement("style");g.dataset.styleForgePatch="",n.head.append(g);let t=(e,r="",s="")=>{let l=n.createElement(e);return l.textContent=r,l.className=s,l},z=t("section","","panel");z.setAttribute("aria-label","STYLE FORGE \uBE44\uC8FC\uC5BC \uD3B8\uC9D1\uAE30");let L=t("div","","header");L.append(t("span","\u2733","mark"),t("strong","STYLE FORGE"),t("small","VISUAL 1.2"));let _=t("button","\xD7","quiet");_.title="\uD3B8\uC9D1\uAE30 \uB2EB\uAE30 \xB7 \uC784\uC2DC \uBCC0\uACBD \uC81C\uAC70",_.setAttribute("aria-label",_.title),L.append(_);let b=t("div","","body");z.append(L,b);let P=t("div","","outline"),ie=t("div","","outline-label");P.append(ie),d.append(P,z),n.documentElement.append(c);let u=null,S="",J="all",R=!0,w=!1,T=null,ae=!1,v=new oe,p=v.current,ke=new Map,Le=t("div","","toolbar"),X=t("button","\u25CE \uC694\uC18C \uC120\uD0DD","primary"),Q=t("button","\u21B6",""),Z=t("button","\u21B7",""),$=t("button","\uC6D0\uBCF8 \uBE44\uAD50");Q.title="\uC2E4\uD589 \uCDE8\uC18C",Z.title="\uB2E4\uC2DC \uC2E4\uD589",Le.append(X,Q,Z,$),b.append(Le,t("p","\uC1FC\uD551\uBAB0\uC758 \uAE00\uC528\xB7\uBC84\uD2BC\xB7\uC601\uC5ED\uC744 \uD074\uB9AD\uD558\uC138\uC694. \uC120\uD0DD \uBAA8\uB4DC\uC5D0\uC11C\uB294 \uB9C1\uD06C \uC774\uB3D9\uACFC \uBC84\uD2BC \uB3D9\uC791\uC744 \uB9C9\uC2B5\uB2C8\uB2E4. Esc\uB85C \uC120\uD0DD \uBAA8\uB4DC\uB97C \uB055\uB2C8\uB2E4.","hint"));let Ne=t("div","","selection"),se=t("strong","\uC120\uD0DD\uD55C \uC694\uC18C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4"),Oe=t("p","\uD654\uBA74\uC5D0\uC11C \uBC14\uAFB8\uACE0 \uC2F6\uC740 \uC601\uC5ED\uC744 \uD074\uB9AD\uD558\uC138\uC694."),ze=t("p","","meta"),pe=t("div","","ancestor-list");Ne.append(se,Oe,ze,pe),b.append(Ne);let Re=t("div","","selector-controls"),Te=t("label","\uB300\uC0C1 \uBC94\uC704"),A=t("select");for(let[e,r]of[["single","\uC120\uD0DD \uC694\uC18C\uB9CC"],["shared","\uAC19\uC740 class\uC758 \uC694\uC18C"]]){let s=t("option",r);s.value=e,A.append(s)}Te.append(A);let Ae=t("label","\uC801\uC6A9 \uD654\uBA74"),U=t("select");for(let[e,r]of[["all","\uBAA8\uB4E0 \uD654\uBA74"],["mobile","\uBAA8\uBC14\uC77C \u2264 767px"],["desktop","\uB370\uC2A4\uD06C\uD1B1 \u2265 768px"]]){let s=t("option",r);s.value=e,U.append(s)}Ae.append(U),Re.append(Te,Ae),b.append(Re);let je=t("div","","selector-row"),I=t("input"),le=t("button","\uC801\uC6A9");I.setAttribute("aria-label","CSS \uB300\uC0C1 \uC120\uD0DD\uC790"),je.append(I,le),b.append(je);let Pe=t("p","","count"),ee=t("p","","warning");ee.hidden=!0,b.append(Pe,ee);let Je=t("div");b.append(Je);let Ie="",ce;for(let e of W){if(Ie!==e.group){Ie=e.group;let x=t("section","","section");x.append(t("h3",e.group)),ce=t("div","","fields"),x.append(ce),Je.append(x)}let r=t("div","",e.type==="font"?"field wide":"field"),s=t("label",e.label),l=t("div","","control"),a;if(["font","weight","border"].includes(e.type)){a=t("select");let x=e.type==="font"?[["__current","\uD604\uC7AC \uD3F0\uD2B8"],["system-ui, sans-serif","\uC2DC\uC2A4\uD15C \uC0B0\uC138\uB9AC\uD504"],["Arial, sans-serif","Arial"],["Georgia, serif","Georgia"],["monospace","\uBAA8\uB178\uC2A4\uD398\uC774\uC2A4"]]:e.type==="weight"?[["__current","\uD604\uC7AC \uAD75\uAE30"],...["100","200","300","400","500","600","700","800","900"].map(E=>[E,E])]:["none","solid","dashed","dotted","double"].map(E=>[E,{none:"\uC5C6\uC74C",solid:"\uC2E4\uC120",dashed:"\uB300\uC2DC",dotted:"\uC810\uC120",double:"\uC774\uC911\uC120"}[E]]);for(let[E,k]of x){let O=t("option",k);O.value=E,a.append(O)}}else a=t("input"),a.type=e.type,e.type==="number"&&(a.min=e.min??0,a.max=e.max,a.step=e.name==="letter-spacing"?"0.1":"1");a.dataset.property=e.name,a.id="sf-property-"+e.name,s.htmlFor=a.id,a.setAttribute("aria-label",e.group+" "+e.label);let f=t("button","\u21BA","reset");f.type="button",f.title=e.label+" \uBCC0\uACBD \uC81C\uAC70",f.setAttribute("aria-label",f.title),f.addEventListener("click",()=>ye(e.name,null)),l.append(a),e.unit&&l.append(t("span",e.unit,"unit")),l.append(f),r.append(s,l),ce.append(r),ke.set(e.name,a),a.addEventListener("input",()=>{if(!u)return;let x=a.value;if(x==="__current"){ye(e.name,null);return}if(e.type==="number"){if(!x||!Number.isFinite(Number(x))||Number(x)<Number(a.min)||Number(x)>Number(a.max))return;x+=e.unit}o.CSS.supports(e.name,x)&&ye(e.name,x)})}let Me=t("label","","important"),M=t("input");M.type="checkbox",M.checked=!0,Me.append(M,n.createTextNode("!important\uB85C \uBBF8\uB9AC\uBCF4\uAE30 \uC6B0\uC120 \uC801\uC6A9")),b.append(Me);let de=t("button","\uC120\uD0DD \uBC94\uC704 \uBCC0\uACBD \uC81C\uAC70"),qe=t("button","\uBAA8\uB4E0 \uBCC0\uACBD \uC81C\uAC70"),De=t("div","","footer-actions");De.append(de,qe),b.append(De);let ue=t("section","","section");ue.append(t("h3","\uC2A4\uD0A8 \uD30C\uC77C \uC5F0\uACB0"));let Ke=t("label","\uC2A4\uD0A8 \uBD84\uC11D JSON \uC5F0\uACB0","file-picker"),q=t("input");q.type="file",q.accept=".json",q.setAttribute("aria-label","\uC2A4\uD0A8 \uBD84\uC11D JSON \uC5F0\uACB0"),Ke.append(q);let D=t("div");ue.append(Ke,t("p","\uC2A4\uD0A8 \uBD84\uC11D\uAE30 \u2192 \uBE44\uC8FC\uC5BC \uC5F0\uACB0 JSON \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694. \uC6D0\uBCF8 \uC2A4\uD0A8 \uCF54\uB4DC\uB294 \uC804\uC1A1\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.","hint"),D),b.append(ue);let N=t("details"),dt=t("summary","\uD604\uC7AC \uC801\uC6A9 CSS\uC640 \uAD6C\uC870"),G=t("div");N.append(dt,G),b.append(N);let Fe=t("details"),_e=t("summary","\uBCC0\uACBD\uC0AC\uD56D \uAC80\uD1A0"),$e=t("div","","review-list");Fe.append(_e,$e),b.append(Fe);let fe=t("section","","section");fe.append(t("h3","\uC218\uC815 \uCF54\uB4DC"));let te=t("textarea","","code");te.readOnly=!0,te.setAttribute("aria-label","\uBCC0\uACBD CSS");let me=t("button","CSS \uBCF5\uC0AC"),ge=t("button","CSS \uB2E4\uC6B4\uB85C\uB4DC","primary"),Ue=t("div","","footer-actions");Ue.append(me,ge),fe.append(te,Ue,t("p","\uAC80\uD1A0\uD55C \uCF54\uB4DC\uB97C \uBCC4\uB3C4 override CSS\uB85C \uC5F0\uACB0\uD558\uC138\uC694. FTP\xB7\uC6B4\uC601 \uD30C\uC77C\uC740 \uC218\uC815\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC778\uB77C\uC778 !important\uAC00 \uC788\uC73C\uBA74 \uC6D0\uBCF8 \uCF54\uB4DC \uC870\uC815\uC774 \uCD94\uAC00\uB85C \uD544\uC694\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.","hint")),b.append(fe);let Ge=t("button","\uD3B8\uC9D1 \uC800\uC7A5"),Ve=t("button","\uC800\uC7A5 \uBD88\uB7EC\uC624\uAE30"),he=t("button","\uD3B8\uC9D1 JSON"),Be=t("label","\uD3B8\uC9D1 JSON \uBD88\uB7EC\uC624\uAE30","file-picker"),V=t("input");V.type="file",V.accept=".json",Be.append(V);let Ye=t("div","","footer-actions");Ye.append(Ge,Ve,he),b.append(Ye,Be);let ne=t("p","","status");ne.setAttribute("role","status"),ne.setAttribute("aria-live","polite"),b.append(ne);let He="style-forge.visual.v1:"+o.location.origin+o.location.pathname,We=i.storage||{async get(e){return JSON.parse(o.localStorage.getItem(e)||"null")},async set(e,r){o.localStorage.setItem(e,JSON.stringify(r))}};function m(e){ne.textContent=e}function xe(){return p.changes.find(e=>e.selector===S&&e.media===J)}function be(){try{return[...n.querySelectorAll(S)].filter(e=>e!==c&&e!==g)}catch{return[]}}function K(){if(!u?.isConnected){P.style.display="none";return}let e=u.getBoundingClientRect();P.style.display="block",Object.assign(P.style,{left:e.left+"px",top:e.top+"px",width:e.width+"px",height:e.height+"px"}),ie.textContent=u.tagName.toLowerCase()+(u.id?"#"+u.id:"")}function y(){let e=u?o.getComputedStyle(u):null,r=xe()?.properties||{};for(let s of W){let l=ke.get(s.name);l.disabled=!u;let a=r[s.name]??e?.getPropertyValue(s.name)??"";if(l.title="\uD604\uC7AC \uACC4\uC0B0\uAC12: "+a,s.type==="color"){let f=a.match(/rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/);l.value=/^#[\da-f]{6}$/i.test(a)?a:f?"#"+f.slice(1,4).map(x=>Number(x).toString(16).padStart(2,"0")).join(""):"#ffffff"}else s.type==="number"?l.value=/^-?[\d.]+px$/.test(a)?parseFloat(a):"":[...l.options].some(f=>f.value===a)?l.value=a:l.querySelector('option[value="__current"]')&&(l.options[0].textContent=a||"\uD604\uC7AC \uAC12",l.value="__current")}}function B(){if(D.replaceChildren(),!T){D.append(t("p","\uBD84\uC11D JSON\uC744 \uC5F0\uACB0\uD558\uBA74 \uD604\uC7AC \uC694\uC18C\uC640 \uB9DE\uB294 CSS \uACBD\uB85C\xB7\uC904\uC744 \uBCF4\uC5EC\uC90D\uB2C8\uB2E4.","hint"));return}let e=ct(u,T);D.append(t("p",e.length+"\uAC1C \uD30C\uC77C \uC704\uCE58 \uD6C4\uBCF4 \xB7 \uC2E4\uC81C \uC801\uC6A9 \uC6B0\uC120\uC21C\uC704\uB294 \uBCC4\uB3C4 \uD655\uC778","hint"));for(let r of e.slice(0,100)){let s=t("div","","source-card");s.append(t("strong",r.file+":"+r.line),t("p",r.selector),t("p",r.context+" \xB7 "+r.status)),D.append(s)}e.length>100&&D.append(t("p","\uCC98\uC74C 100\uAC1C\uB9CC \uD45C\uC2DC\uD569\uB2C8\uB2E4.","hint"))}function Y(){if(G.replaceChildren(),!u)return;let e=o.getComputedStyle(u);for(let f of W)G.append(t("div",f.name+": "+e.getPropertyValue(f.name),"source-card"));let r=0,s=0,l=0;function a(f,x,E="\uAE30\uBCF8"){for(let k of f){if(++l>15e3)return;if(k.selectorText)try{if(u.matches(k.selectorText)&&r++<30){let O=t("div","","source-card");O.append(t("strong",k.selectorText),t("p",x+" \xB7 "+E),t("p",k.style.cssText)),G.append(O)}}catch{}else if(k.cssRules){let O=E;k.conditionText&&(O=k.conditionText),a(k.cssRules,x,O)}}}for(let f of n.styleSheets)if(f.ownerNode!==g)try{a(f.cssRules,f.href||"\uC778\uB77C\uC778 \uC2A4\uD0C0\uC77C")}catch{s++}G.append(t("p",`\uBE0C\uB77C\uC6B0\uC800 CSSOM\uC5D0\uC11C ${r}\uAC1C \uC120\uD0DD\uC790 \uC77C\uCE58 \xB7 \uC678\uBD80 \uC2DC\uD2B8 ${s}\uAC1C \uC77D\uAE30 \uC81C\uD55C. \uC870\uAC74\xB7\uCE90\uC2A4\uCF00\uC774\uB4DC \uC6B0\uC2B9 \uC5EC\uBD80\uB97C \uB2E8\uC815\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`,"hint"))}function j(){let e=be().length,r=H[J];Pe.textContent=S?`\uB300\uC0C1 ${e}\uAC1C \xB7 \uD604\uC7AC \uD654\uBA74 ${o.innerWidth}px${r&&!o.matchMedia(r).matches?" \xB7 \uBBF8\uB514\uC5B4 \uC870\uAC74 \uBBF8\uCDA9\uC871":""}`:"",te.value=F(p),Q.disabled=!v.canUndo,Z.disabled=!v.canRedo,$.disabled=!p.changes.length,$.classList.toggle("active",w),$.textContent=w?"\uBCC0\uACBD \uD654\uBA74 \uBCF4\uAE30":"\uC6D0\uBCF8 \uBE44\uAD50",M.checked=p.important,_e.textContent=`\uBCC0\uACBD\uC0AC\uD56D \uAC80\uD1A0 (${p.changes.length}\uAC1C \uADDC\uCE59)`,$e.replaceChildren(...p.changes.map(l=>{let a=t("div",l.selector+" \xB7 "+l.media,"changes-item");return a.append(t("pre",Object.entries(l.properties).map(([f,x])=>f+": "+x).join(`
`))),a})),me.disabled=ge.disabled=he.disabled=!p.changes.length,de.disabled=!u,A.disabled=U.disabled=I.disabled=le.disabled=!u;let s=u&&Object.keys(xe()?.properties||{}).some(l=>u.style.getPropertyPriority(l)==="important");ee.hidden=!s&&!S.includes(":nth-of-type"),ee.textContent=s?"\uC778\uB77C\uC778 !important\uAC00 \uC788\uC5B4 \uC77C\uBD80 \uAC12\uC774 \uB36E\uC5B4\uC368\uC9C0\uC9C0 \uC54A\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC218\uC815 \uCF54\uB4DC\uC5D0\uC11C \uC6D0\uBCF8 \uC778\uB77C\uC778 \uC2A4\uD0C0\uC77C\uB3C4 \uAC80\uD1A0\uD558\uC138\uC694.":"\uC704\uCE58 \uAE30\uBC18 \uC120\uD0DD\uC790\uC785\uB2C8\uB2E4. \uC0C1\uD488 \uC21C\uC11C\uB098 \uD398\uC774\uC9C0 \uAD6C\uC870\uAC00 \uBC14\uB00C\uBA74 \uB300\uC0C1\uC774 \uB2EC\uB77C\uC9C8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",K()}function C(){let e=F(p);g.textContent=i.applyCSS?"":e,g.disabled=w,i.applyCSS&&i.applyCSS(w?"":e).then(()=>{ae||(K(),N.open&&Y())}).catch(()=>m("\uC784\uC2DC CSS \uC801\uC6A9 \uAD8C\uD55C\uC744 \uD655\uC778\uD558\uC138\uC694. \uD655\uC7A5 \uC544\uC774\uCF58\uC73C\uB85C \uB2E4\uC2DC \uC5F4\uC5B4\uC8FC\uC138\uC694.")),j(),N.open&&Y()}function ye(e,r){if(!(!u||!S)){if(!be().includes(u)){m("\uC120\uD0DD \uC694\uC18C\uC640 \uB9DE\uB294 \uC120\uD0DD\uC790\uB97C \uBA3C\uC800 \uC801\uC6A9\uD558\uC138\uC694.");return}if(!(r!==null&&(!o.CSS.supports(e,r)||/[{};\r\n]/.test(r)))){if(r!==null&&!xe()&&p.changes.length>=200){m("\uCD5C\uB300 200\uAC1C \uBC94\uC704\uAE4C\uC9C0 \uD3B8\uC9D1\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uAE30\uC874 \uBCC0\uACBD\uC744 \uC815\uB9AC\uD558\uC138\uC694.");return}p=pt(p,S,J,e,r),v.commit(p,S+"|"+J+"|"+e),w=!1,C(),r===null&&y(),m("\uD654\uBA74\uC5D0 \uC784\uC2DC \uBC18\uC601\uD588\uC2B5\uB2C8\uB2E4. \uC11C\uBC84\uC758 \uD30C\uC77C\uC740 \uBCC0\uACBD\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.")}}}function Se(e){if(!e||e===c||e===g||["HTML","HEAD","SCRIPT","STYLE","LINK","META"].includes(e.tagName))return;u=e,S=Ee(e).selector,A.value="single",I.value=S,se.textContent=e.tagName.toLowerCase()+(e.id?"#"+e.id:"")+[...e.classList].map(l=>"."+l).join(""),Oe.textContent=(e.textContent||"").replace(/\s+/g," ").slice(0,100)||"(\uD14D\uC2A4\uD2B8 \uC5C6\uC74C)",ze.textContent="module: "+(e.getAttribute("module")||"\uC5C6\uC74C")+" \xB7 "+Math.round(e.getBoundingClientRect().width)+" \xD7 "+Math.round(e.getBoundingClientRect().height)+"px",pe.replaceChildren();let s=e.parentElement;for(let l=0;s&&l<5&&s!==n.documentElement;l++,s=s.parentElement){let a=s,f=t("button","\u2191 "+s.tagName.toLowerCase()+(s.id?"#"+s.id:""));f.addEventListener("click",()=>Se(a)),pe.append(f)}y(),B(),j(),N.open&&Y(),m("\uC120\uD0DD\uD55C \uC694\uC18C\uC758 \uC2A4\uD0C0\uC77C\uC744 \uC870\uC808\uD558\uC138\uC694.")}function Xe(e){e.composedPath().includes(c)||!R||!(e.target instanceof o.Element)||(e.preventDefault(),e.stopImmediatePropagation(),Se(e.target))}function Qe(e){if(!R||e.composedPath().includes(c)||!(e.target instanceof o.Element))return;let r=e.target.getBoundingClientRect();Object.assign(P.style,{display:"block",left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px"}),ie.textContent=e.target.tagName.toLowerCase()}function Ze(e){R=e,X.textContent=R?"\u25CE \uC694\uC18C \uC120\uD0DD \uC911":"\u25CE \uC694\uC18C \uC120\uD0DD",X.classList.toggle("primary",R),R||K()}function et(e){e.key==="Escape"&&(Ze(!1),m("\uC120\uD0DD \uBAA8\uB4DC\uB97C \uAED0\uC2B5\uB2C8\uB2E4. \uC1FC\uD551\uBAB0\uC744 \uC815\uC0C1\uC801\uC73C\uB85C \uD0D0\uC0C9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")),(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"&&!e.composedPath().some(r=>["INPUT","TEXTAREA","SELECT"].includes(r.tagName))&&(e.preventDefault(),e.stopImmediatePropagation(),p=e.shiftKey?v.redo():v.undo(),C(),y())}o.addEventListener("click",Xe,!0),n.addEventListener("pointermove",Qe,!0),n.addEventListener("keydown",et,!0);function tt(){j(),y(),N.open&&Y()}o.addEventListener("resize",tt),n.addEventListener("scroll",K,!0),X.addEventListener("click",()=>Ze(!R)),Q.addEventListener("click",()=>{p=v.undo(),C(),y()}),Z.addEventListener("click",()=>{p=v.redo(),C(),y()}),$.addEventListener("click",()=>{w=!w,C(),m(w?"\uC6D0\uBCF8 \uD654\uBA74\uC785\uB2C8\uB2E4. \uBCC0\uACBD CSS\uB294 \uC720\uC9C0\uB429\uB2C8\uB2E4.":"\uBCC0\uACBD \uD654\uBA74\uC785\uB2C8\uB2E4.")}),A.addEventListener("change",()=>{if(!u)return;let e=A.value==="shared"?lt(u):Ee(u).selector;if(!e){A.value="single",m("class\uAC00 \uC5C6\uB294 \uC694\uC18C\uC785\uB2C8\uB2E4. \uC0C1\uC704 \uC601\uC5ED\uC744 \uC120\uD0DD\uD558\uAC70\uB098 \uC120\uD0DD\uC790\uB97C \uC9C1\uC811 \uC785\uB825\uD558\uC138\uC694.");return}S=e,I.value=S,y(),j()}),U.addEventListener("change",()=>{J=U.value,y(),j()}),le.addEventListener("click",()=>{try{let e=we(I.value.trim(),n);if(!u?.matches(e))throw Error("\uD604\uC7AC \uC120\uD0DD \uC694\uC18C\uC640 \uC77C\uCE58\uD558\uB294 \uC120\uD0DD\uC790\uB97C \uC785\uB825\uD558\uC138\uC694.");S=e,y(),j(),m("\uB300\uC0C1 "+be().length+"\uAC1C\uC5D0 \uC801\uC6A9\uD569\uB2C8\uB2E4.")}catch(e){m(e.message)}}),M.addEventListener("change",()=>{p={...p,important:M.checked},v.commit(p),C()}),de.addEventListener("click",()=>{p={...p,changes:p.changes.filter(e=>e.selector!==S||e.media!==J)},v.commit(p),C(),y()}),qe.addEventListener("click",()=>{p.changes.length&&!o.confirm("\uBAA8\uB4E0 \uC784\uC2DC \uBCC0\uACBD\uC744 \uC81C\uAC70\uD560\uAE4C\uC694? \uC2E4\uD589 \uCDE8\uC18C\uB85C \uBCF5\uC6D0\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")||(p=ve(),v.commit(p),w=!1,C(),y())});function nt(e,r,s){let l=o.URL.createObjectURL(new Blob([e],{type:s})),a=t("a");a.href=l,a.download=r,d.append(a),a.click(),a.remove(),o.setTimeout(()=>o.URL.revokeObjectURL(l),1e3)}ge.addEventListener("click",()=>{nt(F(p),"style-forge-overrides.css","text/css;charset=utf-8"),m("CSS\uB97C \uB2E4\uC6B4\uB85C\uB4DC\uD588\uC2B5\uB2C8\uB2E4. \uBCC0\uACBD\uC0AC\uD56D \uAC80\uD1A0 \uD6C4 \uBCC4\uB3C4 \uD30C\uC77C\uB85C \uC801\uC6A9\uD558\uC138\uC694.")}),me.addEventListener("click",async()=>{try{if(o.navigator.clipboard&&o.isSecureContext)await o.navigator.clipboard.writeText(F(p));else{let e=t("textarea",F(p));e.style.position="fixed",e.style.opacity="0",n.body.append(e),e.select();let r=n.execCommand("copy");if(e.remove(),!r)throw Error("copy")}m("CSS\uB97C \uBCF5\uC0AC\uD588\uC2B5\uB2C8\uB2E4.")}catch{m("\uBCF5\uC0AC \uAD8C\uD55C\uC744 \uD655\uC778\uD558\uAC70\uB098 CSS \uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC0AC\uC6A9\uD558\uC138\uC694.")}});async function ot(e){let r=e.files[0];if(e.value="",!r)return null;if(r.size>50*1024*1024)throw Error("JSON \uD30C\uC77C\uC740 50 MB \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4.");return JSON.parse(await r.text())}q.addEventListener("change",async()=>{try{let e=await ot(q);if(!e)return;T=re(e),B(),m("\uC2A4\uD0A8 \uBD84\uC11D \uACB0\uACFC\uB97C \uC5F0\uACB0\uD588\uC2B5\uB2C8\uB2E4.")}catch(e){m("\uBD84\uC11D JSON\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: "+e.message)}}),Ge.addEventListener("click",async()=>{try{await We.set(He,{state:p,report:T}),m("\uC774 \uD398\uC774\uC9C0\uC758 \uD3B8\uC9D1\uC744 \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.")}catch{m("\uBE0C\uB77C\uC6B0\uC800 \uC800\uC7A5 \uACF5\uAC04 \uB610\uB294 \uAD8C\uD55C\uC744 \uD655\uC778\uD558\uC138\uC694.")}}),Ve.addEventListener("click",async()=>{try{let e=await We.get(He);if(!e){m("\uC774 \uD398\uC774\uC9C0\uC5D0 \uC800\uC7A5\uB41C \uD3B8\uC9D1\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");return}let r=Ce(e.state,n);e.report&&(T=re({...e.report,files:[]})),p=r,v.commit(p),w=!1,C(),y(),B(),m("\uC800\uC7A5\uB41C \uD3B8\uC9D1\uC744 \uD654\uBA74\uC5D0 \uC784\uC2DC \uC801\uC6A9\uD588\uC2B5\uB2C8\uB2E4.")}catch(e){m("\uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: "+e.message)}}),he.addEventListener("click",()=>nt(JSON.stringify({state:p,report:T},null,2),"style-forge-edit.json","application/json")),V.addEventListener("change",async()=>{try{let e=await ot(V);if(!e)return;let r=Ce(e.state,n),s=e.report?re({...e.report,files:[]}):null;p=r,T=s,v.commit(p),w=!1,C(),y(),B(),m("\uD3B8\uC9D1 JSON\uC744 \uBD88\uB7EC\uC654\uC2B5\uB2C8\uB2E4.")}catch(e){m("\uD3B8\uC9D1 JSON\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: "+e.message)}}),N.addEventListener("toggle",()=>{N.open&&Y()});let rt=new o.MutationObserver(()=>{!u?.isConnected&&u?(u=null,se.textContent="\uC120\uD0DD \uC694\uC18C\uAC00 \uD398\uC774\uC9C0\uC5D0\uC11C \uC81C\uAC70\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",y(),j(),m("\uD398\uC774\uC9C0\uAC00 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC694\uC18C\uB97C \uB2E4\uC2DC \uC120\uD0DD\uD558\uC138\uC694.")):K()});rt.observe(n.body,{childList:!0,subtree:!0});function it(){ae||(ae=!0,rt.disconnect(),o.removeEventListener("click",Xe,!0),n.removeEventListener("pointermove",Qe,!0),n.removeEventListener("keydown",et,!0),o.removeEventListener("resize",tt),n.removeEventListener("scroll",K,!0),g.remove(),i.applyCSS&&i.applyCSS("").catch(()=>{}),c.remove(),i.onClose?.())}return _.addEventListener("click",()=>{p.changes.length&&!o.confirm("\uD3B8\uC9D1\uAE30\uB97C \uB2EB\uC73C\uBA74 \uC784\uC2DC \uC801\uC6A9\uC774 \uC81C\uAC70\uB429\uB2C8\uB2E4. \uC800\uC7A5\xB7\uB0B4\uBCF4\uB0B4\uAE30\uB97C \uC644\uB8CC\uD588\uB098\uC694?")||it()}),C(),y(),B(),m("\uC694\uC18C\uB97C \uD074\uB9AD\uD574 \uD3B8\uC9D1\uC744 \uC2DC\uC791\uD558\uC138\uC694."),{host:c,destroy:it,choose:Se,getState:()=>structuredClone(p)}}export{xt as mountEditor};
