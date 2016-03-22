var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var moment = require('moment');

//db connection string
var sequelize = new Sequelize('mysql://b5124efd4be981:33b80305@eu-cdbr-west-01.cleardb.com/heroku_7071fb755f4be3c?reconnect=true');


/*
var sequelize = new Sequelize('backend_restful', 'am', 'matematika', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});
*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;
app.set('port', (process.env.PORT || 8080));
app.use(express.static(__dirname + '/public'));


var router = express.Router();

router.get('/ping', function(req, res) {
    //console.log(req);
    res.json({ message: 'Pong on :' + Date().toLocaleString() });
});

// db structure
// ----------------------------------------------------
//Customers Table Structure
var Customer = sequelize.define('Customer', {
    name: Sequelize.STRING,
    address: Sequelize.STRING,
    birthday: Sequelize.DATE
});

// /api/customers
// ----------------------------------------------------
router.route('/customers')
    .post(function(req, res) {
        //save customer
        Customer.create({
            name: req.body.name,
            address: req.body.address,
            birthday: req.body.birthday
        }).then(
            function(data, error) {
                console.log({ "Saved customer": data });
                io.emit('event', { datetime: moment().format('DD.MM.YYYY, hh:mm:ss'), entity: 'customer', action: 'save', data: data });
                res.json(data);
            }).catch(
            function(reason) {
                console.log({ "Error while saving customer ": reason });
                 io.emit('event', { datetime:  moment().format('DD.MM.YYYY, hh:mm:ss'), entity: 'customer', action: 'Error on: save', data: reason });
                 res.status(500).json({ "error": reason.message });
            });
    })
    .get(function(req, res) {
        //get all customers
        Customer.findAll({}).then(function(data) {
            io.emit('event', { datetime:  moment().format('DD.MM.YYYY, hh:mm:ss'), entity: 'customer', action: 'get all', data: data });
            res.json(data);
        }).catch(
            function(reason) {
                console.log({ "Error while geting all customers ": reason });
                 io.emit('event', { datetime:  moment().format('DD.MM.YYYY, hh:mm:ss'), entity: 'customer', action: 'Error on: get all', data: reason });
                 res.status(500).json({ "error": reason.message });
            });
    });

// /api/customers/:id
// ----------------------------------------------------
router.route('/customers/:id')
    .get(function(req, res) {
        //TODO get customer with id
        res.json({ message: 'Return customer with id ' + req.body.id })
    })
    .put(function(req, res) {
        //TODO update customer with id
        res.json({ message: 'Update  customer with id ' + req.params.id })
    })
    .delete(function(req, res) {
        //TODO delete customer with id
        res.json({ message: 'Delete  customer with id ' + req.params.id })
    });



app.use('/api', router);

app.get('/', function(req, res) {
    res.sendfile('public/index.html');
});



io.on('connect', function() { console.log('SOCKET IO CONECTED'); });
io.on('event', function(data) { console.log(data);});
io.on('disconnect', function() { console.log('SOCKET IO DISCONECTED'); });

sequelize.sync().then(function() {
    server.listen(port, function() {
        console.log('Server is up and listening on ' + port);
    });
});