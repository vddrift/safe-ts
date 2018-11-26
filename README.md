# Safe nested object selector

`safe-ts` helps you select values from nested objects and arrays,
without throwing error `Cannot read property 'x' of undefined`.

It's compact, 
supported by all browsers, 
 preserves Typescript typings and code-completion during development by your IDE (like WebStorm or Visual Studio Code). 

It also takes an optional default value.

## Install

```bash
npm i --save safe-ts
```

### Requirements

- TypeScript >= 2.9
- NodeJS >= 6

## Example Usage

```typescript
import { safe } from 'safe-ts';

const abc = {
    a: {
        b: [
            {c: 'C-0'}, 
        ],
    }
};

let c1 = safe(_=> abc.a.b[0].c); // 'C-0'

let c9 = safe(_=> abc.a.b[9].c, 'C-9'); // 'C-9'
```
## Alternatives
Logical expressions are very verbose for long paths.
```
let c2 = (abc.a && abc.a.b && abc.a.b[9] && abc.a.b[9].c) || 'C-9'
```
[Lodash](https://lodash.com/) `get(...)` is more compact, 
but removes typescript support.

```typescript
import { get } from 'lodash';

let c9 = get(abc, 'a.b[9].c', 'C-9');
```

[`ts-optchain`](https://www.npmjs.com/package/ts-optchain) preserves typescript typings and has an elegant syntax. 
 Reading the source code and this [article](https://medium.com/inside-rimeto/optional-chaining-in-typescript-622c3121f99b) tought me a lot. 
Unfortunately it requires Proxy. 
Please consider this option if the [browser support](https://caniuse.com/#search=proxy) suits your project.

```typescript
import { oc } from 'ts-optchain';

let c9 = oc(abc).b.c('C-9');
```

### Type Preservation

`safe-ts` preserves TypeScript typings and code-completion by IDEs like Visual Studio Code or WebStorm.

```typescript
const abc = {a: {b: {c: 'C'}}};

let b = safe(_=> abc.a.b, {c:'C default'});

console.log(b.c) // When typing 'b' your code editor suggests '.c'
```

### Optional properties

To traverse optional properties, wrap your object in the `all` function, included in `ts-safe`. 
```typescript
import { safe, all } from 'safe-ts';

// Everything is optional.
type ABCDE = {a?: {b?: {c?: {d?: {e?: string}}}}}
const abc:ABCDE = {
    a:{
        b: {
            c: {} // incomplete.
        }
    }
};

let e1 = safe(_=> abc.a.b.c.d.e); // typescript error: Object is possibly 'undefined'
let e2 = safe(_=> all(abc).a.b.c.d.e); // no typescript error. e2 becomes undefined, as expected.
```

Note: the `all` function tells typescript all (nested) properties exits. 
This affects the return value. For instance, using `abc` from before: 
```typescript
// 'all' tells typescript not to worry whether anything exists.
let c = safe(_=> all(abc).a.b.c);

if (c) {
    // When c exists, typescript falsely assumes d and e exist.
    console.log(c.d.e); // RUNTIME error: Cannot read property
    
    // This works. Typscript normally enforces this. Now it's up to you. 
    if (c.d) {
        console.log(c.d.e);
    }
}
```
Please keep this in mind when using optional properties.

## License

`safe-ts` is MIT Licensed.
