module.exports = function(app, connectionPool) {
    
    app.get('/mvnodata', function(req, res) {
        var sess = req.session
        
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        else{
            res.render('mvnodata', { title: 'MOBIG', session : req.session });
        }
        
    });

    app.get('/getCategory', function(req, res, next) {

        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        
        connectionPool.getConnection(function(err, connection) {

            var sqlStr = '';
            sqlStr = "SELECT category_grp_id, category_grp_nm, category_grp_ui FROM mvno_category_grp ORDER BY category_grp_id;";
            
            // 카테고리목록 조회
            connection.query(sqlStr, function(error, rows) {
                if (error) {
                    connection.release();
                    throw error;
                }
                else {
                    if (rows.length >= 0) {
                        var categoryList='';
                        
                        // 카테고리
                        for(var i=0; i<rows.length; i++){
                            categoryList += "<div class=\"col-md-2\"><i class=\"" + rows[i].category_grp_ui + "\" aria-hidden=\"true\" onClick=\"getCategory('" + rows[i].category_grp_id + "')\"></i><h3>" + rows[i].category_grp_nm + "</h3></div>"
                        }
                        // console.log("categoryList=" + categoryList);
                        
                        res.send({categoryList : categoryList, session : req.session});
                        connection.release();

                    }
                    else {
                        res.send({categoryList : null, session : req.session});
                        connection.release();
                    }
                }
            });
        });
        
    });
    
    app.get('/getItem', function(req, res, next) {

        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        
        connectionPool.getConnection(function(err, connection) {

            var sql = '';
            sql = 'SELECT c.category_grp_id, c.category_grp_nm, l.category_grp_dtl_id, l.category_grp_dtl_nm '
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
                        
                        // 카테고리
                        for(var i=0; i<rows.length; i++){
                            
                            // 카테고리 별로 아이템을 가져오기 위해 카테고리id로 식별
                            if(categoryId != rows[i].category_grp_id){
                                
                                if(i==0){
                                    // 아이템 헤더tag
                                    itemList += "<div class=\"col-md-4\"><div class=\"card \"><div class=\"bg-primary card-block\"><h1 class=\"card-title text-white\">" + rows[i].category_grp_nm + "</h1></div><ul class=\"list-group list-group-flush \">";
                                } else {
                                    // 아이템 종료tag + 헤더tag
                                    itemList += "</ul></div></div>" 
                                                + "<div class=\"col-md-4\"><div class=\"card \"><div class=\"bg-primary card-block\"><h1 class=\"card-title text-white\">" + rows[i].category_grp_nm + "</h1></div><ul class=\"list-group list-group-flush \">";
                                }
                                
                                categoryId = rows[i].category_grp_id;
                            }
                            
                            // 아이템 본문tag
                            itemList += "<li class=\"list-group-item\"><button onClick=\"javascript:addItem('" +rows[i].category_grp_dtl_id + "', '" + rows[i].category_grp_dtl_nm + "')\">" + rows[i].category_grp_dtl_nm + "</button></li>";
                            
                            // 마지막 아이템이면 종료tag 닫아준다
                            if(i == rows.length-1){
                                // 아이템 종료tag
                                itemList += "</ul></div></div>" 
                            }
                        }

                        //console.log("itemList=" + itemList);
                        
                        res.send({itemList : itemList, session : req.session});
                        connection.release();

                    }
                    else {
                        res.send({itemList : null, session : req.session});
                        connection.release();
                    }
                }
            });
        });
        
    });
    
    app.post('/checkout', function(req, res, next) {
        
       connectionPool.getConnection(function(err, connection) {
            connection.beginTransaction(function(err) {
                if(err) {
                    connection.release();
                    throw err;
                }
                else {
                    var itemArray = req.body.items;
                    
                    // console.log('itemArray=', itemArray);
                    
                    if (itemArray != null && itemArray.length > 0) {
                        
                        // sql구문 생성
                        // column = "(user_id, req_dtm, category_grp_dtl_id1, table_nm1, column_nm1,item_nm1,category_grp_dtl_id2, table_nm2, column_nm2,item_nm2, category_grp_dtl_id3, table_nm3, column_nm3,item_nm3, sta_ym, end_ym)";
                        var sqlStr = "insert into mvno_req_data ";
                        var colStr =  "(user_id, req_dtm, "; 
                    
                        for(var i=1; i<=itemArray.length; i++) {
                            colStr += "category_grp_dtl_id" + i + ", " + "table_nm" + i + ", " + "column_nm" + i + ", " + "item_nm" + i + ", ";
                        }
                        colStr += "sta_ym, end_ym, req_st) ";
                        
                        var valStr = "VALUES (" + req.session.user_id + ", date_format(sysdate(), \"%Y%m%d%H%i%s\"), ";
                        for(var i=1; i<=itemArray.length; i++) {
                            valStr += itemArray[i-1] + ", " + "TBNAME(" + itemArray[i-1] + "), " + "CLNAME(" + itemArray[i-1] + "), " + "NULL,"; // TO-DO: item상세조건 입력받아 고칠것
                        }
                        valStr += "'20170101','20170631', 'REQ');"; // TO-DO: 날짜조건 입력받아 고칠것
                        
                        sqlStr = sqlStr + colStr + valStr;
                        // console.log(sqlStr);
                    }
                    
                    connection.query(sqlStr,
                    [], function(error, rows) { 
                        if(error) {
                            console.log("insert ERROR!!!!!!!!!");
                            connection.rollback(function() {
                                connection.release();
                                console.error("insert rollback error");
                                throw error;
                            });
                            connection.release();
                            throw error;
                        }else {
                            // console.log("rows:" + rows.affectedRows);
                            
                            if(rows.affectedRows > 0) {
                                    connection.commit(function(err) {
                                        if(err) {
                                            console.error("insert mvno_req_data commit error : " + err);
                                            connection.rollback(function() {
                                                connection.release();
                                                console.error("insert mvno_req_data rollback error");
                                                throw error;
                                            });
                                        }
                                        else{
                                            connection.query('select LAST_INSERT_ID() as req_id from dual;', function(error, rows1) {
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