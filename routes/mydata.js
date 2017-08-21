module.exports = function(app, connectionPool) {
    
    app.get('/mydata', function(req, res) {
        
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        } else {
            // 이하 페이징 
            var cntPerPage = 10;
            var page = req.param('page');
            if (page == null) { page = 1 ; }
            var start = cntPerPage * ( page - 1) + 1 ; 
    
    
    
            var user_id = req.session.user_id;
            console.log('/mydata', user_id, page);
    
            // 해당유저의 요청테이블 조회(+유저명, 데이터명 Join, +결과테이블에 없으면 0 넘김)
            // rslt_data 수정 필요
            connectionPool.getConnection(function(err, connection) {
                var query = 'SELECT a.*, b.user_name, \
                            (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst WHERE category_grp_dtl_id=a.category_grp_dtl_id1) category_grp_dtl_nm1, \
                            (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst WHERE category_grp_dtl_id=a.category_grp_dtl_id2) category_grp_dtl_nm2, \
                            (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst WHERE category_grp_dtl_id=a.category_grp_dtl_id3) category_grp_dtl_nm3, \
                            (SELECT COUNT(*) FROM rslt_data m WHERE m.req_id=a.req_id) AS num \
                            FROM mvno_req_data a, user b WHERE a.user_id= ? AND a.user_id = b.id ORDER BY a.req_id desc LIMIT ? OFFSET ?;';
                connection.query(query, [user_id, cntPerPage, start], function(error, rows) {
                    if (error) throw error;
                    else {
                        // 쿼리 결과가 있다면,
                        if (rows.length > 0) {
                            
                            // 총개수 파악
                            var queryCnt = 'SELECT count(*) cnt FROM mvno_req_data WHERE user_id = ?;';
                            connection.query(queryCnt, user_id, function(error2, rowsCnt) {
                                    if (error2) throw error2;
                                    else {
                                        
                                        // 아이템이름, 날짜포맷 정리
                                        var grpId = new Array(rows.length);                        
                                        for (var i=0; i<rows.length; i++){
                                            grpId[i] = new Array();
                                            if (rows[i].category_grp_dtl_nm1 != null){grpId[i][0] = rows[i].category_grp_dtl_nm1;}
                                            if (rows[i].category_grp_dtl_nm2 != null){grpId[i][1] = rows[i].category_grp_dtl_nm2;}
                                            if (rows[i].category_grp_dtl_nm3 != null){grpId[i][2] = rows[i].category_grp_dtl_nm3;}
                                            rows[i].req_dtm = rows[i].req_dtm.substring(0,4) + ". " + rows[i].req_dtm.substring(4,6) + ". " + rows[i].req_dtm.substring(6,8)
                                            + ". " + rows[i].req_dtm.substring(8,10) + ":" + rows[i].req_dtm.substring(10,12) + ":" + rows[i].req_dtm.substring(12,14);
                                        }
                                        // 한방에 렌더
                                        res.render('mydata', { title: 'MOBIG', req_list: rows, session: req.session, grpId: grpId,
                                                                page: page, cntPerPage: cntPerPage, start: start, cnt: rowsCnt });
                                        connection.release();
                                        }
                            });
    
                        } else {
                            res.redirect('/');
                            connection.release();
                        }
                    }
                });
        
            });
        }        
    });

};