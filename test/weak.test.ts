
import weak from 'weak-napi'
import { equal } from 'assert';

describe('Weak Reference Test', function () {

    it('Weak Reference', done=> {

        let array = new Array<number>(1000);
        array.fill(100);
        let obj = { a: 123 , b: array};
        let container = {objectRef: obj};
        const weakReference = weak(obj, () => {
            // expect( weak.get(weakReference)=== undefined).toBeTruthy();
            // done();
        });
        const sameType = weak.get(weakReference);
        if(sameType){
            expect( sameType.a===obj.a).toBeTruthy();
        }
        delete container.objectRef;
        global.gc();
        done(); 
    }

    )
})