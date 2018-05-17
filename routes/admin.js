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

            var sql = 'SELECT c.category_grp_id, c.category_grp_nm, l.category_grp_dtl_id, l.category_grp_dtl_nm, l.column_nm, l.table_nm '
                    + 'FROM mvno_category_grp c, mvno_category_grp_lst l '
                    + 'WHERE c.category_grp_id = l.category_grp_id '
                    + 'ORDER BY l.category_grp_dtl_id;';
            
            var sqlGrp = 'SELECT category_grp_id, category_grp_nm FROM mvno_category_grp';


            connection.query(sqlGrp, function(error, grpRows) {
                if (error) {
                    connection.release();
                    throw error;
                } else {
                    // 카테고리목록 조회
                    connection.query(sql, function(error, rows) {
                        if (error) {
                            connection.release();
                            throw error;
                        }
                        else {
                            if (rows.length > 0) {
                                res.render('admin', {title: 'MOBIG', itemList : rows, session : req.session, grpRows : grpRows});
                                connection.release();
        
                            } else if (rows.length == 0){
                                console.log('no row');
                                res.render('admin', {title: 'MOBIG', session : req.session, grpRows : grpRows});
                                connection.release();
                            } else {
                               res.render('err', {title: 'MOBIG', itemList : null, session : req.session});
                                console.log('err');
                                connection.release();
                            }
                        }
                    });
                }

            });
        });
        
    });


    
    app.post('/execShell', function(req, res, next) {
        
        // SSH 통신
        var Client = require('ssh2').Client;
        var msg = ""; 
         
         
        var conn = new Client();
        conn.on('ready', function() {
          console.log('Client :: ready');
        //   conn.exec('su hdfs', function(err, stream) {
          conn.exec('su - hdfs -c "sh /user/mobig01/src/commonflow.sh"', function(err, stream) {
            if (err) throw err;
            stream.on('data', function(data) {
              console.log('STDOUT: ' + data);
              msg = msg + data;
              
            }).stderr.on('data', function(data) {
              console.log('STDERR: ' + data);
            }).on('close', function(code, signal) {
              console.log('STREAM END');
              conn.end();
              res.send({shNm : code});
            });
          });
        }).connect({
          host: '13.209.33.8',
          username: 'root',
          password: '#skcc2010'
        //   privateKey: require('fs').readFileSync('/here/is/my/key')
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
                    var uCnt = 0;
                    var iCnt = 0;
                    var dCnt = 0;
                    console.log('saveList.lengt : ' + saveList.length);
                    
                    var query = "";
                    var insertSQL = "";
                    var updateSQL = "";  
                    var delSQL = "DELETE FROM `mvno_category_grp_lst`";
                    var selectSQL = "SELECT category_grp_dtL_id FROM 'mvno_category_grp_lst' where category_grp_dtL_id not in (?)";
                    var dtlArr = [];              

                    connection.query(delSQL, [dtlArr], function(error, rows) {
                        if (error) {
                            console.log("Admin - Delete Err");
                            connection.rollback(function() {
                                connection.release();
                                console.error("Admin - Delete Rollback Err");
                                throw error;
                            });
                            connection.release();
                            throw error;
                        } else {
                            if (rows.affectedRows > 0){
                                dCnt = rows.affectedRows;
                                console.log('delete End -- dCnt : '+dCnt);
                            }
                            // 1차쿼리 : Insert or Update
                            for (var i=0;i<saveList.length;i++){
                                var fileNm = saveList[i].table_nm;
                                var columnNm = saveList[i].column_nm;
                                var dtlId = saveList[i].category_grp_dtl_id;
                                var dtlNm = saveList[i].category_grp_dtl_nm;
                                var grpId = saveList[i].category_grp_id;
                                var grpNm = saveList[i].category_grp_nm;
                                console.log('[' + fileNm + ',' + columnNm + ',' + dtlId + ',' + dtlNm + ',' + grpId + ',' + grpNm + ']');
                                
                                if(dtlId == 'undefined' || dtlId == null || dtlId == ''){
                                    insertSQL = "INSERT INTO `mvno_category_grp_lst` (table_nm, column_nm, category_grp_dtl_nm, category_grp_id, category_grp_nm) VALUES ('" + fileNm + "','" + columnNm + "','" + dtlNm + "','" + grpId + "','" + grpNm + "');";
                                } else {
                                    insertSQL = "INSERT INTO `mvno_category_grp_lst` (category_grp_dtl_id, table_nm, column_nm, category_grp_dtl_nm, category_grp_id, category_grp_nm) VALUES ('" + dtlId + "','" + fileNm + "','" + columnNm + "','" + dtlNm + "','" + grpId + "','" + grpNm + "');";                                    
                                }

                                query = query + insertSQL;
                                iCnt++;
                            }
                            
                            var log = query.split(";");
                            for (var i=0;i<log.length-1;i++){
                                console.log('query - ' + log[i]);
                            }
                                                        
                            connection.query(query, function(error, rows) {
                                if (error) {
                                    console.log("Admin - Insert Err");
                                    connection.rollback(function() {
                                        connection.release();
                                        console.error("Admin - Insert Rollback Err");
                                        throw error;
                                    });
                                    connection.release();
                                    throw error;
                                } else {
                                    console.log('insert End -- iCnt : '+iCnt);
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
                                                console.log('Commit End ----- Insert:'+iCnt+', Delete:'+dCnt);
                                                connection.release();
                                                res.send({uCnt:uCnt});
                                            }
                                        });   
                                            
                                            
                                }
                            });
                                    
                                    
                            
                        }
                    });
                }
            });    
        });
    });    
    
 
    /*
    // 그룹 삭제
    app.post('/deleteGrp', function(req, res, next) {
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
    */

  
};