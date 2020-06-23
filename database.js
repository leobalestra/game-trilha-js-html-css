mysql = require('mysql');
connectionString = 'mysql://b792382a36ff4e:344a5e08@us-cdbr-east-05.cleardb.net/heroku_af5f33ed8f091e3';

db = {};
db.cnn = {};
db.cnn.exec = function(query, callback) {
    var connection = mysql.creaeConnection(connectionString);
    connection.query(query, function(err, rows) {
        if(err) throw err;
        callback(rows, err);
        connection.end();
    });
};

var App = {

    
}
connection.connect(function(err){
    if(err) return console.log(err);
    console.log('conectou!');
});