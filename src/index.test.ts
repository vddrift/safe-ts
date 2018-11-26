import {all, safe} from './index';

describe('safe', () => {
    const abc = {
        a: {
            b: {
                c: 'C',
            },
        }
    };
    const abc_untyped = <any>abc; // used to avoid typescript errors below.
    let a, b, c, d;

    it('should get nested property.', () => {
        b = safe(_ => abc.a.b);
        // console.log(b.c); // uncomment for typescript error: Object possibly undefined
        if (b!==undefined) { // let typescript exclude 'undefined', because there's no default.
            // console.log(b.d); // uncomment for typescript error: Property 'd' does not exist
            expect(b.c).toEqual('C'); // type safe. c is suggested by IDE.
        }
    });
    it('should handle arrays', () => {
        type ABC_arr = {
            a: {
                b_arr: [
                    {c: string}
                ]
            }
        };
        let abc_arr:ABC_arr = {a:{b_arr:[{c:'C'}]}};
        c = safe(_=>abc_arr.a.b_arr[0].c);
        expect(c).toEqual('C');
    });
    it('should use default when propery not found.', () => {
        // uncomment for typescript error: Property 'd' does not exist
        // safe(_ => abc.a.b.c.d.e, 'E');

        d = safe(_ => abc_untyped.a.b.c.d, 'D');
        expect(d).toEqual('D');
    });
    it('should use undefined when propery not found and default missing.', () => {
        d = safe(_ => abc_untyped.a.b.c.d);
        expect(d).toBeUndefined();
    });
    it('can\'t check if first argument returns undefined', () => {
        let undefinedNumber: number;
        a = safe(_ => undefinedNumber); // Typescript can't check if a is undefined.
        // undefinedNumber = 1; //...because a might be set before 'Try' function gets called.
    });
    it('should not accept undefined default.', () => {

        // uncomment for typescript error
        // let undefinedNumber: number|undefined = undefined;
        // safe(_ => 1, undefinedNumber);

        // uncomment for typescript error: Type 'undefined' is not assignable...
        // let undefinedWhatever;
        // safe(_=>abc.a.b.c, undefinedWhatever);

    });
    it('should accept default:any, even if it\'s undefined', () => {
        let undefinedAny: any = undefined;
        let z = safe(_ => abc_untyped.z, undefinedAny); // No typescript error because :any
        expect(z).toBeUndefined();

        let undefinedNumber: number|undefined = undefined;
        z = safe(_ => abc_untyped.z, <any>undefinedNumber); // No typescript error because <any>
        expect(z).toBeUndefined();

        // <any> tells typescript to ignore an invalid default, when you're too lazy to write proper types.
        b = safe(_=>abc.a.b, <any>{b:{}});
        expect(b.c).toEqual('C');
    });
    it('should not accept an incompatible default.', () => {

        // uncomment for error. invalid default.
        // const abc_required: {a:{b:{c:string}}} = {a:{b:{c:'c'}}}
        // a = safe(_=>abc_required.a, {b:{}}); // property 'c' is missing

        // uncomment for error. invalid default.
        // a = safe(_=>1, '2'); // not assignable to number
        // expect(a.b.c).toBeUndefined();
    });
    it('should accept valid default.', () => {

        // valid default because c is optional.
        const abc_optional: {a:{b:{c?:string}}} = {a:{b:{c:'C'}}};
        a = safe(_=>abc_optional.a, {b:{}});
        expect(a.b.c).toEqual('C');

    });
    it('should make discriminated unions', () => {
        // About discriminated unions: https://basarat.gitbooks.io/typescript/docs/types/discriminated-unions.html
        const abcExtra = {
            a: {
                b: {
                    c: 'C from abcExtra',
                    cExtra: 'Only in abcExtra', // not available when combined with abc.
                },
            }
        };
        const combined  = safe(_ => abc.a.b, abcExtra.a.b);
        expect(combined.c).toEqual('C');
        // expect(combined.cExtra).toEqual('Only in abcExtra'); // uncomment for typscript error: c_extra does not exist.

        const combinedReverse = safe(_ => abcExtra.a.b, abc.a.b);
        expect(combinedReverse.c).toEqual('C from abcExtra');
        // expect(combinedReverse.cExtra).toEqual('Only in abcExtra'); // uncomment for typscript error: c_extra does not exist.

        const single = safe(_ => abcExtra.a.b);
        // expect(single.c).toEqual('C from abcExtra'); // uncomment for typescript error: Object is possibly 'undefined'
        if (single!==undefined) { // avoid typescript error

            expect(single.cExtra).toEqual('Only in abcExtra');
        }
    });
    it('should handle optional properties', () => {
        interface AbcOptional {
            a?:{b?:{c?:{d?:string}}}
        }
        const maybeAbc: AbcOptional = {
            a: {
                b: { // optional
                    c: {
                        d:'D'
                    },
                },
            }
        };
        // c = safe(_ => maybeAbc.a.b.c); // uncomment for typescript error: object is possibly 'undefined'

        // Make all (nested) properties required
        c = safe(_=>all(maybeAbc).a.b.c);
        if (c!==undefined) { // avoid typescript error
            expect(c.d).toEqual('D');
        }
    });
   it('unfortunately fails to check optional properties, as a result of all()', () => {

       type ABCDE = {a?: {b?: {c?: {d?: {e?: string}}}}}
       const abcde:ABCDE = {
           a: {
               b: {
                   c: {}
               }
           }
       };

       c = safe(_=> all(abcde).a.b.c);
       if (c!=undefined) {
           let e = null;
           try {
               // The following DOESN'T cause a typescript error,
               // because all (nested) properties are assumed to be present in c,
               // but it DOES throw a runtime TypeError:
               // Cannot read property 'c' of undefined
               console.log(c.d.e);
           } catch (e) {
               // ignore
           }
           expect(e).toBeNull();
       }
    });
});


