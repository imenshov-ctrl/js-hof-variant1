# HOF.js — Data Transformation Library

> Практична робота 8 · Варіант 1 · Функції вищого порядку

## Опис

Бібліотека чистих функцій вищого порядку для трансформації даних. Реалізована без сторонніх залежностей на чистому JavaScript (ES2020+).

## Встановлення та запуск

```bash
# Відкрити demo-сторінку
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Файл `src/hof.js` — ES-модуль, підключається через `import`.

---

## API Reference

### 1. `map(fn)(arr)` — трансформація масиву

Власна реалізація через `for`-цикл. Не мутує оригінал.

```js
import { map } from './src/hof.js';

const double = map(x => x * 2);
double([1, 2, 3]);              // → [2, 4, 6]

map(s => s.toUpperCase())(['a','b','c']); // → ['A','B','C']
```

---

### 2. `filter(predicate)(arr)` — фільтрація

```js
import { filter } from './src/hof.js';

const isEven = filter(x => x % 2 === 0);
isEven([1, 2, 3, 4, 5, 6]);   // → [2, 4, 6]

filter(u => u.active)([
  { name: 'Alice', active: true  },
  { name: 'Bob',   active: false },
]); // → [{ name: 'Alice', active: true }]
```

---

### 3. `reduce(fn, initialValue)(arr)` — згортка

```js
import { reduce } from './src/hof.js';

const sum = reduce((acc, x) => acc + x, 0);
sum([1, 2, 3, 4, 5]);   // → 15

// побудова словника частот
reduce((acc, w) => ({ ...acc, [w]: (acc[w] || 0) + 1 }), {})
  (['a','b','a','c','b','a']); // → { a:3, b:2, c:1 }
```

---

### 4. `compose(...fns)(x)` — композиція справа наліво

```js
import { compose } from './src/hof.js';

const process = compose(
  s => s.toUpperCase(),
  s => s.trim(),
  s => s.replace(/,/g, '')
);
process('  hello, world  ');  // → 'HELLO WORLD'
```

---

### 5. `pipe(...fns)(x)` — конвеєр зліва направо

```js
import { pipe } from './src/hof.js';

const toSlug = pipe(
  s => s.toLowerCase(),
  s => s.trim(),
  s => s.replace(/\s+/g, '-')
);
toSlug('  Hello World  ');  // → 'hello-world'
```

---

### 6. `curry(fn)` — каррінг довільної функції

```js
import { curry } from './src/hof.js';

const add = curry((a, b, c) => a + b + c);

add(1)(2)(3);   // → 6
add(1, 2)(3);   // → 6
add(1)(2, 3);   // → 6
add(1, 2, 3);   // → 6

const add10 = add(10);   // часткове застосування
add10(5)(3);             // → 18
```

---

### 7. `partial(fn, ...presetArgs)` — часткове застосування

```js
import { partial } from './src/hof.js';

const multiply = (a, b) => a * b;
const triple   = partial(multiply, 3);
triple(7);   // → 21

const greet = (greeting, name) => `${greeting}, ${name}!`;
const hello = partial(greet, 'Hello');
hello('Михайло');  // → 'Hello, Михайло!'
```

---

### 8. `memoize(fn, [keyResolver])` — мемоізація

```js
import { memoize } from './src/hof.js';

const fib = memoize(n =>
  n <= 1 ? n : fib(n - 1) + fib(n - 2)
);

fib(40);         // ~0.1 ms
fib(40);         // ~0.001 ms (cache hit)

fib.cache.size;  // кількість кешованих результатів
fib.clearCache(); // очистити кеш
```

---

### 9. `chain(arr)` — Chainable API

```js
import { chain } from './src/hof.js';

const result = chain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .filter(x => x % 2 === 0)    // [2, 4, 6, 8, 10]
  .map(x => x * x)              // [4, 16, 36, 64, 100]
  .reduce((a, b) => a + b, 0); // 220

// .value() повертає поточний масив
chain([1,2,3]).map(x => x*2).value(); // → [2, 4, 6]
```

---

### 10. Допоміжні функції

| Функція | Опис | Приклад |
|---------|------|---------|
| `flatMap(fn)(arr)` | map + flatten(1) | `flatMap(x=>[x,-x])([1,2])` → `[1,-1,2,-2]` |
| `flatten(depth)(arr)` | рекурсивне вирівнювання | `flatten(1)([[1,[2]],[3]])` → `[1,[2],3]` |
| `zip(arr1)(arr2)` | масив пар | `zip([1,2])(['a','b'])` → `[[1,'a'],[2,'b']]` |
| `groupBy(keyFn)(arr)` | групування за ключем | `groupBy(x=>x.type)(items)` |
| `uniq(arr)` | унікальні елементи | `uniq([1,2,1,3])` → `[1,2,3]` |

---

## Принципи реалізації

- **Чисті функції** — жодних побічних ефектів, жодної мутації вхідних даних
- **Curried за замовчуванням** — всі основні функції повертають функцію, що приймає масив
- **Immutability** — `filter`, `map`, `chain` створюють нові масиви
- **Chainable API** — `Chain` повертає `this`-подібний об'єкт для ланцюжків

---

## Demo відео

>https://github.com/imenshov-ctrl/js-hof-variant1/blob/main/HOF%20Library%20%E2%80%94%20Demo%20-%20Google%20Chrome%202026-04-28%2018-30-40.mp4

---

## Критерії оцінювання

| Критерій | Реалізовано |
|----------|-------------|
| Функції вищого порядку (map, filter, reduce) | ✅ власна реалізація |
| Чисті функції та імутабельність | ✅ без мутацій, spread/concat |
| Композиція та каррінг (compose, pipe, curry) | ✅ повна підтримка |
| Partial application | ✅ `partial` |
| Memoize | ✅ з Map-кешем та benchmark |
| Chainable API | ✅ клас Chain |
| README з прикладами | ✅ |
| Demo відео | ⬜ додати посилання |
