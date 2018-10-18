module.exports = function(app, connectionPool) {

    app.get('/recommendprod/logout', function(req, res, next) {
        console.log("logout:" + req.session.user_name);
        req.session.destroy(function(err){
            // 세션 정보 파괴
            res.redirect('/');
        })
    });
    
   
    app.get('/recommendprod', function(req, res) {
        
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        } else {
            var user_id = req.session.user_id;
            res.render('recommendprod', { title: 'Recommend', session: req.session});
        }        
    });
    
    
    app.post('/searchProdInfo', function(req, res, next) {
        
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        } else{
            
            var userId = req.session.user_id;
            var prodId = req.body.prodId;
    
            connectionPool.getConnection(function(err, connection) {
                connection.beginTransaction(function(err) {
                    if(err) {
                        connection.release();
                        throw err;
                    }
                    else {
    
                        if (prodId != null) {
                            
                            var sqlStr = "SELECT MVNO_CO_CD, PROD_ID, PROD_NM, FEE_ITM_AMT, VOICE_OFR_CTT, SMS_OFR_CTT, DATA_OFR_CTT, SEL_AGRMT_DC_AMT, AGRMT_DC_AMT_12, AGRMT_DC_AMT_24, \
                                                 FEE_ITM_AMT-(SEL_AGRMT_DC_AMT+CASE WHEN AGRMT_DC_AMT_24 = 0 THEN AGRMT_DC_AMT_12 WHEN AGRMT_DC_AMT_24 > 0 THEN AGRMT_DC_AMT_24 END) REAL_FEE_AMT, \
                                                 CASE WHEN USIM_ONLY_YN = '0' \
                                                      THEN 'No' \
                                                      WHEN USIM_ONLY_YN = '1' \
                                                      THEN 'YES' \
                                                       END AS USIM_YN, NW_CD, \
                                                 CASE WHEN MVNO_CO_CD = 'M00035' \
                                                      THEN 'SK텔링크' \
                                                      WHEN MVNO_CO_CD = 'M00175' \
                                                      THEN '프리텔레콤' \
                                                      WHEN MVNO_CO_CD = 'M00185' \
                                                      THEN 'CJ헬로' \
                                                      ELSE '에넥스텔레콤' \
                                                      END AS MVNO_NM \
                                            FROM prod_strd_info \
                                           WHERE PROD_ID = ? \
                                           ORDER BY MVNO_CO_CD, PROD_ID"
                                           ;
                        }
                        
                        connection.query(sqlStr, [prodId], function(error, rows) {
                            if(error) {
                                connection.release();
                                throw error;
                            }else {
                                // console.log(rows);
                                if(rows.length >= 0){
                                    
                                    var sqlStr2 = "select d.mvno_co_cd, d.prod_id, d.prod_nm, d.user_cnt, t.total_cnt, \
                                                          round((d.user_cnt/t.total_cnt*100),2) as rate \
                                                     from \
                                                          (select mvno_co_cd, sum(user_cnt) total_cnt \
                                                             from prod_strd_info \
                                                            group by mvno_co_cd) t, \
                                                          prod_strd_info d \
                                                    where t.mvno_co_cd = d.mvno_co_cd \
                                                      and d.prod_id = ? \
                                                    order by length(rate) desc"
                                                    ;
                                                     
                                    connection.query(sqlStr2, [prodId], function(error2, rows2) {
                                        
                                        if (error2) {
                                            connection.release();
                                            throw error2;
                                        }else {
                                            if(rows2.length >= 0){
                                                
                                                var sqlStr3 = "select r.mvno_co_cd, r.sv_acnt_num, r.fee_prod_id, r2.rec_prod_voice, r2.rec_prod_sms, r2.rec_prod_data, \
                                                               r.voice_ovr_amt, r.sms_ovr_amt, r.data_ovr_amt \
                                                               FROM mobig.prod_use_anlyz_result r, mobig.prod_list r2 \
                                                               where r.fee_prod_id = r2.prod_id \
                                                               and r2.prod_id = ?"
                                                                ;
                                                                
                                                connection.query(sqlStr3, [prodId], function(error3, rows3) {
                                                    
                                                    if (error3) {
                                                        connection.release();
                                                        throw error3;
                                                    }else {
                                                        // console.log(rows3);
                                                        if(rows3.length >= 0){
                                                            res.send({prodInfo : rows[0], prodStatus : rows2[0], overStatus : rows3});
                                                            connection.release();
                                                        }else{
                                                            res.render('error', { title: 'Recommendprod', session : req.session });
                                                            connection.release();
                                                        }
                                                    }
                                                });

                                                // res.send({prodInfo : rows[0], prodStatus : rows2[0]});
                                                // connection.release();
                                                
                                            }else{
                                                res.render('error', { title: 'Recommendprod', session : req.session });
                                                connection.release();
                                            }
                                        }
                                    });  
                                }else {
                                    res.render('error', { title: 'Recommendprod', session : req.session });
                                    connection.release();
                                }
                            }
                        });   
                    }
                });  
            }); 
        }
    });  
    
    
    app.post('/getCount', function(req, res, next) {
        
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        } else{
        
            var prodId = req.body.prodId;

            connectionPool.getConnection(function(err, connection) {
                connection.beginTransaction(function(err) {
                    if(err) {
                        connection.release();
                        throw err;
                    }
                    else {
    
                        if (prodId != null) {
                            
                            var sqlStr = "select sum(cnt) as cnt, sum(total_cnt) as total_cnt, truncate((sum(cnt)/sum(total_cnt)*100), 2) as over_rate \
                                             from ( select 0 as cnt, user_cnt as total_cnt \
                                                      from mobig.prod_strd_info \
                                                     where prod_id = ? \
                                                     union all \
                                                    select count(*) as cnt, 0 as total_cnt \
                                                      from mobig.prod_use_anlyz_result \
                                                     where fee_prod_id = ?) a";
                                            ;
                        }
                        
                        connection.query(sqlStr, [prodId, prodId], function(error, rowsCnt) {
                            if(error) {
                                connection.release();
                                throw error;
                            }else {
                                console.log(rowsCnt[0]);
                                if(rowsCnt.length >= 0){
                                    res.send({getCount : rowsCnt[0]});
                                    connection.release();
                                }else{
                                    res.render('error', { title: 'getTotal', session : req.session });
                                    connection.release();
                                }
                            }
                        });
                                                            
                    }
            
                });
            });
        }
    });
    

    app.post('/drawOverList', function(req, res, next) {
        
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        } else{
        
            var prodId = req.body.prodId;

            var cntPerPage = req.body.cntPerPage,
                cntPerPage = Number(cntPerPage);
            var page = req.body.page;
            if (page == null) { page = 1 ; }
            var start = cntPerPage * ( page - 1) ;
    
            var user_id = req.session.user_id;
            
            var prevGrp = req.body.prevGrp;
            var nextGrp = req.body.nextGrp;
    
            connectionPool.getConnection(function(err, connection) {
                connection.beginTransaction(function(err) {
                    if(err) {
                        connection.release();
                        throw err;
                    }
                    else {
    
                        if (prodId != null) {
                            
                            var sqlStr = " select * from ( \
                                            select @rownum:=@rownum+1 as no, a.* from ( \
                                            select  lst.use_dt, lst.mvno_co_cd, sv_acnt_num, fee_prod_id, rcmd_prod_id, \
                                            i.prod_nm, fee_itm_amt, voice_ofr_ctt, sms_ofr_ctt, data_ofr_ctt, sel_agrmt_dc_amt, agrmt_dc_amt_12, agrmt_dc_amt_24, \
                                            fee_itm_amt-(sel_agrmt_dc_amt+case when agrmt_dc_amt_24 = 0 then agrmt_dc_amt_12 when agrmt_dc_amt_24 > 0 then agrmt_dc_amt_24 END) real_fee_amt \
                                            from ( \
                                            select r.use_dt, r.mvno_co_cd, r.sv_acnt_num, r.fee_prod_id, \
                                            case when greatest(r.voice_ovr_amt, r.sms_ovr_amt, r.data_ovr_amt) = r.voice_ovr_amt \
                                              then r2.rec_prod_voice \
                                                 when greatest(r.voice_ovr_amt, r.sms_ovr_amt, r.data_ovr_amt) = r.sms_ovr_amt \
                                                 then r2.rec_prod_sms \
                                                 when greatest(r.voice_ovr_amt, r.sms_ovr_amt, r.data_ovr_amt) = r.data_ovr_amt \
                                                 then r2.rec_prod_data \
                                            end rcmd_prod_id, \
                                            '*****', \
                                            greatest(r.voice_ovr_amt, r.sms_ovr_amt, r.data_ovr_amt) grt_val, \
                                            r.voice_ovr_amt, r.sms_ovr_amt, r.data_ovr_amt \
                                            FROM prod_use_anlyz_result r, prod_list r2 \
                                            where r.fee_prod_id = r2.prod_id \
                                            and r.fee_prod_id = ? \
                                            ) lst, \
                                            prod_strd_info i, \
                                            (select @rownum:=0) r \
                                            where lst.rcmd_prod_id = i.prod_id) a \
                                            order by sv_acnt_num ) b\
                                            limit ? offset ?"
                                            ;
                        }
                        
                        connection.query(sqlStr, [prodId, cntPerPage, start], function(error, rows) {
                            if(error) {
                                connection.release();
                                throw error;
                            }else {
                                // console.log(rows);
                                if(rows.length >= 0){

                                    res.send({overList : rows, page: page, cntPerPage: cntPerPage, prevGrp: prevGrp, nextGrp: nextGrp});
                                    connection.release();
                                }else{
                                    res.render('error', { title: 'drawOverList', session : req.session });
                                    connection.release();
                                }
                            }
                        });
                                                            
                    }
            
                });
            });
        }
    });

};