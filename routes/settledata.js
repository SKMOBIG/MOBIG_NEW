module.exports = function(app, connectionPool) {
    
    app.get('/settledata', function(req, res) {
        var sess = req.session
        
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        else{
            res.render('settledata', { title: 'MOBIG', session : req.session });
        }
    });
    
    
    app.get('/getSettleCategory', function(req, res, next) {

        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        
        connectionPool.getConnection(function(err, connection) {

            var sqlStr = '';
            sqlStr = "SELECT category_grp_id, category_grp_nm, category_grp_ui, category_grp_desc FROM mvno_category_grp where use_yn = 'Y' ORDER BY category_grp_id;";
            
            // 카테고리목록 조회
            connection.query(sqlStr, function(error, rows) {
                if (error) {
                    connection.release();
                    throw error;
                }
                else {
                    var categoryList = "";
                    if (rows.length >= 0) {

                        res.send({categoryList : rows, session : req.session});
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
    
    
    app.get('/getSettleItem', function(req, res, next) {

        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        
        connectionPool.getConnection(function(err, connection) {

            var sql = '';
            sql = "SELECT c.category_grp_id, c.category_grp_nm, l.category_grp_dtl_id, l.category_grp_dtl_nm "
                    + "FROM mvno_category_grp c, mvno_category_grp_lst l "
                    + "WHERE c.category_grp_id = l.category_grp_id and c.use_yn = 'Y'"
                    + "ORDER BY c.category_grp_id, l.category_grp_dtl_id;";
                    
            // 카테고리목록 조회
            connection.query(sql, function(error, rows) {
                if (error) {
                    connection.release();
                    throw error;
                }
                else {
                    if (rows.length >= 0) {
                        //console.log("getItem==>"+rows);
                        var itemList='';
                        var categoryId = 0;
                        
                        // 카테고리
                         for(var i=0; i<rows.length; i++){
                            
                            // 카테고리 별로 아이템을 가져오기 위해 카테고리id로 식별
                            if(categoryId != rows[i].category_grp_id){
                                
                                if(i==0){
                                    // 아이템 헤더tag
                                    //itemList += "<div class=\"col-md-4\"><div class=\"card \"><div class=\"bg-primary card-block\"><h1 class=\"card-title text-white\">" + rows[i].category_grp_nm + "</h1></div><ul class=\"list-group list-group-flush \">";
                                    itemList += "<div class=\"col-md-4\"><div class=\"panel panel-filled\"><div class=\"panel-heading\"><div class=\"panel-tools\"><a class=\"panel-toggle\"><i class=\"fa fa-chevron-up\"></i></a>"
                                    +"<a class=\"panel-close\"><i class=\"fa fa-times\"></i></a></div><h5 class=\"m-b-none\"><a href=\"\">" 
                                    + rows[i].category_grp_nm + "</a></h5></div><div class=\"panel-body buttons-margin\"><div>";
                                    
                                } else {
                                    // 아이템 종료tag + 헤더tag
                                    // itemList += "</ul></div></div>" 
                                    //             + "<div class=\"col-md-4\"><div class=\"card \"><div class=\"bg-primary card-block\"><h1 class=\"card-title text-white\">" + rows[i].category_grp_nm + "</h1></div><ul class=\"list-group list-group-flush \">";
                                    itemList += "</div></div></div></div><div class=\"col-md-4\"><div class=\"panel panel-filled\"><div class=\"panel-heading\"><div class=\"panel-tools\"><a class=\"panel-toggle\"><i class=\"fa fa-chevron-up\"></i></a>"
                                    +"<a class=\"panel-close\"><i class=\"fa fa-times\"></i></a></div><h5 class=\"m-b-none\"><a href=\"\">" 
                                    + rows[i].category_grp_nm + "</a></h5></div><div class=\"panel-body buttons-margin\"><div>";
                                    
                                    
                                }
                                
                                categoryId = rows[i].category_grp_id;
                            }
                            
                            // 아이템 본문tag
                            //itemList += "<li class=\"list-group-item\"><button onClick=\"javascript:addItem('" +rows[i].category_grp_dtl_id + "', '" + rows[i].category_grp_dtl_nm + "')\">" + rows[i].category_grp_dtl_nm + "</button></li>";
                            itemList += "<button type=\"button\" class=\"btn btn-default\" onClick=\"addItem('" +rows[i].category_grp_dtl_id + "', '" + rows[i].category_grp_dtl_nm + "')\">" + rows[i].category_grp_dtl_nm + "</button>";
                            
                            
                            // 마지막 아이템이면 종료tag 닫아준다
                            if(i == rows.length-1){
                                // 아이템 종료tag
                                //itemList += "</ul></div></div>" 
                                itemList += "</div></div></div></div>"   
                                
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
    
    
    app.post('/reqPrediction', function(req, res, next) {
        
        // SSH 통신
        // var Client = require('ssh2').Client;
        // var msg = ""; 
        
        var userId = req.session.user_id;
        var settlGrp = req.body.settlGrp;
        var period = req.body.period;
        var reqNum;
        
        // var conn = new Client();
        
        console.log('settlGrp =', settlGrp);
        console.log('months =', period);
        
        
        connectionPool.getConnection(function(err, connection) {
            connection.beginTransaction(function(err) {
                if(err) {
                    connection.release();
                    throw err;
                }
                else {

                    if (settlGrp[0] != null) {
                        
                        // sql구문 생성
                        var sqlStr = "insert into mobig.stl_pdct_req_spc ";
                        var colStr =  "(fst_crtr_id, fst_cre_dtm, audit_id, audit_dtm, chg_cnt, co_settl_grp_id, settl_pdct_prd, op_proc_st_cd) "; 

                        var valStr = "VALUES (" + userId + ", date_format(sysdate(), \"%Y%m%d%H%i%s\"), "+ userId + ", date_format(sysdate(), \"%Y%m%d%H%i%s\"), 0, "
                                                + settlGrp[0] + ", " + period + ", 'WAI')"
       
                        sqlStr = sqlStr + colStr + valStr;
                        // console.log(sqlStr);
                    }
                    
                    connection.query(sqlStr, [], function(error, rows) {
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
                                            console.error("insert stl_pdct_req_spc commit error : " + err);
                                            connection.rollback(function() {
                                                connection.release();
                                                console.error("insert stl_pdct_req_spc rollback error");
                                                throw error;
                                            });
                                        }
                                        else{
                                            // connection.query('select LAST_INSERT_ID() as req_id from mobig.stl_pdct_req_spc;', function(error, rows1) {
                                            connection.query('select a.settl_pdct_req_num, a.co_settl_grp_id, a.settl_pdct_prd, a.op_proc_st_cd ' 
                                                            +'from mobig.stl_pdct_req_spc a where a.settl_pdct_req_num = (select max(LAST_INSERT_ID ()) from mobig.stl_pdct_req_spc);', function(error, rows1) {
                                                if(error){
                                                    connection.release();
                                                    throw error;
                                                }else {
                                                    if(rows1.length >= 0){
                                                        reqNum = rows1[0].settl_pdct_req_num;
                                                        console.log('reqNum='+reqNum);
                                                         
                                                        res.send({datas : rows1[0]});
                                                        connection.release();
                                                    }else {
                                                        
                                                        res.render('error', { title: 'Prediction', session : req.session });
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
    
    
    app.post('/execPython', function(req, res, next) {
        
        // SSH 통신
        var Client = require('ssh2').Client;
        var msg = ""; 
        console.log('Trace1');
        
        // var userId = req.session.user_id;
        var settlGrp = req.body.settlGrp;
        var period = req.body.period;
        var reqId = req.body.reqId;
        
        var conn = new Client();
        
        console.log('settlGrp2 =', settlGrp);
        console.log('months2 =', period);

        conn.on('ready', function() {
        console.log('Client :: ready');
        //   conn.exec('su hdfs', function(err, stream) {
            console.log('log 2');
            conn.exec('su - hdfs -c "python3 /user/mobig01/src/etc/ts_predict.py ' + settlGrp[0] + ' ' + period + ' ' + reqId + '"', function(err, stream) {
                if (err) {
                    console.log('error - ' + err);
                    throw err;
                }
                stream.on('data', function(data) {
                  console.log('OUTPUT: ' + data);
                });
                stream.on('end', function(data) {
                  console.log('STREAM END - ' + data);
                  res.send({msg : data});
                });
                stream.on('close', function(){
                    console.log('strend');
                    conn.end();
                })
            });
        }).connect({
            host: '13.209.33.8',
            username: 'root',
            password: '#skcc2010'
        //   privateKey: require('fs').readFileSync('/here/is/my/key')
        });
    });  
    
    
    app.post('/prediction', function(req, res, next) {
        
        // def python-shell
        var PythonShell = require('python-shell');  
        
        var itemArray = req.body.items;
        var months = req.body.months;
        
        console.log('itemArray=', itemArray);
        console.log('months=', months);
        
        var flag;
        
        var options = {
            mode: 'text',
            pythonPath: '/usr/bin/python3',
            pythonOptions: ['-u'],
            scriptPath: '',
            args: [itemArray, months]
        };
        
        // run python
        PythonShell.run('./python/prediction.py', options, function (err, result){
            if (err) throw err;
            
            // falg = result[2];
            
            // results
            console.log('results: %j', result);
            console.log('results: %j', flag);
            // res.render('showResults', {data : result});
        });
        
       connectionPool.getConnection(function(err, connection) {
            connection.beginTransaction(function(err) {
                if(err) {
                    connection.release();
                    throw err;
                }
                else {
                    var itemArray = req.body.items;
                    var months = req.body.months;
                    
                    console.log('itemArray=', itemArray);
                    console.log('months=', months);
                    connection.release();
                    
                    // if (itemArray != null && itemArray.length > 0) {
                        
                    //     // sql구문 생성
                    //     // column = "(user_id, req_dtm, category_grp_dtl_id1, table_nm1, column_nm1,item_nm1,category_grp_dtl_id2, table_nm2, column_nm2,item_nm2, category_grp_dtl_id3, table_nm3, column_nm3,item_nm3, sta_ym, end_ym)";
                    //     var sqlStr = "insert into mvno_req_data ";
                    //     var colStr =  "(user_id, req_dtm, "; 
                    
                    //     for(var i=1; i<=itemArray.length; i++) {
                    //         colStr += "category_grp_dtl_id" + i + ", " + "table_nm" + i + ", " + "column_nm" + i + ", " + "item_nm" + i + ", ";
                    //     }
                    //     colStr += "sta_ym, end_ym, req_st) ";
                        
                    //     var valStr = "VALUES (" + req.session.user_id + ", date_format(sysdate(), \"%Y%m%d%H%i%s\"), ";
                    //     for(var i=1; i<=itemArray.length; i++) {
                    //         valStr += itemArray[i-1] + ", " + "TBNAME(" + itemArray[i-1] + "), " + "CLNAME(" + itemArray[i-1] + "), " + "NULL,"; // TO-DO: item상세조건 입력받아 고칠것
                    //     }
                    //     valStr += "'20170101','20170631', 'REQ');"; // TO-DO: 날짜조건 입력받아 고칠것
                        
                    //     sqlStr = sqlStr + colStr + valStr;
                    //     // console.log(sqlStr);
                    // }
                    
                    // connection.query(sqlStr,
                    // [], function(error, rows) { 
                    //     if(error) {
                    //         console.log("insert ERROR!!!!!!!!!");
                    //         connection.rollback(function() {
                    //             connection.release();
                    //             console.error("insert rollback error");
                    //             throw error;
                    //         });
                    //         connection.release();
                    //         throw error;
                    //     }else {
                    //         // console.log("rows:" + rows.affectedRows);
                            
                    //         if(rows.affectedRows > 0) {
                    //                 connection.commit(function(err) {
                    //                     if(err) {
                    //                         console.error("insert mvno_req_data commit error : " + err);
                    //                         connection.rollback(function() {
                    //                             connection.release();
                    //                             console.error("insert mvno_req_data rollback error");
                    //                             throw error;
                    //                         });
                    //                     }
                    //                     else{
                    //                         connection.query('select LAST_INSERT_ID() as req_id from dual;', function(error, rows1) {
                    //                             if(error){
                    //                                 connection.release();
                    //                                 throw error;
                    //                             }else {
                    //                                 if(rows1.length >= 0){
                    //                                     res.send({datas : rows1[0], session : req.session});
                    //                                     connection.release();
                    //                                 }else {
                    //                                     res.render('error', { title: 'MOBIG', session : req.session });
                    //                                     connection.release();
                    //                                 }
                    //                             }
                    //                         });
                    //                     }
                    //                 });
                                
                                
                    //         }else {
                    //             console.log('??');
                    //             connection.release();
                    //         }    
                    //     }
                    // });   
                
                }
                
            });    
        });
    }); 
    
};

