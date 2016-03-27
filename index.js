var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var moment = require('moment');

//db connection string
//var sequelize = new Sequelize('mysql://b5124efd4be981:33b80305@eu-cdbr-west-01.cleardb.com/heroku_7071fb755f4be3c?reconnect=true');

var sequelize = new Sequelize('restaurant', 'root', 'matematika', {
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
app.set('port', (process.env.PORT || 8080));
app.use(express.static(__dirname + '/public'));


var router = express.Router();

router.get('/ping', function(req, res) {
    //console.log(req);
    res.json({ message: 'Pong on :' + Date().toLocaleString() });
});

// db structure
// ----------------------------------------------------

var Menu = sequelize.define('menu', {
   name: Sequelize.STRING,
   states: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});

var MealOption = sequelize.define('mealOption', {
  name: Sequelize.STRING,
  price: Sequelize.DECIMAL(8,2),
   states: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});


var MealCategory = sequelize.define('mealCategory', {
  name: Sequelize.STRING,
   states: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});

var MealSizePrice = sequelize.define('mealSizePrice', {
  name: Sequelize.STRING,
  price: Sequelize.DECIMAL(8,2),
   states: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});

var Meal = sequelize.define('meal', {
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  imageUrl: Sequelize.STRING,
  isMultipeSize: Sequelize.BOOLEAN,  
  hasExtraOptions: Sequelize.BOOLEAN,  
  price: Sequelize.DECIMAL(8,2),
   states: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});

// Order is basket. Pending is while user is creating it when it is oredered 
// it is displayed to cheef
//confirmed zapremljena
//delivered dostavljena
var Order = sequelize.define('order', {
   location: Sequelize.STRING,
   timeOrdered: Sequelize.DATE,
   timeCanceled: Sequelize.DATE,
   timeConfirmed: Sequelize.DATE,
   timeDelivered: Sequelize.DATE,
   totalPrice: Sequelize.DECIMAL(8,2),
   orderState: {
    type:   Sequelize.ENUM,
    values: ['pending', 'confirmed' ,'completed','cancelled']
  },
   paidState: {
    type:   Sequelize.ENUM,
    values: ['yes', 'no']
  }
});

var OrderLine = sequelize.define('orderLine', {
   number: Sequelize.STRING,
   price: Sequelize.DECIMAL(8,2),
   quantity: Sequelize.DECIMAL(8,2)
});
//Mappings
// ----------------------------------------------------
Meal.belongsTo(MealCategory);
MealCategory.hasMany(Meal, {as: 'Meals'});

MealCategory.belongsTo(Menu);
Menu.hasMany(MealCategory, {as: 'Categories'});

Meal.hasMany(MealOption,{as:'Options'});


OrderLine.belongsTo(Order);
Order.hasMany(OrderLine, {as: 'orderLines'});

OrderLine.hasOne(Meal, {as: 'Meal'});

// /api/orders
// ----------------------------------------------------
router.route('/orders')
    .get(function(req, res) {
        Order.findAll({}).then(function(data) {
            res.json(data);
        }).catch(
            function(reason) {
                 console.log({ "Error while geting all orders from database ": reason });
                 res.status(500).json({ "error": reason.message });
            });})
    .post(function(req, res) {
        //save order
        Order.create({
            timeOrdered : new Date(),
            location: req.body.location,
            totalPrice : req.body.totalPrice,
        }).then(
            function(data, error) {
                console.log({ "Saved order": data });
                //emit info to salesman
                io.emit('order:placed',data);
                res.json(data);
            }).catch(
            function(reason) {
                 console.log({ "Error while placing order ": reason });
                 res.status(500).json({ "error": reason.message });
            });
    });

// /api/orders/:id
// ----------------------------------------------------
router.route('/order/:id')
    .get(function(req, res) {
        //TODO get order with id
        res.json({ message: 'Return order with id ' + req.body.id });
    })
    .put(function(req, res) {
        //TODO update order with id
        res.json({ message: 'Update  order with id ' + req.params.id });
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