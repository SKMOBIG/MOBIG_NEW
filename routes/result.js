module.exports = function(app, connectionPool) {

    app.get('/result/logout', function(req, res, next) {
        console.log("logout:" + req.session.user_name);
        req.session.destroy(function(err){
            // 세션 정보 파괴
            res.redirect('/');
        })
    });
    
    app.get('/result/:id', function(req, res, next) {

        console.log('result open');
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('/login');
        }
        else{
            var req_id = req.params.id;
            console.log('/result/', req_id);
            
            //req_id = 1; // test
    
            connectionPool.getConnection(function(err, connection) {
                //결과 데이터 조회
                connection.query('select * from mvno_rslt_data where req_id=? order by data_yymm asc;', req_id, function(error, rows) {
                    if (error) {
                        connection.release();
                        throw error;
                    }
                    else {
    
                        if (rows.length >= 0) {
                            console.log('rows/', rows);                            

                            // 요청 데이터 조회
                            var query = 'SELECT column_nm, table_nm, seq \
                            FROM (\
                            	SELECT \
                            	    (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst f WHERE a.category_grp_dtl_id1 = f.category_grp_dtl_id) column_nm, \
                            	    table_nm1 AS table_nm, 1 seq \
                            	FROM mvno_req_data a \
                            	WHERE a.req_id = ? \
                            	UNION ALL \
                            	SELECT \
                            	    (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst f WHERE a.category_grp_dtl_id2 = f.category_grp_dtl_id) column_nm, \
                            	    table_nm2 AS table_nm, 2 seq \
                            	FROM mvno_req_data a \
                            	WHERE a.req_id =? \
                            	UNION ALL \
                            	SELECT  \
                            	    (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst f WHERE a.category_grp_dtl_id3 = f.category_grp_dtl_id) column_nm, \
                            	    table_nm3 AS table_nm, 3 seq \
                            	FROM mvno_req_data a \
                            	WHERE a.req_id =? \
                            )T \
                            ORDER BY T.table_nm DESC, T.seq ASC;';
                            
                            connection.query(query, [req_id, req_id, req_id], function(error2, req_rows) {
                                    if (error2) throw error2;
                                    else {
                                        console.log('req_rows/', req_rows);            
                                        // 한방에 렌더
                                        res.render('result', { rslt_list: rows, rslt_json:JSON.stringify(rows), req_list:req_rows, req_id: req_id, session: req.session });
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

    app.post('/complete', function(req, res){
        
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('/');
        }
        
        var responseData = {};
        connectionPool.getConnection(function(err, connection) {
                if(err) {
                    connection.release();
                    throw err;
                }
                else {
                    var req_id = req.body.id;
                    console.log('/complete/', req_id);
                    
                    req_id = 1; // test
                    
                    // 결과조회
                    connection.query('SELECT rslt_cnt FROM rslt_data WHERE req_id=? ORDER BY cond_dt;', req_id, function(err,rows){ 
                        responseData.score = [];
                        if(err) throw err;
                        if(rows[0]){
                          responseData.result = "ok";
                          rows.forEach(function(val){
                            responseData.score.push(val.rslt_cnt);
                          })
                        }
                        else{
                          responseData.result = "none";
                          responseData.score = "";
                        }
                        // console.log('responseData',responseData);
                        
                        res.send({responseData : responseData, session : req.session});
                  });
                  connection.release();
                }
        });
    });
    

};