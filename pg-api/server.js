let express = require('express');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let pg = require('pg');
const PORT = 3000;

let pool = new pg.Pool({
    port: 5432,
    password: '8324',
    database: 'zithara',
    //max:10,
    host: 'localhost',
    user: 'postgres'
});

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use(morgan('dev'));

app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/api/db_info', function(request, response) {
    pool.connect(function(err, db, done) {
        if(err) {
            return response.status(400).send(err)
        }
        else {
            db.query('SELECT * FROM db_info', function(err, table) {
                done();
                if(err) {
                    return response.status(400).send(err)
                }
                else {
                    return response.status(200).send(table.rows)
                }
            })
        }
    })
})  

app.post('/api/new-customer', function(request, response) {
    var sno = request.body.sno;
    var cust_name = request.body.cust_name;
    var age = request.body.age;
    var phone = request.body.phone;
    var location = request.body.location;
    var created_at = request.body.created_at;

    pool.connect((err, db, done) => {
    if(err){
        return response.status(400).send(err);
    }
    else {

        db.query('INSERT INTO db_info (sno, cust_name, age, phone, location, created_at) VALUES($1, $2, $3, $4, $5, $6)', [sno, cust_name, age, phone, location, created_at], (err, table) => {
            if(err) {
                return response.status(400).send(err);
            }
            else {
                console.log('Data Insert Success');
                db.end();
                response.status(201).send({message: 'data dumped!'});
            }
        })
    }
})
})  

  app.listen(PORT, () => console.log('Listening on PORT' + PORT));