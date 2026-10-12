var Zt=Object.defineProperty;var eu=(e,u)=>()=>(e&&(u=e(e=0)),u);var tu=(e,u)=>{for(var n in u)Zt(e,n,{get:u[n],enumerable:!0})};var Kt={};tu(Kt,{mountEditor:()=>lu});function _t(e,u){if(typeof e!="string"||e.length>1e3||/[{};\r\n]|\/\*/.test(e))throw Error("\uC62C\uBC14\uB978 CSS \uC120\uD0DD\uC790\uB97C \uC785\uB825\uD558\uC138\uC694.");return u.querySelectorAll(e),e}function Ut(e,u){if(!e||!Array.isArray(e.changes)||e.changes.length>200)throw Error("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uD3B8\uC9D1 \uD504\uB85C\uC81D\uD2B8\uC785\uB2C8\uB2E4.");let n=[];for(let o of e.changes){if(_t(o.selector,u),!Object.hasOwn(le,o.media))throw Error("\uBBF8\uB514\uC5B4 \uC870\uAC74\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");let i={};for(let[s,C]of Object.entries(o.properties||{})){if(!Pt.has(s)||typeof C!="string"||C.length>250||/[{};\r\n]|url\s*\(/i.test(C)||!u.defaultView.CSS.supports(s,C))throw Error("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 CSS \uC18D\uC131: "+s);i[s]=C}Object.keys(i).length&&n.push({...typeof o.important=="boolean"?{important:o.important}:{},selector:o.selector,media:o.media,properties:i})}return{version:"1.2",important:e.important!==!1,changes:n}}function ru(e,u,n,o,i){if(!Pt.has(o))throw Error("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uC18D\uC131");let s=structuredClone(e),C=s.changes.find(r=>r.selector===u&&r.media===n);return C||(C={selector:u,media:n,properties:{}},s.changes.push(C)),i===null?delete C.properties[o]:C.properties[o]=i,s.changes=s.changes.filter(r=>Object.keys(r.properties).length),s}function Ce(e){return`/* STYLE FORGE v1.2 \xB7 \uAC80\uD1A0 \uD6C4 \uBCC4\uB3C4 override CSS\uB85C \uC801\uC6A9 */
`+e.changes.map(u=>{let n=u.selector+` {
`+Object.entries(u.properties).map(([o,i])=>"  "+o+": "+i+(u.important??e.important?" !important":"")+";").join(`
`)+`
}`;return le[u.media]?"@media "+le[u.media]+` {
`+n.split(`
`).map(o=>"  "+o).join(`
`)+`
}`:n}).join(`

`)+`
`}function qt(e){let u=e.ownerDocument,n=u.defaultView.CSS;if(e.id){let s="#"+n.escape(e.id);if(u.querySelectorAll(s).length===1)return{selector:s,fragile:!1}}let o=[],i=e;for(;i&&i.nodeType===1;){let s=i.tagName.toLowerCase(),C=[...i.classList].filter(h=>!/[{}]/.test(h)).slice(0,3);C.length&&(s+=C.map(h=>"."+n.escape(h)).join(""));let r=i.parentElement?[...i.parentElement.children].filter(h=>h.tagName===i.tagName):[];r.length>1&&(s+=":nth-of-type("+(r.indexOf(i)+1)+")"),o.unshift(s);let p=o.join(" > ");if(u.querySelectorAll(p).length===1)return{selector:p,fragile:p.includes(":nth-of-type")};i=i.parentElement}return{selector:o.join(" > "),fragile:!0}}function ou(e){let u=[...e.classList].filter(n=>!/[{}]/.test(n));return u.length?e.tagName.toLowerCase()+u.map(n=>"."+e.ownerDocument.defaultView.CSS.escape(n)).join(""):null}function Me(e){if(!e||!Array.isArray(e.rules)||e.rules.length>3e4||!Array.isArray(e.files))throw Error("\uC2A4\uD0A8 \uBD84\uC11D\uAE30\uC5D0\uC11C \uB0B4\uBCF4\uB0B8 JSON\uC744 \uC120\uD0DD\uD558\uC138\uC694.");return{rules:e.rules.filter(u=>typeof u.selector=="string"&&u.selector.length<=1e3&&typeof u.file=="string"&&u.file.length<=2e3&&!/(^|\/)\.\.(\/|$)/.test(u.file)&&Number.isInteger(u.line)&&u.line>0).map(u=>({selector:u.selector,file:u.file,line:u.line,context:String(u.context||"\uAE30\uBCF8").slice(0,2e3)}))}}function Jt(e,u){return!e||!u?[]:u.rules.filter(n=>{try{return e.matches(n.selector)}catch{return!1}}).map(n=>({...n,status:"\uD604\uC7AC DOM \uC120\uD0DD\uC790 \uC77C\uCE58 \xB7 \uC801\uC6A9 \uC6B0\uC120\uC21C\uC704 \uBBF8\uD655\uC778"}))}function Ve(e){let u=new URL(e);if(!["http:","https:"].includes(u.protocol)||u.username||u.password)throw Error("\uC62C\uBC14\uB978 \uD648\uD398\uC774\uC9C0 \uC8FC\uC18C\uAC00 \uC544\uB2D9\uB2C8\uB2E4.");for(let n of u.searchParams.keys())if(/^(password|pass|token|access_token|refresh_token|auth|authorization|session|sessionid|sid|api_key|key)$/i.test(n))throw Error("\uC778\uC99D \uC815\uBCF4\uAC00 \uD3EC\uD568\uB41C \uC8FC\uC18C\uB294 \uC81C\uCD9C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC77C\uBC18 \uD398\uC774\uC9C0 \uC8FC\uC18C\uB97C \uC0AC\uC6A9\uD558\uC138\uC694.");return u.searchParams.sort(),u.origin+u.pathname+u.search}function au(e,u,n=()=>!0){if(!Array.isArray(e)||!e.length||e.length>200)throw Error("\uC218\uC815 \uD56D\uBAA9\uC740 1\u2013200\uAC1C\uC5EC\uC57C \uD569\uB2C8\uB2E4.");return e.map(o=>{let i=Ve(o.pageUrl);if(new URL(i).origin!==u)throw Error("\uD504\uB85C\uC81D\uD2B8\uC5D0 \uB4F1\uB85D\uB41C \uC0AC\uC774\uD2B8\uC758 \uC218\uC815\uC548\uB9CC \uC81C\uCD9C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");if(typeof o.selector!="string"||!o.selector||o.selector.length>1e3||/[{};\r\n]|\/\*/.test(o.selector)||!Object.hasOwn(le,o.media))throw Error("\uC798\uBABB\uB41C \uB300\uC0C1 \uC120\uD0DD\uC790 \uB610\uB294 \uD654\uBA74 \uBC94\uC704");let s={};for(let[p,h]of Object.entries(o.properties||{})){if(!iu.has(p)||typeof h!="string"||h.length>250||/[{};\r\n]|url\s*\(/i.test(h)||!n(p,h))throw Error("\uD5C8\uC6A9\uB418\uC9C0 \uC54A\uC740 CSS \uC18D\uC131: "+p);s[p]=h}if(!Object.keys(s).length)throw Error("\uBCC0\uACBD\uD55C CSS\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");let C={};for(let p of Object.keys(s))typeof o.before?.[p]=="string"&&(C[p]=o.before[p].slice(0,250));let r=Array.isArray(o.sources)?o.sources.slice(0,30).filter(p=>typeof p.file=="string"&&p.file.length<1e3&&!/(^|\/)\.\.(\/|$)/.test(p.file)&&Number.isInteger(p.line)&&p.line>0).map(p=>({file:p.file,line:p.line})):[];return{pageUrl:i,selector:o.selector,media:o.media,properties:s,before:C,sources:r,important:o.important!==!1,label:String(o.label||o.selector).slice(0,160)}})}function Cu(e,u,n){let o=[],i=!0,s=e.createElement("div");return s.className="review-overlays",u.append(s),{load(C){if(!["style-forge-review-v1","style-forge-submission-v1"].includes(C?.format))throw Error("\uB2F4\uB2F9\uC790 \uAC80\uD1A0\uD568\uC758 \uD648\uD398\uC774\uC9C0 \uD45C\uC2DC JSON\uC744 \uC120\uD0DD\uD558\uC138\uC694.");let r=au(C.items,new URL(C.items[0]?.pageUrl).origin,(x,O)=>e.defaultView.CSS.supports(x,O)),p=Ve(e.defaultView.location.href),h=r.map((x,O)=>({...x,status:C.items[O].status||"pending"})).filter(x=>x.pageUrl===p);if(!h.length)throw Error("\uD604\uC7AC \uD398\uC774\uC9C0\uC5D0 \uD574\uB2F9\uD558\uB294 \uC218\uC815 \uC694\uCCAD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. JSON\uC758 \uD398\uC774\uC9C0 \uC8FC\uC18C\uB97C \uD655\uC778\uD558\uC138\uC694.");o=[],s.replaceChildren();let S=0,b=0;for(let x of h){let O=[];try{O=[...e.querySelectorAll(x.selector)].filter(D=>D.tagName!=="STYLE-FORGE-EDITOR")}catch{}O.length||S++,b+=O.length;for(let D of O.slice(0,10)){if(o.length>=100)break;let E=e.createElement("div");E.className="review-mark";let F=e.createElement("button");F.className="review-badge",F.textContent=(x.status==="approved"?"\uC2B9\uC778":x.status==="applied"?"\uC801\uC6A9 \uC644\uB8CC":x.status==="revision_requested"?"\uC7AC\uC218\uC815 \uC694\uCCAD":"\uC218\uC815 \uC694\uCCAD")+" \xB7 "+x.label,F.title=x.selector,F.addEventListener("click",()=>n(D)),E.append(F),s.append(E),o.push({element:D,box:E})}}return{items:h,total:b,missing:S,displayed:o.length}},draw(){for(let{element:C,box:r}of o){if(!i||!C.isConnected){r.hidden=!0;continue}let p=C.getBoundingClientRect();r.hidden=p.width===0&&p.height===0,Object.assign(r.style,{left:p.left+"px",top:p.top+"px",width:p.width+"px",height:p.height+"px"})}},toggle(){return i=!i,s.hidden=!i,this.draw(),i},clear(){o=[],s.remove()}}}function lu(e=document,u={}){let n=e.defaultView;if(e.querySelector("style-forge-editor"))return null;let o=e.createElement("style-forge-editor");o.style.cssText="all:initial!important;position:fixed!important;inset:0!important;pointer-events:none!important;z-index:2147483647!important;";let i=o.attachShadow({mode:"open"}),s=e.createElement("style");s.textContent=su,i.append(s);let C=e.createElement("style");C.dataset.styleForgePatch="",e.head.append(C);let r=(t,a="",c="")=>{let m=e.createElement(t);return m.textContent=a,m.className=c,m},p=r("section","","panel");p.setAttribute("aria-label","STYLE FORGE \uBE44\uC8FC\uC5BC \uD3B8\uC9D1\uAE30");let h=r("div","","header");h.append(r("span","\u2733","mark"),r("strong","STYLE FORGE"),r("small","VISUAL 1.2"));let S=r("button","\xD7","quiet");S.title="\uD3B8\uC9D1\uAE30 \uB2EB\uAE30 \xB7 \uC784\uC2DC \uBCC0\uACBD \uC81C\uAC70",S.setAttribute("aria-label",S.title),h.append(S);let b=r("div","","body");p.append(h,b);let x=r("div","","outline"),O=r("div","","outline-label");x.append(O),i.append(x,p),e.documentElement.append(o);let D=null,E="",F="all",_=!0,N=!1,J=null,ve=!1,de=new Map,te=null,j=new nu,f=j.current,Qe=new Map,Ze=r("div","","toolbar"),fe=r("button","\u25CE \uC694\uC18C \uC120\uD0DD","primary"),me=r("button","\u21B6",""),Be=r("button","\u21B7",""),ue=r("button","\uC6D0\uBCF8 \uBE44\uAD50");me.title="\uC2E4\uD589 \uCDE8\uC18C",Be.title="\uB2E4\uC2DC \uC2E4\uD589",Ze.append(fe,me,Be,ue),b.append(Ze,r("p","\uC1FC\uD551\uBAB0\uC758 \uAE00\uC528\xB7\uBC84\uD2BC\xB7\uC601\uC5ED\uC744 \uD074\uB9AD\uD558\uC138\uC694. \uC120\uD0DD \uBAA8\uB4DC\uC5D0\uC11C\uB294 \uB9C1\uD06C \uC774\uB3D9\uACFC \uBC84\uD2BC \uB3D9\uC791\uC744 \uB9C9\uC2B5\uB2C8\uB2E4. Esc\uB85C \uC120\uD0DD \uBAA8\uB4DC\uB97C \uB055\uB2C8\uB2E4.","hint"));let et=r("div","","selection"),he=r("strong","\uC120\uD0DD\uD55C \uC694\uC18C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4"),tt=r("p","\uD654\uBA74\uC5D0\uC11C \uBC14\uAFB8\uACE0 \uC2F6\uC740 \uC601\uC5ED\uC744 \uD074\uB9AD\uD558\uC138\uC694."),ut=r("p","","meta"),we=r("div","","ancestor-list");et.append(he,tt,ut,we),b.append(et);let Se=r("div","","selector-controls"),rt=r("label","\uB300\uC0C1 \uBC94\uC704"),K=r("select");for(let[t,a]of[["single","\uC120\uD0DD \uC694\uC18C\uB9CC"],["shared","\uAC19\uC740 class\uC758 \uC694\uC18C"]]){let c=r("option",a);c.value=t,K.append(c)}rt.append(K);let ot=r("label","\uC801\uC6A9 \uD654\uBA74"),re=r("select");for(let[t,a]of[["all","\uBAA8\uB4E0 \uD654\uBA74"],["mobile","\uBAA8\uBC14\uC77C \u2264 767px"],["desktop","\uB370\uC2A4\uD06C\uD1B1 \u2265 768px"]]){let c=r("option",a);c.value=t,re.append(c)}ot.append(re),Se.append(rt,ot),b.append(Se);let nt=r("div","","selector-row"),V=r("input"),ke=r("button","\uC801\uC6A9");V.setAttribute("aria-label","CSS \uB300\uC0C1 \uC120\uD0DD\uC790"),nt.append(V,ke),b.append(nt);let it=r("p","","count"),De=r("p","","warning");De.hidden=!0,b.append(it,De);let at=r("div");b.append(at);let Ct="",Le;for(let t of se){if(Ct!==t.group){Ct=t.group;let y=r("section","","section");y.append(r("h3",t.group)),Le=r("div","","fields"),y.append(Le),at.append(y)}let a=r("div","",t.type==="font"?"field wide":"field"),c=r("label",t.label),m=r("div","","control"),d;if(["font","weight","border"].includes(t.type)){d=r("select");let y=t.type==="font"?[["__current","\uD604\uC7AC \uD3F0\uD2B8"],["system-ui, sans-serif","\uC2DC\uC2A4\uD15C \uC0B0\uC138\uB9AC\uD504"],["Arial, sans-serif","Arial"],["Georgia, serif","Georgia"],["monospace","\uBAA8\uB178\uC2A4\uD398\uC774\uC2A4"]]:t.type==="weight"?[["__current","\uD604\uC7AC \uAD75\uAE30"],...["100","200","300","400","500","600","700","800","900"].map(I=>[I,I])]:["none","solid","dashed","dotted","double"].map(I=>[I,{none:"\uC5C6\uC74C",solid:"\uC2E4\uC120",dashed:"\uB300\uC2DC",dotted:"\uC810\uC120",double:"\uC774\uC911\uC120"}[I]]);for(let[I,U]of y){let P=r("option",U);P.value=I,d.append(P)}}else d=r("input"),d.type=t.type,t.type==="number"&&(d.min=t.min??0,d.max=t.max,d.step=t.name==="letter-spacing"?"0.1":"1");d.dataset.property=t.name,d.id="sf-property-"+t.name,c.htmlFor=d.id,d.setAttribute("aria-label",t.group+" "+t.label);let A=r("button","\u21BA","reset");A.type="button",A.title=t.label+" \uBCC0\uACBD \uC81C\uAC70",A.setAttribute("aria-label",A.title),A.addEventListener("click",()=>Je(t.name,null)),m.append(d),t.unit&&m.append(r("span",t.unit,"unit")),m.append(A),a.append(c,m),Le.append(a),Qe.set(t.name,d),d.addEventListener("input",()=>{if(!D)return;let y=d.value;if(y==="__current"){Je(t.name,null);return}if(t.type==="number"){if(!y||!Number.isFinite(Number(y))||Number(y)<Number(d.min)||Number(y)>Number(d.max))return;y+=t.unit}n.CSS.supports(t.name,y)&&Je(t.name,y)})}let st=r("label","","important"),G=r("input");G.type="checkbox",G.checked=!0,st.append(G,e.createTextNode("!important\uB85C \uBBF8\uB9AC\uBCF4\uAE30 \uC6B0\uC120 \uC801\uC6A9")),b.append(st);let Oe=r("button","\uC120\uD0DD \uBC94\uC704 \uBCC0\uACBD \uC81C\uAC70"),lt=r("button","\uBAA8\uB4E0 \uBCC0\uACBD \uC81C\uAC70"),pt=r("div","","footer-actions");pt.append(Oe,lt),b.append(pt);let je=r("section","","section");je.append(r("h3","\uC2A4\uD0A8 \uD30C\uC77C \uC5F0\uACB0"));let ct=r("label","\uC2A4\uD0A8 \uBD84\uC11D JSON \uC5F0\uACB0","file-picker"),Y=r("input");Y.type="file",Y.accept=".json",Y.setAttribute("aria-label","\uC2A4\uD0A8 \uBD84\uC11D JSON \uC5F0\uACB0"),ct.append(Y);let H=r("div");je.append(ct,r("p","\uC2A4\uD0A8 \uBD84\uC11D\uAE30 \u2192 \uBE44\uC8FC\uC5BC \uC5F0\uACB0 JSON \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694. \uC6D0\uBCF8 \uC2A4\uD0A8 \uCF54\uB4DC\uB294 \uC804\uC1A1\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.","hint"),H),b.append(je);let $=r("details"),Qt=r("summary","\uD604\uC7AC \uC801\uC6A9 CSS\uC640 \uAD6C\uC870"),oe=r("div");$.append(Qt,oe),b.append($);let dt=r("details"),ft=r("summary","\uBCC0\uACBD\uC0AC\uD56D \uAC80\uD1A0"),mt=r("div","","review-list");dt.append(ft,mt),b.append(dt);let Fe=r("section","","section");Fe.append(r("h3","\uC218\uC815 \uCF54\uB4DC"));let ge=r("textarea","","code");ge.readOnly=!0,ge.setAttribute("aria-label","\uBCC0\uACBD CSS");let Ne=r("button","CSS \uBCF5\uC0AC"),ze=r("button","CSS \uB2E4\uC6B4\uB85C\uB4DC","primary"),Bt=r("div","","footer-actions");Bt.append(Ne,ze),Fe.append(ge,Bt,r("p","\uAC80\uD1A0\uD55C \uCF54\uB4DC\uB97C \uBCC4\uB3C4 override CSS\uB85C \uC5F0\uACB0\uD558\uC138\uC694. FTP\xB7\uC6B4\uC601 \uD30C\uC77C\uC740 \uC218\uC815\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC778\uB77C\uC778 !important\uAC00 \uC788\uC73C\uBA74 \uC6D0\uBCF8 \uCF54\uB4DC \uC870\uC815\uC774 \uCD94\uAC00\uB85C \uD544\uC694\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.","hint")),b.append(Fe);let ht=r("button","\uD3B8\uC9D1 \uC800\uC7A5"),Dt=r("button","\uC800\uC7A5 \uBD88\uB7EC\uC624\uAE30"),Te=r("button","\uD3B8\uC9D1 JSON"),gt=r("label","\uD3B8\uC9D1 JSON \uBD88\uB7EC\uC624\uAE30","file-picker"),W=r("input");W.type="file",W.accept=".json",W.setAttribute("aria-label","\uD3B8\uC9D1 JSON \uBD88\uB7EC\uC624\uAE30"),gt.append(W);let bt=r("div","","footer-actions");bt.append(ht,Dt,Te),b.append(bt,gt);let be=r("p","","status");be.setAttribute("role","status"),be.setAttribute("aria-live","polite"),b.append(be);let Re=r("section","","section");Re.append(r("h3","\uD074\uB77C\uC774\uC5B8\uD2B8 \uC218\uC815 \uC694\uCCAD"));let At=r("button",u.onSubmit?"\uAC80\uD1A0 \uC694\uCCAD \uBCF4\uB0B4\uAE30":"\uAC80\uD1A0 \uC694\uCCAD \uD30C\uC77C","primary"),xt=r("label","\uD648\uD398\uC774\uC9C0 \uD45C\uC2DC / \uACE0\uAC1D \uC694\uCCAD JSON \uBD88\uB7EC\uC624\uAE30","file-picker"),X=r("input");X.type="file",X.accept=".json",X.setAttribute("aria-label","\uD648\uD398\uC774\uC9C0 \uD45C\uC2DC JSON"),xt.append(X);let ne=r("button","\uC218\uC815 \uC601\uC5ED \uD45C\uC2DC \uB044\uAE30");ne.hidden=!0,Re.append(At,r("p","\uC694\uCCAD\uC5D0\uB294 \uD398\uC774\uC9C0 \uC8FC\uC18C, \uC218\uC815\uD55C \uC601\uC5ED\uACFC \uC804\uD6C4 \uAC12\uB9CC \uD3EC\uD568\uD569\uB2C8\uB2E4. \uC2A4\uD0A8 \uD30C\uC77C \uBCF8\uBB38\uACFC FTP \uC815\uBCF4\uB294 \uC804\uC1A1\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.","hint"),xt,ne),b.insertBefore(Re,Se);function yt(){let t=Ve(n.location.href);return{format:"style-forge-submission-v1",items:f.changes.map(a=>{let c=de.get(a.selector+"|"+a.media);return{...a,pageUrl:t,important:a.important??f.important,before:c?.before||{},label:c?.label||a.selector,sources:c?.sources||[]}})}}At.addEventListener("click",async t=>{if(!(u.onSubmit&&!t.isTrusted)){if(!f.changes.length){g("\uBA3C\uC800 \uC694\uC18C\uC758 \uB514\uC790\uC778\uC744 \uBCC0\uACBD\uD558\uC138\uC694.");return}try{u.onSubmit?(await u.onSubmit(yt()),g("\uD611\uC5C5 \uAC80\uD1A0\uD568\uC744 \uC5F4\uC5C8\uC2B5\uB2C8\uB2E4. \uD074\uB77C\uC774\uC5B8\uD2B8 \uACC4\uC815\uC73C\uB85C \uB85C\uADF8\uC778 \uD6C4 \uC81C\uBAA9\uACFC \uBA54\uBAA8\uB97C \uB123\uC5B4 \uC81C\uCD9C\uD558\uC138\uC694.")):($e(JSON.stringify(yt(),null,2),"style-forge-submission.json","application/json"),g("\uD611\uC5C5 \uAC80\uD1A0\uD568\uC758 \uD074\uB77C\uC774\uC5B8\uD2B8 \uD654\uBA74\uC5D0\uC11C \uC694\uCCAD \uD30C\uC77C\uC744 \uBD88\uB7EC\uC624\uC138\uC694."))}catch(a){g("\uC694\uCCAD\uC744 \uC900\uBE44\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: "+a.message)}}}),te=Cu(e,i,Ae);function Ie(t){let a=te.load(t);for(let c of a.items)de.set(c.selector+"|"+c.media,{before:c.before,label:c.label,sources:c.sources});f={version:"1.2",important:a.items.every(c=>c.important),changes:a.items.map(({selector:c,media:m,properties:d,important:A})=>({selector:c,media:m,properties:d,important:A}))},j.commit(f),N=!1,z(),k(),ne.hidden=!1,g(`\uC694\uCCAD ${a.items.length}\uAC1C \uC601\uC5ED \xB7 \uC77C\uCE58 ${a.total}\uAC1C \uC694\uC18C \xB7 \uBBF8\uD655\uC778 ${a.missing}\uAC1C \xB7 \uD45C\uC2DC ${a.displayed}\uAC1C. \uC784\uC2DC \uBBF8\uB9AC\uBCF4\uAE30\uC774\uBA70 \uC6B4\uC601 \uBC18\uC601\uC774 \uC544\uB2D9\uB2C8\uB2E4.`)}X.addEventListener("change",async()=>{try{let t=await Pe(X);t&&Ie(t)}catch(t){g("\uC694\uCCAD \uD45C\uC2DC \uD30C\uC77C\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: "+t.message)}}),ne.addEventListener("click",()=>{let t=te.toggle();ne.textContent=t?"\uC218\uC815 \uC601\uC5ED \uD45C\uC2DC \uB044\uAE30":"\uC218\uC815 \uC601\uC5ED \uD45C\uC2DC \uCF1C\uAE30"});let Et="style-forge.visual.v1:"+n.location.origin+n.location.pathname,vt=u.storage||{async get(t){return JSON.parse(n.localStorage.getItem(t)||"null")},async set(t,a){n.localStorage.setItem(t,JSON.stringify(a))}};function g(t){be.textContent=t}function Ue(){return f.changes.find(t=>t.selector===E&&t.media===F)}function qe(){try{return[...e.querySelectorAll(E)].filter(t=>t!==o&&t!==C)}catch{return[]}}function Q(){if(te?.draw(),!D?.isConnected){x.style.display="none";return}let t=D.getBoundingClientRect();x.style.display="block",Object.assign(x.style,{left:t.left+"px",top:t.top+"px",width:t.width+"px",height:t.height+"px"}),O.textContent=D.tagName.toLowerCase()+(D.id?"#"+D.id:"")}function k(){let t=D?n.getComputedStyle(D):null,a=Ue()?.properties||{};for(let c of se){let m=Qe.get(c.name);m.disabled=!D;let d=a[c.name]??t?.getPropertyValue(c.name)??"";if(m.title="\uD604\uC7AC \uACC4\uC0B0\uAC12: "+d,c.type==="color"){let A=d.match(/rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/);m.value=/^#[\da-f]{6}$/i.test(d)?d:A?"#"+A.slice(1,4).map(y=>Number(y).toString(16).padStart(2,"0")).join(""):"#ffffff"}else c.type==="number"?m.value=/^-?[\d.]+px$/.test(d)?parseFloat(d):"":[...m.options].some(A=>A.value===d)?m.value=d:m.querySelector('option[value="__current"]')&&(m.options[0].textContent=d||"\uD604\uC7AC \uAC12",m.value="__current")}}function ie(){if(H.replaceChildren(),!J){H.append(r("p","\uBD84\uC11D JSON\uC744 \uC5F0\uACB0\uD558\uBA74 \uD604\uC7AC \uC694\uC18C\uC640 \uB9DE\uB294 CSS \uACBD\uB85C\xB7\uC904\uC744 \uBCF4\uC5EC\uC90D\uB2C8\uB2E4.","hint"));return}let t=Jt(D,J);H.append(r("p",t.length+"\uAC1C \uD30C\uC77C \uC704\uCE58 \uD6C4\uBCF4 \xB7 \uC2E4\uC81C \uC801\uC6A9 \uC6B0\uC120\uC21C\uC704\uB294 \uBCC4\uB3C4 \uD655\uC778","hint"));for(let a of t.slice(0,100)){let c=r("div","","source-card");c.append(r("strong",a.file+":"+a.line),r("p",a.selector),r("p",a.context+" \xB7 "+a.status)),H.append(c)}t.length>100&&H.append(r("p","\uCC98\uC74C 100\uAC1C\uB9CC \uD45C\uC2DC\uD569\uB2C8\uB2E4.","hint"))}function ae(){if(oe.replaceChildren(),!D)return;let t=n.getComputedStyle(D);for(let A of se)oe.append(r("div",A.name+": "+t.getPropertyValue(A.name),"source-card"));let a=0,c=0,m=0;function d(A,y,I="\uAE30\uBCF8"){for(let U of A){if(++m>15e3)return;if(U.selectorText)try{if(D.matches(U.selectorText)&&a++<30){let P=r("div","","source-card");P.append(r("strong",U.selectorText),r("p",y+" \xB7 "+I),r("p",U.style.cssText)),oe.append(P)}}catch{}else if(U.cssRules){let P=I;U.conditionText&&(P=U.conditionText),d(U.cssRules,y,P)}}}for(let A of e.styleSheets)if(A.ownerNode!==C)try{d(A.cssRules,A.href||"\uC778\uB77C\uC778 \uC2A4\uD0C0\uC77C")}catch{c++}oe.append(r("p",`\uBE0C\uB77C\uC6B0\uC800 CSSOM\uC5D0\uC11C ${a}\uAC1C \uC120\uD0DD\uC790 \uC77C\uCE58 \xB7 \uC678\uBD80 \uC2DC\uD2B8 ${c}\uAC1C \uC77D\uAE30 \uC81C\uD55C. \uC870\uAC74\xB7\uCE90\uC2A4\uCF00\uC774\uB4DC \uC6B0\uC2B9 \uC5EC\uBD80\uB97C \uB2E8\uC815\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`,"hint"))}function M(){let t=qe().length,a=le[F];it.textContent=E?`\uB300\uC0C1 ${t}\uAC1C \xB7 \uD604\uC7AC \uD654\uBA74 ${n.innerWidth}px${a&&!n.matchMedia(a).matches?" \xB7 \uBBF8\uB514\uC5B4 \uC870\uAC74 \uBBF8\uCDA9\uC871":""}`:"",ge.value=Ce(f),me.disabled=!j.canUndo,Be.disabled=!j.canRedo,ue.disabled=!f.changes.length,ue.classList.toggle("active",N),ue.textContent=N?"\uBCC0\uACBD \uD654\uBA74 \uBCF4\uAE30":"\uC6D0\uBCF8 \uBE44\uAD50",G.checked=f.important,ft.textContent=`\uBCC0\uACBD\uC0AC\uD56D \uAC80\uD1A0 (${f.changes.length}\uAC1C \uADDC\uCE59)`,mt.replaceChildren(...f.changes.map(m=>{let d=r("div",m.selector+" \xB7 "+m.media,"changes-item");return d.append(r("pre",Object.entries(m.properties).map(([A,y])=>A+": "+y).join(`
`))),d})),Ne.disabled=ze.disabled=Te.disabled=!f.changes.length,Oe.disabled=!D,K.disabled=re.disabled=V.disabled=ke.disabled=!D;let c=D&&Object.keys(Ue()?.properties||{}).some(m=>D.style.getPropertyPriority(m)==="important");De.hidden=!c&&!E.includes(":nth-of-type"),De.textContent=c?"\uC778\uB77C\uC778 !important\uAC00 \uC788\uC5B4 \uC77C\uBD80 \uAC12\uC774 \uB36E\uC5B4\uC368\uC9C0\uC9C0 \uC54A\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC218\uC815 \uCF54\uB4DC\uC5D0\uC11C \uC6D0\uBCF8 \uC778\uB77C\uC778 \uC2A4\uD0C0\uC77C\uB3C4 \uAC80\uD1A0\uD558\uC138\uC694.":"\uC704\uCE58 \uAE30\uBC18 \uC120\uD0DD\uC790\uC785\uB2C8\uB2E4. \uC0C1\uD488 \uC21C\uC11C\uB098 \uD398\uC774\uC9C0 \uAD6C\uC870\uAC00 \uBC14\uB00C\uBA74 \uB300\uC0C1\uC774 \uB2EC\uB77C\uC9C8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",Q()}function z(){let t=Ce(f);C.textContent=u.applyCSS?"":t,C.disabled=N,u.applyCSS&&u.applyCSS(N?"":t).then(()=>{ve||(Q(),$.open&&ae())}).catch(()=>g("\uC784\uC2DC CSS \uC801\uC6A9 \uAD8C\uD55C\uC744 \uD655\uC778\uD558\uC138\uC694. \uD655\uC7A5 \uC544\uC774\uCF58\uC73C\uB85C \uB2E4\uC2DC \uC5F4\uC5B4\uC8FC\uC138\uC694.")),M(),$.open&&ae()}function Je(t,a){if(!D||!E)return;if(!qe().includes(D)){g("\uC120\uD0DD \uC694\uC18C\uC640 \uB9DE\uB294 \uC120\uD0DD\uC790\uB97C \uBA3C\uC800 \uC801\uC6A9\uD558\uC138\uC694.");return}if(a!==null&&(!n.CSS.supports(t,a)||/[{};\r\n]/.test(a)))return;if(a!==null&&!Ue()&&f.changes.length>=200){g("\uCD5C\uB300 200\uAC1C \uBC94\uC704\uAE4C\uC9C0 \uD3B8\uC9D1\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uAE30\uC874 \uBCC0\uACBD\uC744 \uC815\uB9AC\uD558\uC138\uC694.");return}let c=E+"|"+F,m=de.get(c);m||(m={before:{},label:he.textContent,sources:Jt(D,J).slice(0,30).map(({file:d,line:A})=>({file:d,line:A}))},de.set(c,m)),a!==null&&!Object.hasOwn(m.before,t)&&(m.before[t]=n.getComputedStyle(D).getPropertyValue(t)),f=ru(f,E,F,t,a),j.commit(f,E+"|"+F+"|"+t),N=!1,z(),a===null&&k(),g("\uD654\uBA74\uC5D0 \uC784\uC2DC \uBC18\uC601\uD588\uC2B5\uB2C8\uB2E4. \uC11C\uBC84\uC758 \uD30C\uC77C\uC740 \uBCC0\uACBD\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.")}function Ae(t){if(!t||t===o||t===C||["HTML","HEAD","SCRIPT","STYLE","LINK","META"].includes(t.tagName))return;D=t,E=qt(t).selector,K.value="single",V.value=E,he.textContent=t.tagName.toLowerCase()+(t.id?"#"+t.id:"")+[...t.classList].map(c=>"."+c).join(""),tt.textContent=(t.textContent||"").replace(/\s+/g," ").slice(0,100)||"(\uD14D\uC2A4\uD2B8 \uC5C6\uC74C)",ut.textContent="module: "+(t.getAttribute("module")||"\uC5C6\uC74C")+" \xB7 "+Math.round(t.getBoundingClientRect().width)+" \xD7 "+Math.round(t.getBoundingClientRect().height)+"px",we.replaceChildren();let a=t.parentElement;for(let c=0;a&&c<5&&a!==e.documentElement;c++,a=a.parentElement){let m=a,d=r("button","\u2191 "+a.tagName.toLowerCase()+(a.id?"#"+a.id:""));d.addEventListener("click",()=>Ae(m)),we.append(d)}k(),ie(),M(),$.open&&ae(),g("\uC120\uD0DD\uD55C \uC694\uC18C\uC758 \uC2A4\uD0C0\uC77C\uC744 \uC870\uC808\uD558\uC138\uC694.")}function wt(t){t.composedPath().includes(o)||!_||!(t.target instanceof n.Element)||(t.preventDefault(),t.stopImmediatePropagation(),Ae(t.target))}function St(t){if(!_||t.composedPath().includes(o)||!(t.target instanceof n.Element))return;let a=t.target.getBoundingClientRect();Object.assign(x.style,{display:"block",left:a.left+"px",top:a.top+"px",width:a.width+"px",height:a.height+"px"}),O.textContent=t.target.tagName.toLowerCase()}function kt(t){_=t,fe.textContent=_?"\u25CE \uC694\uC18C \uC120\uD0DD \uC911":"\u25CE \uC694\uC18C \uC120\uD0DD",fe.classList.toggle("primary",_),_||Q()}function Lt(t){t.key==="Escape"&&(kt(!1),g("\uC120\uD0DD \uBAA8\uB4DC\uB97C \uAED0\uC2B5\uB2C8\uB2E4. \uC1FC\uD551\uBAB0\uC744 \uC815\uC0C1\uC801\uC73C\uB85C \uD0D0\uC0C9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")),(t.ctrlKey||t.metaKey)&&t.key.toLowerCase()==="z"&&!t.composedPath().some(a=>["INPUT","TEXTAREA","SELECT"].includes(a.tagName))&&(t.preventDefault(),t.stopImmediatePropagation(),f=t.shiftKey?j.redo():j.undo(),z(),k())}n.addEventListener("click",wt,!0),e.addEventListener("pointermove",St,!0),e.addEventListener("keydown",Lt,!0);function Ot(){M(),k(),$.open&&ae()}n.addEventListener("resize",Ot),e.addEventListener("scroll",Q,!0),fe.addEventListener("click",()=>kt(!_)),me.addEventListener("click",()=>{f=j.undo(),z(),k()}),Be.addEventListener("click",()=>{f=j.redo(),z(),k()}),ue.addEventListener("click",()=>{N=!N,z(),g(N?"\uC6D0\uBCF8 \uD654\uBA74\uC785\uB2C8\uB2E4. \uBCC0\uACBD CSS\uB294 \uC720\uC9C0\uB429\uB2C8\uB2E4.":"\uBCC0\uACBD \uD654\uBA74\uC785\uB2C8\uB2E4.")}),K.addEventListener("change",()=>{if(!D)return;let t=K.value==="shared"?ou(D):qt(D).selector;if(!t){K.value="single",g("class\uAC00 \uC5C6\uB294 \uC694\uC18C\uC785\uB2C8\uB2E4. \uC0C1\uC704 \uC601\uC5ED\uC744 \uC120\uD0DD\uD558\uAC70\uB098 \uC120\uD0DD\uC790\uB97C \uC9C1\uC811 \uC785\uB825\uD558\uC138\uC694.");return}E=t,V.value=E,k(),M()}),re.addEventListener("change",()=>{F=re.value,k(),M()}),ke.addEventListener("click",()=>{try{let t=_t(V.value.trim(),e);if(!D?.matches(t))throw Error("\uD604\uC7AC \uC120\uD0DD \uC694\uC18C\uC640 \uC77C\uCE58\uD558\uB294 \uC120\uD0DD\uC790\uB97C \uC785\uB825\uD558\uC138\uC694.");E=t,k(),M(),g("\uB300\uC0C1 "+qe().length+"\uAC1C\uC5D0 \uC801\uC6A9\uD569\uB2C8\uB2E4.")}catch(t){g(t.message)}}),G.addEventListener("change",()=>{f={...f,important:G.checked,changes:f.changes.map(({important:t,...a})=>a)},j.commit(f),z()}),Oe.addEventListener("click",()=>{f={...f,changes:f.changes.filter(t=>t.selector!==E||t.media!==F)},j.commit(f),z(),k()}),lt.addEventListener("click",()=>{f.changes.length&&!n.confirm("\uBAA8\uB4E0 \uC784\uC2DC \uBCC0\uACBD\uC744 \uC81C\uAC70\uD560\uAE4C\uC694? \uC2E4\uD589 \uCDE8\uC18C\uB85C \uBCF5\uC6D0\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")||(f=$t(),j.commit(f),N=!1,z(),k())});function $e(t,a,c){let m=n.URL.createObjectURL(new Blob([t],{type:c})),d=r("a");d.href=m,d.download=a,i.append(d),d.click(),d.remove(),n.setTimeout(()=>n.URL.revokeObjectURL(m),1e3)}ze.addEventListener("click",()=>{$e(Ce(f),"style-forge-overrides.css","text/css;charset=utf-8"),g("CSS\uB97C \uB2E4\uC6B4\uB85C\uB4DC\uD588\uC2B5\uB2C8\uB2E4. \uBCC0\uACBD\uC0AC\uD56D \uAC80\uD1A0 \uD6C4 \uBCC4\uB3C4 \uD30C\uC77C\uB85C \uC801\uC6A9\uD558\uC138\uC694.")}),Ne.addEventListener("click",async()=>{try{if(n.navigator.clipboard&&n.isSecureContext)await n.navigator.clipboard.writeText(Ce(f));else{let t=r("textarea",Ce(f));t.style.position="fixed",t.style.opacity="0",e.body.append(t),t.select();let a=e.execCommand("copy");if(t.remove(),!a)throw Error("copy")}g("CSS\uB97C \uBCF5\uC0AC\uD588\uC2B5\uB2C8\uB2E4.")}catch{g("\uBCF5\uC0AC \uAD8C\uD55C\uC744 \uD655\uC778\uD558\uAC70\uB098 CSS \uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC0AC\uC6A9\uD558\uC138\uC694.")}});async function Pe(t){let a=t.files[0];if(t.value="",!a)return null;if(a.size>50*1024*1024)throw Error("JSON \uD30C\uC77C\uC740 50 MB \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4.");return JSON.parse(await a.text())}Y.addEventListener("change",async()=>{try{let t=await Pe(Y);if(!t)return;J=Me(t),ie(),g("\uC2A4\uD0A8 \uBD84\uC11D \uACB0\uACFC\uB97C \uC5F0\uACB0\uD588\uC2B5\uB2C8\uB2E4.")}catch(t){g("\uBD84\uC11D JSON\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: "+t.message)}}),ht.addEventListener("click",async()=>{try{await vt.set(Et,{state:f,report:J}),g("\uC774 \uD398\uC774\uC9C0\uC758 \uD3B8\uC9D1\uC744 \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.")}catch{g("\uBE0C\uB77C\uC6B0\uC800 \uC800\uC7A5 \uACF5\uAC04 \uB610\uB294 \uAD8C\uD55C\uC744 \uD655\uC778\uD558\uC138\uC694.")}}),Dt.addEventListener("click",async()=>{try{let t=await vt.get(Et);if(!t){g("\uC774 \uD398\uC774\uC9C0\uC5D0 \uC800\uC7A5\uB41C \uD3B8\uC9D1\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");return}let a=Ut(t.state,e);t.report&&(J=Me({...t.report,files:[]})),f=a,j.commit(f),N=!1,z(),k(),ie(),g("\uC800\uC7A5\uB41C \uD3B8\uC9D1\uC744 \uD654\uBA74\uC5D0 \uC784\uC2DC \uC801\uC6A9\uD588\uC2B5\uB2C8\uB2E4.")}catch(t){g("\uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: "+t.message)}}),Te.addEventListener("click",()=>$e(JSON.stringify({state:f,report:J},null,2),"style-forge-edit.json","application/json")),W.addEventListener("change",async()=>{try{let t=await Pe(W);if(!t)return;let a=Ut(t.state,e),c=t.report?Me({...t.report,files:[]}):null;f=a,J=c,j.commit(f),N=!1,z(),k(),ie(),g("\uD3B8\uC9D1 JSON\uC744 \uBD88\uB7EC\uC654\uC2B5\uB2C8\uB2E4.")}catch(t){g("\uD3B8\uC9D1 JSON\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: "+t.message)}}),$.addEventListener("toggle",()=>{$.open&&ae()});let jt=new n.MutationObserver(()=>{!D?.isConnected&&D?(D=null,he.textContent="\uC120\uD0DD \uC694\uC18C\uAC00 \uD398\uC774\uC9C0\uC5D0\uC11C \uC81C\uAC70\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",k(),M(),g("\uD398\uC774\uC9C0\uAC00 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC694\uC18C\uB97C \uB2E4\uC2DC \uC120\uD0DD\uD558\uC138\uC694.")):Q()});jt.observe(e.body,{childList:!0,subtree:!0});function Ft(){ve||(ve=!0,jt.disconnect(),te?.clear(),n.removeEventListener("click",wt,!0),e.removeEventListener("pointermove",St,!0),e.removeEventListener("keydown",Lt,!0),n.removeEventListener("resize",Ot),e.removeEventListener("scroll",Q,!0),C.remove(),u.applyCSS&&u.applyCSS("").catch(()=>{}),o.remove(),u.onClose?.())}return S.addEventListener("click",()=>{f.changes.length&&!n.confirm("\uD3B8\uC9D1\uAE30\uB97C \uB2EB\uC73C\uBA74 \uC784\uC2DC \uC801\uC6A9\uC774 \uC81C\uAC70\uB429\uB2C8\uB2E4. \uC800\uC7A5\xB7\uB0B4\uBCF4\uB0B4\uAE30\uB97C \uC644\uB8CC\uD588\uB098\uC694?")||Ft()}),z(),k(),ie(),g("\uC694\uC18C\uB97C \uD074\uB9AD\uD574 \uD3B8\uC9D1\uC744 \uC2DC\uC791\uD558\uC138\uC694."),u.reviewPacket&&Ie(u.reviewPacket),{host:o,destroy:Ft,choose:Ae,loadReview:Ie,getState:()=>structuredClone(f)}}var se,le,$t,Pt,nu,iu,su,Mt=eu(()=>{se=[{name:"font-family",label:"\uD3F0\uD2B8",type:"font",group:"\uAE00\uC528"},{name:"font-size",label:"\uD06C\uAE30",type:"number",unit:"px",max:300,group:"\uAE00\uC528"},{name:"font-weight",label:"\uAD75\uAE30",type:"weight",group:"\uAE00\uC528"},{name:"line-height",label:"\uD589\uAC04",type:"number",unit:"px",max:500,group:"\uAE00\uC528"},{name:"letter-spacing",label:"\uC790\uAC04",type:"number",unit:"px",min:-20,max:100,group:"\uAE00\uC528"},{name:"color",label:"\uAE00\uC528 \uC0C9",type:"color",group:"\uC0C9\uC0C1"},{name:"background-color",label:"\uBC30\uACBD \uC0C9",type:"color",group:"\uC0C9\uC0C1"},...["top","right","bottom","left"].map(e=>({name:"padding-"+e,label:{top:"\uC704",right:"\uC624\uB978\uCABD",bottom:"\uC544\uB798",left:"\uC67C\uCABD"}[e],type:"number",unit:"px",max:500,group:"\uC548\uCABD \uC5EC\uBC31"})),...["top","right","bottom","left"].map(e=>({name:"margin-"+e,label:{top:"\uC704",right:"\uC624\uB978\uCABD",bottom:"\uC544\uB798",left:"\uC67C\uCABD"}[e],type:"number",unit:"px",min:-500,max:500,group:"\uBC14\uAE65 \uC5EC\uBC31"})),{name:"width",label:"\uB108\uBE44",type:"number",unit:"px",max:3e3,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"height",label:"\uB192\uC774",type:"number",unit:"px",max:3e3,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-radius",label:"\uBAA8\uC11C\uB9AC",type:"number",unit:"px",max:500,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-width",label:"\uD14C\uB450\uB9AC \uB450\uAED8",type:"number",unit:"px",max:50,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-style",label:"\uD14C\uB450\uB9AC \uC885\uB958",type:"border",group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-color",label:"\uD14C\uB450\uB9AC \uC0C9",type:"color",group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"}],le={all:"",mobile:"(max-width: 767px)",desktop:"(min-width: 768px)"},$t=()=>({version:"1.2",important:!0,changes:[]}),Pt=new Set(se.map(e=>e.name));nu=class{constructor(e=$t()){this.states=[structuredClone(e)],this.index=0,this.lastKey="",this.lastTime=0}get current(){return structuredClone(this.states[this.index])}commit(e,u="",n=Date.now()){if(JSON.stringify(e)===JSON.stringify(this.states[this.index]))return;let o=u&&u===this.lastKey&&n-this.lastTime<450&&this.index===this.states.length-1&&this.index>0;this.states=this.states.slice(0,this.index+1),o?this.states[this.index]=structuredClone(e):(this.states.push(structuredClone(e)),this.index++),this.states.length>101&&(this.states.shift(),this.index--),this.lastKey=u,this.lastTime=n}undo(){return this.index>0&&this.index--,this.lastKey="",this.current}redo(){return this.index<this.states.length-1&&this.index++,this.lastKey="",this.current}get canUndo(){return this.index>0}get canRedo(){return this.index<this.states.length-1}};iu=new Set(se.map(e=>e.name));su=`:host {
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
`});var _e=[{name:"font-family",label:"\uD3F0\uD2B8",type:"font",group:"\uAE00\uC528"},{name:"font-size",label:"\uD06C\uAE30",type:"number",unit:"px",max:300,group:"\uAE00\uC528"},{name:"font-weight",label:"\uAD75\uAE30",type:"weight",group:"\uAE00\uC528"},{name:"line-height",label:"\uD589\uAC04",type:"number",unit:"px",max:500,group:"\uAE00\uC528"},{name:"letter-spacing",label:"\uC790\uAC04",type:"number",unit:"px",min:-20,max:100,group:"\uAE00\uC528"},{name:"color",label:"\uAE00\uC528 \uC0C9",type:"color",group:"\uC0C9\uC0C1"},{name:"background-color",label:"\uBC30\uACBD \uC0C9",type:"color",group:"\uC0C9\uC0C1"},...["top","right","bottom","left"].map(e=>({name:"padding-"+e,label:{top:"\uC704",right:"\uC624\uB978\uCABD",bottom:"\uC544\uB798",left:"\uC67C\uCABD"}[e],type:"number",unit:"px",max:500,group:"\uC548\uCABD \uC5EC\uBC31"})),...["top","right","bottom","left"].map(e=>({name:"margin-"+e,label:{top:"\uC704",right:"\uC624\uB978\uCABD",bottom:"\uC544\uB798",left:"\uC67C\uCABD"}[e],type:"number",unit:"px",min:-500,max:500,group:"\uBC14\uAE65 \uC5EC\uBC31"})),{name:"width",label:"\uB108\uBE44",type:"number",unit:"px",max:3e3,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"height",label:"\uB192\uC774",type:"number",unit:"px",max:3e3,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-radius",label:"\uBAA8\uC11C\uB9AC",type:"number",unit:"px",max:500,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-width",label:"\uD14C\uB450\uB9AC \uB450\uAED8",type:"number",unit:"px",max:50,group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-style",label:"\uD14C\uB450\uB9AC \uC885\uB958",type:"border",group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"},{name:"border-color",label:"\uD14C\uB450\uB9AC \uC0C9",type:"color",group:"\uD06C\uAE30 & \uD14C\uB450\uB9AC"}],xe={all:"",mobile:"(max-width: 767px)",desktop:"(min-width: 768px)"};var fu=new Set(_e.map(e=>e.name));function Nt(e){return`/* STYLE FORGE v1.2 \xB7 \uAC80\uD1A0 \uD6C4 \uBCC4\uB3C4 override CSS\uB85C \uC801\uC6A9 */
`+e.changes.map(n=>{let o=n.selector+` {
`+Object.entries(n.properties).map(([i,s])=>"  "+i+": "+s+(n.important??e.important?" !important":"")+";").join(`
`)+`
}`;return xe[n.media]?"@media "+xe[n.media]+` {
`+o.split(`
`).map(i=>"  "+i).join(`
`)+`
}`:o}).join(`

`)+`
`}var uu=new Set(_e.map(e=>e.name)),zt={pending:"\uAC80\uD1A0 \uB300\uAE30",approved:"\uC2B9\uC778",rejected:"\uBC18\uB824",revision_requested:"\uC218\uC815 \uC694\uCCAD",applied:"\uC801\uC6A9 \uC644\uB8CC"};function Ke(e){let u=new URL(e);if(!["http:","https:"].includes(u.protocol)||u.username||u.password)throw Error("\uC62C\uBC14\uB978 \uD648\uD398\uC774\uC9C0 \uC8FC\uC18C\uAC00 \uC544\uB2D9\uB2C8\uB2E4.");for(let n of u.searchParams.keys())if(/^(password|pass|token|access_token|refresh_token|auth|authorization|session|sessionid|sid|api_key|key)$/i.test(n))throw Error("\uC778\uC99D \uC815\uBCF4\uAC00 \uD3EC\uD568\uB41C \uC8FC\uC18C\uB294 \uC81C\uCD9C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC77C\uBC18 \uD398\uC774\uC9C0 \uC8FC\uC18C\uB97C \uC0AC\uC6A9\uD558\uC138\uC694.");return u.searchParams.sort(),u.origin+u.pathname+u.search}function Tt(e,u,n=()=>!0){if(!Array.isArray(e)||!e.length||e.length>200)throw Error("\uC218\uC815 \uD56D\uBAA9\uC740 1\u2013200\uAC1C\uC5EC\uC57C \uD569\uB2C8\uB2E4.");return e.map(o=>{let i=Ke(o.pageUrl);if(new URL(i).origin!==u)throw Error("\uD504\uB85C\uC81D\uD2B8\uC5D0 \uB4F1\uB85D\uB41C \uC0AC\uC774\uD2B8\uC758 \uC218\uC815\uC548\uB9CC \uC81C\uCD9C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");if(typeof o.selector!="string"||!o.selector||o.selector.length>1e3||/[{};\r\n]|\/\*/.test(o.selector)||!Object.hasOwn(xe,o.media))throw Error("\uC798\uBABB\uB41C \uB300\uC0C1 \uC120\uD0DD\uC790 \uB610\uB294 \uD654\uBA74 \uBC94\uC704");let s={};for(let[p,h]of Object.entries(o.properties||{})){if(!uu.has(p)||typeof h!="string"||h.length>250||/[{};\r\n]|url\s*\(/i.test(h)||!n(p,h))throw Error("\uD5C8\uC6A9\uB418\uC9C0 \uC54A\uC740 CSS \uC18D\uC131: "+p);s[p]=h}if(!Object.keys(s).length)throw Error("\uBCC0\uACBD\uD55C CSS\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");let C={};for(let p of Object.keys(s))typeof o.before?.[p]=="string"&&(C[p]=o.before[p].slice(0,250));let r=Array.isArray(o.sources)?o.sources.slice(0,30).filter(p=>typeof p.file=="string"&&p.file.length<1e3&&!/(^|\/)\.\.(\/|$)/.test(p.file)&&Number.isInteger(p.line)&&p.line>0).map(p=>({file:p.file,line:p.line})):[];return{pageUrl:i,selector:o.selector,media:o.media,properties:s,before:C,sources:r,important:o.important!==!1,label:String(o.label||o.selector).slice(0,160)}})}function Rt(e){return Nt({important:e.important!==!1,changes:[{selector:e.selector,media:e.media,properties:e.properties}]})}function It(e){return e=structuredClone(e),{...e,pages:[...new Set(e.items.map(u=>u.pageUrl))],pending:e.items.filter(u=>u.status==="pending").length,approved:e.items.filter(u=>u.status==="approved").length}}var l=e=>document.getElementById(e),B=(e,u="",n="")=>{let o=document.createElement(e);return o.textContent=u,o.className=n,o},ee="",v=null,Z=[],pe=[],Ht=[],q=null,ce=[],L="demo";try{l("collab-api").value=localStorage.getItem("style-forge.collab.api")||""}catch{}var Ge=null,Ye="style-forge.collab.demo.v1",Vt=location.protocol==="chrome-extension:"?"https://demo.example":location.origin,He={id:"demo-client",name:"\uCCB4\uD5D8 \uD074\uB77C\uC774\uC5B8\uD2B8",email:"client@example.test",role:"client"},pu={id:"demo-reviewer",name:"\uCCB4\uD5D8 \uB2F4\uB2F9\uC790",role:"reviewer"};function Xe(){let e;try{e=JSON.parse(localStorage.getItem(Ye)||"null")}catch{}if(e||(e=Ge),!e){let u=Vt+"/visual/demo.html";e={projects:[{id:"demo-project",name:"\uC1FC\uD551\uBAB0 \uCCB4\uD5D8 \uD504\uB85C\uC81D\uD2B8",origin:Vt}],requests:[{id:"demo-request",version:1,projectId:"demo-project",authorId:He.id,authorName:He.name,title:"\uBA54\uC778 \uAE00\uC528\uC640 \uBC84\uD2BC \uC5EC\uBC31 \uC218\uC815",note:"\uC81C\uBAA9\uC744 \uB354 \uD06C\uAC8C \uD558\uACE0 \uC0C1\uD488 \uBC84\uD2BC \uC5EC\uBC31\uC744 \uB298\uB824\uC8FC\uC138\uC694.",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),items:[{id:"demo-title",pageUrl:u,selector:".shop-title",media:"all",properties:{"font-size":"42px",color:"#9258ad"},before:{"font-size":"38px",color:"rgb(37, 40, 50)"},label:"\uBA54\uC778 \uC81C\uBAA9",important:!0,sources:[],status:"pending"},{id:"demo-button",pageUrl:u,selector:".product-button",media:"all",properties:{"padding-top":"18px","border-radius":"14px"},before:{"padding-top":"12px","border-radius":"8px"},label:"\uC0C1\uD488 \uBC84\uD2BC",important:!0,sources:[],status:"pending"}],events:[]}]};try{localStorage.setItem(Ye,JSON.stringify(e))}catch{}}return Ge=e,e}function w(e){l("collab-status").textContent=e}function We(){let e=l("collab-api").value.trim().replace(/\/$/,""),u=new URL(e);if(u.username||u.password||u.pathname!=="/"||!["https:"].includes(u.protocol)&&!(u.protocol==="http:"&&["localhost","127.0.0.1"].includes(u.hostname)))throw Error("HTTPS \uC11C\uBC84 \uC8FC\uC18C \uB610\uB294 localhost \uC8FC\uC18C\uB97C \uC785\uB825\uD558\uC138\uC694.");return u.origin}async function T(e,u){let n=await fetch(We()+e,{method:u?"POST":"GET",headers:{...u?{"Content-Type":"application/json"}:{},...ee?{Authorization:"Bearer "+ee}:{}},...u?{body:JSON.stringify(u)}:{}}),o=await n.json();if(!n.ok)throw Error(o.error||"\uC694\uCCAD \uC2E4\uD328");return o}function Wt(e){Ge=e;try{localStorage.setItem(Ye,JSON.stringify(e))}catch{}}function ye(e,u,n="application/json"){let o=B("a"),i=URL.createObjectURL(new Blob([e],{type:n}));o.href=i,o.download=u,document.body.append(o),o.click(),o.remove(),setTimeout(()=>URL.revokeObjectURL(i),1e3)}async function R(){try{if(L==="demo"){v=l("collab-demo-role").value==="client"?He:pu;let e=Xe();Z=e.projects,pe=e.requests.filter(u=>v.role==="reviewer"||u.authorId===v.id).map(It)}else{if(!ee){v=null,Z=[],pe=[],Gt();return}Z=(await T("/api/projects")).projects,pe=(await T("/api/requests")).requests,v.role==="reviewer"&&(Ht=(await T("/api/users")).users)}Gt()}catch(e){w(e.message)}}function Gt(){let e=!!v;l("collab-body").hidden=!e,l("collab-login").hidden=L!=="server"||e,l("collab-demo-role-wrap").hidden=L!=="demo",l("collab-logout").hidden=L!=="server"||!e,l("collab-user").textContent=v?`${v.name} \xB7 ${v.role==="reviewer"?"\uB2F4\uB2F9\uC790":"\uD074\uB77C\uC774\uC5B8\uD2B8"}`:"\uB85C\uADF8\uC778 \uD6C4 \uC0AC\uC6A9\uD558\uC138\uC694.",l("collab-mode-banner").textContent=L==="demo"?"\uB85C\uCEEC \uCCB4\uD5D8 \uBAA8\uB4DC \xB7 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uB9CC \uC800\uC7A5\uB429\uB2C8\uB2E4. \uD074\uB77C\uC774\uC5B8\uD2B8\uC5D0\uAC8C \uC2E4\uC81C \uC804\uC1A1\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.":"\uD611\uC5C5 \uC11C\uBC84 \uBAA8\uB4DC \xB7 \uC218\uC815 \uC694\uCCAD\uACFC \uAC80\uD1A0 \uAE30\uB85D\uC744 \uC5F0\uACB0\uD55C \uC11C\uBC84\uC5D0 \uC800\uC7A5\uD569\uB2C8\uB2E4.";let u=l("collab-project").value;if(l("collab-project").replaceChildren(...Z.map(n=>new Option(n.name,n.id))),Z.some(n=>n.id===u)&&(l("collab-project").value=u),l("collab-submit-section").hidden=v?.role!=="client",l("collab-admin").hidden=v?.role!=="reviewer"||L==="demo",l("collab-client-users").replaceChildren(...Ht.filter(n=>n.role==="client").map(n=>new Option(n.name+" \xB7 "+n.email,n.id))),Ee(),q){let n=pe.find(o=>o.id===q.id);n?Xt(n):(l("collab-detail").replaceChildren(B("p","\uC218\uC815 \uC694\uCCAD\uC744 \uC120\uD0DD\uD558\uC138\uC694.","collab-empty")),q=null)}}function Ee(){let e=l("collab-search").value.toLowerCase(),u=l("collab-filter").value,n=pe.filter(o=>o.projectId===l("collab-project").value&&(u==="all"||o.items.some(i=>i.status===u))&&[o.title,...o.pages].join(" ").toLowerCase().includes(e));l("collab-request-count").textContent=n.length+"\uAC74",l("collab-requests").replaceChildren(...n.map(o=>{let i=B("button","",q?.id===o.id?"collab-request selected":"collab-request");return i.append(B("strong",o.title),B("small",`${o.authorName} \xB7 ${o.pages.length}\uAC1C \uD398\uC774\uC9C0 \xB7 ${o.items.length}\uAC1C \uC601\uC5ED`),B("p",o.pages.join(`
`)),B("small",`\uAC80\uD1A0 \uB300\uAE30 ${o.pending} \xB7 \uC2B9\uC778 ${o.approved}`)),i.addEventListener("click",()=>Xt(o)),i})),n.length||l("collab-requests").append(B("p","\uC218\uC815 \uC694\uCCAD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.","collab-empty"))}function Yt(e){return{format:"style-forge-review-v1",requestId:e.id,version:e.version,title:e.title,items:e.items.filter(u=>u.status!=="rejected")}}async function cu(e,u,n,o){try{if(L==="demo"){let i=Xe(),s=i.requests.find(C=>C.id===e.id);s.items.find(C=>C.id===u.id).status=n,s.items.find(C=>C.id===u.id).reviewNote=o,s.version++,Wt(i)}else await T("/api/requests/"+e.id+"/decisions",{version:e.version,decisions:[{id:u.id,status:n,note:o}]});await R(),w("\uAC80\uD1A0 \uACB0\uACFC\uB97C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.")}catch(i){w(i.message)}}function Xt(e){q=e,Ee();let u=l("collab-detail");u.replaceChildren(B("h2",e.title),B("p",`${e.authorName} \xB7 ${new Date(e.createdAt).toLocaleString("ko-KR")} \xB7 \uBC84\uC804 ${e.version}`,"meta"),B("p",e.note||"\uBA54\uBAA8 \uC5C6\uC74C","meta"));let n=B("div","","collab-actions"),o=B("button","\uD648\uD398\uC774\uC9C0 \uD45C\uC2DC JSON","button");if(o.addEventListener("click",()=>ye(JSON.stringify(Yt(e),null,2),"style-forge-review.json")),n.append(o),v.role==="reviewer"){let i=B("button",L==="demo"?"\uC2B9\uC778 CSS \uBC1B\uAE30 (\uCCB4\uD5D8)":"\uC2B9\uC778 \uC801\uC6A9 \uD328\uD0A4\uC9C0 \uBC1B\uAE30","button dark");i.disabled=!e.items.some(r=>r.status==="approved"),i.addEventListener("click",async()=>{try{if(L==="demo")ye(e.items.filter(r=>r.status==="approved").map(Rt).join(`
`),"approved-demo.css","text/css");else{let r=await T("/api/requests/"+e.id+"/bundle",{});ye(JSON.stringify(r.bundle,null,2),"style-forge-approved.json")}}catch(r){w(r.message)}}),n.append(i);let s=B("label","\uC801\uC6A9 \uC601\uC218\uC99D \uD655\uC778","collab-file"),C=B("input");C.type="file",C.accept=".json",s.append(C),C.addEventListener("change",async()=>{try{if(L!=="server")throw Error("\uCCB4\uD5D8 \uBAA8\uB4DC\uC5D0\uC11C\uB294 \uC2E4\uC81C \uC801\uC6A9 \uC644\uB8CC\uB97C \uAE30\uB85D\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");let r=C.files[0];if(!r||r.size>1e5)throw Error("\uC601\uC218\uC99D \uD30C\uC77C\uC744 \uD655\uC778\uD558\uC138\uC694.");let p=JSON.parse(await r.text());if(p.requestId!==e.id)throw Error("\uB2E4\uB978 \uC694\uCCAD\uC758 \uC601\uC218\uC99D\uC785\uB2C8\uB2E4.");await T("/api/requests/"+e.id+"/receipt",p),await R(),w("\uB2F4\uB2F9\uC790\uAC00 \uC801\uC6A9 \uC601\uC218\uC99D\uC744 \uD655\uC778\uD558\uC5EC \uAE30\uB85D\uD588\uC2B5\uB2C8\uB2E4.")}catch(r){w(r.message)}C.value=""}),n.append(s)}if(u.append(n),L==="demo"&&location.protocol!=="chrome-extension:"){let i=B("button","\uC218\uC815 \uC601\uC5ED \uCCB4\uD5D8 \uD654\uBA74 \uC5F4\uAE30","button");i.addEventListener("click",async()=>{u.querySelector("iframe")?.remove();let C=B("iframe","","collab-demo-frame");C.title="\uC218\uC815 \uC601\uC5ED \uAC80\uD1A0 \uCCB4\uD5D8",C.src="visual/demo.html",u.append(C),C.scrollIntoView({block:"start"}),C.addEventListener("load",async()=>{let{mountEditor:r}=await Promise.resolve().then(()=>(Mt(),Kt));r(C.contentDocument,{reviewPacket:Yt(e)})})}),u.append(i)}for(let i of e.items){let s=B("article","","collab-item");s.append(B("strong",i.label),B("span",zt[i.status],"badge"));let C=B("a",i.pageUrl,"page-link");C.href=Ke(i.pageUrl),C.target="_blank",C.rel="noopener noreferrer",s.append(C,B("code",i.selector+" \xB7 "+i.media));let r=B("table"),p=B("tr");for(let h of["\uC18D\uC131","\uC218\uC815 \uC804 \uB300\uD45C\uAC12","\uC218\uC815 \uD6C4"])p.append(B("th",h));r.append(p);for(let[h,S]of Object.entries(i.properties)){let b=B("tr");b.append(B("td",h),B("td",i.before?.[h]||"\uBBF8\uAE30\uB85D"),B("td",S)),r.append(b)}s.append(r);for(let h of i.sources||[])s.append(B("div",`${h.file}:${h.line} \xB7 \uD30C\uC77C \uC704\uCE58 \uD6C4\uBCF4`,"collab-source"));if(i.reviewNote&&s.append(B("p",i.reviewNote,"meta")),v.role==="reviewer"&&i.status!=="applied"){let h=B("div","","collab-review-controls"),S=B("select");for(let[O,D]of[["approved","\uC2B9\uC778"],["revision_requested","\uC7AC\uC218\uC815 \uC694\uCCAD"],["rejected","\uBC18\uB824"]])S.append(new Option(D,O));S.value=i.status==="pending"?"approved":i.status;let b=B("input");b.placeholder="\uAC80\uD1A0 \uBA54\uBAA8 / \uC7AC\uC218\uC815 \uC0AC\uC720",b.value=i.reviewNote||"";let x=B("button","\uAC80\uD1A0 \uC800\uC7A5","button");x.addEventListener("click",()=>{if(S.value==="revision_requested"&&!b.value.trim()){w("\uC7AC\uC218\uC815 \uC0AC\uC720\uB97C \uC785\uB825\uD558\uC138\uC694.");return}cu(e,i,S.value,b.value)}),h.append(S,b,x),s.append(h)}u.append(s)}if(v.role==="client"&&e.items.some(i=>i.status==="revision_requested")){let i=B("button","\uC7AC\uC218\uC815 \uC694\uCCAD\uC5D0 \uB2F5\uD558\uAE30","button");i.addEventListener("click",()=>{l("collab-supersedes").value=e.id,l("collab-title").value="[\uC7AC\uC218\uC815] "+e.title,w("\uC0C8 \uC218\uC815 \uC694\uCCAD \uD30C\uC77C\uC744 \uBD88\uB7EC\uC640 \uC81C\uCD9C\uD558\uC138\uC694. \uC774\uC804 \uAC80\uD1A0 \uAE30\uB85D\uC740 \uC720\uC9C0\uB429\uB2C8\uB2E4."),l("collab-submit-section").scrollIntoView({behavior:"smooth"})}),u.append(i)}}l("collab-mode").addEventListener("change",()=>{L=l("collab-mode").value,ee="",v=null,q=null,R()});l("collab-demo-role").addEventListener("change",()=>{q=null,R()});l("collab-login").addEventListener("submit",async e=>{e.preventDefault();try{if(globalThis.chrome?.permissions){let n=new URL(We());if(!await chrome.permissions.request({origins:[n.protocol+"//"+n.hostname+"/*"]}))throw Error("\uC11C\uBC84 \uC811\uADFC \uAD8C\uD55C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.")}let u=await T("/api/login",{email:l("collab-email").value,password:l("collab-password").value});l("collab-password").value="";try{localStorage.setItem("style-forge.collab.api",We())}catch{}ee=u.token,v=u.user,await R(),w("\uB85C\uADF8\uC778\uD588\uC2B5\uB2C8\uB2E4.")}catch(u){w(u.message)}});l("collab-logout").addEventListener("click",async()=>{try{await T("/api/logout",{})}catch{}ee="",v=null,q=null,R()});l("collab-refresh").addEventListener("click",R);for(let e of["collab-project","collab-filter"])l(e).addEventListener("change",()=>{q=null,Ee(),l("collab-detail").replaceChildren(B("p","\uC218\uC815 \uC694\uCCAD\uC744 \uC120\uD0DD\uD558\uC138\uC694.","collab-empty"))});l("collab-search").addEventListener("input",Ee);l("collab-submit-files").addEventListener("change",async e=>{try{let u=[];for(let n of e.target.files){if(n.size>2*1024*1024)throw Error("\uC694\uCCAD \uD30C\uC77C\uC740 2 MB \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4.");let o=JSON.parse(await n.text());if(o.format!=="style-forge-submission-v1")throw Error("\uBE44\uC8FC\uC5BC \uD3B8\uC9D1\uAE30\uC758 \uAC80\uD1A0 \uC694\uCCAD \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.");u.push(...o.items)}ce=u,l("collab-draft-info").textContent=`${new Set(u.map(n=>n.pageUrl)).size}\uAC1C \uD398\uC774\uC9C0 \xB7 ${u.length}\uAC1C \uC218\uC815 \uC601\uC5ED \uC900\uBE44\uB428`}catch(u){w(u.message)}e.target.value=""});l("collab-submit-form").addEventListener("submit",async e=>{e.preventDefault();try{let u=Z.find(i=>i.id===l("collab-project").value);if(!u)throw Error("\uD504\uB85C\uC81D\uD2B8\uB97C \uBA3C\uC800 \uC120\uD0DD\uD558\uC138\uC694.");let n=Tt(ce,u.origin,(i,s)=>CSS.supports(i,s)),o={projectId:u.id,title:l("collab-title").value,note:l("collab-note").value,supersedes:l("collab-supersedes").value||null,items:n};if(L==="demo"){let i=Xe(),s=new Date().toISOString();i.requests.push({...o,id:crypto.randomUUID(),authorId:v.id,authorName:v.name,version:1,createdAt:s,updatedAt:s,events:[],items:n.map(C=>({...C,id:crypto.randomUUID(),status:"pending"}))}),Wt(i)}else await T("/api/requests",o);ce=[],l("collab-draft-info").textContent="",l("collab-submit-form").reset(),await R(),w(L==="demo"?"\uCCB4\uD5D8 \uC218\uC815 \uC694\uCCAD\uC744 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.":"\uB2F4\uB2F9\uC790 \uAC80\uD1A0\uD568\uC5D0 \uC218\uC815 \uC694\uCCAD\uC744 \uC81C\uCD9C\uD588\uC2B5\uB2C8\uB2E4.")}catch(u){w(u.message)}});l("collab-new-user").addEventListener("submit",async e=>{e.preventDefault();try{await T("/api/users",{email:l("collab-new-email").value,name:l("collab-new-name").value,password:l("collab-new-password").value,role:"client"}),l("collab-new-password").value="",e.target.reset(),await R(),w("\uD074\uB77C\uC774\uC5B8\uD2B8 \uACC4\uC815\uC744 \uC0DD\uC131\uD588\uC2B5\uB2C8\uB2E4.")}catch(u){w(u.message)}});l("collab-new-project").addEventListener("submit",async e=>{e.preventDefault();try{await T("/api/projects",{name:l("collab-new-project-name").value,origin:l("collab-new-origin").value,clientIds:[...l("collab-client-users").selectedOptions].map(u=>u.value)}),e.target.reset(),await R(),w("\uD504\uB85C\uC81D\uD2B8\uB97C \uC0DD\uC131\uD588\uC2B5\uB2C8\uB2E4.")}catch(u){w(u.message)}});l("collab-export-key").addEventListener("click",async()=>{try{let e=await T("/api/key");ye(e.publicKey,"style-forge-server-public.pem","text/plain")}catch(e){w(e.message)}});if(location.protocol==="chrome-extension:"){let e=new URL(location.href).searchParams.get("draft");if(e){let u=(await chrome.storage.session.get(e))[e];u&&(ce=u.items,l("collab-draft-info").textContent=`${ce.length}\uAC1C \uC218\uC815 \uC601\uC5ED \uC900\uBE44\uB428`),await chrome.storage.session.remove(e)}l("collab-mode").value="server",L="server"}R();
