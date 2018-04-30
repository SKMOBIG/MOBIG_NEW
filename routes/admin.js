module.exports = function(app, connectionPool) {
    
    app.get('/admint', function(req, res) {
        var sess = req.session
        
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        else{
            res.render('admin', { title: 'MOBIG', itemList : null, session : req.session });
        }
        
    });

    // 처음 화면 조회
    app.get('/admin', function(req, res, next) {

        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        
        connectionPool.getConnection(function(err, connection) {

            var sql = '';
            sql = 'SELECT c.category_grp_id, c.category_grp_nm, l.category_grp_dtl_id, l.category_grp_dtl_nm, l.column_nm, l.table_nm '
                    + 'FROM mvno_category_grp c, mvno_category_grp_lst l '
                    + 'WHERE c.category_grp_id = l.category_grp_id '
                    + 'ORDER BY l.category_grp_dtl_id;';
                    
            // 카테고리목록 조회
            connection.query(sql, function(error, rows) {
                if (error) {
                    connection.release();
                    throw error;
                }
                else {
                    if (rows.length > 0) {
                        console.log('rows : ' + rows[0] + ', rowsleng' + rows.length + rows[0].category_grp_id);
                        res.render('admin', {title: 'MOBIG', itemList : rows, session : req.session});
                        connection.release();

                    } else if (rows.length == 0){
                        console.log('no row');
                        res.render('admin', {title: 'MOBIG', session : req.session});
                        connection.release();
                    } else {
                       res.render('err', {title: 'MOBIG', itemList : null, session : req.session});
                        console.log('err');
                        connection.release();
                    }
                }
            });
        });
        
    });

    // 하나보기
    app.post('/getOne', function(req, res, next) {
        console.log(req.body.grpId);
        console.log(req.body.lstId);
        
        connectionPool.getConnection(function(err, connection) {
            var sql = 'SELECT l.category_grp_id grpId, c.category_grp_nm grpNm, l.category_grp_dtl_id lstId, l.category_grp_dtl_nm lstNm, l.column_nm colNm '
                    + 'FROM mvno_category_grp c, mvno_category_grp_lst l '
                    + 'WHERE c.category_grp_id = l.category_grp_id AND l.category_grp_id = ? AND l.category_grp_dtl_id = ?;';
                    
            // 카테고리목록 조회
            connection.query(sql, [req.body.grpId, req.body.lstId], function(error, rows) {
                if (error) {
                    connection.release();
                    throw error;
                }
                else {
                    if (rows.length == 1) {
                        res.send({row : rows[0], session : req.session});
                        connection.release();
                        console.log(rows[0]);
                    }
                    else {
                        res.send({row : rows, session : req.session});
                        console.log('err');
                        connection.release();
                    }
                }
            });
        });
        
    });

    
    // 항목 추가
    app.post('/saveList', function(req, res, next) {
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        
       connectionPool.getConnection(function(err, connection) {
           if(err) {
                connection.release();
                throw err;
           }
            connection.beginTransaction(function(err) {
                if(err) {
                    connection.release();
                    throw err;
                }
                else {
                    var saveList = req.body.saveList;
                    console.log('saveList : ' + saveList);
                    
                    for (var i=0;i<saveList.length;i++){
                        var fileNm = saveList[i].table_nm;
                        var columnNm = saveList[i].column_nm;
                        var dtlId = saveList[i].category_grp_dtl_id;
                        var dtlNm = saveList[i].category_grp_dtl_nm;
                        var grpId = saveList[i].category_grp_id;
                        var grpNm = saveList[i].category_grp_nm;
                        var insertSQL = "";
                        var updateSQL = "";
                        
                        // category id 없는 경우(신규 row) -> INSERT
                        if(saveList[i].category_grp_dtl_id == null || saveList[i].category_grp_dtl_id == ''){
                            console.log('insert query - ' + saveList[i].category_grp_dtl_id);
                                connection.query(insertItem,
                                [grpId, dtlNm, rows1[0].dtlId, colNm], function(error, rows) { 
                                    if(error) {
                                        console.log("Admin - Insert Err");
                                        connection.rollback(function() {
                                            connection.release();
                                            console.error("Admin - Insert Rollback Err");
                                            throw error;
                                        });
                                        connection.release();
                                        throw error;
                                    }
                            //insert
                                });
                        // category id 있는 경우(있던 row) -> UPDATE
                        } else {
                            console.log('update query - ' + saveList[i].category_grp_dtl_id)
                            //update
                        }
                    }
                    
                    // var updateItem = "";
                    // var insertItem = "insert into mvno_category_grp_lst(category_grp_id, category_grp_dtl_nm, category_grp_dtl_id, table_nm, column_nm)  values (?, ?, ?, 'Admin Data', ?);";
                    // var selectNewDtlId = "SELECT IFNULL((SELECT MAX(category_grp_dtl_id) FROM mvno_category_grp_lst WHERE category_grp_id = ?), 0)+1 AS dtlId FROM DUAL;";

                    // connection.query(selectNewDtlId, grpId, function(error, rows1) {
                    //     if(error){
                    //         connection.release();
                    //         throw error;
                    //     } else {
                    //         if(rows1.length >= 0){
                    //                         if(rows.affectedRows > 0) {
                                                    connection.commit(function(err) {
                                                        if(err) {
                                                            console.error("Admin : " + err);
                                                            connection.rollback(function() {
                                                                connection.release();
                                                                console.error("Admin - commit Rollback err");
                                                                throw err;
                                                            });
                                                        }
                                                        else{
                                                            console.log('insert completed');
                                                            connection.release();
                                                        }
                                                    });
                    //                         }else {
                    //                             console.log('??');
                    //                             connection.release();
                    //                         }    
                    //                     }
                    //                 });   
                    //         }else {
                    //             res.render('error', { title: 'MOBIG', session : req.session });
                    //             connection.release();
                    //         }
                    //     }
                    // });
                }
                
            });    
        });
    });    
    

    
    // 그룹 삭제
    app.post('/deleteDtl', function(req, res, next) {
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        
       connectionPool.getConnection(function(err, connection) {
            connection.beginTransaction(function(err) {
                if(err) {
                    connection.release();
                    throw err;
                }
                else {
                    var dtlId = req.body.dtlId;
                    var delDtl = "delete from mvno_category_grp_lst where category_grp_dtl_id= ? ";
                    
                    connection.query(delDtl,
                    [dtlId], function(error, rows) { 
                        if(error) {
                            console.log("Admin - Delete Err");
                            connection.rollback(function() {
                                connection.release();
                                console.error("Admin - Delete Rollback Err");
                                throw error;
                            });
                            connection.release();
                            throw error;
                        }else {
                            if(rows.affectedRows > 0) {
                                    connection.commit(function(err) {
                                        if(err) {
                                            connection.rollback(function() {
                                                connection.release();
                                                console.error("Admin - commit Rollback err");
                                                throw error;
                                            });
                                        }
                                        else{
                                            console.log('delete DTL success');
                                            connection.release();
                                        }
                                    });
                            }else {
                                console.log('??');
                                connection.release();
                            }    
                        }
                    });   
                
                }
                
            });    
        });
    });    
    
    // 그룹 삭제
    app.post('/deleteGrp', function(req, res, next) {
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        
       connectionPool.getConnection(function(err, connection) {
            connection.beginTransaction(function(err) {
                if(err) {
                    connection.release();
                    throw err;
                }
                else {
                    var grpId = req.body.id;
                    var delGrp = "delete from test_grp where category_grp_id= ? ";
                    var delLst = "delete from test_lst where category_grp_id= ? "; 
                    
                    connection.query(delGrp,
                    [grpId], function(error, rows) { 
                        if(error) {
                            console.log("Admin - Delete Err");
                            connection.rollback(function() {
                                connection.release();
                                console.error("Admin - Delete Rollback Err");
                                throw error;
                            });
                            connection.release();
                            throw error;
                        }else {
                            if(rows.affectedRows > 0) {
                                    connection.commit(function(err) {
                                        if(err) {
                                            console.error("Admin : " + err);
                                            connection.rollback(function() {
                                                connection.release();
                                                console.error("Admin - commit Rollback err");
                                                throw error;
                                            });
                                        }
                                        else{
                                            connection.query(delLst, [grpId], function(error, rows1) {
                                                if(error){
                                                    connection.release();
                                                    throw error;
                                                }else {
                                                    if(rows1.length >= 0){
                                                        res.send({datas : rows1[0], session : req.session});
                                                        connection.release();
                                                    }else {
                                                        res.render('error', { title: 'MOBIG', session : req.session });
                                                        connection.release();
                                                    }
                                                }
                                            });
                                        }
                                    });
                            }else {
                                console.log('??');
                                connection.release();
                            }    
                        }
                    });   
                
                }
                
            });    
        });
    });    
    

  
};