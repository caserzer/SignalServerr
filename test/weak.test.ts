
import weak from 'weak-napi'

describe('Weak Reference Test', function () {

    it('Weak Reference', function () {

        let obj = { a: 123 };
        const weakReference = weak(obj, () => {
            // collected
            console.log("haha garbage collected!");
        });
        const sameType = weak.get(weakReference);
        if(sameType){
            expect( sameType.a===obj.a).toBeTruthy();
        }
        
    }

    )
})