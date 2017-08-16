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
            res.redirect('login');
        }
        else{
            
            console.log('/progress/', req.params.id);
    
            connectionPool.getConnection(function(err, connection) {
                connection.query('select * from mvno_req_data where req_id = ?;', req.params.id, function(error, rows) {
                    if (error) {
                        connection.release();
                        throw error;
                    }
                    else {
                        if (rows.length >= 0) {
                            res.render('progress', { req_data: rows[0],session: req.session });
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