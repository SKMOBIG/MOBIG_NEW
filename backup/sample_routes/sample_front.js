module.exports = function(app, connectionPool) {
    
    /* GET home page. */
    app.get('/front', function(req, res) {
        var sess = req.session
        // if(sess.views) {
        //     res.redirect('mvno/main'); // /main url에서 다시 세션 존재 검사
        // }else {
        //     res.render('mvno/mvnomain', { title: 'MOBIG' });    
        // }
        
        res.render('front', { title: 'MOBIG', session : req.session });
        
    });


};
