
module.exports = function(app, connectionPool) {
    
    app.get('/tabs', function(req, res) {
        var sess = req.session
        
        // /* session 없을 땐 로그인 화면으로 */
        // if (!req.session.user_name) {
        //     res.redirect('/front');
        // }

        res.render('tabs', { title: 'MOBIG', session : req.session });
        
    });

};