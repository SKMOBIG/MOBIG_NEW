module.exports = function(app, connectionPool) {
    
    app.get('/admin', function(req, res) {
        var sess = req.session
        
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        else{
            res.render('admin', { title: 'MOBIG', session : req.session });
        }
        
    });

    // 처음 화면 조회
    app.get('/getAdminList', function(req, res, next) {

        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        
        connectionPool.getConnection(function(err, connection) {

            var sql = '';
            sql = 'SELECT c.category_grp_id, c.category_grp_nm, l.category_grp_dtl_id, l.category_grp_dtl_nm, l.column_nm '
                    + 'FROM mvno_category_grp c, mvno_category_grp_lst l '
                    + 'WHERE c.category_grp_id = l.category_grp_id '
                    + 'ORDER BY c.category_grp_id, l.category_grp_dtl_id;';
                    
            // 카테고리목록 조회
            connection.query(sql, function(error, rows) {
                if (error) {
                    connection.release();
                    throw error;
                }
                else {
                    if (rows.length >= 0) {
                        var itemList='';
                        var categoryId = 0;
                        
                        // 아이템태그 생성
                        for(var i=0; i<rows.length; i++){
                            // 그룹명, 아이템 Tag 설정
                            var grpTag = "<li class=\"dd-item\"><div class=\"dd-handle\" id=\"grp" + rows[i].category_grp_id + "\"><span><i class=\"fa fa-cog m-r-xs\"></i></span>" 
                                            + rows[i].category_grp_nm + "<span class=\"pull-right\"><a href=\"#\" onClick=\"addItem(" + rows[i].category_grp_id + ",'" 
                                            + rows[i].category_grp_nm + "');\">추가</a> | <a href=\"#\" onClick=\"editItem(" + rows[i].category_grp_id + "," 
                                            + rows[i].category_grp_dtl_id + ");\">편집</a> | <a href=\"javascript:deleteItem();\">삭제</a></span></div><ol class=\"dd-list\">";
                            var dtlTag = "<li class=\"dd-item\" id=\"\"><div class=\"dd-handle\" id=\"dtl" + rows[i].category_grp_id + "\">" + rows[i].category_grp_dtl_nm + " - " 
                                            + rows[i].column_nm + "<span class=\"pull-right\"><a href=\"#\" onClick=\"editItem(" + rows[i].category_grp_id + ","
                                            + rows[i].category_grp_dtl_id + ");\">편집</a> | <a href=\"javascript:deleteItem();\">삭제</a></span></div></li>" ;
                            
                            // 그룹명 Tag 추가
                            if(categoryId != rows[i].category_grp_id){
                                if(i==0){  // 첫그룹인 경우 - 그룹 Tag만 추가
                                    itemList += grpTag;
                                } else {   // 그룹 종료 + 다음 그룹 Tag 추가
                                    itemList += "</ol></li>" + grpTag;
                                }
                                categoryId = rows[i].category_grp_id;
                            }
                            // 아이템 Tag 추가
                            itemList += dtlTag;
                            
                            // 마지막 아이템이면 종료tag 닫아준다
                            if(i == rows.length-1){
                                // 아이템 종료tag
                                itemList += "" 
                            }
                        }

                        //console.log("itemList=" + itemList);
                        
                        res.send({itemList : itemList, session : req.session});
                        connection.release();
                        console.log('good');
                    }
                    else {
                        res.send({itemList : null, session : req.session});
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
    app.post('/saveItem', function(req, res, next) {
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
                    var grpId = req.body.grpId;
                    var grpNm = req.body.grpNm;
                    var dtlNm = req.body.dtlNm;
                    var colNm = req.body.colNm;
                    
                    console.log("grpId : " + grpId + ", grpNm : " + grpNm + ", dtlNm : " + dtlNm + ", colNm : " + colNm);
                    
                    var selectYN = "";
                    var updateItem = "";
                    var insertItem = "insert into mvno_category_grp_lst(category_grp_id, category_grp_dtl_nm, category_grp_dtl_id, table_nm, column_nm)  values (?, ?, ?, 'Admin Data', ?);";
                    var selectNewDtlId = "SELECT IFNULL((SELECT MAX(category_grp_dtl_id) FROM mvno_category_grp_lst WHERE category_grp_id = ?), 0)+1 AS dtlId FROM DUAL;";

                    connection.query(selectNewDtlId, grpId, function(error, rows1) {
                        if(error){
                            connection.release();
                            throw error;
                        } else {
                            if(rows1.length >= 0){
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
                                                            console.log('insert completed');
                                                            connection.release();
                                                        }
                                                    });
                                            }else {
                                                console.log('??');
                                                connection.release();
                                            }    
                                        }
                                    });   
                            }else {
                                res.render('error', { title: 'MOBIG', session : req.session });
                                connection.release();
                            }
                        }
                    });
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