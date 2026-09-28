import"./main-Xfqt2xr9.js";const o=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1D Compression</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>1D Compression</h1>
        </header>

        <section id="about">
            <p>Loaded in one dimension, as in an oedometer, a soil's void ratio falls with the logarithm of the
                vertical effective stress. Below its preconsolidation stress σ′<sub>pc</sub>, the largest stress it
                has carried, it follows a stiff recompression line of slope κ. Loaded past σ′<sub>pc</sub>, it yields
                onto the virgin compression line of slope λ, and σ′<sub>pc</sub> moves up to the new past maximum.
                Unloading from the peak follows a swelling line of slope κ, so the soil keeps most of the compression
                and is left overconsolidated.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>The chart.</strong> Void ratio against vertical effective stress, on a logarithmic
                    axis, so every line is straight. The dashed black line is the virgin compression line; the
                    dotted grey line is the initial recompression line, up to the initial σ′<sub>pc</sub> (dotted
                    grey vertical line).</li>
                <li><strong>The path.</strong> Loading (solid blue) runs from the initial stress to the peak, along
                    the recompression line and then, if the peak passes σ′<sub>pc</sub>, along the virgin line.
                    Unloading (solid orange) runs back from the peak to the final stress, on the current
                    unload–reload line (dash-dot orange). If the soil yielded, the dashed orange vertical line marks
                    the new σ′<sub>pc</sub>. The black points are the initial, peak and final states.</li>
                <li><strong>The outputs.</strong> The overconsolidation ratios and void ratios of those states, and a
                    note on whether the soil yielded.</li>
            </ul>
        </section>

        <div class="main-layout">
            <div class="column">
                <section id="input-section">
                    <h2>Stress History</h2>

                    <div class="input-group">
                        <label for="initial-stress" data-tip="The vertical effective stress the soil starts at, before this loading.">Initial stress σ′<sub>0</sub></label>
                        <div class="slider-container">
                            <input type="range" id="initial-stress" min="20" max="250" value="50" step="5">
                            <span class="slider-value" id="initialStressValue">50</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="precon-stress" data-tip="The largest vertical effective stress the soil has carried in the past. Below it the soil is stiff; beyond it, it yields. It cannot be less than σ′0.">Preconsolidation stress σ′<sub>pc</sub></label>
                        <div class="slider-container">
                            <input type="range" id="precon-stress" min="30" max="400" value="150" step="5">
                            <span class="slider-value" id="preconStressValue">150</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="peak-stress" data-tip="The largest vertical effective stress applied in this loading, before unloading.">Peak stress σ′<sub>max</sub></label>
                        <div class="slider-container">
                            <input type="range" id="peak-stress" min="30" max="600" value="300" step="5">
                            <span class="slider-value" id="peakStressValue">300</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="final-stress" data-tip="The vertical effective stress after unloading from the peak. It cannot exceed the peak.">Final stress σ′<sub>f</sub></label>
                        <div class="slider-container">
                            <input type="range" id="final-stress" min="20" max="500" value="100" step="5">
                            <span class="slider-value" id="finalStressValue">100</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <h2>Compressibility</h2>

                    <div class="input-group">
                        <label for="lambda" data-tip="Slope of the virgin compression line: the fall in void ratio per unit increase in ln σ′.">Compression slope λ</label>
                        <div class="slider-container">
                            <input type="range" id="lambda" min="0.08" max="0.35" value="0.18" step="0.01">
                            <span class="slider-value" id="lambdaValue">0.18</span>
                            <span class="unit">-</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="kappa" data-tip="Slope of the swelling and recompression lines, per unit ln σ′. Much smaller than λ: unloading and reloading are stiff.">Swelling slope κ</label>
                        <div class="slider-container">
                            <input type="range" id="kappa" min="0.01" max="0.10" value="0.04" step="0.005">
                            <span class="slider-value" id="kappaValue">0.040</span>
                            <span class="unit">-</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="precon-void-ratio" data-tip="The void ratio on the virgin compression line at the initial preconsolidation stress. It fixes where the lines sit.">Void ratio at σ′<sub>pc</sub></label>
                        <div class="slider-container">
                            <input type="range" id="precon-void-ratio" min="0.60" max="1.40" value="1.00" step="0.02">
                            <span class="slider-value" id="preconVoidRatioValue">1.00</span>
                            <span class="unit">e</span>
                        </div>
                    </div>

                </section>


            </div>

            <div class="column">
                <section id="visualization-section">
                    <div id="compressionPlot" class="graph"></div>
                </section>
                <section id="results-section">
                    <h2>Important Outputs</h2>
                    <div class="results-grid">
                        <div class="result-item">
                            <span class="label" data-tip="Overconsolidation ratio before loading: σ′pc/σ′0.">Initial OCR</span>
                            <span id="initialOCR">3.00</span>
                        </div>
                        <div class="result-item emphasis">
                            <span class="label" data-tip="Overconsolidation ratio after unloading: the current σ′pc over σ′f. The current σ′pc is the larger of the initial σ′pc and the peak stress.">Current OCR</span>
                            <span id="currentOCR">3.00</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="Void ratio at σ′0, on the initial recompression line.">Initial void ratio</span>
                            <span id="initialVoidRatio">1.04</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="Void ratio at the peak stress: on the virgin line if the peak passes σ′pc, otherwise on the recompression line.">Peak void ratio</span>
                            <span id="peakVoidRatio">0.88</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="Void ratio after unloading to σ′f, on the swelling line from the current σ′pc.">Final void ratio</span>
                            <span id="finalVoidRatio">0.92</span>
                        </div>
                    </div>
                    <p class="result-note" id="pathSummary">Peak stress exceeds the initial σ′pc, so the soil yields and the new σ′pc becomes the past maximum stress.</p>
                </section>
            </div>
        </div>
    </div>

    <script type="module" src="./js/1d-compression.js"><\/script>
</body>

</html>`,r=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bearing Capacity</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>Bearing Capacity</h1>
        </header>

        <section id="about">
            <p>Under a strip footing the tilt of the stress points down; beside it, under the surcharge, it lies
                flat. Between them it turns through a right angle, a quarter turn, and turning a tilt that is at the
                cap multiplies the squeeze by e<sup>2 tan φ′ Δβ</sup>. Slide the turn along the fan to follow
                it.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>The mechanism.</strong> Prandtl's mechanism, to scale: the active wedge under the
                    footing (orange), the fan (blue) and the passive wedge under the surcharge (purple). Ticks show
                    the direction of the tilt in each zone. The thick blue ray is the point you have reached round
                    the fan, and the black tick on it is the tilt there.</li>
                <li><strong>The squeeze along the way.</strong> The squeeze <em>p</em>′ on a log scale, read from
                    the footing out to the surcharge, through the active zone, the fan and the passive zone. The
                    ratio across each zone is written along its bottom. The black dot and dashed line mark where
                    the slider is.</li>
            </ul>
            <h3>Assumptions</h3>
            <p>The soil's own weight is left out, as in Prandtl's solution: it adds the
                ½γB<em>N</em><sub>γ</sub> term, which has no closed form.</p>
        </section>

        <div class="main-layout">
            <section id="input-section">
                <h2>Soil</h2>
                <div class="input-group">
                    <label for="phi" data-tip="The effective friction angle of the soil. At φ′ = 0 the soil is undrained clay with strength s_u.">Friction angle φ′</label>
                    <div class="slider-container">
                        <input type="range" id="phi" min="0" max="45" step="0.5" value="30">
                        <span class="slider-value" id="phi-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="c" data-tip="The effective cohesion c′, or the undrained shear strength s_u when φ′ = 0, in kPa.">Cohesion <em>c′</em></label>
                    <div class="slider-container">
                        <input type="range" id="c" min="0" max="80" step="1" value="0">
                        <span class="slider-value" id="c-value"></span>
                    </div>
                </div>

                <h2>Footing</h2>
                <div class="input-group">
                    <label for="sv0" data-tip="The vertical effective stress at footing level beside the footing, from the soil above it or a load on the ground.">Surcharge σ<sub>v0</sub>′</label>
                    <div class="slider-container">
                        <input type="range" id="sv0" min="0" max="100" step="1" value="18">
                        <span class="slider-value" id="sv0-value"></span>
                    </div>
                </div>

                <h2>Follow the turn</h2>
                <div class="input-group">
                    <label for="psi" data-tip="How far round the fan, out from under the footing: 0° is the edge of the active wedge, 90° the edge of the passive wedge.">Angle round the fan</label>
                    <div class="slider-container">
                        <input type="range" id="psi" min="0" max="90" step="1" value="45">
                        <span class="slider-value" id="psi-value"></span>
                    </div>
                </div>
                <button id="play">Play the turn</button>
            </section>

            <section id="visualization-section">
                <div class="panels">
                    <figure class="wide">
                        <canvas id="mech-canvas"></canvas>
                        <figcaption>The mechanism</figcaption>
                    </figure>
                    <figure class="wide">
                        <canvas id="ladder-canvas"></canvas>
                        <figcaption>The squeeze along the way</figcaption>
                    </figure>
                </div>
                <div id="readout"></div>
            </section>
        </div>
    </div>

    <script type="module" src="./js/bearing-capacity.js"><\/script>
</body>

</html>
`,d=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phase Relations</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>Phase Relations</h1>
        </header>

        <section id="about">
            <p>A soil is a skeleton of solid grains with water and air in the voids between them. Set the volume of
                each and the page works out the phase relations: the masses, the moisture content, the void ratio,
                porosity and saturation, and the densities and unit weights, taking ρ<sub>w</sub> = 1 g/cm³ and
                G<sub>s</sub> = 2.7. The dry unit weight and moisture content then place the soil on a compaction
                chart, where no soil can lie above the zero air voids line.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>The volume column.</strong> The volumes of solid (brown), water (blue) and air (white),
                    stacked to scale; its height is the total volume <em>V</em>.</li>
                <li><strong>The compaction chart.</strong> Dry unit weight against moisture content. The dashed blue
                    line is the zero air voids line, γ<sub>dry</sub> = <em>g</em>ρ<sub>w</sub><em>G</em><sub>s</sub>/(1 +
                    <em>m</em><sub>c</sub><em>G</em><sub>s</sub>): the voids are full of water, <em>S</em> = 1. The
                    black dot is the current soil; remove the air and it moves onto the line.</li>
                <li><strong>Derived quantities.</strong> Every phase relation for the current volumes; the ? by each
                    gives its definition.</li>
            </ul>
        </section>

        <div class="main-layout">
            <!-- Parameters Column -->
            <div class="column">
                <section id="input-section">
                    <h2>Parameters</h2>

                    <div class="input-group">
                        <label for="Vs" data-tip="Volume of the solid grains. Their mass is Gs ρw Vs.">Solids V<sub>s</sub></label>
                        <div class="slider-container">
                            <input type="range" id="Vs" name="Vs" min="0" max="100" value="50">
                            <span class="slider-value" id="VsValue">50</span>
                            <span class="unit">cm³</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="Vw" data-tip="Volume of water in the voids. Its mass is ρw Vw.">Water V<sub>w</sub></label>
                        <div class="slider-container">
                            <input type="range" id="Vw" name="Vw" min="0" max="100" value="50">
                            <span class="slider-value" id="VwValue">50</span>
                            <span class="unit">cm³</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="Va" data-tip="Volume of air in the voids. Air has no mass, so it adds volume but no weight.">Air V<sub>a</sub></label>
                        <div class="slider-container">
                            <input type="range" id="Va" name="Va" min="0" max="100" value="50">
                            <span class="slider-value" id="VaValue">50</span>
                            <span class="unit">cm³</span>
                        </div>
                    </div>

                    <h3>Material Properties</h3>
                    <p><span data-tip="Density of water, taken as 1 g/cm³.">ρ<sub>w</sub> = 1 g/cm³</span>,
                        <span data-tip="Specific gravity of the solids: the density of the grains over that of water. 2.7 is typical of many soils.">G<sub>s</sub> = 2.7</span></p>
                </section>

                <section id="results-section">
                    <div id="results-overlay">
                        <h3>Derived Quantities</h3>
                        <div class="results-grid" id="valuesContainer">
                            <div class="result-item">
                                <span class="label" data-tip="Total volume, V = Vs + Vw + Va.">V</span>
                                <span id="VValue"></span> cm³
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Volume of voids, Vv = Vw + Va.">V<sub>v</sub></span>
                                <span id="VvValue"></span> cm³
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Mass of water, mw = ρw Vw.">m<sub>w</sub></span>
                                <span id="mwValue"></span> g
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Mass of solids, ms = Gs ρw Vs.">m<sub>s</sub></span>
                                <span id="msValue"></span> g
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Total mass, m = ms + mw. The air has no mass.">m</span>
                                <span id="mValue"></span> g
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Moisture content, mc = mw/ms, as a decimal.">mc</span>
                                <span id="mcValue"></span>
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Void ratio, e = Vv/Vs.">e</span>
                                <span id="eValue"></span>
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Volume fraction of solids, ν = Vs/V = 1 − n.">ν</span>
                                <span id="nuValue"></span>
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Porosity, n = Vv/V.">n</span>
                                <span id="nValue"></span>
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Degree of saturation, S = Vw/Vv: the fraction of the voids filled with water.">S</span>
                                <span id="SValue"></span>
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Air content: the volume of air as a fraction of the whole volume, A = Va/V. It sets the air-voids lines on the compaction chart.">A</span>
                                <span id="AValue"></span>
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Dry density, ρdry = ms/V.">ρ<sub>dry</sub></span>
                                <span id="rhodValue"></span> g/cm³
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Bulk density, ρbulk = (ms + mw)/V.">ρ<sub>bulk</sub></span>
                                <span id="rhobValue"></span> g/cm³
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Saturated density: the density if the voids were full of water, ρsat = (Gs + e)ρw/(1 + e).">ρ<sub>sat</sub></span>
                                <span id="rhosatValue"></span> g/cm³
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Dry unit weight, γdry = ρdry g, with g = 9.81 m/s².">γ<sub>dry</sub></span>
                                <span id="gammadValue"></span> kN/m³
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Bulk unit weight, γbulk = ρbulk g.">γ<sub>bulk</sub></span>
                                <span id="gammabValue"></span> kN/m³
                            </div>
                            <div class="result-item">
                                <span class="label" data-tip="Saturated unit weight, γsat = ρsat g.">γ<sub>sat</sub></span>
                                <span id="gammasatValue"></span> kN/m³
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Visualization Column -->
            <div class="column">
                <section id="visualization-section">
                    <div class="graphs-container">
                        <div id="ternaryGraph" class="graph"></div>
                        <div id="dryWeightGraph" class="graph"></div>
                    </div>
                </section>
            </div>
        </div>
    </div>
    <script type="module" src="./js/compaction.js"><\/script>
</body>

</html>`,c=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1D Consolidation</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>1D Consolidation</h1>
        </header>

        <section id="about">
            <p>When a wide load goes on a saturated clay, the water takes it all. As the water drains away it hands
                the load over to the grains, and the ground settles as it does. See how fast that handover happens,
                and what drainage, drains and overconsolidation do to it.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>Settlement with time.</strong> The settlement curve shows the handover in time (solid
                    blue). The dashed grey line is the final settlement; the black dot and dotted line mark the
                    profile time. With drains on, the dotted grey curve is the same layer without them.</li>
                <li><strong>Load share.</strong> The handover through the layer at the profile time: at each depth
                    the brown width is the grains' share of the added load, Δσ′, and the blue width is the water's,
                    the excess pore pressure <em>u</em>. The grains take over first next to the drains.</li>
            </ul>
            <h3>The model</h3>
            <p><strong>Drainage:</strong> Drained boundaries force <em>u</em> = 0. Undrained boundaries trap water
                and slow dissipation.</p>
            <p><strong>Drains</strong> shorten the drainage path to about half their spacing, so the time falls with
                its square. The radial flow to a drain is approximated here by one-dimensional flow over that
                distance, combined with vertical drainage by Carrillo's rule, 1 − <em>U</em> = (1 −
                <em>U</em><sub>v</sub>)(1 − <em>U</em><sub>r</sub>): a scaling estimate, not a design
                calculation.</p>
            <p><strong>Reloading</strong> below the preconsolidation stress uses C<sub>r</sub> instead of
                C<sub>c</sub>: m<sub>v</sub> is six times smaller and, with the same permeability, c<sub>v</sub> is
                six times larger. The settlement is smaller and faster.</p>
        </section>

        <div class="main-layout">
            <div class="column">
                <section id="input-section">
                    <h2>Soil and Loading</h2>

                    <div class="input-group">
                        <label for="stress-increment" data-tip="The added vertical stress from a wide load, applied at once. At first the pore water carries all of it.">Stress increase Δσ</label>
                        <div class="slider-container">
                            <input type="range" id="stress-increment" min="25" max="250" value="100" step="5">
                            <span class="slider-value" id="stressIncrementValue">100</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="layer-thickness" data-tip="Thickness of the clay layer.">Layer thickness <em>H</em></label>
                        <div class="slider-container">
                            <input type="range" id="layer-thickness" min="2" max="12" value="6" step="0.5">
                            <span class="slider-value" id="layerThicknessValue">6.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="cv" data-tip="Coefficient of consolidation: how fast the excess pore pressure dissipates. The time to reach a given degree of consolidation scales with Hdr²/cv.">Consolidation coefficient c<sub>v</sub></label>
                        <div class="slider-container">
                            <input type="range" id="cv" min="0.05" max="2" value="0.1" step="0.05">
                            <span class="slider-value" id="cvValue">0.10</span>
                            <span class="unit">m²/day</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="mv" data-tip="Coefficient of volume compressibility: vertical strain per unit increase in effective stress. The final settlement is mv Δσ H.">Compressibility m<sub>v</sub></label>
                        <div class="slider-container">
                            <input type="range" id="mv" min="0.0002" max="0.002" value="0.0004" step="0.0001">
                            <span class="slider-value" id="mvValue">0.0004</span>
                            <span class="unit">m²/kN</span>
                        </div>
                    </div>

                    <h2>Drainage</h2>

                    <div class="checkbox-grid">
                        <label class="checkbox-item" for="drainage-top" data-tip="A drained top boundary, such as a sand layer, holds u = 0. Untick it for an impermeable boundary.">
                            <input type="checkbox" id="drainage-top" checked>
                            <span>Top drained</span>
                        </label>
                        <label class="checkbox-item" for="drainage-bottom" data-tip="A drained bottom boundary holds u = 0. Untick it for an impermeable base.">
                            <input type="checkbox" id="drainage-bottom" checked>
                            <span>Bottom drained</span>
                        </label>
                    </div>

                    <div class="input-group">
                        <label for="loading" data-tip="Past the preconsolidation stress the clay is normally consolidated and uses Cc. Below it, it is reloading on Cr = Cc/6: mv is six times smaller and cv six times larger.">Loading</label>
                        <select id="loading">
                            <option value="nc">Past σ′<sub>pc</sub>: normally consolidated</option>
                            <option value="oc">Below σ′<sub>pc</sub>: reloading, C<sub>c</sub>/C<sub>r</sub> = 6</option>
                        </select>
                    </div>
                    <label class="checkbox-item" for="drains" data-tip="Vertical drains through the layer add sideways drainage over about half their spacing.">
                        <input type="checkbox" id="drains">
                        <span>Vertical drains</span>
                    </label>
                    <div class="input-group">
                        <label for="drain-spacing" data-tip="Distance between the vertical drains. Used only when the drains are on.">Drain spacing</label>
                        <div class="slider-container">
                            <input type="range" id="drain-spacing" min="0.5" max="5" value="2" step="0.1">
                            <span class="slider-value" id="drainSpacingValue">2.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>
                    <h2>Time View</h2>

                    <div class="input-group">
                        <label for="t-max" data-tip="The length of the time axis on the settlement plot.">Time shown</label>
                        <div class="slider-container">
                            <input type="range" id="t-max" min="30" max="365" value="365" step="5">
                            <span class="slider-value" id="tMaxValue">365</span>
                            <span class="unit">days</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="profile-time" data-tip="The time at which the load-share profile and the outputs are worked out, marked on the settlement plot.">Profile time</label>
                        <div class="slider-container">
                            <input type="range" id="profile-time" min="0" max="365" value="30" step="1">
                            <span class="slider-value" id="profileTimeValue">30</span>
                            <span class="unit">days</span>
                        </div>
                    </div>

                </section>

                <section id="results-section">
                    <h2>Important Outputs</h2>
                    <div class="results-grid">
                        <div class="result-item">
                            <span class="label" data-tip="Which boundaries drain, set by the two checkboxes.">Drainage condition</span>
                            <span id="drainageCondition">Double drainage</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="The longest distance the water travels to a drained boundary: H/2 with double drainage, H with single. The drains are not included.">Drainage path H<sub>dr</sub></span>
                            <span id="drainagePath">3.00 m</span>
                        </div>
                        <div class="result-item emphasis">
                            <span class="label" data-tip="The settlement reached at the profile time: the final settlement times the degree of consolidation.">Settlement at profile time</span>
                            <span id="currentSettlement">0.00 mm</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="Average degree of consolidation U at the profile time: the fraction of the final settlement reached. With drains it combines vertical and sideways drainage.">Degree of consolidation</span>
                            <span id="currentDegree">0.0%</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="mv Δσ H: the settlement once all the excess pore pressure has gone. Shown as zero when nothing drains.">Final settlement</span>
                            <span id="finalSettlement">0.00 mm</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="The water's share u of the added load at mid-depth, at the profile time.">Mid-depth excess pore pressure</span>
                            <span id="midDepthPressure">0.0 kPa</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="The time for the average degree of consolidation to reach 90%.">Time to 90%</span>
                            <span id="t90">—</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="The values used in the calculation: when reloading, cv is six times larger and mv six times smaller than the sliders.">c<sub>v</sub> and m<sub>v</sub> in use</span>
                            <span id="inUse">—</span>
                        </div>
                    </div>
                </section>
            </div>

            <div class="column">
                <section id="visualization-section">
                    <div class="graphs-container">
                        <div id="settlementPlot" class="graph"></div>
                        <div id="profilePlot" class="graph"></div>
                    </div>
                </section>
            </div>
        </div>
    </div>

    <script type="module" src="./js/consolidation.js"><\/script>
</body>

</html>`,h=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Critical State Line</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>Critical State Line</h1>
        </header>

        <section id="about">
            <p>The critical state line represents the ultimate shear strength of soil in both stress space (τ vs σ)
                and void ratio space (e vs ln σ). On it, τ = <em>M</em>σ and <em>e</em> = Γ − λ ln σ. The normal
                compression line, <em>e</em> = <em>N</em> − λ ln σ, has the same slope λ and is drawn at τ = 0.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>3D view.</strong> The critical state line (solid blue) in σ–τ–<em>e</em> space, and the
                    normal compression line (dashed black) in the τ = 0 plane. The translucent surface joins the
                    critical state line to the τ = 0 plane at the same void ratio. Drag to rotate.</li>
                <li><strong>τ–σ view.</strong> The critical state line in stress space: a straight line through the
                    origin of slope <em>M</em>.</li>
                <li><strong>e–σ view.</strong> The critical state line (solid blue) and the normal compression line
                    (dashed black) in void ratio space. On a logarithmic σ axis both are straight and parallel.</li>
            </ul>
        </section>

        <div class="main-layout">
            <section id="input-section">
                <div class="column">
                    <h2>Critical State Parameters</h2>
                    <div class="input-group">
                        <label for="M" data-tip="Slope of the critical state line in stress space: τ = Mσ at critical state.">Slope <em>M</em></label>
                        <input type="number" id="M" value="1.2" step="0.1" min="0.1" max="3.0">
                    </div>
                    <div class="input-group">
                        <label for="Gamma" data-tip="Void ratio on the critical state line at σ = 1 kPa, where ln σ = 0.">Intercept Γ</label>
                        <input type="number" id="Gamma" value="2.0" step="0.1" min="1.0" max="5.0">
                    </div>
                    <div class="input-group">
                        <label for="lambda" data-tip="Slope of the critical state and normal compression lines in void ratio space: the fall in e per unit increase in ln σ.">Compression index λ</label>
                        <input type="number" id="lambda" value="0.15" step="0.01" min="0.01" max="0.5">
                    </div>
                    <div class="input-group">
                        <label for="N" data-tip="Void ratio on the normal compression line at σ = 1 kPa. Normally larger than Γ, so the normal compression line lies above the critical state line.">NCL intercept <em>N</em></label>
                        <input type="number" id="N" value="2.5" step="0.1" min="1.0" max="5.0">
                    </div>

                    <h3>View Controls</h3>
                    <div class="input-group">
                        <label for="sigma-scale" data-tip="Linear shows σ from 0 to 500 kPa; logarithmic from 1 to 1000 kPa, where the lines in void ratio space are straight.">σ axis scale</label>
                        <select id="sigma-scale">
                            <option value="linear">Linear</option>
                            <option value="log">Logarithmic</option>
                        </select>
                    </div>
                    <div class="button-group">
                        <button id="view-tau-sigma">τ-σ View</button>
                        <button id="view-e-sigma">e-σ View</button>
                        <button id="view-3d">3D View</button>
                    </div>
                </div>
            </section>

            <section id="visualization-section">
                <div id="plot-container"></div>
            </section>
        </div>
    </div>

    <script type="module" src="./js/critical-state.js"><\/script>
</body>

</html>`,p=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Darcy Flow</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>Darcy Flow</h1>
        </header>

        <section id="about">
            <p>Water flows through a saturated soil from high total head to low. The head at a point is the height
                water rises to in a standpipe there, measured above a common datum. Darcy's law says the flow is
                proportional to the hydraulic gradient <em>i</em> = &Delta;<em>h</em>/<em>L</em>, the head lost per
                length of flow path: the Darcy flux is <em>q</em> = <em>k i</em>, and the discharge through the
                area <em>A</em> is <em>Q</em> = <em>qA</em> = <em>kA</em>&Delta;<em>h</em>/<em>L</em>.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>The schematic.</strong> A horizontal soil-filled pipe between two standpipes. The water
                    level in each standpipe is the head, <em>h</em><sub>1</sub> upstream and <em>h</em><sub>2</sub>
                    downstream, measured from the dashed datum. The dashed blue line is the hydraulic head line,
                    falling from <em>h</em><sub>1</sub> to <em>h</em><sub>2</sub> through the soil. The drawing is
                    not to scale: the pipe gets longer and thicker as <em>L</em> and <em>A</em> grow, and
                    <em>h</em><sub>2</sub> is chosen only to draw the picture, since only &Delta;<em>h</em>
                    matters.</li>
                <li><strong>Key results.</strong> The gradient, flux and discharge from Darcy's law for the values
                    you set.</li>
            </ul>
        </section>

        <div class="main-layout">
            <div class="column">
                <section id="input-section">
                    <h2>Parameters</h2>

                    <div class="input-group">
                        <label for="conductivity" data-tip="A measure of how easily water flows through the soil, in m/s. Roughly 10⁻² m/s for a clean gravel-sand down to 10⁻⁶ m/s and below for silts and clays.">Conductivity <em>k</em></label>
                        <div class="slider-container">
                            <input type="range" id="conductivity" name="conductivity" min="-6" max="-2" value="-4" step="0.1">
                            <span class="slider-value" id="conductivityValue">1.0 × 10<sup>-4</sup></span>
                            <span class="unit">m/s</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="headLoss" data-tip="The drop in total head from the upstream standpipe to the downstream one, in metres. It drives the flow.">Head loss Δ<em>h</em></label>
                        <div class="slider-container">
                            <input type="range" id="headLoss" name="headLoss" min="0.1" max="10" value="2" step="0.1">
                            <span class="slider-value" id="headLossValue">2.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="length" data-tip="The length of soil the water flows through, in metres.">Length <em>L</em></label>
                        <div class="slider-container">
                            <input type="range" id="length" name="length" min="0.1" max="10" value="4" step="0.1">
                            <span class="slider-value" id="lengthValue">4.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="area" data-tip="The area of the soil specimen normal to the flow, in m².">Area <em>A</em></label>
                        <div class="slider-container">
                            <input type="range" id="area" name="area" min="0.01" max="1" value="0.2" step="0.01">
                            <span class="slider-value" id="areaValue">0.20</span>
                            <span class="unit">m²</span>
                        </div>
                    </div>
                </section>

                <section id="results-section">
                    <h2>Key Results</h2>
                    <div class="results-grid">
                        <div class="result-item">
                            <span class="label" data-tip="i = Δh / L: the head lost per metre of flow path. Dimensionless.">Gradient <em>i</em></span>
                            <span id="gradientValue"></span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="q = k i: the discharge per unit of total area, in m/s. It is not the speed of the water in the pores, which is faster.">Flux <em>q</em></span>
                            <span id="fluxValue"></span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="Q = qA: the volume of water flowing through the specimen per second, in m³/s.">Discharge <em>Q</em></span>
                            <span id="dischargeValue"></span>
                        </div>
                    </div>
                    <p class="equation">Q = k A Δh / L</p>
                </section>
            </div>

            <div class="column">
                <section id="visualization-section">
                    <div id="headProfile" class="schematic" aria-label="Darcy flow schematic"></div>
                </section>
            </div>
        </div>
    </div>

    <script type="module" src="./js/darcy-flow.js"><\/script>
</body>

</html>`,u=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Earth Pressures</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>Earth Pressures</h1>
        </header>

        <section id="about">
            <p>Behind a smooth wall with level ground, the tilt of the stress can only point up or down, so it is
                one number, <em>C</em>, and <em>K</em> = σ<sub>h</sub>′/σ<sub>v</sub>′ = (1 − <em>C</em>)/(1 +
                <em>C</em>). Friction stops <em>C</em> at ± sin φ′: the active and passive states. Drag along the
                dial, or move the wall.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>The dial.</strong> <em>K</em> = (1 − <em>C</em>)/(1 + <em>C</em>) against the tilt
                    <em>C</em>, on a log scale. The curve is solid blue between friction's two stops and dotted
                    beyond them, where the shaded regions are out of reach. The dots mark passive (purple), water,
                    <em>K</em> = 1 (blue), at rest (green) and active (orange); the large dot is the dial now, and
                    the arrow is the trip from rest to here. Drag along it to move <em>C</em>.</li>
                <li><strong>The wall.</strong> The grains push on the wall with <em>K</em>γ<em>z</em>: the
                    pressure diagram grows with depth, with the at-rest diagram dashed in green for comparison. At
                    a stop, the sliding wedge and its slip plane are drawn, at 45° + φ′/2 (active) or 45° − φ′/2
                    (passive). The arrow at the top shows which way the wall has moved from rest.</li>
                <li><strong>The Mohr circle.</strong> The stress at the base of the wall, between σ<sub>v</sub>′
                    and σ<sub>h</sub>′, with the friction lines in blue. At a stop the circle touches them.</li>
                <li><strong>The status bar.</strong> Whether the soil is between the stops or at one.</li>
            </ul>
            <h3>The model</h3>
            <p>The two stops are Rankine's active and passive states. At rest the soil sits wherever deposition
                left it, <em>C</em><sub>0</sub> = (1 − <em>K</em><sub>0</sub>)/(1 + <em>K</em><sub>0</sub>). Water
                has no tilt, and sits at <em>C</em> = 0, <em>K</em> = 1. The soil is dry.</p>
        </section>

        <div class="main-layout">
            <section id="input-section">
                <h2>The wall</h2>
                <div class="input-group">
                    <label for="C" data-tip="The vertical tilt of the stress. Move the wall away and C rises towards the active stop, +sin φ′; push it in and C falls towards the passive stop, −sin φ′.">Vertical tilt <em>C</em></label>
                    <div class="slider-container">
                        <input type="range" id="C" min="-1" max="1" step="0.001" value="0.333">
                        <span class="slider-value" id="C-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="H" data-tip="The height of the retained soil behind the wall, in m.">Wall height <em>H</em></label>
                    <div class="slider-container">
                        <input type="range" id="H" min="1" max="12" step="0.5" value="6">
                        <span class="slider-value" id="H-value"></span>
                    </div>
                </div>

                <h2>Soil</h2>
                <div class="input-group">
                    <label for="phi" data-tip="The effective friction angle of the soil. It sets friction's stops at C = ± sin φ′.">Friction angle φ′</label>
                    <div class="slider-container">
                        <input type="range" id="phi" min="15" max="45" step="0.5" value="30">
                        <span class="slider-value" id="phi-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="K0" data-tip="The at-rest coefficient, σh′/σv′ before the wall moves. It is set by how the soil was deposited, and must lie between K_a and K_p.">At-rest <em>K</em><sub>0</sub></label>
                    <div class="slider-container">
                        <input type="range" id="K0" min="0.2" max="2" step="0.01" value="0.5">
                        <span class="slider-value" id="K0-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="gamma" data-tip="The dry unit weight of the soil, in kN/m³.">Unit weight γ</label>
                    <div class="slider-container">
                        <input type="range" id="gamma" min="14" max="22" step="0.5" value="18">
                        <span class="slider-value" id="gamma-value"></span>
                    </div>
                </div>

                <h2>Go to</h2>
                <div class="presets">
                    <button data-preset="active">Active</button>
                    <button data-preset="rest">At rest</button>
                    <button data-preset="passive">Passive</button>
                    <button data-preset="jaky">K₀ from Jaky</button>
                </div>
            </section>

            <section id="visualization-section">
                <div class="panels">
                    <figure class="wide">
                        <canvas id="dial-canvas"></canvas>
                        <figcaption>The dial</figcaption>
                    </figure>
                    <figure>
                        <canvas id="wall-canvas"></canvas>
                        <figcaption>The wall</figcaption>
                    </figure>
                    <figure>
                        <canvas id="mohr-canvas"></canvas>
                        <figcaption>The Mohr circle</figcaption>
                    </figure>
                </div>
                <div id="readout"></div>
            </section>
        </div>
    </div>

    <script type="module" src="./js/earth-pressures.js"><\/script>
</body>

</html>
`,m=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elastic Strip Footing</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- <script src="https://cdn.plot.ly/plotly-latest.min.js"><\/script> -->
</head>

<body>
    <div class="container">
        <header>
            <h1>Elastic Strip Footing</h1>
        </header>

        <section id="about">
            <p>The displacement field in an elastic half-space under a uniformly loaded strip footing, from
                Boussinesq-type solutions: the Flamant line-load solution integrated across the strip, from
                &minus;<i>B</i> to +<i>B</i>. The field assumes plane strain and linear elastic behaviour, so every
                displacement scales with <i>q</i>/<i>E</i>, and the Poisson ratio changes its shape.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>The contour plot.</strong> The chosen displacement component, in mm, over a section
                    from &minus;3<i>B</i> to 3<i>B</i> across the footing and down to the domain depth, drawn to
                    equal scales. The vertical component uses a red&ndash;blue scale, the horizontal a
                    red&ndash;yellow&ndash;blue scale, and the magnitude Viridis; the colour bar gives the values
                    and the contours are labelled.</li>
                <li><strong>The footing.</strong> The black bar at the surface is the strip, and the red arrows are
                    the uniform load on it.</li>
            </ul>
        </section>

        <div class="main-layout">
            <!-- Parameters Column -->
            <div class="column">
                <section id="input-section">
                    <h2>Loading</h2>
                    
                    <div class="input-group">
                        <label for="load" data-tip="The uniform pressure applied over the width of the strip.">Load <i>q</i></label>
                        <div class="slider-container">
                            <input type="range" id="load" name="load" min="10" max="500" value="100" step="10">
                            <span class="slider-value" id="loadValue">100</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="width" data-tip="Half the width of the strip: it spans from −B to +B, so it is 2B wide. The plot spans 3B either side of the centre.">Half-width <i>B</i></label>
                        <div class="slider-container">
                            <input type="range" id="width" name="width" min="0.5" max="5" value="2" step="0.1">
                            <span class="slider-value" id="widthValue">2</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="depth" data-tip="How deep below the surface the displacement field is plotted.">Domain depth</label>
                        <div class="slider-container">
                            <input type="range" id="depth" name="depth" min="5" max="20" value="10" step="1">
                            <span class="slider-value" id="depthValue">10</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <h2>Elastic properties</h2>
                    
                    <div class="input-group">
                        <label for="youngs" data-tip="Stiffness of the elastic soil. Every displacement is inversely proportional to E. Soft clay a few MPa, dense sand tens of MPa.">Young’s modulus <i>E</i></label>
                        <div class="slider-container">
                            <input type="range" id="youngs" name="youngs" min="1" max="100" value="20" step="1">
                            <span class="slider-value" id="youngsValue">20</span>
                            <span class="unit">MPa</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="poisson" data-tip="Lateral strain over axial strain under uniaxial load. It changes the shape of the field; 0.5 would be incompressible.">Poisson’s ratio <i>&nu;</i></label>
                        <div class="slider-container">
                            <input type="range" id="poisson" name="poisson" min="0.1" max="0.49" value="0.3" step="0.01">
                            <span class="slider-value" id="poissonValue">0.3</span>
                            <span class="unit">-</span>
                        </div>
                    </div>

                    <h2>Display</h2>
                    
                    <div class="input-group">
                        <label for="component" data-tip="Which displacement to plot: vertical uy (negative downwards), horizontal ux, or the magnitude |u|.">Component</label>
                        <select id="component" name="component">
                            <option value="vertical">Vertical (uy)</option>
                            <option value="horizontal">Horizontal (ux)</option>
                            <option value="magnitude">Magnitude |u|</option>
                        </select>
                    </div>

                </section>

                <!-- <section id="results-section">
                    <h3>Key Results</h3>
                    <div class="results-grid" id="valuesContainer">
                        <div class="result-item">
                            <span class="label">Max Vertical Displacement:</span>
                            <span id="maxVertical"></span> mm
                        </div>
                        <div class="result-item">
                            <span class="label">Max Horizontal Displacement:</span>
                            <span id="maxHorizontal"></span> mm
                        </div>
                        <div class="result-item">
                            <span class="label">Settlement at Center:</span>
                            <span id="centerSettlement"></span> mm
                        </div>
                        <div class="result-item">
                            <span class="label">Settlement at Edge:</span>
                            <span id="edgeSettlement"></span> mm
                        </div>
                    </div>
                </section> -->
            </div>

            <!-- Visualization Column -->
            <div class="column">
                <section id="visualization-section">
                    <div class="graph-container">
                        <div id="displacementField" class="graph"></div>
                    </div>
                </section>
            </div>
        </div>
    </div>
    <script type="module" src="./js/elastic-footing.js"><\/script>
</body>

</html>`,v=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Footing Settlement</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>Footing Settlement</h1>
        </header>

        <section id="about">
            <p>How far a footing load spreads is set by the friction angle, not by an elastic modulus. The page
                computes the vertical stress increment under a flexible rectangular footing with Fröhlich's
                concentration factor <i>n</i>, found from &phi; alone, and compares it with Boussinesq
                (<i>n</i> = 3). The settlement is the sum of one-dimensional compression of thin sublayers down each
                vertical, from founding level to the base of the layer.</p>
            <p><strong>Why no <i>E</i> and no <i>&nu;</i>?</strong> Boussinesq's vertical stress
                contains no elastic constant, and that is not a coincidence: &sigma;<sub><i>z</i></sub>
                under a surface load is fixed by statics and by the geometry of load spreading. Reading the
                classical radial solution as a fan of force chains carrying
                cos&thinsp;&theta; reproduces &sigma;<sub><i>zz</i></sub> and
                &sigma;<sub><i>rz</i></sub> exactly for <em>every</em> Poisson ratio. The only components
                that need elasticity are the ones a settlement calculation never uses.</p>
            <p><strong>Where &phi; comes in.</strong> That ray fan has <i>q</i>/<i>p</i> = 1/3, so it is
                admissible whenever sin&thinsp;&phi; &ge; 1/3, i.e. &phi; &ge; 19.5&deg;. Boussinesq is the
                unaligned-fabric limit. Align the force chains with the load and the friction cone binds:
                the fan narrows, and fitting Fröhlich's
                &sigma;<sub><i>z</i></sub> = (<i>nP</i>/2&pi;<i>R</i>²)cos<sup><i>n</i></sup>&theta;
                returns a concentration factor that depends on &phi; alone. <i>n</i> = 3 at the
                crossover, rising to about 7 at &phi; = 40&deg;. The <i>n</i> = 4&ndash;6 that practice
                recommends corresponds to &phi; = 25.7&deg; to 35.4&deg;.</p>
            <p><strong>What this means for the answer.</strong> Focusing the load does not change the
                total force on any horizontal plane &mdash; it moves it inward. So the centre settles
                <em>more</em> than Boussinesq predicts, the neighbour settles <em>less</em>, and the bowl
                dishes harder. Boussinesq is not the conservative choice in either direction.</p>
            <p><strong>What is approximated.</strong> Each vertical is compressed one-dimensionally with
                no shear coupling to its neighbours, which is the standard sublayer summation. This is a
                perfectly flexible footing; a rigid one settles uniformly and redistributes its contact
                pressure instead. The two bracket the real case.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>The pressure bulbs</strong> (top). Contours of &Delta;&sigma;<sub><i>z</i></sub>/<i>q</i>
                    at tenths of the applied pressure, on the vertical section through the centre of the footing (black
                    bar) across its width: Boussinesq on the left, the fan on the right. Depth is measured below the footing.</li>
                <li><strong>Stress on the centre line</strong> (bottom left). &Delta;&sigma;<sub><i>z</i></sub>
                    against depth below ground: Boussinesq in blue, the fan in orange, and the 2:1 load-spreading
                    rule as a grey dotted line for comparison.</li>
                <li><strong>Settlement bowl</strong> (bottom right). The settlement of the ground surface at each
                    offset from the centre of the flexible footing, in the same colours. The black bar is the
                    footing.</li>
                <li><strong>The results.</strong> Centre settlements by the two methods, their ratio, and the
                    differential between the centre and the edge for the fan. The note below reads the numbers.</li>
            </ul>
            <h3>The compression laws</h3>
            <p>A constant <i>m</i><sub>v</sub> gives strain proportional to the stress increment. The Janbu law
                makes the oedometer modulus grow with stress,
                <i>E</i><sub>oed</sub> = <i>m p</i><sub>a</sub>(&sigma;&prime;/<i>p</i><sub>a</sub>)<sup><i>a</i></sup>
                with <i>p</i><sub>a</sub> = 100 kPa: <i>a</i> = 1/3 is Hertzian contact, <i>a</i> &asymp; 0.5 is
                what sands measure, <i>a</i> = 1 is the C<sub>c</sub> log law. The initial effective stress is
                <i>&gamma;</i><sub>bulk</sub><i>z</i>, less <i>&gamma;</i><sub>w</sub> times the depth below the
                water table.</p>
        </section>

        <div class="main-layout">
            <div class="column">
                <section id="input-section">
                    <h2>Footing</h2>

                    <div class="input-group compact">
                        <label for="width" data-tip="Width of the rectangular footing in plan, across the section drawn in the plots.">Width <i>B</i></label>
                        <div class="slider-container">
                            <input type="range" id="width" min="0.5" max="8" value="2" step="0.1">
                            <span class="slider-value" id="widthValue">2.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group compact">
                        <label for="length" data-tip="Length of the footing. L = B is a square; a long footing tends to a strip.">Length <i>L</i></label>
                        <div class="slider-container">
                            <input type="range" id="length" min="0.5" max="20" value="2" step="0.1">
                            <span class="slider-value" id="lengthValue">2.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group compact">
                        <label for="pressure" data-tip="The uniform pressure the footing applies at founding level.">Pressure <i>q</i></label>
                        <div class="slider-container">
                            <input type="range" id="pressure" min="25" max="400" value="100" step="5">
                            <span class="slider-value" id="pressureValue">100</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <div class="input-group compact">
                        <label for="founding" data-tip="Depth of the base of the footing below the ground surface. The loaded layer starts here, where the soil already carries γbulk·Df.">Depth <i>D</i><sub>f</sub></label>
                        <div class="slider-container">
                            <input type="range" id="founding" min="0" max="4" value="1" step="0.1">
                            <span class="slider-value" id="foundingValue">1.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <h2>Soil</h2>

                    <div class="input-group">
                        <label for="friction" data-tip="Sets the concentration factor n, and nothing else. Above arcsin(1/3) = 19.47° the load is focused (n > 3); below it the response is broader than Boussinesq.">Friction angle &phi;</label>
                        <div class="slider-container">
                            <input type="range" id="friction" min="15" max="45" value="32" step="0.5">
                            <span class="slider-value" id="frictionValue">32.0</span>
                            <span class="unit">&deg;</span>
                        </div>
                    </div>

                    <div class="input-group compact">
                        <label for="unitWeight" data-tip="Bulk unit weight of the soil, used for the initial vertical effective stress. Typically 16 to 21 kN/m³.">&gamma;<sub>bulk</sub></label>
                        <div class="slider-container">
                            <input type="range" id="unitWeight" min="14" max="22" value="18" step="0.5">
                            <span class="slider-value" id="unitWeightValue">18.0</span>
                            <span class="unit">kN/m³</span>
                        </div>
                    </div>

                    <div class="input-group compact">
                        <label for="waterTable" data-tip="Depth of the water table below the ground surface. Below it the initial effective stress is reduced by γw per metre. At the top of the slider there is no water table.">Water table</label>
                        <div class="slider-container">
                            <input type="range" id="waterTable" min="0" max="30" value="30" step="0.5">
                            <span class="slider-value" id="waterTableValue">none</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group compact">
                        <label for="thickness" data-tip="Thickness of the compressible layer below founding level, summed in thin sublayers.">Layer <i>H</i></label>
                        <div class="slider-container">
                            <input type="range" id="thickness" min="2" max="40" value="16" step="0.5">
                            <span class="slider-value" id="thicknessValue">16.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <h2>Compression law</h2>

                    <div class="input-group">
                        <label for="law" data-tip="How the stress increment becomes strain: the Janbu power law, whose stiffness grows with stress, or a constant coefficient of volume compressibility.">How stress becomes strain</label>
                        <select id="law">
                            <option value="janbu" selected>Janbu power law (stress dependent)</option>
                            <option value="constant">Constant m&#8340; (linear)</option>
                        </select>
                    </div>

                    <div class="input-group compact" id="mv-group" hidden>
                        <label for="mv" data-tip="Coefficient of volume compressibility: vertical strain per unit increase in effective stress, in m²/MN. Larger is softer.">m&#8340;</label>
                        <div class="slider-container">
                            <input type="range" id="mv" min="0.02" max="0.5" value="0.1" step="0.005">
                            <span class="slider-value" id="mvValue">0.100</span>
                            <span class="unit">m²/MN</span>
                        </div>
                    </div>

                    <div id="janbu-group">
                        <div class="input-group compact">
                            <label for="modulus" data-tip="Janbu modulus number m: the oedometer modulus at σ′ = pa = 100 kPa, divided by pa. Larger is stiffer.">m</label>
                            <div class="slider-container">
                                <input type="range" id="modulus" min="20" max="1200" value="300" step="10">
                                <span class="slider-value" id="modulusValue">300</span>
                                <span class="unit">&ndash;</span>
                            </div>
                        </div>
                        <div class="input-group compact">
                            <label for="stressExponent" data-tip="Janbu stress exponent a: how fast the stiffness grows with stress. 0 is a constant modulus, 1/3 Hertzian contact, about 0.5 a sand, 1 the Cc log law of a clay.">a</label>
                            <div class="slider-container">
                                <input type="range" id="stressExponent" min="0" max="1" value="0.5" step="0.01">
                                <span class="slider-value" id="stressExponentValue">0.50</span>
                                <span class="unit">&ndash;</span>
                            </div>
                        </div>
                    </div>

                    <div class="preset-row">
                        <button id="hertz-button" type="button" class="secondary">Hertz <i>a</i>=1/3</button>
                        <button id="clay-button" type="button" class="secondary">Clay <i>a</i>=1</button>
                    </div>
                </section>
            </div>

            <div class="column">
                <section id="results-section">
                    <div class="results-grid">
                        <div class="result-item">
                            <span class="label" data-tip="Fröhlich’s exponent in σz = (nP/2πR²)cosⁿθ, found from φ alone. n = 3 is Boussinesq; larger n focuses the load under the footing.">Concentration factor <i>n</i></span>
                            <span id="exponentOut">5.2</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="Settlement at the centre of the footing with the Boussinesq stress increment (n = 3).">Settlement, Boussinesq</span>
                            <span id="elasticOut">0.0 mm</span>
                        </div>
                        <div class="result-item emphasis">
                            <span class="label" data-tip="Settlement at the centre of the footing with the stress increment of the fan, using n from φ.">Settlement, fan</span>
                            <span id="fanOut">0.0 mm</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="Centre settlement from the fan divided by that from Boussinesq.">Ratio</span>
                            <span id="ratioOut">1.00</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="Fan settlement at the centre, less that at the middle of the edge, B/2 from the centre.">Differential, centre to edge</span>
                            <span id="differentialOut">0.0 mm</span>
                        </div>
                    </div>
                    <p class="result-note" id="summaryNote"></p>
                </section>

                <section id="visualization-section">
                    <div id="bulbPlot" class="graph"></div>
                    <div id="profilePlot" class="graph"></div>
                </section>
            </div>
        </div>
    </div>

    <script type="module" src="./js/footing-settlement.js"><\/script>
</body>

</html>
`,g=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Soil Mechanics Visualisation Tools</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>

<body>
    <main class="home-shell">
        <section class="hero">
            <p class="eyebrow">Soil mechanics</p>
            <h1>Interactive teaching tools</h1>
            <p class="hero-copy">Browse every visualisation in this project from one generated homepage. New HTML tools are picked up automatically.</p>
        </section>

        <section aria-labelledby="tool-list-heading" class="tool-library">
            <div class="section-heading">
                <h2 id="tool-list-heading">Available pages</h2>
                <p>Built from discovered HTML entries and page titles.</p>
            </div>
            <div class="tool-grid" id="tool-grid"></div>
        </section>
    </main>

    <script type="module" src="./js/index.js"><\/script>
</body>

</html>`,f=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Infinite Slope</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>The Infinite Slope</h1>
        </header>

        <section id="about">
            <p>On a plane parallel to a long slope the shear is fixed by the weight, τ = γ<em>z</em> sin α cos α.
                Friction can resist tan φ′ times the effective normal stress. Raise the water table and the water
                takes part of the squeeze: the grains are pressed together less, and friction resists less.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>A slice of the slope.</strong> The soil down to the slip plane (dashed brown), with a
                    slice and its weight <em>W</em>. The water below the water table is shaded blue, with arrows
                    showing the flow. Water flows parallel to the surface, so the equipotentials (dotted) are
                    perpendicular to it. The standpipe at the slip plane shows the pore pressure there as a head,
                    <em>u</em>/γ<sub>w</sub>.</li>
                <li><strong>Factor of safety.</strong> FS against slope angle: dry (blue), with the water table at
                    the surface (dark blue), and at the current water table (thick orange). The dot is the slope
                    now, red if it fails. The dashed line marks the steepest slope that stands.</li>
            </ul>
            <h3>Assumptions</h3>
            <p>The slope is infinitely long, with seepage parallel to its surface. The unit weight is taken the same
                above and below the water table.</p>
        </section>

        <div class="main-layout">
            <section id="input-section">
                <h2>Slope</h2>
                <div class="input-group">
                    <label for="alpha" data-tip="The angle of the ground surface, and of the slip plane parallel to it, from the horizontal.">Slope angle α</label>
                    <div class="slider-container">
                        <input type="range" id="alpha" min="5" max="45" step="0.5" value="25">
                        <span class="slider-value" id="alpha-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="z" data-tip="The vertical depth of the slip plane below the surface, in m.">Slip plane depth <em>z</em></label>
                    <div class="slider-container">
                        <input type="range" id="z" min="0.5" max="8" step="0.1" value="3">
                        <span class="slider-value" id="z-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="m" data-tip="The height of the water table above the slip plane, as a fraction of z: 0 is dry, 1 is the water table at the surface.">Water table height <em>m</em></label>
                    <div class="slider-container">
                        <input type="range" id="m" min="0" max="1" step="0.01" value="0">
                        <span class="slider-value" id="m-value"></span>
                    </div>
                </div>

                <h2>Soil</h2>
                <div class="input-group">
                    <label for="phi" data-tip="The effective friction angle of the soil: friction resists tan φ′ times the effective normal stress.">Friction angle φ′</label>
                    <div class="slider-container">
                        <input type="range" id="phi" min="20" max="45" step="0.5" value="33">
                        <span class="slider-value" id="phi-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="c" data-tip="The effective cohesion: shear strength the soil has even with no effective normal stress, in kPa.">Cohesion <em>c′</em></label>
                    <div class="slider-container">
                        <input type="range" id="c" min="0" max="20" step="0.5" value="0">
                        <span class="slider-value" id="c-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="gamma" data-tip="The unit weight of the soil in kN/m³, taken the same above and below the water table.">Unit weight γ</label>
                    <div class="slider-container">
                        <input type="range" id="gamma" min="16" max="22" step="0.5" value="20">
                        <span class="slider-value" id="gamma-value"></span>
                    </div>
                </div>

                <h2>Rain</h2>
                <button id="rain">Let it rain</button>
            </section>

            <section id="visualization-section">
                <div class="panels">
                    <figure class="wide">
                        <canvas id="slope-canvas"></canvas>
                        <figcaption>A slice of the slope</figcaption>
                    </figure>
                    <figure class="wide">
                        <canvas id="fs-canvas"></canvas>
                        <figcaption>Factor of safety against slope angle</figcaption>
                    </figure>
                </div>
                <div id="readout"></div>
            </section>
        </div>
    </div>

    <script type="module" src="./js/infinite-slope.js"><\/script>
</body>

</html>
`,b=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mohr's Circle</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>Mohr's Circle</h1>
        </header>

        <section id="about">
            <p>A stress has a size <em>p′</em> and a tilt: an arrow whose length is <em>q/p′</em> and whose
                direction is that of σ<sub>1</sub>′. Friction caps the length at sin φ′. Drag in the right-hand
                panel to set the tilt.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>The Mohr circle.</strong> Centre <em>p′</em>, radius <em>q</em>, drawn blue inside
                    the cap, orange at it and red beyond it. The blue lines are the Mohr–Coulomb envelope, with the
                    allowed wedge between them shaded. H and V are the stresses on horizontal and vertical planes,
                    the ends of one diameter. The green dot is the chosen θ plane. At the cap, dashed radii go to
                    the points where the circle touches the lines.</li>
                <li><strong>The tilt.</strong> The tilt as a point (<em>C</em>, <em>S</em>) =
                    (<em>q/p′</em>)(cos 2β, sin 2β). The shaded disc is the cap; the dotted circle is
                    <em>q/p′</em> = 1. The active, passive and at-rest (K₀) states are marked on the <em>C</em>
                    axis. Drag anywhere to set the tilt. The small element in the corner shows which way
                    σ<sub>1</sub>′ pushes, and the chosen plane in green.</li>
                <li><strong>The status bar.</strong> Whether the stress is inside the cap, at it, or beyond
                    it.</li>
            </ul>
            <h3>Conventions</h3>
            <p>Compression is positive throughout.</p>
        </section>

        <div class="main-layout">
            <section id="input-section">
                <h2>Stress</h2>
                <div class="input-group">
                    <label for="p" data-tip="The mean effective stress, (σ₁′ + σ₃′)/2: the centre of the Mohr circle, in kPa.">Mean stress <em>p′</em></label>
                    <div class="slider-container">
                        <input type="range" id="p" min="10" max="300" step="1" value="100">
                        <span class="slider-value" id="p-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="tilt" data-tip="The length of the tilt: q/p′, where q = (σ₁′ − σ₃′)/2 is the radius of the circle. 0 is isotropic; friction caps it at sin φ′.">Size of the tilt <em>q/p′</em></label>
                    <div class="slider-container">
                        <input type="range" id="tilt" min="0" max="1" step="0.001" value="0.3">
                        <span class="slider-value" id="tilt-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="beta" data-tip="The direction of the major principal stress σ₁′, measured from the vertical. 0° is vertical, ±90° horizontal.">Direction of σ<sub>1</sub>′, β</label>
                    <div class="slider-container">
                        <input type="range" id="beta" min="-90" max="90" step="1" value="0">
                        <span class="slider-value" id="beta-value"></span>
                    </div>
                </div>

                <h2>Soil</h2>
                <div class="input-group">
                    <label for="phi" data-tip="The effective friction angle of the soil. It sets the slope of the Mohr–Coulomb lines and the cap, sin φ′.">Friction angle φ′</label>
                    <div class="slider-container">
                        <input type="range" id="phi" min="10" max="45" step="0.5" value="30">
                        <span class="slider-value" id="phi-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="cohesion" data-tip="The effective cohesion, in kPa. It acts as a built-in pressure c′ cot φ′, moving the apex of the lines to the left.">Cohesion <em>c′</em></label>
                    <div class="slider-container">
                        <input type="range" id="cohesion" min="0" max="50" step="1" value="0">
                        <span class="slider-value" id="cohesion-value"></span>
                    </div>
                </div>

                <h2>A plane</h2>
                <div class="input-group">
                    <label for="theta" data-tip="A plane through the element, inclined at θ to the horizontal. The readout gives the stresses on it.">Plane angle θ</label>
                    <div class="slider-container">
                        <input type="range" id="theta" min="-90" max="90" step="1" value="0">
                        <span class="slider-value" id="theta-value"></span>
                    </div>
                </div>

                <h2>Try</h2>
                <div class="presets">
                    <button data-preset="isotropic">Isotropic</button>
                    <button data-preset="rest">At rest (Jaky)</button>
                    <button data-preset="active">Active</button>
                    <button data-preset="passive">Passive</button>
                </div>
            </section>

            <section id="visualization-section">
                <div class="panels">
                    <figure>
                        <canvas id="mohr-canvas"></canvas>
                        <figcaption>The Mohr circle</figcaption>
                    </figure>
                    <figure>
                        <canvas id="disc-canvas"></canvas>
                        <figcaption>The tilt</figcaption>
                    </figure>
                </div>
                <div id="readout"></div>
            </section>
        </div>
    </div>

    <script type="module" src="./js/mohrs-circle.js"><\/script>
</body>

</html>
`,w=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Newmark's Chart</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>Newmark's Chart</h1>
        </header>

        <section id="about">
            <p>Draw your foundation to scale on the chart, and the chart gives the vertical stress increase beneath
                its centre, at depth <i>z</i>. Ring <i>i</i> is drawn at the radius <i>a</i> of a uniformly loaded disc
                that gives &sigma;<sub><i>z</i></sub>/<i>q</i> = <i>i</i>/rings at depth <i>z</i>, from Fröhlich's
                &sigma;<sub><i>z</i></sub>/<i>q</i> = 1 &minus; [1 + (<i>a</i>/<i>z</i>)&sup2;]<sup>&minus;<i>n</i>/2</sup>,
                and the rings are cut into equal sectors. Every cell then carries the same unit influence,
                1/(rings &times; sectors), so Δσ<sub><i>z</i></sub> = <i>q</i> &times; (cells covered) &times;
                (unit influence). With &phi; = 0 the concentration factor is <i>n</i> = 3 and this is Newmark's
                Boussinesq chart; a friction angle sets <i>n</i> from &phi;, which moves the rings.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>The chart.</strong> The rings and sectors, with the <i>r</i>/<i>z</i> of each ring
                    labelled along the diagonal. The last ring, out to infinity, is not drawn. The black bar at the
                    bottom left is the scale: its length on the chart is the depth <i>z</i>.</li>
                <li><strong>Your sketch.</strong> Drag on the chart to draw the loaded area, in orange. Cells whose
                    centre lies inside it are shaded orange and counted.</li>
                <li><strong>The results.</strong> The concentration factor, the unit influence of one cell, the
                    cells covered, the influence value <i>I</i>, and the stress increase, with the calculation
                    written out.</li>
            </ul>
            <p>The sketch is held in <i>r</i>/<i>z</i>. Changing the rings, sectors or &phi; redraws it at the new
                scale of the chart, so it stays the same footing; changing <i>z</i> leaves it where it is on the
                chart, so it then stands for a footing scaled with <i>z</i>.</p>
        </section>

        <div class="main-layout">
            <div class="column">
                <section id="input-section">
                    <h2>Chart</h2>

                    <div class="input-group">
                        <label for="pressure" data-tip="The uniform pressure on the loaded area you draw, in kPa.">Applied pressure <i>q</i></label>
                        <input type="number" id="pressure" value="150" min="0" step="5">
                    </div>

                    <div class="input-group">
                        <div class="input-group">
                            <label for="rings" data-tip="How many rings the influence is split into; each carries 1/rings of it. More rings give a finer chart.">Rings</label>
                            <input type="number" id="rings" value="20" min="4" max="50" step="1">
                        </div>

                        <div class="input-group">
                            <label for="sectors" data-tip="How many equal angular sectors each ring is cut into. More sectors give smaller cells.">Sectors</label>
                            <input type="number" id="sectors" value="50" min="8" max="100" step="2">
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="friction" data-tip="Sets the concentration factor n, in degrees. 0 gives Boussinesq (n = 3), the classical chart.">Friction angle &phi;</label>
                        <input type="number" id="friction" value="0" min="0" max="45" step="0.5">
                    </div>

                    <div class="button-row">
                        <button id="clear-drawing" type="button">Clear drawing</button>
                    </div>
                </section>

                <section id="scale-section">
                    <h2>Depth</h2>

                    <div class="input-group">
                        <label for="depth" data-tip="Depth below the chart centre at which the stress is found, in metres. The scale bar on the chart is this long.">Depth <i>z</i></label>
                        <input type="number" id="depth" value="5" min="0.1" step="0.1">
                    </div>
                </section>

                <section id="results-section">
                    <h2>Results</h2>

                    <div class="results-grid">
                        <div class="result-item">
                            <span class="label" data-tip="Fröhlich’s exponent: 3 for Boussinesq, larger when a friction angle focuses the load.">Concentration factor <i>n</i></span>
                            <span id="exponent">3.00</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="The share of q that one cell contributes: 1/(rings × sectors).">Unit influence per cell</span>
                            <span id="unit-influence">0.0000</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="The number of cells whose centre lies inside the area you drew.">Covered cells</span>
                            <span id="covered-cells">0</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="Covered cells times the unit influence: Δσz/q at depth z under the chart centre.">Influence value I</span>
                            <span id="influence-value">0.0000</span>
                        </div>
                        <div class="result-item emphasis">
                            <span class="label" data-tip="The vertical stress increase at depth z beneath the chart centre, q × I.">Stress increase Δσ<sub>z</sub></span>
                            <span id="stress-result">0.00 kPa</span>
                        </div>
                    </div>

                    <div class="formula-card">
                        <h3 data-tip="The stress increase worked out from the applied pressure and the influence value.">Calculation</h3>
                        <p id="formula-text">Δσ<sub>z</sub> = q × I</p>
                        <!-- <p id="assumption-text">The chart is truncated at the selected r/z cutoff, so the total captured influence is less than 1.0.</p> -->
                    </div>
                </section>
            </div>

            <div class="column chart-column">
                <section id="visualization-section">
                    <div class="chart-frame">
                        <svg id="newmark-chart" viewBox="0 0 800 800" aria-label="Newmark influence chart"></svg>
                        <!-- <div id="chart-scale-readout">z = 5.00 m, chart radius = 30.00 m</div> -->
                        <div id="chart-hint">Drag on the chart to sketch a loaded area.</div>
                    </div>
                </section>
            </div>
        </div>
    </div>

    <script type="module" src="./js/newmarks-chart.js"><\/script>
</body>

</html>`,y=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Proctor Test</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>The Proctor Test</h1>
        </header>

        <section id="about">
            <p>Compact a soil at a range of moisture contents and plot its dry unit weight: the curve rises to a
                peak, the optimum, and falls again. Dry of the optimum, water bridges squeeze the contacts, and the
                blows cannot make them slide. Wet of it, the air is trapped in bubbles, and the water, which cannot
                leave during a blow, takes it. The optimum is where the air stops being able to get out. More energy
                beats more suction, so the optimum moves drier and denser, along a line of constant saturation.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>The chart.</strong> The points you have compacted, coloured from light blue (low energy)
                    to orange (high). The solid blue line is saturation, <em>S</em> = 1: no point can lie above it.
                    The dashed blue lines have 5% and 10% of the volume as air. The orange dashed line is the line
                    of optimums. The dotted circle is where the next sample would land.</li>
                <li><strong>The mould.</strong> A close-up after compaction: water bridges at the contacts on the
                    dry side, water filling the pores with trapped bubbles on the wet side. The column beside it
                    shows the volumes of solid, water and air, to scale, for the same volume of solid.</li>
                <li><strong>The status bar.</strong> Which limit is in charge: the suction, or the trapped air.</li>
            </ul>
            <h3>The model</h3>
            <p>A schematic model, tuned only to land near typical results. The grains' limit follows a log law in
                the energy, resisted by the suction squeeze; the water's limit is the air-voids line of the air that
                cannot get out. A sand drains during the blows, so only the saturation line limits it. The same
                model draws the figures in the course notes.</p>
        </section>

        <div class="main-layout">
            <section id="input-section">
                <h2>Soil</h2>
                <div class="input-group">
                    <label for="soil" data-tip="A clean sand drains freely and has no true optimum. The clays hold their water and trap their air.">Soil</label>
                    <select id="soil">
                        <option value="clay" selected>Lean clay (CL)</option>
                        <option value="fat">Fat clay (CH)</option>
                        <option value="sand">Clean sand (SP)</option>
                    </select>
                </div>

                <h2>Energy</h2>
                <div class="presets">
                    <button id="standard">Standard</button>
                    <button id="modified">Modified</button>
                </div>
                <div class="input-group" style="margin-top: 0.6rem">
                    <label for="energy" data-tip="E = nNmgh/V: the energy of all the blows per volume of soil. Its units, kJ/m³, are kPa: it is a stress. Standard is 596 kPa, Modified 2704 kPa.">Energy <em>E</em></label>
                    <div class="slider-container">
                        <input type="range" id="energy" min="0" max="1" step="0.001" value="0.5">
                        <span class="slider-value" id="energy-value"></span>
                    </div>
                </div>

                <h2>Sample</h2>
                <div class="input-group">
                    <label for="mc" data-tip="Mass of water over mass of solids, before compaction.">Moisture content <em>m</em><sub>c</sub></label>
                    <div class="slider-container">
                        <input type="range" id="mc" min="0" max="35" step="0.1" value="10">
                        <span class="slider-value" id="mc-value"></span>
                    </div>
                </div>
                <div class="presets">
                    <button id="compact">Compact it</button>
                    <button id="sweep">Run a full test</button>
                </div>
                <div class="presets" style="margin-top: 0.5rem">
                    <button id="clear">Clear points</button>
                    <label class="checkbox-item" for="show-curve">
                        <input type="checkbox" id="show-curve"> Show curve
                    </label>
                </div>

            </section>

            <section id="visualization-section">
                <div class="panels">
                    <figure>
                        <canvas id="chart-canvas"></canvas>
                        <figcaption>The compaction chart</figcaption>
                    </figure>
                    <figure>
                        <canvas id="grain-canvas"></canvas>
                        <figcaption>Inside the mould</figcaption>
                    </figure>
                </div>
                <div id="readout"></div>
            </section>
        </div>
    </div>

    <script type="module" src="./js/proctor.js"><\/script>
</body>

</html>
`,T=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Void Ratio Ruler</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <header>
        <h1>Void Ratio Ruler</h1>
    </header>

    <section id="about">
        <p>Three equivalent ways to say how densely the grains are packed. The solid fraction &nu; is the volume
            of solids over the total volume. The porosity <em>n</em> = 1 &minus; &nu; is the volume of voids over
            the total volume. The void ratio <em>e</em> = <em>n</em>/(1 &minus; <em>n</em>) = 1/&nu; &minus; 1 is
            the volume of voids over the volume of solids. The rulers are lined up so that one vertical line reads
            all three for the same packing.</p>
        <h3>What you are seeing</h3>
        <ul>
            <li><strong>The rulers.</strong> Solid fraction from 0 to 1, left to right; porosity the same scale
                reversed; and the void ratio at the same tick positions, so its spacing is not even and it grows
                without limit towards &nu; = 0.</li>
            <li><strong>The cursor.</strong> Move the mouse, or drag a finger, across the rulers: the vertical line
                and the numbers beside it give &nu;, <em>n</em> and <em>e</em> at that point.</li>
            <li><strong>The arrow.</strong> Loose packings lie to the left, dense ones to the right.</li>
        </ul>
    </section>
    <div class="container">

        <div class="ruler-container">
            <div class="axis-label" data-tip="Volume of solids over total volume, from 0 (no grains) to 1 (no voids).">Solid fraction &nu;</div>
            <div class="ruler" id="solid-fraction"></div>
            <div class="marker" id="marker-solid-fraction"></div>

        </div>

        <div class="ruler-container">
            <div class="axis-label" data-tip="Volume of voids over total volume: n = 1 − ν.">Porosity <em>n</em></div>
            <div class="ruler" id="porosity"></div>
            <div class="marker" id="marker-porosity"></div>
        </div>

        <div class="ruler-container">
            <div class="axis-label" data-tip="Volume of voids over volume of solids: e = n / (1 − n) = 1/ν − 1. Sands typically lie between about 0.4 and 1.">Void ratio <em>e</em></div>
            <div class="ruler" id="void-ratio"></div>
            <div class="marker" id="marker-void-ratio"></div>
        </div>

        <div class="vertical-line" id="vertical-line"></div>
    </div>


    <div class="container">
        <div id="loose-to-dense" class="arrow-container">
            <span class="label left">Loose</span>
            <div class="double-arrow"></div>
            <span class="label right">Dense</span>
        </div>
    </div>

    <script type="module" src="./js/ruler.js"><\/script>
</body>

</html>`,k=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Shear Box</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>The Shear Box</h1>
        </header>

        <section id="about">
            <p>Push the top half of the box sideways under a fixed normal load. The work you do goes into sliding
                against friction and into lifting the load as the sample rises (Taylor's balance):
                τ/σ′ = tan φ′<sub>cs</sub> + d<em>y</em>/d<em>x</em>. A dense sample has to climb; a loose one
                sinks. Both end at the critical state.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>The box.</strong> The bottom half is fixed and the top half is pushed sideways by the
                    force <em>T</em> (blue) under the normal load <em>N</em>. The darker band is the shear zone: it
                    leans as the top half moves, and thickens as the sample dilates (orange) or thins as it
                    contracts (blue). The rise is exaggerated three times.</li>
                <li><strong>Strength and rise.</strong> Top: the stress ratio τ/σ′ (black) against the shear
                    displacement <em>x</em>, and friction alone, tan φ′<sub>cs</sub> (blue dashed). The shaded
                    strip between them is d<em>y</em>/d<em>x</em>: the work of lifting the load. Bottom: the rise
                    <em>y</em> of the top half, orange if the sample ends up higher, blue if lower. The dashed line
                    and dots mark the current displacement.</li>
            </ul>
            <h3>The model</h3>
            <p>Peak dilatancy follows Bolton's (1986) relative dilatancy index,
                <em>I</em><sub>R</sub> = <em>I</em><sub>D</sub>(10 − ln <em>p</em>′) − 1, with
                φ′<sub>peak</sub> − φ′<sub>cs</sub> ≈ 5<em>I</em><sub>R</sub> degrees in plane strain. The
                shape of the curves is schematic.</p>
        </section>

        <div class="main-layout">
            <section id="input-section">
                <h2>Sample</h2>
                <div class="input-group">
                    <label for="ID" data-tip="How dense the sample is between its loosest (0) and densest (1) states. Dense samples dilate; loose ones contract.">Relative density <em>I</em><sub>D</sub></label>
                    <div class="slider-container">
                        <input type="range" id="ID" min="0" max="1" step="0.01" value="0.8">
                        <span class="slider-value" id="ID-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="sigma" data-tip="The effective normal stress applied by the load N on the plane between the halves. Higher stress suppresses dilation.">Normal stress σ′</label>
                    <div class="slider-container">
                        <input type="range" id="sigma" min="10" max="800" step="5" value="100">
                        <span class="slider-value" id="sigma-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="phics" data-tip="The friction angle at the critical state, when the sample shears at constant volume. Typically 30–36° for sands.">Critical-state angle φ′<sub>cs</sub></label>
                    <div class="slider-container">
                        <input type="range" id="phics" min="25" max="40" step="0.5" value="33">
                        <span class="slider-value" id="phics-value"></span>
                    </div>
                </div>

                <h2>Shear it</h2>
                <div class="input-group">
                    <label for="x" data-tip="How far the top half of the box has been pushed sideways, in mm.">Shear displacement <em>x</em></label>
                    <div class="slider-container">
                        <input type="range" id="x" min="0" max="10" step="0.05" value="2">
                        <span class="slider-value" id="x-value"></span>
                    </div>
                </div>
                <button id="play">Play the test</button>
            </section>

            <section id="visualization-section">
                <div class="panels">
                    <figure>
                        <canvas id="box-canvas"></canvas>
                        <figcaption>The box</figcaption>
                    </figure>
                    <figure>
                        <canvas id="curve-canvas"></canvas>
                        <figcaption>Strength and rise</figcaption>
                    </figure>
                </div>
                <div id="readout"></div>
            </section>
        </div>
    </div>

    <script type="module" src="./js/shear-box.js"><\/script>
</body>

</html>
`,x=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sieve Analysis</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>Sieve Analysis</h1>
        </header>

        <section id="about">
            <p>A sieve analysis shakes a dry sample through a stack of sieves, from coarse at the top to fine at
                the bottom, and weighs what each one retains. Adding up the retained masses from the top gives the
                percentage of the sample finer than each sieve, the percent passing. Plotted against the log of the
                aperture, this is the grading curve. From it come the sizes <em>D</em><sub>10</sub>,
                <em>D</em><sub>30</sub> and <em>D</em><sub>60</sub>, which 10%, 30% and 60% of the sample is finer
                than, and from those the coefficients of uniformity and curvature that describe how well graded
                the soil is.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>Mass retained.</strong> The mass, in grams, left on each sieve and in the pan. Change
                    any of them to change the sample.</li>
                <li><strong>The grading curve.</strong> Percent passing each sieve against its aperture, on a log
                    axis. The pan is counted in the total but has no aperture, so it is not plotted.</li>
                <li><strong>Key results.</strong> The total mass, the fines passing 0.075 mm, and the characteristic
                    sizes and coefficients. Each <em>D</em> is interpolated linearly in log size between the two
                    sieves either side of it; a dash means the curve does not reach that percentage.</li>
            </ul>
        </section>

        <div class="main-layout">
            <div class="column">
                <section id="input-section">
                    <h2>Mass retained</h2>
                    <div id="sieveInputs" class="sieve-inputs"></div>
                </section>
            </div>

            <div class="column">
                <section id="visualization-section">
                    <div id="gradingCurveGraph" class="graph"></div>
                </section>

                <section id="results-section">
                    <h2>Key results</h2>
                    <div class="results-grid">
                        <div class="result-item">
                            <span class="label" data-tip="The sum of the masses on every sieve and in the pan, in grams.">Total mass</span>
                            <span><span id="totalMassValue">0</span> g</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="The percentage of the sample finer than the 0.075 mm sieve: the fines, silt and clay.">Passing 0.075 mm</span>
                            <span id="finesValue">0%</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="The size that 10% of the sample, by mass, is finer than. Sometimes called the effective size.">D<sub>10</sub></span>
                            <span id="d10Value">—</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="The size that 30% of the sample, by mass, is finer than.">D<sub>30</sub></span>
                            <span id="d30Value">—</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="The size that 60% of the sample, by mass, is finer than.">D<sub>60</sub></span>
                            <span id="d60Value">—</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="Coefficient of uniformity, D60 / D10. Near 1 for a soil of one size; larger for a wider spread of sizes.">C<sub>u</sub></span>
                            <span id="cuValue">—</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="Coefficient of curvature, D30² / (D10 D60). It describes the shape of the curve between D10 and D60.">C<sub>c</sub></span>
                            <span id="ccValue">—</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
    <script type="module" src="./js/sieve-analysis.js"><\/script>
</body>

</html>`,V=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stress Profile</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>Stress Profile</h1>
        </header>

        <section id="about">
            <p>The vertical stresses in the ground, down through three layers of soil. The total stress
                <em>&sigma;</em> is the weight of everything above a point: any surcharge <em>q</em>, any ponded
                water, and each layer's unit weight times its thickness, with <em>&gamma;</em><sub>bulk</sub> above
                the water table and <em>&gamma;</em><sub>sat</sub> below it. The pore pressure is hydrostatic from
                the water table, <em>u</em> = <em>&gamma;</em><sub>w</sub>(<em>z</em> &minus; <em>z</em><sub>w</sub>),
                and negative (suction) through the capillary fringe above it. The effective stress,
                <em>&sigma;&prime;</em> = <em>&sigma;</em> &minus; <em>u</em>, is what the grains carry: only a
                change in <em>&sigma;&prime;</em> makes the soil settle or swell.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>The soil column</strong> (left). Each layer in its own brown, labelled with its unit
                    weights. Soil below the water table is tinted blue, the capillary fringe a paler blue, and
                    ponded water above the ground is solid blue. The dashed dark blue line (&#9661; WT) is the
                    water table; the grey dotted line is the probe depth.</li>
                <li><strong>The stress plot</strong> (right). Total stress <em>&sigma;</em> in black, pore pressure
                    <em>u</em> in blue, effective stress <em>&sigma;&prime;</em> in thick orange. The grey dashed
                    line is <em>&sigma;&prime;</em> for the frozen reference. The dots mark the three values at the
                    probe depth.</li>
                <li><strong>At the probe depth.</strong> The three stresses at the probe, and how far
                    <em>&sigma;&prime;</em> has moved from the reference: shown orange when it has risen (the soil
                    will settle) and green when it has fallen (the soil will swell). The note below explains what
                    the change means.</li>
            </ul>
            <p>The reference starts as the default scenario. Press <em>Freeze reference</em> to make the current
                scenario the one to compare against.</p>
        </section>

        <div class="main-layout">
            <div class="column">
                <section id="input-section">
                    <h2>Scenario</h2>

                    <div class="input-group">
                        <label for="water-table" data-tip="Depth of the water table below the ground surface. A negative value puts the water table above the ground: ponded water that deep sits on the surface.">Water table depth</label>
                        <div class="slider-container">
                            <input type="range" id="water-table" min="-4" max="12" value="0" step="0.1">
                            <span class="slider-value" id="waterTableValue">0.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="surcharge" data-tip="A uniform load spread over the whole ground surface, such as a wide fill. It adds the same amount to the total stress at every depth.">Surface surcharge <i>q</i></label>
                        <div class="slider-container">
                            <input type="range" id="surcharge" min="0" max="150" value="0" step="5">
                            <span class="slider-value" id="surchargeValue">0</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="capillary" data-tip="Height above the water table to which capillarity draws water up. In this fringe the pore pressure is negative (suction). Near zero for sands, metres for clays.">Capillary rise <i>h</i><sub>c</sub></label>
                        <div class="slider-container">
                            <input type="range" id="capillary" min="0" max="5" value="0" step="0.1">
                            <span class="slider-value" id="capillaryValue">0.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="probe" data-tip="The depth at which the stresses are read out below, and marked by the dotted line.">Probe depth</label>
                        <div class="slider-container">
                            <input type="range" id="probe" min="0" max="12" value="8" step="0.1">
                            <span class="slider-value" id="probeValue">8.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <h2>Layers</h2>

                    <div class="layer-block" id="layer-1-block">
                        <div class="layer-head"><span class="swatch" id="swatch-1"></span>Layer 1</div>
                        <div class="input-group compact">
                            <label for="t1" data-tip="Thickness of layer 1. Set it to zero to remove the layer.">Thickness</label>
                            <div class="slider-container">
                                <input type="range" id="t1" min="0" max="10" value="5" step="0.5">
                                <span class="slider-value" id="t1Value">5.0</span>
                                <span class="unit">m</span>
                            </div>
                        </div>
                        <div class="input-group compact">
                            <label for="g1" data-tip="Bulk unit weight of layer 1: the weight per volume of the soil above the water table. Typically 16 to 20 kN/m³.">&gamma;<sub>bulk</sub></label>
                            <div class="slider-container">
                                <input type="range" id="g1" min="13" max="22" value="18" step="0.5">
                                <span class="slider-value" id="g1Value">18.0</span>
                                <span class="unit">kN/m³</span>
                            </div>
                        </div>
                        <div class="input-group compact">
                            <label for="gs1" data-tip="Saturated unit weight of layer 1: the weight per volume with every void full of water, used below the water table. Never less than γbulk; typically 18 to 22 kN/m³.">&gamma;<sub>sat</sub></label>
                            <div class="slider-container">
                                <input type="range" id="gs1" min="15" max="24" value="20" step="0.5">
                                <span class="slider-value" id="gs1Value">20.0</span>
                                <span class="unit">kN/m³</span>
                            </div>
                        </div>
                    </div>

                    <div class="layer-block" id="layer-2-block">
                        <div class="layer-head"><span class="swatch" id="swatch-2"></span>Layer 2</div>
                        <div class="input-group compact">
                            <label for="t2" data-tip="Thickness of layer 2. Set it to zero to remove the layer.">Thickness</label>
                            <div class="slider-container">
                                <input type="range" id="t2" min="0" max="10" value="3" step="0.5">
                                <span class="slider-value" id="t2Value">3.0</span>
                                <span class="unit">m</span>
                            </div>
                        </div>
                        <div class="input-group compact">
                            <label for="g2" data-tip="Bulk unit weight of layer 2: the weight per volume of the soil above the water table. Typically 16 to 20 kN/m³.">&gamma;<sub>bulk</sub></label>
                            <div class="slider-container">
                                <input type="range" id="g2" min="13" max="22" value="17" step="0.5">
                                <span class="slider-value" id="g2Value">17.0</span>
                                <span class="unit">kN/m³</span>
                            </div>
                        </div>
                        <div class="input-group compact">
                            <label for="gs2" data-tip="Saturated unit weight of layer 2: the weight per volume with every void full of water, used below the water table. Never less than γbulk; typically 18 to 22 kN/m³.">&gamma;<sub>sat</sub></label>
                            <div class="slider-container">
                                <input type="range" id="gs2" min="15" max="24" value="19" step="0.5">
                                <span class="slider-value" id="gs2Value">19.0</span>
                                <span class="unit">kN/m³</span>
                            </div>
                        </div>
                    </div>

                    <div class="layer-block" id="layer-3-block">
                        <div class="layer-head"><span class="swatch" id="swatch-3"></span>Layer 3</div>
                        <div class="input-group compact">
                            <label for="t3" data-tip="Thickness of layer 3. Set it to zero to remove the layer.">Thickness</label>
                            <div class="slider-container">
                                <input type="range" id="t3" min="0" max="10" value="4" step="0.5">
                                <span class="slider-value" id="t3Value">4.0</span>
                                <span class="unit">m</span>
                            </div>
                        </div>
                        <div class="input-group compact">
                            <label for="g3" data-tip="Bulk unit weight of layer 3: the weight per volume of the soil above the water table. Typically 16 to 20 kN/m³.">&gamma;<sub>bulk</sub></label>
                            <div class="slider-container">
                                <input type="range" id="g3" min="13" max="22" value="19" step="0.5">
                                <span class="slider-value" id="g3Value">19.0</span>
                                <span class="unit">kN/m³</span>
                            </div>
                        </div>
                        <div class="input-group compact">
                            <label for="gs3" data-tip="Saturated unit weight of layer 3: the weight per volume with every void full of water, used below the water table. Never less than γbulk; typically 18 to 22 kN/m³.">&gamma;<sub>sat</sub></label>
                            <div class="slider-container">
                                <input type="range" id="gs3" min="15" max="24" value="21" step="0.5">
                                <span class="slider-value" id="gs3Value">21.0</span>
                                <span class="unit">kN/m³</span>
                            </div>
                        </div>
                    </div>

                    <div class="preset-row">
                        <button id="freeze-button" type="button">Freeze reference</button>
                    </div>
                </section>
            </div>

            <div class="column">
                <section id="visualization-section">
                    <div id="profilePlot" class="graph"></div>
                </section>
                <section id="results-section">
                    <h2>At the probe depth</h2>
                    <div class="results-grid">
                        <div class="result-item">
                            <span class="label" data-tip="The weight of everything above this depth per unit area: surcharge, ponded water and soil.">Total stress &sigma;</span>
                            <span id="sigmaOut">157.0</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="The pressure in the water in the pores, γw times the depth below the water table. Negative in the capillary fringe.">Pore pressure <i>u</i></span>
                            <span id="uOut">78.5</span>
                        </div>
                        <div class="result-item emphasis">
                            <span class="label" data-tip="σ′ = σ − u: the part of the stress carried by the grains through their contacts. It sets the stiffness and strength of the soil.">Effective stress &sigma;&prime;</span>
                            <span id="sigmaEffOut">78.5</span>
                        </div>
                        <div class="result-item">
                            <span class="label" data-tip="How far σ′ at this depth has moved from the frozen reference. A rise compresses the soil (settlement); a fall lets it swell.">Change vs reference</span>
                            <span id="deltaOut">0.0</span>
                        </div>
                    </div>
                    <p class="result-note" id="summaryNote"></p>
                </section>
            </div>
        </div>
    </div>

    <script type="module" src="./js/stress-profile.js"><\/script>
</body>

</html>
`,C=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Dynamics</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>System Dynamics</h1>
        </header>

        <section id="about">
            <p>A system dynamics model follows a stock <em>x</em> through time by its rate of change
                d<em>x</em>/d<em>t</em>, the balance of what flows in and out, which depends on <em>x</em> itself.
                This page solves a family of first-order models: exponential growth and decay; a constant input
                <em>u</em> with decay, which settles at <em>u</em>/<em>r</em>; and logistic growth towards a
                carrying capacity <em>k</em>, with and without a harvest. With a constant harvest <em>h</em>, the
                normalised harvest <em>H</em> = 4<em>h</em>/(<em>rk</em>) compares it with the largest growth the
                logistic model can supply, <em>rk</em>/4 at <em>x</em> = <em>k</em>/2. Below 1 there are two
                equilibria; at 1 they merge at <em>k</em>/2; above 1 there are none and the stock collapses.</p>
            <h3>What you are seeing</h3>
            <ul>
                <li><strong>The plot.</strong> The state <em>x</em>(<em>t</em>) in blue on the left axis, and its
                    rate of change d<em>x</em>/d<em>t</em> in orange on the right axis, from <em>t</em> = 0 to
                    <em>t</em><sub>max</sub>. Where a model's stock would go negative it is shown as zero.</li>
                <li><strong>Differential equation.</strong> The model being solved.</li>
                <li><strong>Analytical solution.</strong> Its closed-form solution, or a note on its equilibria.
                    The two constant-harvest cases with <em>H</em> &le; 1 are integrated numerically (fourth-order
                    Runge-Kutta); the others are plotted from the closed form.</li>
            </ul>
        </section>

        <div class="main-layout">
            <section id="input-section">
                <div class="column">
                    <h2>Model</h2>

                    <div class="input-group">
                        <label for="model-select" data-tip="The model to solve. Each sets how the rate of change dx/dt depends on the state x.">Model</label>
                        <select id="model-select">
                            <option value="exp-growth">Exponential Growth</option>
                            <option value="exp-decay">Exponential Decay</option>
                            <option value="const-input">Constant Input with Decay</option>
                            <option value="logistic">Logistic Growth (No Harvest)</option>
                            <option value="logistic-stock-harvest">Logistic Growth (Stock-Dependent Harvest)</option>
                            <option value="logistic-const-harvest-critical">Logistic Growth (Const Harvest, H=1)</option>
                            <option value="logistic-const-harvest-under">Logistic Growth (Const Harvest, H&lt;1)</option>
                            <option value="logistic-const-harvest-over">Logistic Growth (Const Harvest, H&gt;1)</option>
                        </select>
                    </div>

                    <div id="parameters-container">
                        <!-- Parameters will be dynamically inserted here -->
                    </div>

                    <h3>Time</h3>
                    <div class="input-group">
                        <label for="t-max" data-tip="The time the plot runs to, in the same time units as the rates.">End time <em>t</em><sub>max</sub></label>
                        <input type="number" id="t-max" value="10" step="1" min="1" max="100">
                    </div>

                    <div id="equation-display">
                        <!-- Differential equation will be displayed here -->
                    </div>
                </div>
            </section>

            <section id="visualization-section">
                <div id="plot-container"></div>
                <div id="solution-display">
                    <!-- Analytical solution will be displayed here -->
                </div>
            </section>
        </div>
    </div>

    <script type="module" src="./js/system-dynamics.js"><\/script>
</body>

</html>`,S=Object.assign({"../1d-compression.html":o,"../bearing-capacity.html":r,"../compaction.html":d,"../consolidation.html":c,"../critical-state.html":h,"../darcy-flow.html":p,"../earth-pressures.html":u,"../elastic-footing.html":m,"../footing-settlement.html":v,"../index.html":g,"../infinite-slope.html":f,"../mohrs-circle.html":b,"../newmarks-chart.html":w,"../proctor.html":y,"../ruler.html":T,"../shear-box.html":k,"../sieve-analysis.html":x,"../stress-profile.html":V,"../system-dynamics.html":C}),D=document.querySelector("#tool-grid"),l=(n,t)=>{const e=n.match(t);return e?e[1].replace(/\s+/g," ").trim():""},z=n=>n.replace(/[-_]+/g," ").replace(/\b\w/g,t=>t.toUpperCase()),P=Object.entries(S).map(([n,t])=>{const e=n.split("/").pop();if(!e||e==="index.html")return null;const s=l(t,/<h1[^>]*>([\s\S]*?)<\/h1>/i)||l(t,/<title>([\s\S]*?)<\/title>/i)||z(e.replace(/\.html$/,""));return{fileName:e,href:`./${e}`,title:s.replace(/<[^>]+>/g,"")}}).filter(Boolean).sort((n,t)=>n.title.localeCompare(t.title));D.replaceChildren(...P.map((n,t)=>{const e=document.createElement("a");e.className="tool-card",e.href=n.href;const s=document.createElement("span");s.className="tool-card-index",s.textContent=`Tool ${String(t+1).padStart(2,"0")}`;const i=document.createElement("h3");i.textContent=n.title;const a=document.createElement("p");return a.textContent=n.fileName,e.append(s,i,a),e}));
