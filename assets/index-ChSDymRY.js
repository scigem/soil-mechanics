import"./modulepreload-polyfill-B5Qt9EMX.js";const o=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1D Compression Explorer</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>1D Compression</h1>
        </header>

        <div class="main-layout">
            <div class="column">
                <section id="input-section">
                    <h2>Stress History</h2>

                    <div class="input-group">
                        <label for="initial-stress">Initial vertical stress σ′<sub>0</sub> (kPa):</label>
                        <div class="slider-container">
                            <input type="range" id="initial-stress" min="20" max="250" value="50" step="5">
                            <span class="slider-value" id="initialStressValue">50</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="precon-stress">Initial preconsolidation stress σ′<sub>pc</sub> (kPa):</label>
                        <div class="slider-container">
                            <input type="range" id="precon-stress" min="30" max="400" value="150" step="5">
                            <span class="slider-value" id="preconStressValue">150</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="peak-stress">Peak loading stress σ′<sub>max</sub> (kPa):</label>
                        <div class="slider-container">
                            <input type="range" id="peak-stress" min="30" max="600" value="300" step="5">
                            <span class="slider-value" id="peakStressValue">300</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="final-stress">Stress after unloading σ′<sub>f</sub> (kPa):</label>
                        <div class="slider-container">
                            <input type="range" id="final-stress" min="20" max="500" value="100" step="5">
                            <span class="slider-value" id="finalStressValue">100</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <h2>Compressibility</h2>

                    <div class="input-group">
                        <label for="lambda">Virgin compression slope λ:</label>
                        <div class="slider-container">
                            <input type="range" id="lambda" min="0.08" max="0.35" value="0.18" step="0.01">
                            <span class="slider-value" id="lambdaValue">0.18</span>
                            <span class="unit">-</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="kappa">Swelling / recompression slope κ:</label>
                        <div class="slider-container">
                            <input type="range" id="kappa" min="0.01" max="0.10" value="0.04" step="0.005">
                            <span class="slider-value" id="kappaValue">0.040</span>
                            <span class="unit">-</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="precon-void-ratio">Void ratio at initial σ′<sub>pc</sub>:</label>
                        <div class="slider-container">
                            <input type="range" id="precon-void-ratio" min="0.60" max="1.40" value="1.00" step="0.02">
                            <span class="slider-value" id="preconVoidRatioValue">1.00</span>
                            <span class="unit">e</span>
                        </div>
                    </div>

                    <button id="reset-button" type="button">Reset to Default</button>
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
                            <span class="label">Initial OCR</span>
                            <span id="initialOCR">3.00</span>
                        </div>
                        <div class="result-item emphasis">
                            <span class="label">Current OCR</span>
                            <span id="currentOCR">3.00</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Initial void ratio</span>
                            <span id="initialVoidRatio">1.04</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Peak void ratio</span>
                            <span id="peakVoidRatio">0.88</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Final void ratio</span>
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
    <title>Bearing Capacity: a Quarter Turn</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>Bearing Capacity: a Quarter Turn</h1>
            <p class="subtitle">Under a strip footing the tilt of the stress points down; beside it, under the
                surcharge, it lies flat. Between them it turns through a right angle, and turning a tilt that is at
                the cap multiplies the squeeze by e<sup>2 tan φ′ Δβ</sup>. Slide the turn along the fan to follow
                it.</p>
        </header>

        <div class="main-layout">
            <section id="input-section">
                <h2>Soil</h2>
                <div class="input-group">
                    <label for="phi">Friction angle φ′ (°)</label>
                    <div class="slider-container">
                        <input type="range" id="phi" min="0" max="45" step="0.5" value="30">
                        <span class="slider-value" id="phi-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="c">Cohesion <em>c′</em>, or <em>s</em><sub>u</sub> at φ′ = 0 (kPa)</label>
                    <div class="slider-container">
                        <input type="range" id="c" min="0" max="80" step="1" value="0">
                        <span class="slider-value" id="c-value"></span>
                    </div>
                </div>

                <h2>Footing</h2>
                <div class="input-group">
                    <label for="sv0">Surcharge beside the footing σ<sub>v0</sub>′ (kPa)</label>
                    <div class="slider-container">
                        <input type="range" id="sv0" min="0" max="100" step="1" value="18">
                        <span class="slider-value" id="sv0-value"></span>
                    </div>
                </div>

                <h2>Follow the turn</h2>
                <div class="input-group">
                    <label for="psi">How far round the fan, out from under the footing (°)</label>
                    <div class="slider-container">
                        <input type="range" id="psi" min="0" max="90" step="1" value="45">
                        <span class="slider-value" id="psi-value"></span>
                    </div>
                </div>
                <button id="play">Play the turn</button>
                <p class="note">The soil's own weight is left out, as in Prandtl's solution: it adds the ½γB<em>N</em><sub>γ</sub>
                    term, which has no closed form.</p>
            </section>

            <section id="visualization-section">
                <div class="panels">
                    <figure class="wide">
                        <canvas id="mech-canvas"></canvas>
                        <figcaption>The mechanism, to scale. Ticks show the direction of the tilt.</figcaption>
                    </figure>
                    <figure class="wide">
                        <canvas id="ladder-canvas"></canvas>
                        <figcaption>The squeeze <em>p</em>′ along the way, from the footing out to the surcharge (log
                            scale)</figcaption>
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
    <title>Compaction Simulator</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>Compaction Simulator</h1>
            <!-- <p>Explore how compaction changes material index properties</p> -->
        </header>

        <div class="main-layout">
            <!-- Parameters Column -->
            <div class="column">
                <section id="input-section">
                    <h2>Parameters</h2>

                    <div class="input-group">
                        <label for="Vs">V<sub>s</sub> (Volume of Solids):</label>
                        <div class="slider-container">
                            <input type="range" id="Vs" name="Vs" min="0" max="100" value="50">
                            <span class="slider-value" id="VsValue">50</span>
                            <span class="unit">cm³</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="Vw">V<sub>w</sub> (Volume of Water):</label>
                        <div class="slider-container">
                            <input type="range" id="Vw" name="Vw" min="0" max="100" value="50">
                            <span class="slider-value" id="VwValue">50</span>
                            <span class="unit">cm³</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="Va">V<sub>a</sub> (Volume of Air):</label>
                        <div class="slider-container">
                            <input type="range" id="Va" name="Va" min="0" max="100" value="50">
                            <span class="slider-value" id="VaValue">50</span>
                            <span class="unit">cm³</span>
                        </div>
                    </div>

                    <!-- <div class="material-properties"> -->
                    <h3>Material Properties</h3>
                    <p>ρ<sub>w</sub> = 1 g/cm³, G<sub>s</sub> = 2.7</p>
                    <!-- </div> -->
                </section>

                <section id="results-section">
                    <div id="results-overlay">
                        <h3>Derived Quantities</h3>
                        <div class="results-grid" id="valuesContainer">
                            <div class="result-item">
                                <span class="label">V:</span>
                                <span id="VValue"></span> cm³
                            </div>
                            <div class="result-item">
                                <span class="label">V<sub>v</sub>:</span>
                                <span id="VvValue"></span> cm³
                            </div>
                            <div class="result-item">
                                <span class="label">m<sub>w</sub>:</span>
                                <span id="mwValue"></span> g
                            </div>
                            <div class="result-item">
                                <span class="label">m<sub>s</sub>:</span>
                                <span id="msValue"></span> g
                            </div>
                            <div class="result-item">
                                <span class="label">m:</span>
                                <span id="mValue"></span> g
                            </div>
                            <div class="result-item">
                                <span class="label">mc:</span>
                                <span id="mcValue"></span>
                            </div>
                            <div class="result-item">
                                <span class="label">e:</span>
                                <span id="eValue"></span>
                            </div>
                            <div class="result-item">
                                <span class="label">ν:</span>
                                <span id="nuValue"></span>
                            </div>
                            <div class="result-item">
                                <span class="label">n:</span>
                                <span id="nValue"></span>
                            </div>
                            <div class="result-item">
                                <span class="label">S:</span>
                                <span id="SValue"></span>
                            </div>
                            <div class="result-item">
                                <span class="label">A:</span>
                                <span id="AValue"></span>
                            </div>
                            <div class="result-item">
                                <span class="label">ρ<sub>dry</sub>:</span>
                                <span id="rhodValue"></span> g/cm³
                            </div>
                            <div class="result-item">
                                <span class="label">ρ<sub>bulk</sub>:</span>
                                <span id="rhobValue"></span> g/cm³
                            </div>
                            <div class="result-item">
                                <span class="label">ρ<sub>sat</sub>:</span>
                                <span id="rhosatValue"></span> g/cm³
                            </div>
                            <div class="result-item">
                                <span class="label">γ<sub>dry</sub>:</span>
                                <span id="gammadValue"></span> kN/m³
                            </div>
                            <div class="result-item">
                                <span class="label">γ<sub>bulk</sub>:</span>
                                <span id="gammabValue"></span> kN/m³
                            </div>
                            <div class="result-item">
                                <span class="label">γ<sub>sat</sub>:</span>
                                <span id="gammasatValue"></span> kN/m³
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Visualization Column -->
            <div class="column">
                <section id="visualization-section">
                    <!-- <h2>Compaction Visualization</h2> -->
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
    <title>1D Consolidation Explorer</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>1D Consolidation Explorer</h1>
            <p>See how excess pore pressure dissipates with time and depth, and how top and bottom drainage change the response.</p>
        </header>

        <div class="main-layout">
            <div class="column">
                <section id="input-section">
                    <h2>Soil and Loading</h2>

                    <div class="input-group">
                        <label for="stress-increment">Stress increase Δσ (kPa):</label>
                        <div class="slider-container">
                            <input type="range" id="stress-increment" min="25" max="250" value="100" step="5">
                            <span class="slider-value" id="stressIncrementValue">100</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="layer-thickness">Layer thickness H (m):</label>
                        <div class="slider-container">
                            <input type="range" id="layer-thickness" min="2" max="12" value="6" step="0.5">
                            <span class="slider-value" id="layerThicknessValue">6.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="cv">Coefficient of consolidation c<sub>v</sub> (m²/day):</label>
                        <div class="slider-container">
                            <input type="range" id="cv" min="0.05" max="2" value="0.1" step="0.05">
                            <span class="slider-value" id="cvValue">0.10</span>
                            <span class="unit">m²/day</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="mv">Compressibility m<sub>v</sub> (m²/kN):</label>
                        <div class="slider-container">
                            <input type="range" id="mv" min="0.0002" max="0.002" value="0.0004" step="0.0001">
                            <span class="slider-value" id="mvValue">0.0004</span>
                            <span class="unit">m²/kN</span>
                        </div>
                    </div>

                    <h2>Drainage</h2>

                    <div class="checkbox-grid">
                        <label class="checkbox-item" for="drainage-top">
                            <input type="checkbox" id="drainage-top" checked>
                            <span>Top drained</span>
                        </label>
                        <label class="checkbox-item" for="drainage-bottom">
                            <input type="checkbox" id="drainage-bottom" checked>
                            <span>Bottom drained</span>
                        </label>
                    </div>

                    <h2>Time View</h2>

                    <div class="input-group">
                        <label for="t-max">Maximum time shown (days):</label>
                        <div class="slider-container">
                            <input type="range" id="t-max" min="30" max="365" value="365" step="5">
                            <span class="slider-value" id="tMaxValue">365</span>
                            <span class="unit">days</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="profile-time">Profile time (days):</label>
                        <div class="slider-container">
                            <input type="range" id="profile-time" min="0" max="365" value="30" step="1">
                            <span class="slider-value" id="profileTimeValue">30</span>
                            <span class="unit">days</span>
                        </div>
                    </div>

                    <button id="reset-button" type="button">Reset to Default</button>
                </section>

                <section id="results-section">
                    <h2>Important Outputs</h2>
                    <div class="results-grid">
                        <div class="result-item">
                            <span class="label">Drainage condition</span>
                            <span id="drainageCondition">Double drainage</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Drainage path H<sub>dr</sub></span>
                            <span id="drainagePath">3.00 m</span>
                        </div>
                        <div class="result-item emphasis">
                            <span class="label">Settlement at profile time</span>
                            <span id="currentSettlement">0.00 mm</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Degree of consolidation</span>
                            <span id="currentDegree">0.0%</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Final settlement</span>
                            <span id="finalSettlement">0.00 mm</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Mid-depth excess pore pressure</span>
                            <span id="midDepthPressure">0.0 kPa</span>
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
                    <div class="info-panel">
                        <p><strong>Interpretation:</strong> The settlement curve shows the time-dependent response. The profile shows how excess pore pressure varies with depth at the selected time.</p>
                        <p><strong>Drainage:</strong> Drained boundaries force u = 0. Undrained boundaries trap water and slow dissipation.</p>
                    </div>
                </section>
            </div>
        </div>
    </div>

    <script type="module" src="./js/consolidation.js"><\/script>
</body>

</html>`,p=`<!DOCTYPE html>
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
        <!-- <header>
            <h1>Critical State Line</h1>
        </header> -->

        <div class="main-layout">
            <section id="input-section">
                <div class="column">
                    <h2>Critical State Parameters</h2>
                    <div class="input-group">
                        <label for="M">Critical State Slope M:</label>
                        <input type="number" id="M" value="1.2" step="0.1" min="0.1" max="3.0">
                    </div>
                    <div class="input-group">
                        <label for="Gamma">Critical State Intercept Γ:</label>
                        <input type="number" id="Gamma" value="2.0" step="0.1" min="1.0" max="5.0">
                    </div>
                    <div class="input-group">
                        <label for="lambda">Compression Index λ:</label>
                        <input type="number" id="lambda" value="0.15" step="0.01" min="0.01" max="0.5">
                    </div>
                    <div class="input-group">
                        <label for="N">Normal Compression Line N:</label>
                        <input type="number" id="N" value="2.5" step="0.1" min="1.0" max="5.0">
                    </div>

                    <h3>View Controls</h3>
                    <div class="input-group">
                        <label for="sigma-scale">σ Axis Scale:</label>
                        <select id="sigma-scale">
                            <option value="linear">Linear</option>
                            <option value="log">Logarithmic</option>
                        </select>
                    </div>
                    <div class="button-group">
                        <button id="view-tau-sigma">τ-σ View</button>
                        <button id="view-e-sigma">e-σ View</button>
                        <button id="view-3d">3D View</button>
                        <button id="reset-button">Reset</button>
                    </div>
                </div>
            </section>

            <section id="visualization-section">
                <div id="plot-container"></div>
                <div id="info-panel">
                    <h3>Critical State Theory</h3>
                    <p>The critical state line represents the ultimate shear strength of soil in both stress space (τ vs σ) and void ratio space (e vs ln σ).</p>
                    <ul>
                        <li><strong>M:</strong> Critical state slope in stress space</li>
                        <li><strong>Γ:</strong> Critical state intercept in void ratio space</li>
                        <li><strong>λ:</strong> Compression index</li>
                        <li><strong>N:</strong> Normal compression line intercept</li>
                    </ul>
                </div>
            </section>
        </div>
    </div>

    <script type="module" src="./js/critical-state.js"><\/script>
</body>

</html>`,u=`<!DOCTYPE html>
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

        <div class="main-layout">
            <div class="column">
                <section id="input-section">
                    <h2>Parameters</h2>

                    <div class="input-group">
                        <label for="conductivity">Hydraulic Conductivity k:</label>
                        <div class="slider-container">
                            <input type="range" id="conductivity" name="conductivity" min="-6" max="-2" value="-4" step="0.1">
                            <span class="slider-value" id="conductivityValue">1.0 × 10<sup>-4</sup></span>
                            <span class="unit">m/s</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="headLoss">Head Loss Δh:</label>
                        <div class="slider-container">
                            <input type="range" id="headLoss" name="headLoss" min="0.1" max="10" value="2" step="0.1">
                            <span class="slider-value" id="headLossValue">2.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="length">Flow Length L:</label>
                        <div class="slider-container">
                            <input type="range" id="length" name="length" min="0.1" max="10" value="4" step="0.1">
                            <span class="slider-value" id="lengthValue">4.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="area">Cross-sectional Area A:</label>
                        <div class="slider-container">
                            <input type="range" id="area" name="area" min="0.01" max="1" value="0.2" step="0.01">
                            <span class="slider-value" id="areaValue">0.20</span>
                            <span class="unit">m²</span>
                        </div>
                    </div>

                    <button id="reset-button">Reset to Default</button>
                </section>

                <section id="results-section">
                    <h2>Key Results</h2>
                    <div class="results-grid">
                        <div class="result-item">
                            <span class="label">Hydraulic Gradient i</span>
                            <span id="gradientValue"></span>
                        </div>
                        <div class="result-item">
                            <span class="label">Darcy Flux q</span>
                            <span id="fluxValue"></span>
                        </div>
                        <div class="result-item">
                            <span class="label">Discharge Q</span>
                            <span id="dischargeValue"></span>
                        </div>
                    </div>
                    <p class="equation">Q = k A Δh / L</p>
                </section>
            </div>

            <div class="column">
                <section id="visualization-section">
                    <div id="headProfile" class="schematic" aria-label="Darcy flow schematic"></div>
                    <div class="info-panel">
                        <p><strong>Interpretation:</strong> Head is the height water rises in a standpipe above a common datum. Water flows through the soil from the higher head on the left to the lower head on the right, and the drop over the specimen length gives the hydraulic gradient <span id="gradientEquationText">i = Δh / L</span>.</p>
                    </div>
                </section>
            </div>
        </div>
    </div>

    <script type="module" src="./js/darcy-flow.js"><\/script>
</body>

</html>`,v=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Earth Pressure Dial</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>The Earth Pressure Dial</h1>
            <p class="subtitle">Behind a smooth wall with level ground, the tilt of the stress can only point up or
                down, so it is one number, <em>C</em>, and <em>K</em> = σ<sub>h</sub>′/σ<sub>v</sub>′ = (1 − <em>C</em>)/(1
                + <em>C</em>). Friction stops <em>C</em> at ± sin φ′: the active and passive states. Drag along the
                dial, or move the wall.</p>
        </header>

        <div class="main-layout">
            <section id="input-section">
                <h2>The wall</h2>
                <div class="input-group">
                    <label for="C">Vertical tilt <em>C</em> (move the wall away → +, push it in → −)</label>
                    <div class="slider-container">
                        <input type="range" id="C" min="-1" max="1" step="0.001" value="0.333">
                        <span class="slider-value" id="C-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="H">Wall height <em>H</em> (m)</label>
                    <div class="slider-container">
                        <input type="range" id="H" min="1" max="12" step="0.5" value="6">
                        <span class="slider-value" id="H-value"></span>
                    </div>
                </div>

                <h2>Soil</h2>
                <div class="input-group">
                    <label for="phi">Friction angle φ′ (°)</label>
                    <div class="slider-container">
                        <input type="range" id="phi" min="15" max="45" step="0.5" value="30">
                        <span class="slider-value" id="phi-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="K0">At-rest <em>K</em><sub>0</sub>, set by how the soil was deposited</label>
                    <div class="slider-container">
                        <input type="range" id="K0" min="0.2" max="2" step="0.01" value="0.5">
                        <span class="slider-value" id="K0-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="gamma">Unit weight γ (kN/m³), dry</label>
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
                        <figcaption>The dial: <em>K</em> = (1 − <em>C</em>)/(1 + <em>C</em>), with friction's two
                            stops</figcaption>
                    </figure>
                    <figure>
                        <canvas id="wall-canvas"></canvas>
                        <figcaption>The wall: grains push with <em>K</em>γ<em>z</em></figcaption>
                    </figure>
                    <figure>
                        <canvas id="mohr-canvas"></canvas>
                        <figcaption>The Mohr circle at the base of the wall</figcaption>
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
    <title>Elastic Strip Footing Displacement Field</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- <script src="https://cdn.plot.ly/plotly-latest.min.js"><\/script> -->
</head>

<body>
    <div class="container">
        <header>
            <h1>Elastic Strip Footing Displacement Field</h1>
            <p>Explore the displacement field in an elastic half-space under a uniformly loaded strip footing</p>
        </header>

        <div class="main-layout">
            <!-- Parameters Column -->
            <div class="column">
                <section id="input-section">
                    <h2>Loading Parameters</h2>
                    
                    <div class="input-group">
                        <label for="load">Load q (kPa):</label>
                        <div class="slider-container">
                            <input type="range" id="load" name="load" min="10" max="500" value="100" step="10">
                            <span class="slider-value" id="loadValue">100</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="width">Footing Half-Width B (m):</label>
                        <div class="slider-container">
                            <input type="range" id="width" name="width" min="0.5" max="5" value="2" step="0.1">
                            <span class="slider-value" id="widthValue">2</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="depth">Domain Depth (m):</label>
                        <div class="slider-container">
                            <input type="range" id="depth" name="depth" min="5" max="20" value="10" step="1">
                            <span class="slider-value" id="depthValue">10</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <h2>Elastic Properties</h2>
                    
                    <div class="input-group">
                        <label for="youngs">Young's Modulus E (MPa):</label>
                        <div class="slider-container">
                            <input type="range" id="youngs" name="youngs" min="1" max="100" value="20" step="1">
                            <span class="slider-value" id="youngsValue">20</span>
                            <span class="unit">MPa</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="poisson">Poisson's Ratio ν:</label>
                        <div class="slider-container">
                            <input type="range" id="poisson" name="poisson" min="0.1" max="0.49" value="0.3" step="0.01">
                            <span class="slider-value" id="poissonValue">0.3</span>
                            <span class="unit">-</span>
                        </div>
                    </div>

                    <h2>Display Options</h2>
                    
                    <div class="input-group">
                        <label for="component">Displacement Component:</label>
                        <select id="component" name="component">
                            <option value="vertical">Vertical (uy)</option>
                            <option value="horizontal">Horizontal (ux)</option>
                            <option value="magnitude">Magnitude |u|</option>
                        </select>
                    </div>

                    <button id="reset-button">Reset to Default</button>
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
                    <div class="info-panel">
                        <p><strong>Theory:</strong> This visualization shows the displacement field in an elastic half-space under a uniformly loaded strip footing using Boussinesq-type solutions.</p>
                        <p><strong>Note:</strong> The displacement field assumes plane strain conditions and linear elastic behavior.</p>
                    </div>
                </section>
            </div>
        </div>
    </div>
    <script type="module" src="./js/elastic-footing.js"><\/script>
</body>

</html>`,h=`<!DOCTYPE html>
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
            <p>How far a footing load spreads is set by the friction angle, not by an elastic modulus.</p>
        </header>

        <div class="main-layout">
            <div class="column">
                <section id="input-section">
                    <h2>Footing</h2>

                    <div class="input-group compact">
                        <label for="width">Width <i>B</i></label>
                        <div class="slider-container">
                            <input type="range" id="width" min="0.5" max="8" value="2" step="0.1">
                            <span class="slider-value" id="widthValue">2.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group compact">
                        <label for="length">Length <i>L</i></label>
                        <div class="slider-container">
                            <input type="range" id="length" min="0.5" max="20" value="2" step="0.1">
                            <span class="slider-value" id="lengthValue">2.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group compact">
                        <label for="pressure">Pressure <i>q</i></label>
                        <div class="slider-container">
                            <input type="range" id="pressure" min="25" max="400" value="100" step="5">
                            <span class="slider-value" id="pressureValue">100</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <div class="input-group compact">
                        <label for="founding">Depth <i>D</i><sub>f</sub></label>
                        <div class="slider-container">
                            <input type="range" id="founding" min="0" max="4" value="1" step="0.1">
                            <span class="slider-value" id="foundingValue">1.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <h2>Soil</h2>

                    <div class="input-group">
                        <label for="friction">Friction angle &phi;
                            <span class="hint">&rarr; concentration factor</span></label>
                        <div class="slider-container">
                            <input type="range" id="friction" min="15" max="45" value="32" step="0.5">
                            <span class="slider-value" id="frictionValue">32.0</span>
                            <span class="unit">&deg;</span>
                        </div>
                    </div>

                    <div class="input-group compact">
                        <label for="unitWeight">&gamma;<sub>bulk</sub></label>
                        <div class="slider-container">
                            <input type="range" id="unitWeight" min="14" max="22" value="18" step="0.5">
                            <span class="slider-value" id="unitWeightValue">18.0</span>
                            <span class="unit">kN/m³</span>
                        </div>
                    </div>

                    <div class="input-group compact">
                        <label for="waterTable">Water table</label>
                        <div class="slider-container">
                            <input type="range" id="waterTable" min="0" max="30" value="30" step="0.5">
                            <span class="slider-value" id="waterTableValue">none</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group compact">
                        <label for="thickness">Layer <i>H</i></label>
                        <div class="slider-container">
                            <input type="range" id="thickness" min="2" max="40" value="16" step="0.5">
                            <span class="slider-value" id="thicknessValue">16.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <h2>Compression law</h2>

                    <div class="input-group">
                        <label for="law">How stress becomes strain</label>
                        <select id="law">
                            <option value="janbu" selected>Janbu power law (stress dependent)</option>
                            <option value="constant">Constant m&#8340; (linear)</option>
                        </select>
                    </div>

                    <div class="input-group compact" id="mv-group" hidden>
                        <label for="mv">m&#8340;</label>
                        <div class="slider-container">
                            <input type="range" id="mv" min="0.02" max="0.5" value="0.1" step="0.005">
                            <span class="slider-value" id="mvValue">0.100</span>
                            <span class="unit">m²/MN</span>
                        </div>
                    </div>

                    <div id="janbu-group">
                        <div class="input-group compact">
                            <label for="modulus" title="Janbu modulus number">m</label>
                            <div class="slider-container">
                                <input type="range" id="modulus" min="20" max="1200" value="300" step="10">
                                <span class="slider-value" id="modulusValue">300</span>
                                <span class="unit">&ndash;</span>
                            </div>
                        </div>
                        <div class="input-group compact">
                            <label for="stressExponent" title="Janbu stress exponent">a</label>
                            <div class="slider-container">
                                <input type="range" id="stressExponent" min="0" max="1" value="0.5" step="0.01">
                                <span class="slider-value" id="stressExponentValue">0.50</span>
                                <span class="unit">&ndash;</span>
                            </div>
                        </div>
                        <p class="hint-block">
                            <i>E</i><sub>oed</sub> = <i>m p</i><sub>a</sub>(&sigma;&prime;/<i>p</i><sub>a</sub>)<sup><i>a</i></sup>.
                            <i>a</i> = 1/3 is Hertzian contact, <i>a</i> &asymp; 0.5 is what sands measure,
                            <i>a</i> = 1 is the C<sub>c</sub> log law.
                        </p>
                    </div>

                    <div class="preset-row">
                        <button id="hertz-button" type="button" class="secondary">Hertz <i>a</i>=1/3</button>
                        <button id="clay-button" type="button" class="secondary">Clay <i>a</i>=1</button>
                        <button id="reset-button" type="button" class="secondary">Reset</button>
                    </div>
                </section>
            </div>

            <div class="column">
                <section id="results-section">
                    <div class="results-grid">
                        <div class="result-item">
                            <span class="label">Concentration factor <i>n</i></span>
                            <span id="exponentOut">5.2</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Settlement, Boussinesq</span>
                            <span id="elasticOut">0.0 mm</span>
                        </div>
                        <div class="result-item emphasis">
                            <span class="label">Settlement, fan</span>
                            <span id="fanOut">0.0 mm</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Ratio</span>
                            <span id="ratioOut">1.00</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Differential, centre to edge</span>
                            <span id="differentialOut">0.0 mm</span>
                        </div>
                    </div>
                    <p class="result-note" id="summaryNote"></p>
                </section>

                <section id="visualization-section">
                    <div id="bulbPlot" class="graph"></div>
                    <div id="profilePlot" class="graph"></div>
                </section>

                <section id="explainer-section">
                    <div class="info-panel">
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
                    </div>
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

</html>`,b=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Infinite Slope and Water</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>The Infinite Slope and Water</h1>
            <p class="subtitle">On a plane parallel to a long slope the shear is fixed by the weight, τ = γ<em>z</em>
                sin α cos α. Friction can resist tan φ′ times the effective normal stress. Raise the water table and
                the water takes part of the squeeze: the grains are pressed together less, and friction resists
                less.</p>
        </header>

        <div class="main-layout">
            <section id="input-section">
                <h2>Slope</h2>
                <div class="input-group">
                    <label for="alpha">Slope angle α (°)</label>
                    <div class="slider-container">
                        <input type="range" id="alpha" min="5" max="45" step="0.5" value="25">
                        <span class="slider-value" id="alpha-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="z">Depth of the slip plane <em>z</em> (m)</label>
                    <div class="slider-container">
                        <input type="range" id="z" min="0.5" max="8" step="0.1" value="3">
                        <span class="slider-value" id="z-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="m">Water table height, as a fraction <em>m</em> of <em>z</em> above the slip plane</label>
                    <div class="slider-container">
                        <input type="range" id="m" min="0" max="1" step="0.01" value="0">
                        <span class="slider-value" id="m-value"></span>
                    </div>
                </div>

                <h2>Soil</h2>
                <div class="input-group">
                    <label for="phi">Friction angle φ′ (°)</label>
                    <div class="slider-container">
                        <input type="range" id="phi" min="20" max="45" step="0.5" value="33">
                        <span class="slider-value" id="phi-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="c">Cohesion <em>c′</em> (kPa)</label>
                    <div class="slider-container">
                        <input type="range" id="c" min="0" max="20" step="0.5" value="0">
                        <span class="slider-value" id="c-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="gamma">Unit weight γ (kN/m³), taken the same above and below the water table</label>
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
                        <figcaption>A slice of the slope. Water flows parallel to the surface, so the equipotentials
                            are perpendicular to it.</figcaption>
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
`,f=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mohr's Circle and the Friction Cap</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>Mohr's Circle and the Friction Cap</h1>
            <p class="subtitle">A stress has a size <em>p′</em> and a tilt: an arrow whose length is <em>q/p′</em> and
                whose direction is that of σ<sub>1</sub>′. Friction caps the length at sin φ′. Drag in the right-hand
                panel to set the tilt.</p>
        </header>

        <div class="main-layout">
            <section id="input-section">
                <h2>Stress</h2>
                <div class="input-group">
                    <label for="p">Mean stress <em>p′</em> (kPa)</label>
                    <div class="slider-container">
                        <input type="range" id="p" min="10" max="300" step="1" value="100">
                        <span class="slider-value" id="p-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="tilt">Size of the tilt <em>q/p′</em></label>
                    <div class="slider-container">
                        <input type="range" id="tilt" min="0" max="1" step="0.001" value="0.3">
                        <span class="slider-value" id="tilt-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="beta">Direction of σ<sub>1</sub>′ from vertical, β (°)</label>
                    <div class="slider-container">
                        <input type="range" id="beta" min="-90" max="90" step="1" value="0">
                        <span class="slider-value" id="beta-value"></span>
                    </div>
                </div>

                <h2>Soil</h2>
                <div class="input-group">
                    <label for="phi">Friction angle φ′ (°)</label>
                    <div class="slider-container">
                        <input type="range" id="phi" min="10" max="45" step="0.5" value="30">
                        <span class="slider-value" id="phi-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="cohesion">Cohesion <em>c′</em> (kPa)</label>
                    <div class="slider-container">
                        <input type="range" id="cohesion" min="0" max="50" step="1" value="0">
                        <span class="slider-value" id="cohesion-value"></span>
                    </div>
                </div>

                <h2>A plane</h2>
                <div class="input-group">
                    <label for="theta">Plane inclined at θ to the horizontal (°)</label>
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
                        <figcaption>The Mohr circle: centre <em>p′</em>, radius <em>q</em></figcaption>
                    </figure>
                    <figure>
                        <canvas id="disc-canvas"></canvas>
                        <figcaption>The tilt: (<em>C</em>, <em>S</em>) = (<em>q/p′</em>)(cos 2β, sin 2β)</figcaption>
                    </figure>
                </div>
                <div id="readout"></div>
            </section>
        </div>
    </div>

    <script type="module" src="./js/mohrs-circle.js"><\/script>
</body>

</html>
`,y=`<!DOCTYPE html>
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
            <p>Draw your foundation to scale on the chart. The chart calculates the vertical stress increase beneath the centre of the chart.</p>
        </header>

        <div class="main-layout">
            <div class="column">
                <section id="input-section">
                    <h2>Chart Controls</h2>

                    <div class="input-group">
                        <label for="pressure">Applied pressure q (kPa):</label>
                        <input type="number" id="pressure" value="150" min="0" step="5">
                    </div>

                    <div class="input-group">
                        <div class="input-group">
                            <label for="rings">Rings:</label>
                            <input type="number" id="rings" value="20" min="4" max="50" step="1">
                        </div>

                        <div class="input-group">
                            <label for="sectors">Sectors:</label>
                            <input type="number" id="sectors" value="50" min="8" max="100" step="2">
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="friction">Friction angle &phi; (&deg;), 0 for Boussinesq:</label>
                        <input type="number" id="friction" value="0" min="0" max="45" step="0.5">
                    </div>

                    <div class="button-row">
                        <button id="clear-drawing" type="button">Clear Drawing</button>
                        <button id="reset-button" type="button" class="secondary-button">Reset Defaults</button>
                    </div>
                </section>

                <section id="scale-section">
                    <h2>Depth and Scale Helpers</h2>

                    <div class="input-group">
                        <label for="depth">Depth z (m):</label>
                        <input type="number" id="depth" value="5" min="0.1" step="0.1">
                    </div>
                </section>

                <section id="results-section">
                    <h2>Results</h2>

                    <div class="results-grid">
                        <div class="result-item">
                            <span class="label">Concentration factor <i>n</i></span>
                            <span id="exponent">3.00</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Unit influence per cell</span>
                            <span id="unit-influence">0.0000</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Covered cells</span>
                            <span id="covered-cells">0</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Influence value I</span>
                            <span id="influence-value">0.0000</span>
                        </div>
                        <div class="result-item emphasis">
                            <span class="label">Stress increase Δσ<sub>z</sub></span>
                            <span id="stress-result">0.00 kPa</span>
                        </div>
                    </div>

                    <div class="formula-card">
                        <h3>Calculation</h3>
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

</html>`,w=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
    </style>
    <title>Rulers</title>
</head>

<body>
    <h1>Solid fraction, Porosity, and Void ratio</h1>
    <div class="container">

        <div class="ruler-container">
            <div class="axis-label">Solid Fraction (&nu;)</div>
            <div class="ruler" id="solid-fraction"></div>
            <div class="marker" id="marker-solid-fraction"></div>

        </div>

        <div class="ruler-container">
            <div class="axis-label">Porosity (n)</div>
            <div class="ruler" id="porosity"></div>
            <div class="marker" id="marker-porosity"></div>
        </div>

        <div class="ruler-container">
            <div class="axis-label">Void Ratio (e)</div>
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

</html>`,x=`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Shear Box and Taylor's Balance</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>The Shear Box and Taylor's Balance</h1>
            <p class="subtitle">Push the top half of the box sideways under a fixed normal load. The work you do goes
                into sliding against friction and into lifting the load as the sample rises:
                τ/σ′ = tan φ′<sub>cs</sub> + d<em>y</em>/d<em>x</em>. A dense sample has to climb; a loose one
                sinks. Both end at the critical state.</p>
        </header>

        <div class="main-layout">
            <section id="input-section">
                <h2>Sample</h2>
                <div class="input-group">
                    <label for="ID">Relative density <em>I</em><sub>D</sub></label>
                    <div class="slider-container">
                        <input type="range" id="ID" min="0" max="1" step="0.01" value="0.8">
                        <span class="slider-value" id="ID-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="sigma">Normal stress σ′ (kPa)</label>
                    <div class="slider-container">
                        <input type="range" id="sigma" min="10" max="800" step="5" value="100">
                        <span class="slider-value" id="sigma-value"></span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="phics">Critical-state angle φ′<sub>cs</sub> (°)</label>
                    <div class="slider-container">
                        <input type="range" id="phics" min="25" max="40" step="0.5" value="33">
                        <span class="slider-value" id="phics-value"></span>
                    </div>
                </div>

                <h2>Shear it</h2>
                <div class="input-group">
                    <label for="x">Shear displacement <em>x</em> (mm)</label>
                    <div class="slider-container">
                        <input type="range" id="x" min="0" max="10" step="0.05" value="2">
                        <span class="slider-value" id="x-value"></span>
                    </div>
                </div>
                <button id="play">Play the test</button>
                <p class="note">Peak dilatancy follows Bolton's (1986) relative dilatancy index,
                    <em>I</em><sub>R</sub> = <em>I</em><sub>D</sub>(10 − ln <em>p</em>′) − 1, with
                    φ′<sub>peak</sub> − φ′<sub>cs</sub> ≈ 5<em>I</em><sub>R</sub> degrees in plane strain. The
                    shape of the curves is schematic.</p>
            </section>

            <section id="visualization-section">
                <div class="panels">
                    <figure>
                        <canvas id="box-canvas"></canvas>
                        <figcaption>The box. The darker band is the shear zone: it leans as the top half moves, and thickens as the sample dilates (orange) or thins as it contracts (blue). The rise is exaggerated three times.</figcaption>
                    </figure>
                    <figure>
                        <canvas id="curve-canvas"></canvas>
                        <figcaption>Strength and rise. The shaded strip is d<em>y</em>/d<em>x</em>: the work of
                            lifting the load.</figcaption>
                    </figure>
                </div>
                <div id="readout"></div>
            </section>
        </div>
    </div>

    <script type="module" src="./js/shear-box.js"><\/script>
</body>

</html>
`,k=`<!DOCTYPE html>
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
                            <span class="label">Total mass</span>
                            <span><span id="totalMassValue">0</span> g</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Passing 0.075 mm</span>
                            <span id="finesValue">0%</span>
                        </div>
                        <div class="result-item">
                            <span class="label">D<sub>10</sub></span>
                            <span id="d10Value">—</span>
                        </div>
                        <div class="result-item">
                            <span class="label">D<sub>30</sub></span>
                            <span id="d30Value">—</span>
                        </div>
                        <div class="result-item">
                            <span class="label">D<sub>60</sub></span>
                            <span id="d60Value">—</span>
                        </div>
                        <div class="result-item">
                            <span class="label">C<sub>u</sub></span>
                            <span id="cuValue">—</span>
                        </div>
                        <div class="result-item">
                            <span class="label">C<sub>c</sub></span>
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
    <title>Stress Profile Explorer</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="container">
        <header>
            <h1>Stress Profile</h1>
        </header>

        <div class="main-layout">
            <div class="column">
                <section id="input-section">
                    <h2>Scenario</h2>

                    <div class="input-group">
                        <label for="water-table">Water table depth (negative = ponded water):</label>
                        <div class="slider-container">
                            <input type="range" id="water-table" min="-4" max="12" value="0" step="0.1">
                            <span class="slider-value" id="waterTableValue">0.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="surcharge">Surface surcharge <i>q</i>:</label>
                        <div class="slider-container">
                            <input type="range" id="surcharge" min="0" max="150" value="0" step="5">
                            <span class="slider-value" id="surchargeValue">0</span>
                            <span class="unit">kPa</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="capillary">Capillary rise <i>h</i><sub>c</sub> above water table:</label>
                        <div class="slider-container">
                            <input type="range" id="capillary" min="0" max="5" value="0" step="0.1">
                            <span class="slider-value" id="capillaryValue">0.0</span>
                            <span class="unit">m</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="probe">Probe depth:</label>
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
                            <label for="t1">Thickness</label>
                            <div class="slider-container">
                                <input type="range" id="t1" min="0" max="10" value="5" step="0.5">
                                <span class="slider-value" id="t1Value">5.0</span>
                                <span class="unit">m</span>
                            </div>
                        </div>
                        <div class="input-group compact">
                            <label for="g1" title="Bulk unit weight">&gamma;<sub>bulk</sub></label>
                            <div class="slider-container">
                                <input type="range" id="g1" min="13" max="22" value="18" step="0.5">
                                <span class="slider-value" id="g1Value">18.0</span>
                                <span class="unit">kN/m³</span>
                            </div>
                        </div>
                        <div class="input-group compact">
                            <label for="gs1" title="Saturated unit weight">&gamma;<sub>sat</sub></label>
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
                            <label for="t2">Thickness</label>
                            <div class="slider-container">
                                <input type="range" id="t2" min="0" max="10" value="3" step="0.5">
                                <span class="slider-value" id="t2Value">3.0</span>
                                <span class="unit">m</span>
                            </div>
                        </div>
                        <div class="input-group compact">
                            <label for="g2" title="Bulk unit weight">&gamma;<sub>bulk</sub></label>
                            <div class="slider-container">
                                <input type="range" id="g2" min="13" max="22" value="17" step="0.5">
                                <span class="slider-value" id="g2Value">17.0</span>
                                <span class="unit">kN/m³</span>
                            </div>
                        </div>
                        <div class="input-group compact">
                            <label for="gs2" title="Saturated unit weight">&gamma;<sub>sat</sub></label>
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
                            <label for="t3">Thickness</label>
                            <div class="slider-container">
                                <input type="range" id="t3" min="0" max="10" value="4" step="0.5">
                                <span class="slider-value" id="t3Value">4.0</span>
                                <span class="unit">m</span>
                            </div>
                        </div>
                        <div class="input-group compact">
                            <label for="g3" title="Bulk unit weight">&gamma;<sub>bulk</sub></label>
                            <div class="slider-container">
                                <input type="range" id="g3" min="13" max="22" value="19" step="0.5">
                                <span class="slider-value" id="g3Value">19.0</span>
                                <span class="unit">kN/m³</span>
                            </div>
                        </div>
                        <div class="input-group compact">
                            <label for="gs3" title="Saturated unit weight">&gamma;<sub>sat</sub></label>
                            <div class="slider-container">
                                <input type="range" id="gs3" min="15" max="24" value="21" step="0.5">
                                <span class="slider-value" id="gs3Value">21.0</span>
                                <span class="unit">kN/m³</span>
                            </div>
                        </div>
                    </div>

                    <div class="preset-row">
                        <button id="freeze-button" type="button">Freeze reference</button>
                        <button id="reset-button" type="button" class="secondary">Reset</button>
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
                            <span class="label">Total stress &sigma;</span>
                            <span id="sigmaOut">157.0</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Pore pressure <i>u</i></span>
                            <span id="uOut">78.5</span>
                        </div>
                        <div class="result-item emphasis">
                            <span class="label">Effective stress &sigma;&prime;</span>
                            <span id="sigmaEffOut">78.5</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Change vs reference</span>
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
        <div class="main-layout">
            <section id="input-section">
                <div class="column">
                    <h2>System Dynamics Models</h2>

                    <div class="input-group">
                        <label for="model-select">Select Model:</label>
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

                    <h3>Time Controls</h3>
                    <div class="input-group">
                        <label for="t-max">Maximum Time (t<sub>max</sub>):</label>
                        <input type="number" id="t-max" value="10" step="1" min="1" max="100">
                    </div>

                    <div class="button-group">
                        <button id="reset-button">Reset Parameters</button>
                    </div>

                    <div id="equation-display">
                        <!-- Differential equation will be displayed here -->
                    </div>
                </div>
            </section>

            <section id="visualization-section">
                <div id="plot-container"></div>
                <div id="info-panel">
                    <h3>System Dynamics</h3>
                    <p>Explore various differential equation models and their solutions over time.</p>
                    <ul>
                        <li><strong>x(t):</strong> System state at time t</li>
                        <li><strong>dx/dt:</strong> Rate of change of the system</li>
                        <li><strong>Parameters:</strong> Control system behavior (growth rate, carrying capacity, etc.)</li>
                    </ul>
                    <div id="solution-display">
                        <!-- Analytical solution will be displayed here -->
                    </div>
                </div>
            </section>
        </div>
    </div>

    <script type="module" src="./js/system-dynamics.js"><\/script>
</body>

</html>`,T=Object.assign({"../1d-compression.html":o,"../bearing-capacity.html":r,"../compaction.html":d,"../consolidation.html":c,"../critical-state.html":p,"../darcy-flow.html":u,"../earth-pressures.html":v,"../elastic-footing.html":m,"../footing-settlement.html":h,"../index.html":g,"../infinite-slope.html":b,"../mohrs-circle.html":f,"../newmarks-chart.html":y,"../ruler.html":w,"../shear-box.html":x,"../sieve-analysis.html":k,"../stress-profile.html":V,"../system-dynamics.html":C}),_=document.querySelector("#tool-grid"),l=(s,e)=>{const n=s.match(e);return n?n[1].replace(/\s+/g," ").trim():""},P=s=>s.replace(/[-_]+/g," ").replace(/\b\w/g,e=>e.toUpperCase()),S=Object.entries(T).map(([s,e])=>{const n=s.split("/").pop();if(!n||n==="index.html")return null;const i=l(e,/<h1[^>]*>([\s\S]*?)<\/h1>/i)||l(e,/<title>([\s\S]*?)<\/title>/i)||P(n.replace(/\.html$/,""));return{fileName:n,href:`./${n}`,title:i.replace(/<[^>]+>/g,"")}}).filter(Boolean).sort((s,e)=>s.title.localeCompare(e.title));_.replaceChildren(...S.map((s,e)=>{const n=document.createElement("a");n.className="tool-card",n.href=s.href;const i=document.createElement("span");i.className="tool-card-index",i.textContent=`Tool ${String(e+1).padStart(2,"0")}`;const a=document.createElement("h3");a.textContent=s.title;const t=document.createElement("p");return t.textContent=s.fileName,n.append(i,a,t),n}));
