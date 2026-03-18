import"./main-CHv88UQI.js";const h={conductivityExponent:-4,headLoss:2,length:4,area:.2},T=document.getElementById("headProfile"),Y=["conductivity","headLoss","length","area"];Y.forEach(n=>{document.getElementById(n).addEventListener("input",$)});document.getElementById("reset-button").addEventListener("click",()=>{document.getElementById("conductivity").value=h.conductivityExponent,document.getElementById("headLoss").value=h.headLoss,document.getElementById("length").value=h.length,document.getElementById("area").value=h.area,$()});function g(n){const t=Math.floor(Math.log10(n));return`${(n/10**t).toFixed(1)} × 10<sup>${t}</sup>`}function F(n,t,o){return(n-t)/(o-t)}function $(){const n=parseFloat(document.getElementById("conductivity").value),t=parseFloat(document.getElementById("headLoss").value),o=parseFloat(document.getElementById("length").value),d=parseFloat(document.getElementById("area").value),k=10**n,m=t/o,w=k*m,I=w*d;document.getElementById("conductivityValue").innerHTML=g(k),document.getElementById("headLossValue").textContent=t.toFixed(1),document.getElementById("lengthValue").textContent=o.toFixed(1),document.getElementById("areaValue").textContent=d.toFixed(2),document.getElementById("gradientValue").textContent=m.toFixed(3),document.getElementById("fluxValue").innerHTML=`${g(w)} m/s`,document.getElementById("dischargeValue").innerHTML=`${g(I)} m³/s`;const L=F(o,.1,10),C=F(d,.01,1),s=250+L*150,c=42+C*34,E=c+20,a=132,r=a+s,H=284-E/2,M=284-c/2,l=284+c/2,b=32,p=a-b/2,x=r-b/2,y=Math.max(.8,Math.min(2.2,t*.45+.6)),u=y+t,B=170/Math.max(u,1),v=245,e=v-u*B,i=v-y*B,S=(e+i)/2,f=(a+r)/2,W=[`${a},${e}`,`${a+s*.32},${e+(i-e)*.3}`,`${a+s*.68},${e+(i-e)*.68}`,`${r},${i}`].join(" ");document.getElementById("gradientEquationText").textContent=`i = ${t.toFixed(1)} / ${o.toFixed(1)} = ${m.toFixed(3)}`,T.innerHTML=`
        <svg viewBox="0 0 680 420" role="img" aria-labelledby="darcySchematicTitle darcySchematicDesc">
            <title id="darcySchematicTitle">Darcy flow through a soil-filled horizontal specimen</title>
            <desc id="darcySchematicDesc">A horizontal soil specimen connects two standpipes. The water surface stands higher on the left than on the right, showing head loss and driving seepage through the soil.</desc>

            <defs>
                <pattern id="soilPattern" width="18" height="18" patternUnits="userSpaceOnUse">
                    <rect width="18" height="18" fill="#c89f6a"></rect>
                    <circle cx="4" cy="5" r="1.6" fill="#8b5f36"></circle>
                    <circle cx="13" cy="9" r="1.3" fill="#9a6a3c"></circle>
                    <circle cx="8" cy="14" r="1.5" fill="#7b522f"></circle>
                </pattern>
                <linearGradient id="pipeWall" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#cfd5dd"></stop>
                    <stop offset="100%" stop-color="#aab2bf"></stop>
                </linearGradient>
                <linearGradient id="waterFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#9be7ff"></stop>
                    <stop offset="100%" stop-color="#2a7fff"></stop>
                </linearGradient>
                <marker id="dimensionCap" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <path d="M 9 0 L 9 10" stroke="#1f2937" stroke-width="2.4" fill="none"></path>
                </marker>
                <marker id="deltaCap" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <path d="M 9 0 L 9 10" stroke="#dc2626" stroke-width="2.4" fill="none"></path>
                </marker>
                <marker id="flowCap" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <path d="M 9 0 L 9 10" stroke="#0f766e" stroke-width="2.4" fill="none"></path>
                </marker>
            </defs>

            <rect x="24" y="18" width="632" height="384" rx="24" fill="#f7f8fb"></rect>

            <g class="datum-layer">
                <line x1="50" y1="360" x2="630" y2="360" stroke="#94a3b8" stroke-width="2" stroke-dasharray="7 7"></line>
                <text x="40" y="352" class="datum-label">Datum</text>
            </g>

            <g class="standpipe-layer">
                <rect x="${p}" y="64" width="32" height="${l-64}" rx="12" fill="url(#pipeWall)" opacity="0.95"></rect>
                <rect x="${x}" y="102" width="32" height="${l-102}" rx="12" fill="url(#pipeWall)" opacity="0.95"></rect>

                <rect x="${p+6}" y="${e}" width="20" height="${l-e}" rx="8" fill="url(#waterFill)" opacity="0.82"></rect>
                <rect x="${x+6}" y="${i}" width="20" height="${l-i}" rx="8" fill="url(#waterFill)" opacity="0.82"></rect>

                <line x1="${p+2}" y1="${e}" x2="${a+14}" y2="${e}" stroke="#0f5bd8" stroke-width="4"></line>
                <line x1="${r-14}" y1="${i}" x2="${x+30}" y2="${i}" stroke="#0f5bd8" stroke-width="4"></line>
            </g>

            <g class="specimen-layer">
                <rect x="${a}" y="${H}" width="${s}" height="${E}" rx="28" fill="url(#pipeWall)"></rect>
                <rect x="${a+14}" y="${M}" width="${s-28}" height="${c}" rx="20" fill="url(#soilPattern)" stroke="#8b5f36" stroke-width="2"></rect>
            </g>

            <g class="head-layer">
                <polyline points="${W}" fill="none" stroke="#2563eb" stroke-width="4" stroke-dasharray="10 8"></polyline>
                <text x="254" y="${S-16}" class="head-line-label">Hydraulic head line</text>

                <line x1="88" y1="360" x2="88" y2="${e}" stroke="#1f2937" stroke-width="2.5" marker-start="url(#dimensionCap)" marker-end="url(#dimensionCap)"></line>
                <text x="10" y="${(360+e)/2}" class="dimension-label">h₁ = ${u.toFixed(1)} m</text>

                <line x1="552" y1="360" x2="552" y2="${i}" stroke="#1f2937" stroke-width="2.5" marker-start="url(#dimensionCap)" marker-end="url(#dimensionCap)"></line>
                <text x="560" y="${(360+i)/2}" class="dimension-label">h₂ = ${y.toFixed(1)} m</text>

                <line x1="590" y1="${e}" x2="590" y2="${i}" stroke="#dc2626" stroke-width="2.5" marker-start="url(#deltaCap)" marker-end="url(#deltaCap)"></line>
                <text x="600" y="${(e+i)/2}" class="delta-label">Δh = ${t.toFixed(1)} m</text>
            </g>

            <g class="length-layer">
                <line x1="${a+14}" y1="${l+26}" x2="${r-14}" y2="${l+26}" stroke="#1f2937" stroke-width="2" marker-start="url(#dimensionCap)" marker-end="url(#dimensionCap)"></line>
                <text x="${f-70}" y="${l+44}" class="dimension-label">Specimen length L = ${o.toFixed(1)} m</text>
            </g>

            <g class="caption-layer">
                <text x="88" y="48" class="caption-label">Upstream standpipe</text>
                <text x="${r-46}" y="86" class="caption-label">Downstream standpipe</text>
                <text x="${f-88}" y="394" class="caption-label">Soil specimen area A = ${d.toFixed(2)} m²</text>
                <text x="${f-58}" y="288" class="caption-strong">Soil-filled pipe</text>
            </g>
        </svg>
    `}$();
