const bodyParser = require('body-parser');
var urlencodedParses = bodyParser.urlencoded({extended:true})

module.exports = function(app){
    app.get('/', function(req,res){
        res.render('vBuatKelas');
    });
    app.get('/kelas', function(req,res){
        res.render('vKelasVirtual');
    });
    app.post('/kelas',urlencodedParses ,function(req,res){
        console.log(req.body);
        var kelas = req.body;
        res.render('vKelasVirtual',{data: req.body});
    });
    app.get('/kelas/bergabung', function(req,res){
        console.log(req.query);
        res.render('vMasukKelas',{data: req.query});
    });
}