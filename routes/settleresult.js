module.exports = function(app, connectionPool) {

    app.get('/settleresult/logout', function(req, res, next) {
        console.log("logout:" + req.session.user_name);
        req.session.destroy(function(err){
            // 세션 정보 파괴
            res.redirect('/');
        })
    });
    
    app.get('/settleresult/:id', function(req, res, next) {

        console.log('result open');
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('/login');
        }
        else{
            var req_id = req.params.id;
            console.log('/settleresult/', req_id);
            
            //req_id = 1; // test
    
            connectionPool.getConnection(function(err, connection) {
                
                var query = 'select a.*, substring(a.settl_pdct_ym, 1, 4) settl_pdct_year, substring(a.settl_pdct_ym, 5, 2) settl_pdct_month \
                             from stl_pdct_rslt a where a.settl_pdct_req_num = ? order by a.settl_pdct_ym asc';
                
                //결과 데이터 조회
                connection.query(query, req_id, function(error, rows) {
                    if (error) {
                        connection.release();
                        throw error;
                    }
                    else {

                        if (rows.length >= 0) {
                        //    console.log('rows/', rows);                            
       
                            var query2 = 'SELECT a.*, \
                                             CASE a.co_settl_grp_id WHEN "1" THEN "유형1선불" WHEN "2" THEN "유형2후불" WHEN "4" THEN "유형1후불" WHEN "7" THEN "유형1DATA" ELSE 0 END co_settl_grp_nm \
                                             FROM stl_pdct_req_spc a WHERE a.settl_pdct_req_num = ?;';
                            connection.query(query2, req_id, function(error2, rows2) {
                                
                             //       console.log('rows2/', rows2); 
                                    if (error2) throw error2;
                                    else {
                                            res.render('settleresult', { rslt_list: rows, rslt_json:JSON.stringify(rows), req_id: req_id, rslt_main: rows2, session: req.session });
                                            connection.release();
                                        }
                            });       
       
       
                        }
                        else {
                            res.redirect('/');
                            connection.release();
                        }
                    }
                });
            });            
        }
    });

    // app.post('/complete', function(req, res){
        
    //     /* session 없을 땐 로그인 화면으로 */
    //     if (!req.session.user_name) {
    //         res.redirect('/');
    //     }
        
    //     var responseData = {};
    //     connectionPool.getConnection(function(err, connection) {
    //             if(err) {
    //                 connection.release();
    //                 throw err;
    //             }
    //             else {
    //                 var req_id = req.body.id;
    //                 console.log('/complete/', req_id);
                    
    //                 req_id = 1; // test
                    
    //                 // 결과조회
    //                 connection.query('SELECT rslt_cnt FROM rslt_data WHERE req_id=? ORDER BY cond_dt;', req_id, function(err,rows){ 
    //                     responseData.score = [];
    //                     if(err) throw err;
    //                     if(rows[0]){
    //                       responseData.result = "ok";
    //                       rows.forEach(function(val){
    //                         responseData.score.push(val.rslt_cnt);
    //                       })
    //                     }
    //                     else{
    //                       responseData.result = "none";
    //                       responseData.score = "";
    //                     }
    //                     // console.log('responseData',responseData);
                        
    //                     res.send({responseData : responseData, session : req.session});
    //               });
    //               connection.release();
    //             }
    //     });
    // });
    

};