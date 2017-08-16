module.exports = function(app, connectionPool) {
    
    app.get('/myaccount', function(req, res) {
        var sess = req.session
        
        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('login');
        }
        else{
            res.render('myaccount', { title: 'MOBIG', session : req.session });
        }
        
    });

};