mysql = require('mysql');
connectionString = 'mysql://b792382a36ff4e:344a5e08@us-cdbr-east-05.cleardb.net/heroku_af5f33ed8f091e3';

db = {};
db.cnn = {};
db.cnn.exec = function(query, callback) {
    var connection = mysql.createConnection(connectionString);
    connection.query(query, function(err, rows) {
        if(err) throw err;
        callback(rows, err);
        connection.end();
    });
};

/*
var query = "SELECT count(*) FROM tb_vitorias_ip where ip = '201.0.68.111'";
db.cnn.exec(query, function(dadosRetornados, erro) {
    if(erro){
        console.log("Erro banco de dados");
        return 0;
    }
    else{
        console.log(dadosRetornados);
        return dadosRetornados;
    }
});*/