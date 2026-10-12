'use strict';

/**
 * Evaluador aritmético seguro (sin eval): + - × ÷ ^ % y paréntesis.
 * `%` es porcentaje postfijo (50% = 0.5). Lanza un Error si la expresión no es válida.
 */
const PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 };
const RIGHT_ASSOCIATIVE = new Set(['^']);
const MAX_LENGTH = 80;

function tokenize(input) {
  const source = input.replaceAll('×', '*').replaceAll('÷', '/').replace(/\s+/g, '');
  if (!source || source.length > MAX_LENGTH) throw new Error('invalid');

  const tokens = [];
  const pattern = /(\d+\.?\d*|\.\d+)|([-+*/^()%])/gy;
  let match;
  let lastIndex = 0;
  while ((match = pattern.exec(source)) !== null) {
    if (match.index !== lastIndex) throw new Error('invalid');
    lastIndex = pattern.lastIndex;
    tokens.push(match[1] !== undefined ? { type: 'num', value: Number(match[1]) } : { type: 'op', value: match[2] });
  }
  if (lastIndex !== source.length) throw new Error('invalid');
  return tokens;
}

/** Convierte a notación postfija (shunting-yard) resolviendo menos unario y % postfijo. */
function toPostfix(tokens) {
  const output = [];
  const stack = [];
  let previous = null; // para distinguir "-" unario de binario

  for (const token of tokens) {
    if (token.type === 'num') {
      output.push(token);
    } else if (token.value === '(') {
      stack.push(token);
    } else if (token.value === ')') {
      while (stack.length && stack.at(-1).value !== '(') output.push(stack.pop());
      if (!stack.length) throw new Error('invalid');
      stack.pop();
    } else if (token.value === '%') {
      if (!previous || (previous.type === 'op' && previous.value !== ')' && previous.value !== '%')) throw new Error('invalid');
      output.push({ type: 'op', value: '%' });
    } else {
      const unary = token.value === '-' && (!previous || (previous.type === 'op' && previous.value !== ')' && previous.value !== '%'));
      if (unary) {
        output.push({ type: 'num', value: 0 }); // -x  →  0 - x
      } else if (token.value === '+' && !previous) {
        previous = token;
        continue;
      }
      const precedence = unary ? 3 : PRECEDENCE[token.value];
      while (stack.length) {
        const top = stack.at(-1);
        if (top.value === '(') break;
        const topPrecedence = PRECEDENCE[top.value];
        if (topPrecedence > precedence || (topPrecedence === precedence && !RIGHT_ASSOCIATIVE.has(token.value))) output.push(stack.pop());
        else break;
      }
      stack.push({ type: 'op', value: token.value });
    }
    previous = token;
  }
  while (stack.length) {
    const top = stack.pop();
    if (top.value === '(') throw new Error('invalid');
    output.push(top);
  }
  return output;
}

function evaluate(expression) {
  const stack = [];
  for (const token of toPostfix(tokenize(expression))) {
    if (token.type === 'num') {
      stack.push(token.value);
    } else if (token.value === '%') {
      if (!stack.length) throw new Error('invalid');
      stack.push(stack.pop() / 100);
    } else {
      if (stack.length < 2) throw new Error('invalid');
      const b = stack.pop();
      const a = stack.pop();
      if (token.value === '/' && b === 0) throw new Error('division');
      stack.push({ '+': a + b, '-': a - b, '*': a * b, '/': a / b, '^': a ** b }[token.value]);
    }
  }
  if (stack.length !== 1 || !Number.isFinite(stack[0])) throw new Error('invalid');
  return Number(stack[0].toPrecision(12)); // evita 0.1+0.2 = 0.30000000000000004
}

module.exports = { evaluate, MAX_LENGTH };
