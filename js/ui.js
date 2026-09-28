import '../css/main.css';

// Shared interface for every tool page. Importing this module sets up:
//
//  - a ? after every element with a data-tip attribute (put it on the label
//    of each input), showing the text as a tooltip on hover, focus or tap.
//    Readouts built in code use tip(text) to get the same ? as a string;
//  - a ? next to the page title, if the page has a <section id="about">,
//    opening its contents in a dialog: the background and a description of
//    what each panel shows, kept out of the way until someone asks;
//  - a Reset button under the controls in #input-section, which puts every
//    input back to its starting value and fires 'tool-reset' on document;
//  - colors: the shared palette from the CSS variables in main.css, for
//    canvas and Plotly drawing, and alpha(color, a) to make it translucent.

const FALLBACK = {
    soil: '#a8551f', soilEdge: '#6b3512', soilLight: '#d9b48f',
    soilLayer1: '#b5651d', soilLayer2: '#9c7a4e', soilLayer3: '#836048',
    water: '#29a3e3', waterDark: '#0b6ea8', waterLight: 'rgba(41, 163, 227, 0.22)', air: '#ffffff',
    ink: '#212121', muted: '#757575', faint: '#bdbdbd', grid: '#eeeeee',
    totalStress: '#212121', porePressure: '#29a3e3', effectiveStress: '#d95f02',
    friction: '#646ef6', dilate: '#ef6c00', contract: '#0b6ea8', structure: '#9e9e9e',
    primary: '#646ef6',
};

const kebab = (name) => name.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();

function readColors() {
    const style = getComputedStyle(document.documentElement);
    const out = {};
    for (const [key, fallback] of Object.entries(FALLBACK)) {
        const v = style.getPropertyValue(key === 'primary' ? '--primary-color' : `--${kebab(key)}`).trim();
        out[key] = v || fallback;
    }
    return out;
}

export const colors = readColors();

/** A colour from the palette with transparency: alpha(colors.water, 0.5). */
export function alpha(color, a) {
    const hex = color.trim().replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(hex)) return color;
    const n = parseInt(hex, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

const escape = (text) => String(text)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The ? button, as HTML, for readouts built in code. */
export function tip(text) {
    return `<button type="button" class="tip" data-text="${escape(text)}" aria-label="What is this?">?</button>`;
}

// ---------------------------------------------------------------- tooltips

let tooltip = null;
let current = null;

function show(button) {
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.setAttribute('role', 'tooltip');
        document.body.appendChild(tooltip);
    }
    if (current && current !== button) current.setAttribute('aria-expanded', 'false');
    current = button;
    button.setAttribute('aria-expanded', 'true');
    tooltip.textContent = button.dataset.text;
    tooltip.classList.add('shown');
    const r = button.getBoundingClientRect();
    const t = tooltip.getBoundingClientRect();
    let x = r.left + r.width / 2 - t.width / 2;
    x = Math.max(8, Math.min(window.innerWidth - t.width - 8, x));
    let y = r.top - t.height - 8;
    if (y < 8) y = r.bottom + 8;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
}

function hide() {
    if (tooltip) tooltip.classList.remove('shown');
    if (current) current.setAttribute('aria-expanded', 'false');
    current = null;
}

function wireTooltips() {
    const target = (e) => (e.target instanceof Element ? e.target.closest('.tip') : null);
    document.addEventListener('pointerover', (e) => { const b = target(e); if (b) show(b); });
    document.addEventListener('pointerout', (e) => { if (target(e)) hide(); });
    document.addEventListener('focusin', (e) => { const b = target(e); if (b) show(b); });
    document.addEventListener('focusout', (e) => { if (target(e)) hide(); });
    document.addEventListener('click', (e) => {
        const b = target(e);
        if (b) {
            // a tip inside a label must not move focus to, or toggle, its input
            e.preventDefault();
            e.stopPropagation();
            current === b && tooltip.classList.contains('shown') ? hide() : show(b);
        } else hide();
    }, true);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
    window.addEventListener('scroll', hide, { passive: true });
}

function addStaticTips() {
    for (const el of document.querySelectorAll('[data-tip]')) {
        if (el.querySelector(':scope > .tip')) continue;
        el.insertAdjacentHTML('beforeend', tip(el.dataset.tip));
    }
}

// ---------------------------------------------------------------- about

function addAbout() {
    const about = document.getElementById('about');
    const h1 = document.querySelector('header h1');
    if (!about || !h1) return;
    const dialog = document.createElement('dialog');
    dialog.className = 'about';
    dialog.setAttribute('aria-label', `About: ${h1.textContent.trim()}`);
    dialog.innerHTML = `<button type="button" class="close" aria-label="Close">×</button>
        <h2>${h1.innerHTML}</h2>${about.innerHTML}`;
    about.remove();
    document.body.appendChild(dialog);

    const row = document.createElement('div');
    row.className = 'title-row';
    h1.replaceWith(row);
    row.appendChild(h1);
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'about-toggle';
    open.textContent = '?';
    open.title = 'What am I looking at?';
    open.setAttribute('aria-label', 'What am I looking at?');
    row.appendChild(open);

    open.addEventListener('click', () => { hide(); dialog.showModal(); });
    dialog.querySelector('.close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
}

// ---------------------------------------------------------------- reset

function addReset() {
    const panel = document.getElementById('input-section');
    if (!panel || panel.querySelector('button.reset')) return;
    const inputs = [...panel.querySelectorAll('input, select, textarea')];
    const initial = inputs.map((el) => (el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value));
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'reset';
    button.textContent = 'Reset';
    button.addEventListener('click', () => {
        inputs.forEach((el, i) => {
            if (el.type === 'checkbox' || el.type === 'radio') el.checked = initial[i];
            else el.value = initial[i];
        });
        for (const el of inputs) {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
        document.dispatchEvent(new CustomEvent('tool-reset'));
    });
    panel.appendChild(button);
}

// ---------------------------------------------------------------- start

function init() {
    addAbout();
    addStaticTips();
    addReset();
    wireTooltips();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
