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
                    + 'FROM mvno_category_grp c, mvno_category_grp_lst_test l '
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


    
    app.post('/execShell', function(req, res, next) {
        
        var shNm = 'sh test.sh';
        
        const exec = require('child_process').exec;
        var yourscript = exec(shNm,
                (error, stdout, stderr) => {
                    console.log(`Output From Shell : ${stdout}`);
                    if (error !== null) {
                        console.log(`exec error: ${error}`);
                    }
        });
        res.send({shNm:shNm});
        
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
                    var uCnt = 0;
                    var iCnt = 0;
                    var dCnt = 0;
                    console.log('saveList.lengt : ' + saveList.length);
                    
                    var query = "";
                    var insertSQL = "";
                    var updateSQL = "";  
                    
                    
                    // 1차쿼리 묶음 : Insert or Update
                    var dtlArr = [];
                    for (var i=0;i<saveList.length;i++){
                        var fileNm = saveList[i].table_nm;
                        var columnNm = saveList[i].column_nm;
                        var dtlId = saveList[i].category_grp_dtl_id;
                        var dtlNm = saveList[i].category_grp_dtl_nm;
                        var grpId = saveList[i].category_grp_id;
                        var grpNm = saveList[i].category_grp_nm;

                        var delSQL = "DELETE FROM `mvno_category_grp_lst_test` WHERE category_grp_dtl_id NOT IN (?);";
                        var selectSQL = "SELECT category_grp_dtL_id FROM 'mvno_category_grp_lst_test' where category_grp_dtL_id not in (?)";
                        
                        console.log('[' + fileNm + ',' + columnNm + ',' + dtlId + ',' + dtlNm + ',' + grpId + ',' + grpNm + ']');
                        
                        // category id 없는 경우(신규 row) -> INSERT
                        if(dtlId == null || dtlId == ''){
                            console.log('no id => Insert Row');

                            insertSQL = "INSERT INTO `mvno_category_grp_lst_test` (table_nm, column_nm, category_grp_dtl_nm, category_grp_id, category_grp_nm) VALUES ('" + fileNm + "','" + columnNm + "','" + dtlNm + "','" + grpId + "','" + grpNm + "');";
                            query = query + insertSQL;
                            iCnt++;
                                
                        // category id 있는 경우(있던 row) -> UPDATE
                        } else {
                            console.log('yes id => Update Row, dtlId : ' + dtlId);
                            
                            dtlArr.push(dtlId);
                            updateSQL = "UPDATE `mvno_category_grp_lst_test` SET table_nm = '" + fileNm + "', column_nm = '" + columnNm + "', category_grp_dtl_nm = '" + dtlNm + "', category_grp_id = '" + "1" + "', category_grp_nm = '" + grpNm + "' WHERE category_grp_dtl_id = '" + dtlId +"';" ;
                            query = query + updateSQL;
                            uCnt++;
                        } 
                    }
                    
                    console.log('query : ' + query);
                                                
                    connection.query(query, function(error, rows) {
                        if (error) {
                            console.log("Admin - Update&Insert Err");
                            connection.rollback(function() {
                                connection.release();
                                console.error("Admin - Update&Insert Rollback Err");
                                throw error;
                            });
                            connection.release();
                            throw error;
                        } else {
                            
                            console.log('insert&update End -- iCnt : '+iCnt+', uCnt : '+uCnt);
                            
                            // 최종 Commit 처리
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
                                    console.log('Commit End ----- Insert:'+iCnt+', Update:'+uCnt+', Delete:'+dCnt);
                                    connection.release();
                                    res.send({uCnt:uCnt});
                                }
                            });
                        }
                    });
                    
                    // //2차 쿼리 묶음 : Delete (받아온 값에 기존값이 없다면)
                    // if(dtlArr.length>=1){
                    //     connection.query(delSQL, [dtlArr], function(error, rows) {
                    //         if (error) {
                    //             console.log("Admin - Delete Err");
                    //             connection.rollback(function() {
                    //                 connection.release();
                    //                 console.error("Admin - Delete Rollback Err");
                    //                 throw error;
                    //             });
                    //             connection.release();
                    //             throw error;
                    //         } else {
                    //             if (rows.length > 0){
                    //                 dCnt = rows.length;
                    //             }
                    //             console.log('delete End -- dCnt:' + dCnt);
                    //         }
                    //     });
                    // }

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