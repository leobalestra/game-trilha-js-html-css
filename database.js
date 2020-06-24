const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b792382a36ff4e',
    password: '344a5e08',
    database: 'heroku_af5f33ed8f091e3'
});

con.connect((err) => {
    if (err) {
        console.log('Erro connecting to database...', err)
        return
    }
    console.log('Connection established!')
});

con.query('SELECT * FROM tb_img_back', (err, rows) => {
    if (err) throw err

    console.log('Backgrounds: ', rows, '\n\n')
});

con.query('SELECT * FROM tb_img_tabu', (err, rows) => {
    if (err) throw err

    console.log('Tabuleiros: ', rows, '\n\n')
});

con.end((err) => {
    if(err) {
        console.log('Erro to finish connection...', err)
        return 
    }
    console.log('The connection was finish...')
});