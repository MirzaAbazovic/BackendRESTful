var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
//db connection string
var sequelize = new Sequelize('backend_restful', 'am', 'matematika', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

router.get('/ping', function(req, res) {
    console.log(req);
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
                console.log({ "saved customer": data });
                res.json(data);
            }).catch(
            function(reason) {
                console.log({ "error while saving customer ": reason });
                res.status(500).json({"error" : reason.message});
            });
    })
    .get(function(req, res) {
        //get all customers
        Customer.findAll({}).then(function(data) {
            res.json(data);
        });
    });

// /api/customers/:id
// ----------------------------------------------------
router.route('/customers/:id')
    .get(function(req, res) {
        //TODO get customer with id
        res.json({ message: 'Return customer with id ' + req.params.id })

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

sequelize.sync().then(function() {
    app.listen(port, function() {
        console.log('Server is up and listening on ' + port);
    });
});