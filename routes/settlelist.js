module.exports = function(app, connectionPool) {
    
    app.get('/settlelist', function(req, res) {
        
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        } else {
            // 이하 페이징 
            var cntPerPage = 10;
            var page = req.param('page');
            if (page == null) { page = 1 ; }
            var start = cntPerPage * ( page - 1) ; 
    
    
            var user_id = req.session.user_id;
            console.log('/settlelist', user_id, page);
    
            // 해당유저의 요청테이블 조회(+유저명, 데이터명 Join, +결과테이블에 없으면 0 넘김)
            connectionPool.getConnection(function(err, connection) {

                var query = 'SELECT a.settl_pdct_req_num, a.fst_crtr_id, DATE_FORMAT(a.fst_cre_dtm, "%Y. %m. %d. %H:%i:%s") fst_cre_dtm, a.co_settl_grp_id, \
                            CASE a.co_settl_grp_id WHEN "1" THEN "유형1선불" WHEN "2" THEN "유형2후불" WHEN "4" THEN "유형1후불" WHEN "7" THEN "유형1DATA" ELSE 0 END co_settl_grp_nm, \
                            a.settl_pdct_prd, a.op_proc_st_cd, b.user_name \
                            FROM stl_pdct_req_spc a, user b WHERE a.fst_crtr_id = b.id AND a.fst_crtr_id = ? ORDER BY a.settl_pdct_req_num desc LIMIT ? OFFSET ?;';
                            
                connection.query(query, [user_id, cntPerPage, start], function(error, rows) {
                    if (error) throw error;
                    else {
                        // 쿼리 결과가 있다면,
                        if (rows.length > 0) {
                            
                            // 총개수 파악
                            var queryCnt = 'SELECT count(*) cnt FROM stl_pdct_req_spc WHERE fst_crtr_id = ?;';
                            connection.query(queryCnt, user_id, function(error2, rowsCnt) {
                                    if (error2) throw error2;
                                    else {
                                        res.render('settlelist', { title: 'Prediction', req_list: rows, session: req.session, 
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