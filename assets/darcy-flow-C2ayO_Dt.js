import"./main-Xfqt2xr9.js";import{c as e,a as Y}from"./ui-tU1-thhr.js";const D=document.getElementById("headProfile"),T=["conductivity","headLoss","length","area"];T.forEach(n=>{document.getElementById(n).addEventListener("input",L)});function u(n){const a=Math.floor(Math.log10(n));return`${(n/10**a).toFixed(1)} × 10<sup>${a}</sup>`}function C(n,a,o){return(n-a)/(o-a)}function L(){const n=parseFloat(document.getElementById("conductivity").value),a=parseFloat(document.getElementById("headLoss").value),o=parseFloat(document.getElementById("length").value),d=parseFloat(document.getElementById("area").value),g=10**n,f=a/o,k=g*f,M=k*d;document.getElementById("conductivityValue").innerHTML=u(g),document.getElementById("headLossValue").textContent=a.toFixed(1),document.getElementById("lengthValue").textContent=o.toFixed(1),document.getElementById("areaValue").textContent=d.toFixed(2),document.getElementById("gradientValue").textContent=f.toFixed(3),document.getElementById("fluxValue").innerHTML=`${u(k)} m/s`,document.getElementById("dischargeValue").innerHTML=`${u(M)} m³/s`;const H=C(o,.1,10),I=C(d,.01,1),c=250+H*150,h=42+I*34,w=h+20,r=132,s=r+c,v=284-w/2,S=284-h/2,l=284+h/2,E=32,p=r-E/2,m=s-E/2,x=Math.max(.8,Math.min(2.2,a*.45+.6)),$=x+a,F=170/Math.max($,1),B=245,t=B-$*F,i=B-x*F,W=(t+i)/2,y=(r+s)/2,b=[`${r},${t}`,`${r+c*.32},${t+(i-t)*.3}`,`${r+c*.68},${t+(i-t)*.68}`,`${s},${i}`].join(" ");D.innerHTML=`
        <svg viewBox="0 0 680 420" role="img" aria-labelledby="darcySchematicTitle darcySchematicDesc">
            <title id="darcySchematicTitle">Darcy flow through a soil-filled horizontal specimen</title>
            <desc id="darcySchematicDesc">A horizontal soil specimen connects two standpipes. The water surface stands higher on the left than on the right, showing head loss and driving seepage through the soil.</desc>

            <defs>
                <pattern id="soilPattern" width="18" height="18" patternUnits="userSpaceOnUse">
                    <rect width="18" height="18" fill="${e.soilLight}"></rect>
                    <circle cx="4" cy="5" r="1.6" fill="${e.soilEdge}"></circle>
                    <circle cx="13" cy="9" r="1.3" fill="${e.soil}"></circle>
                    <circle cx="8" cy="14" r="1.5" fill="${e.soilLayer3}"></circle>
                </pattern>
                <linearGradient id="pipeWall" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${e.faint}"></stop>
                    <stop offset="100%" stop-color="${e.structure}"></stop>
                </linearGradient>
                <linearGradient id="waterFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${Y(e.water,.45)}"></stop>
                    <stop offset="100%" stop-color="${e.water}"></stop>
                </linearGradient>
                <marker id="dimensionCap" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <path d="M 9 0 L 9 10" stroke="${e.ink}" stroke-width="2.4" fill="none"></path>
                </marker>
                <marker id="deltaCap" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <path d="M 9 0 L 9 10" stroke="${e.primary}" stroke-width="2.4" fill="none"></path>
                </marker>
                <marker id="flowCap" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <path d="M 9 0 L 9 10" stroke="${e.waterDark}" stroke-width="2.4" fill="none"></path>
                </marker>
            </defs>

            <rect x="24" y="18" width="632" height="384" rx="24" fill="${e.surfaceMuted}"></rect>

            <g class="datum-layer">
                <line x1="50" y1="360" x2="630" y2="360" stroke="${e.muted}" stroke-width="2" stroke-dasharray="7 7"></line>
                <text x="40" y="352" class="datum-label">Datum</text>
            </g>

            <g class="standpipe-layer">
                <rect x="${p}" y="64" width="32" height="${l-64}" rx="12" fill="url(#pipeWall)" opacity="0.95"></rect>
                <rect x="${m}" y="102" width="32" height="${l-102}" rx="12" fill="url(#pipeWall)" opacity="0.95"></rect>

                <rect x="${p+6}" y="${t}" width="20" height="${l-t}" rx="8" fill="url(#waterFill)" opacity="0.82"></rect>
                <rect x="${m+6}" y="${i}" width="20" height="${l-i}" rx="8" fill="url(#waterFill)" opacity="0.82"></rect>

                <line x1="${p+2}" y1="${t}" x2="${r+14}" y2="${t}" stroke="${e.waterDark}" stroke-width="4"></line>
                <line x1="${s-14}" y1="${i}" x2="${m+30}" y2="${i}" stroke="${e.waterDark}" stroke-width="4"></line>
            </g>

            <g class="specimen-layer">
                <rect x="${r}" y="${v}" width="${c}" height="${w}" rx="28" fill="url(#pipeWall)"></rect>
                <rect x="${r+14}" y="${S}" width="${c-28}" height="${h}" rx="20" fill="url(#soilPattern)" stroke="${e.soilEdge}" stroke-width="2"></rect>
            </g>

            <g class="head-layer">
                <polyline points="${b}" fill="none" stroke="${e.water}" stroke-width="4" stroke-dasharray="10 8"></polyline>
                <text x="254" y="${W-16}" class="head-line-label">Hydraulic head line</text>

                <line x1="88" y1="360" x2="88" y2="${t}" stroke="${e.ink}" stroke-width="2.5" marker-start="url(#dimensionCap)" marker-end="url(#dimensionCap)"></line>
                <text x="10" y="${(360+t)/2}" class="dimension-label">h₁ = ${$.toFixed(1)} m</text>

                <line x1="552" y1="360" x2="552" y2="${i}" stroke="${e.ink}" stroke-width="2.5" marker-start="url(#dimensionCap)" marker-end="url(#dimensionCap)"></line>
                <text x="560" y="${(360+i)/2}" class="dimension-label">h₂ = ${x.toFixed(1)} m</text>

                <line x1="590" y1="${t}" x2="590" y2="${i}" stroke="${e.primary}" stroke-width="2.5" marker-start="url(#deltaCap)" marker-end="url(#deltaCap)"></line>
                <text x="600" y="${(t+i)/2}" class="delta-label">Δh = ${a.toFixed(1)} m</text>
            </g>

            <g class="length-layer">
                <line x1="${r+14}" y1="${l+26}" x2="${s-14}" y2="${l+26}" stroke="${e.ink}" stroke-width="2" marker-start="url(#dimensionCap)" marker-end="url(#dimensionCap)"></line>
                <text x="${y-70}" y="${l+44}" class="dimension-label">Specimen length L = ${o.toFixed(1)} m</text>
            </g>

            <g class="caption-layer">
                <text x="88" y="48" class="caption-label">Upstream standpipe</text>
                <text x="${s-46}" y="86" class="caption-label">Downstream standpipe</text>
                <text x="${y-88}" y="394" class="caption-label">Soil specimen area A = ${d.toFixed(2)} m²</text>
                <text x="${y-58}" y="288" class="caption-strong">Soil-filled pipe</text>
            </g>
        </svg>
    `}L();
