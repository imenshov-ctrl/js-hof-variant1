/**
 * HOF Data Transformation Library
 * Variant 1 — Higher-Order Functions
 */

// ─── 1. map / filter / reduce (власні реалізації) ───────────────────────────

/**
 * map — застосовує функцію до кожного елемента масиву
 * @param {Function} fn
 * @returns {Function} масив -> масив
 */
const map = fn => arr => {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i, arr));
  }
  return result;
};

/**
 * filter — залишає елементи, що задовольняють предикат
 * @param {Function} predicate
 * @returns {Function} масив -> масив
 */
const filter = predicate => arr => {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i, arr)) result.push(arr[i]);
  }
  return result;
};

/**
 * reduce — згортає масив до одного значення
 * @param {Function} fn  (accumulator, current) => value
 * @param {*} initialValue
 * @returns {Function} масив -> значення
 */
const reduce = (fn, initialValue) => arr => {
  let acc = initialValue;
  let startIndex = 0;

  if (acc === undefined) {
    if (arr.length === 0) throw new TypeError('reduce of empty array with no initial value');
    acc = arr[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < arr.length; i++) {
    acc = fn(acc, arr[i], i, arr);
  }
  return acc;
};

// ─── 2. compose та pipe ──────────────────────────────────────────────────────

/**
 * compose — застосовує функції справа наліво
 * compose(f, g, h)(x) === f(g(h(x)))
 * @param {...Function} fns
 * @returns {Function}
 */
const compose = (...fns) => x =>
  fns.reduceRight((acc, fn) => fn(acc), x);

/**
 * pipe — застосовує функції зліва направо
 * pipe(f, g, h)(x) === h(g(f(x)))
 * @param {...Function} fns
 * @returns {Function}
 */
const pipe = (...fns) => x =>
  fns.reduce((acc, fn) => fn(acc), x);

// ─── 3. curry ────────────────────────────────────────────────────────────────

/**
 * curry — перетворює функцію з N аргументів на ланцюжок одноаргументних
 * @param {Function} fn
 * @returns {Function}
 */
const curry = fn => {
  const arity = fn.length;

  const curried = (...args) => {
    if (args.length >= arity) {
      return fn(...args);
    }
    return (...moreArgs) => curried(...args, ...moreArgs);
  };

  return curried;
};

// ─── 4. partial ──────────────────────────────────────────────────────────────

/**
 * partial — часткове застосування: фіксує перші аргументи функції
 * @param {Function} fn
 * @param {...*} presetArgs
 * @returns {Function}
 */
const partial = (fn, ...presetArgs) =>
  (...laterArgs) => fn(...presetArgs, ...laterArgs);

// ─── 5. memoize ──────────────────────────────────────────────────────────────

/**
 * memoize — кешує результати функції за аргументами
 * @param {Function} fn  (має бути чистою)
 * @param {Function} [keyResolver]  — власний ключ кешу (опційно)
 * @returns {Function}
 */
const memoize = (fn, keyResolver = (...args) => JSON.stringify(args)) => {
  const cache = new Map();

  const memoized = (...args) => {
    const key = keyResolver(...args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };

  // доступ до кешу для тестування
  memoized.cache = cache;
  memoized.clearCache = () => cache.clear();

  return memoized;
};

// ─── Chainable API ────────────────────────────────────────────────────────────

/**
 * Chain — обгортка для ланцюжкових трансформацій
 * @param {Array} data
 */
class Chain {
  constructor(data) {
    this._data = [...data]; // не мутуємо оригінал
  }

  map(fn)    { return new Chain(map(fn)(this._data)); }
  filter(fn) { return new Chain(filter(fn)(this._data)); }
  reduce(fn, init) { return reduce(fn, init)(this._data); }

  pipe(...fns) {
    return new Chain(pipe(...fns)(this._data));
  }

  value() { return this._data; }

  toJSON() { return this._data; }
}

/**
 * chain — фабрика для Chainable API
 * @param {Array} data
 * @returns {Chain}
 */
const chain = data => new Chain(data);

// ─── Службові чисті функції ───────────────────────────────────────────────────

/** flatMap — map + flatten на один рівень */
const flatMap = fn => arr =>
  reduce((acc, item) => [...acc, ...([].concat(fn(item)))], [])(arr);

/** flatten — рекурсивне вирівнювання масиву */
const flatten = depth => arr => {
  if (depth === 0) return arr;
  return reduce(
    (acc, item) =>
      Array.isArray(item)
        ? [...acc, ...flatten(depth - 1)(item)]
        : [...acc, item],
    []
  )(arr);
};

/** zip — об'єднує два масиви в масив пар */
const zip = arr1 => arr2 => {
  const len = Math.min(arr1.length, arr2.length);
  const result = [];
  for (let i = 0; i < len; i++) result.push([arr1[i], arr2[i]]);
  return result;
};

/** groupBy — групує масив за ключовою функцією */
const groupBy = keyFn => arr =>
  reduce((acc, item) => {
    const key = keyFn(item);
    return { ...acc, [key]: [...(acc[key] || []), item] };
  }, {})(arr);

/** uniq — унікальні елементи (за рефернсом / примітивним значенням) */
const uniq = arr => [...new Set(arr)];

export {
  map, filter, reduce,
  compose, pipe,
  curry, partial, memoize,
  chain,
  flatMap, flatten, zip, groupBy, uniq,
};
