module.exports = function(app, connectionPool) {
    
    app.get('/', function(req, res) {
        var sess = req.session
        
        if(sess.views) {
            res.render('index', { title: 'MOBIG', session : req.session });    
        }else {
            res.render('landing', { title: 'MOBIG', session : req.session });  
        }
        
    });
    
    app.get('/index', function(req, res) {
        goIndex(req, res);
    });
    
    app.get('/login', function(req, res) {
        var sess = req.session
        res.render('login', { title: 'MOBIG', session : req.session });
    });

    app.post('/login', findUser, (req, res, next) => {
        if(req.user.length > 0) {
            
            /* session 내에 사용자 정보 저장 */
            req.session.regenerate(function (err) {
              if(err){
                console.log(err);
              } else {
                req.session.user_name = req.user[0].user_name;
                req.session.emp_num = req.user[0].emp_num;
                req.session.user_id = req.user[0].id;
                
                goIndex(req, res);
                
                console.log("login:" + req.session.user_name);
              }
            });
        }else {
            res.redirect('/');
        }
    });
    app.get('/logout', function(req, res, next) {
        console.log("logout:" + req.session.user_name);
        req.session.destroy(function(err){
            // 세션 정보 파괴
            res.redirect('/');
        })
    });
    function findUser(req, res, next) {
        connectionPool.getConnection((err, connection) => {
            connection.query('select user_name, emp_num, id from user' +
                             ' where 1=1 and user_name = ? and emp_num = ?;', [req.body.user_name, req.body.emp_num], function(error, rows) {
                if(error) {
                    connection.release();
                    next(new Error("route findUser error: " + error));
                }else {
                    if(rows.length > 0) {
                        connection.release();
                        req.user = rows;    
                        next();
                    }else {
                        next('route');
                    }
                }
            });
        });
    }
    
    
    app.get('/error', function(req, res) {
        var sess = req.session
        res.render('error', { title: 'MOBIG', session : req.session });    
    });
    
    
    function goIndex(req, res) {
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        } else {
            connectionPool.getConnection((err, connection) => {
                var query = 'SELECT a.*, b.user_name, \
                    (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst WHERE category_grp_dtl_id=LPAD(a.category_grp_dtl_id1, 3, 0)) category_grp_dtl_nm1, \
                    (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst WHERE category_grp_dtl_id=LPAD(a.category_grp_dtl_id2, 3, 0)) category_grp_dtl_nm2, \
                    (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst WHERE category_grp_dtl_id=LPAD(a.category_grp_dtl_id3, 3, 0)) category_grp_dtl_nm3, \
                    (SELECT COUNT(*) FROM rslt_data m WHERE m.req_id=a.req_id) AS num \
                    FROM mvno_req_data a, user b WHERE a.user_id = b.id ORDER BY a.req_id desc LIMIT 5 OFFSET 0;';
                connection.query(query, req.session.user_id, function(error, rows) {
                    if(error) {
                        connection.release();
                    }else {
                        console.log(req.session.user_id);
                        if(rows.length > 0) {
                            // 아이템이름, 날짜포맷 정리
                            var grpId = new Array(rows.length);                        
                            for (var i=0; i<rows.length; i++){
                                grpId[i] = new Array();
                                if (rows[i].category_grp_dtl_nm1 != null){grpId[i][0] = rows[i].category_grp_dtl_nm1;}
                                if (rows[i].category_grp_dtl_nm2 != null){grpId[i][1] = rows[i].category_grp_dtl_nm2;}
                                if (rows[i].category_grp_dtl_nm3 != null){grpId[i][2] = rows[i].category_grp_dtl_nm3;}
                                rows[i].req_dtm = rows[i].req_dtm.substring(0,4) + ". " + rows[i].req_dtm.substring(4,6) + ". " + rows[i].req_dtm.substring(6,8) + ". ";
                            }
                                // 한방에 렌더
                            res.render('index', { title: 'MOBIG', req_list: rows, session: req.session, grpId: grpId});
                            connection.release();
                        } else {
                            res.render('index', { title: 'MOBIG', session : req.session });
                        }
                    }
                });
            });
        }
    }
    
};    
