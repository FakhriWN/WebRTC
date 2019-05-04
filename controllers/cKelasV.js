module.exports = function(app){
    app.get('/dashboard', function(req,res){
        res.render('dashboard');
    });
    app.get('/kelas', function(req,res){
        res.render('vKelasVirtual');
    });
    app.post('/todo', function(req,res){
        
    });
}