
module.exports = function(app, connectionPool) {
    
    app.get('/activity', function(req, res) {
        var sess = req.session

        res.render('activity', { title: 'MOBIG', session : req.session });
        
    });

};
