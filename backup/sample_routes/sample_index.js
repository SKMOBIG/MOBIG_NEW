// var express = require('express');
// var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// module.exports = router;


module.exports = function(app, connectionPool) {
    
    /* GET home page. */
    app.get('/', function(req, res) {
        var sess = req.session
        // if(sess.views) {
        //     res.redirect('mvno/main'); // /main url에서 다시 세션 존재 검사
        // }else {
        //     res.render('mvno/mvnomain', { title: 'MOBIG' });    
        // }
        
        res.render('index', { title: 'MOBIG', session : req.session });
        
    });

    app.get('/index', function(req, res) {
        var sess = req.session
        // if(sess.views) {
        //     res.redirect('mvno/main'); // /main url에서 다시 세션 존재 검사
        // }else {
        //     res.render('mvno/mvnomain', { title: 'MOBIG' });    
        // }
        
        res.render('index', { title: 'MOBIG', session : req.session });
        
    });

};
