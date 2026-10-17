const screen = document.getElementById('screen');
const history = document.getElementById('history');
const symbols = { '/': '÷', '*': '×', '-': '−', '+': '+' };

let current = '0';   // number being typed
let previous = null; // first operand
let operator = null;
let fresh = false;   // true after = so the next digit starts a new number

function show() { screen.textContent = current; }

function compute(a, b, op) {
  a = parseFloat(a); b = parseFloat(b);
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return b === 0 ? 'Error' : a / b;
  return b;
}
function clean(n) {
  return n === 'Error' ? n : String(parseFloat(Number(n).toPrecision(12)));
}

function press(action, value) {
  if (current === 'Error' && action !== 'clear') { current = '0'; previous = operator = null; }
  switch (action) {
    case 'num':
      if (fresh) { current = '0'; fresh = false; }
      if (value === '.' && current.includes('.')) return;
      current = (current === '0' && value !== '.') ? value : current + value;
      break;
    case 'op':
      if (operator && !fresh) current = clean(compute(previous, current, operator));
      previous = current; operator = value; fresh = true;
      history.textContent = previous + ' ' + symbols[value];
      break;
    case 'equals':
      if (!operator) return;
      history.textContent = previous + ' ' + symbols[operator] + ' ' + current + ' =';
      current = clean(compute(previous, current, operator));
      previous = operator = null; fresh = true;
      break;
    case 'clear': current = '0'; previous = operator = null; fresh = false; history.textContent = ''; break;
    case 'back': current = current.length > 1 ? current.slice(0, -1) : '0'; break;
    case 'sign': if (current !== '0') current = current.startsWith('-') ? current.slice(1) : '-' + current; break;
    case 'percent': current = clean(parseFloat(current) / 100); break;
  }
  show();
}

document.getElementById('keys').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) press(b.dataset.a, b.dataset.v);
});

// Keyboard support
document.addEventListener('keydown', e => {
  if (/[0-9.]/.test(e.key)) press('num', e.key);
  else if ('+-*/'.includes(e.key)) press('op', e.key);
  else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); press('equals'); }
  else if (e.key === 'Backspace') press('back');
  else if (e.key === 'Escape') press('clear');
});
