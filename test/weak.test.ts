
import mysql = require('mysql');
import logger from "../src/util/logger";
import fs from "fs";




describe('Weak Reference Test', function () {


    it('Weak Reference', async() => {

    //   logger.debug("hello the world")

    //     let r : any;
    //     r =  await query('select * from b_batch_list where batch_no = ? limit 1', '20200114054355752');
    //     logger.debug(r[0].id);
    //     // // // let result: any;
        // // let p = query('select * from b_batch_list where batch_no = ? limit 1', '20200114054355752')
        // //     .then(x => {
        // //         result = x;
        // //         logger.debug(result[0].id);
        // //         done();
        // //     });
        // let r : any;
        // async()=>{

        //     r = await query('select * from b_batch_list where batch_no = ? limit 1', '20200114054355752');

        // }

        // while(!r)
        // {

        // }
        // logger.debug(r[0].id);
            // (async () => {
            //     const r = await query('select * from b_batch_list where batch_no = ? limit 1', '20200114054355752');
            //     logger.debug(result[0].id);
            //   }());
        //done();
    }

    )
})
