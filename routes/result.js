module.exports = function(app, connectionPool) {

    app.get('/result/logout', function(req, res, next) {
        console.log("logout:" + req.session.user_name);
        req.session.destroy(function(err){
            // 세션 정보 파괴
            res.redirect('/');
        })
    });
    
    app.get('/result/:id', function(req, res, next) {

        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        else{
            var req_id = req.params.id;
            console.log('/result/', req_id);
            
            req_id = 1; // test
    
            connectionPool.getConnection(function(err, connection) {
                connection.query('select * from mvno_rslt_data where req_id=?;', req_id, function(error, rows) {
                    if (error) {
                        connection.release();
                        throw error;
                    }
                    else {
                        if (rows.length >= 0) {
                            // console.log('rows/', rows);                            
                            res.render('result', { rslt_list: rows, req_id: req_id, session: req.session });
                            connection.release();
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