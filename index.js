var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

router.get('/ping', function(req, res) {
    console.log(req);
    res.json({ message: 'Pong on :' + Date().toLocaleString() });
});

// /api/customers
// ----------------------------------------------------
router.route('/customers')
    .post(function(req, res) {
        //TODO save customer
        res.json({ message: 'Save new customer' })
    })
    .get(function(req, res) {
        //TODO get all customers
        res.json({ message: 'Return all customers' })
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

app.listen(port);
console.log('Server is up and listening on ' + port);