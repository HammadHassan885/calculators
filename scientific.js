const exprEl = document.getElementById('expr');
const resultEl = document.getElementById('result');
const modeBtn = document.getElementById('modeBtn');

let expr = '';
let lastAnswer = 0;
let degrees = true;

const toRad = x => degrees ? x * Math.PI / 180 : x;
const fns = {
  sin: x => Math.sin(toRad(x)),
  cos: x => Math.cos(toRad(x)),
  tan: x => Math.tan(toRad(x)),
  log: x => Math.log10(x),
  ln: x => Math.log(x),
  sqrt: x => Math.sqrt(x),
  fact: n => {
    if (n < 0 || !Number.isInteger(n) || n > 170) throw new Error('bad factorial');
    let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;
  }
};

function evaluate(text) {
  let s = text
    .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
    .replace(/π/g, '(' + Math.PI + ')')
    .replace(/(\d+(\.\d+)?)%/g, '($1/100)')
    .replace(/(\d+)!/g, 'fact($1)')
    .replace(/√\(/g, 'sqrt(')
    .replace(/\^/g, '**');
  // Replace the constant e (not part of a function name) with its value
  s = s.replace(/\be\b/g, '(' + Math.E + ')');
  // Safety check: after removing known function names, only maths characters may remain
  const leftover = s.replace(/\b(sin|cos|tan|log|ln|sqrt|fact)\b/g, '');
  if (!/^[0-9+\-*/().\s]*$/.test(leftover)) throw new Error('invalid');
  const value = new Function('sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'fact',
    '"use strict"; return (' + s + ');')(fns.sin, fns.cos, fns.tan, fns.log, fns.ln, fns.sqrt, fns.fact);
  if (typeof value !== 'number' || !isFinite(value)) throw new Error('math');
  return value;
}

function render() {
  exprEl.textContent = expr;
  if (!expr) { resultEl.textContent = '0'; return; }
  try { resultEl.textContent = String(parseFloat(evaluate(expr).toPrecision(12))); }
  catch { /* keep showing last result while the expression is incomplete */ }
}

function add(v) { expr += v; render(); }

function equals() {
  if (!expr) return;
  try {
    lastAnswer = parseFloat(evaluate(expr).toPrecision(12));
    exprEl.textContent = expr + ' =';
    resultEl.textContent = String(lastAnswer);
    expr = String(lastAnswer);
  } catch {
    resultEl.textContent = 'Error';
    expr = '';
  }
}

document.getElementById('keys').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const a = b.dataset.a;
  if (a === 'clear') { expr = ''; render(); }
  else if (a === 'back') { expr = expr.replace(/(sin\(|cos\(|tan\(|log\(|ln\(|√\(|.)$/, ''); render(); }
  else if (a === 'equals') equals();
  else if (a === 'ans') add(String(lastAnswer));
  else add(b.dataset.v);
});

modeBtn.addEventListener('click', () => {
  degrees = !degrees;
  modeBtn.textContent = 'Mode: ' + (degrees ? 'Degrees' : 'Radians');
  render();
});

document.addEventListener('keydown', e => {
  if (/^[0-9.()+\-]$/.test(e.key)) add(e.key === '-' ? '−' : e.key);
  else if (e.key === '*') add('×');
  else if (e.key === '/') { e.preventDefault(); add('÷'); }
  else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); equals(); }
  else if (e.key === 'Backspace') { expr = expr.slice(0, -1); render(); }
  else if (e.key === 'Escape') { expr = ''; render(); }
});
