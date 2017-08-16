module.exports = function(app, connectionPool) {

    app.get('/sample_activity', function(req, res) {
        var sess = req.session
        res.render('sample/sample_activity', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_alerts', function(req, res) {
        var sess = req.session
        res.render('sample/sample_alerts', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_autocomplete', function(req, res) {
        var sess = req.session
        res.render('sample/sample_autocomplete', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_buttons', function(req, res) {
        var sess = req.session
        res.render('sample/sample_buttons', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_chartJs', function(req, res) {
        var sess = req.session
        res.render('sample/sample_chartJs', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_contacts', function(req, res) {
        var sess = req.session
        res.render('sample/sample_contacts', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_controls', function(req, res) {
        var sess = req.session
        res.render('sample/sample_controls', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_dataTables', function(req, res) {
        var sess = req.session
        res.render('sample/sample_dataTables', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_datamaps', function(req, res) {
        var sess = req.session
        res.render('sample/sample_datamaps', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_draggable', function(req, res) {
        var sess = req.session
        res.render('sample/sample_draggable', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_error', function(req, res) {
        var sess = req.session
        res.render('sample/sample_error', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_flotCharts', function(req, res) {
        var sess = req.session
        res.render('sample/sample_flotCharts', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_forgotPassword', function(req, res) {
        var sess = req.session
        res.render('sample/sample_forgotPassword', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_formElements', function(req, res) {
        var sess = req.session
        res.render('sample/sample_formElements', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_front', function(req, res) {
        var sess = req.session
        res.render('sample/sample_front', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_gridSystem', function(req, res) {
        var sess = req.session
        res.render('sample/sample_gridSystem', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_icons', function(req, res) {
        var sess = req.session
        res.render('sample/sample_icons', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_index', function(req, res) {
        var sess = req.session
        res.render('sample/sample_index', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_loaders', function(req, res) {
        var sess = req.session
        res.render('sample/sample_loaders', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_login', function(req, res) {
        var sess = req.session
        res.render('sample/sample_login', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_metrics', function(req, res) {
        var sess = req.session
        res.render('sample/sample_metrics', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_modals', function(req, res) {
        var sess = req.session
        res.render('sample/sample_modals', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_nestableList', function(req, res) {
        var sess = req.session
        res.render('sample/sample_nestableList', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_panels', function(req, res) {
        var sess = req.session
        res.render('sample/sample_panels', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_profile', function(req, res) {
        var sess = req.session
        res.render('sample/sample_profile', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_projects', function(req, res) {
        var sess = req.session
        res.render('sample/sample_projects', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_register', function(req, res) {
        var sess = req.session
        res.render('sample/sample_register', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_sparkline', function(req, res) {
        var sess = req.session
        res.render('sample/sample_sparkline', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_support', function(req, res) {
        var sess = req.session
        res.render('sample/sample_support', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_tableStyles', function(req, res) {
        var sess = req.session
        res.render('sample/sample_tableStyles', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_tabs', function(req, res) {
        var sess = req.session
        res.render('sample/sample_tabs', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_textEditor', function(req, res) {
        var sess = req.session
        res.render('sample/sample_textEditor', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_timeline', function(req, res) {
        var sess = req.session
        res.render('sample/sample_timeline', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_typography', function(req, res) {
        var sess = req.session
        res.render('sample/sample_typography', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_usage', function(req, res) {
        var sess = req.session
        res.render('sample/sample_usage', { title: 'MOBIG', session : req.session });
    });

    app.get('/sample_versions', function(req, res) {
        var sess = req.session
        res.render('sample/sample_versions', { title: 'MOBIG', session : req.session });
    });
    
};

