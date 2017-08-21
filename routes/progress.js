module.exports = function(app, connectionPool) {
    
    // app.get('/progress', function(req, res) {
    //     var sess = req.session
        
    //     /* session 없을 땐 로그인 화면으로 */
    //     if (!req.session.user_name) {
    //         res.redirect('login');
    //     }
    //     else{
    //         res.render('progress', { title: 'MOBIG', session : req.session });
    //     }
        
    // });

    app.get('/progress/:id', function(req, res, next) {

        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('../login');
        }
        else{
            
            console.log('/progress/', req.params.id);
    
            connectionPool.getConnection(function(err, connection) {
                var query = 'SELECT a.*, b.user_name, \
                            (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst WHERE category_grp_dtl_id=LPAD(a.category_grp_dtl_id1, 3, 0)) category_grp_dtl_nm1, \
                            (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst WHERE category_grp_dtl_id=LPAD(a.category_grp_dtl_id2, 3, 0)) category_grp_dtl_nm2, \
                            (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst WHERE category_grp_dtl_id=LPAD(a.category_grp_dtl_id3, 3, 0)) category_grp_dtl_nm3  \
                            FROM mvno_req_data a, user b WHERE a.req_id= ? AND a.user_id = b.id;';
                connection.query(query, req.params.id, function(error, rows) {
                    if (error) {
                        res.render('error', { title: 'MOBIG', session : req.session });
                        connection.release();
                        throw error;
                    }
                    else {
                        if (rows.length == 1) {
                            var grpId = new Array();      
                            
                            if (rows[0].category_grp_dtl_nm1 != null){grpId[0] = new Array(); grpId[0][1] = rows[0].category_grp_dtl_nm1; grpId[0][0] = rows[0].table_nm1;}
                            if (rows[0].category_grp_dtl_nm2 != null){grpId[1] = new Array(); grpId[1][1] = rows[0].category_grp_dtl_nm2; grpId[1][0] = rows[0].table_nm2;}
                            if (rows[0].category_grp_dtl_nm3 != null){grpId[2] = new Array(); grpId[2][1] = rows[0].category_grp_dtl_nm3; grpId[2][0] = rows[0].table_nm3;}
                            rows[0].req_dtm = rows[0].req_dtm.substring(0,4) + ". " + rows[0].req_dtm.substring(4,6) + ". " + rows[0].req_dtm.substring(6,8)
                            + ". " + rows[0].req_dtm.substring(8,10) + ":" + rows[0].req_dtm.substring(10,12) + ":" + rows[0].req_dtm.substring(12,14);
                            
                            res.render('progress', { req_data: rows[0],session: req.session, grpId:grpId });
                            connection.release();
                        }
                        else {
                            res.render('error', { title: 'MOBIG', session : req.session });
                            connection.release();
                        }
                    }
                });
            });
        }


    });
    

};