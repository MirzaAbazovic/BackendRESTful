var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var moment = require('moment');

var sequelizeOptions = {
    define: {
        //prevent sequelize from pluralizing table names
        freezeTableName: true,
         // don't delete database entries but set the newly added attribute deletedAt
         paranoid: true,
         // disable logging; default: console.log
         logging: false
    }
};

var env = process.env.NODE_ENV || 'dev';

console.log('env ='+env);
switch (env) {
    case 'development':
    var sequelize = new Sequelize('mysql://root:matematika@localhost/restaurant?reconnect=true',sequelizeOptions);
        break;
    case 'production':
        var sequelize = new Sequelize('mysql://b5124efd4be981:33b80305@eu-cdbr-west-01.cleardb.com/heroku_7071fb755f4be3c?reconnect=true',sequelizeOptions);

        break;
}

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
   state: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});

var MealOption = sequelize.define('mealOption', {
  name: Sequelize.STRING,
  price: Sequelize.DECIMAL(8,2),
   state: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});


var MealCategory = sequelize.define('mealCategory', {
  name: Sequelize.STRING,
   state: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});

var MealSizePrice = sequelize.define('mealSizePrice', {
  name: Sequelize.STRING,
  price: Sequelize.DECIMAL(8,2),
   state: {
    type:   Sequelize.ENUM,
    values: ['active', 'inactive']
  }
});

var Meal = sequelize.define('meal', {
  name: Sequelize.STRING,
  description: Sequelize.TEXT,
  imageUrl: Sequelize.STRING,
  isMultipeSize: Sequelize.BOOLEAN,  
  hasExtraOptions: Sequelize.BOOLEAN,  
  price: Sequelize.DECIMAL(8,2),
   state: {
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
   timeCancelled: Sequelize.DATE,
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


OrderLine.belongsTo(Order,{as: 'order'});
Order.hasMany(OrderLine, {as: 'orderLines'});

//OrderLine.belongsTo(Meal); ili
Meal.hasOne(OrderLine);
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
        var ordeLinesReq = req.body.order.orderLines;
        var ordeLines = [];
        for(var i=0;i<ordeLinesReq.length;i++){
            ordeLines.push({
                 number:i+1,
                 mealId:ordeLinesReq[i].selectedMeal.id,
                 quantity:ordeLinesReq[i].quantity,
                 price : ordeLinesReq[i].quantity * ordeLinesReq[i].selectedMeal.price
            });
        }
         
        var savedOrder;
        return sequelize.transaction(function (t) {
        
  // chain all your queries here. make sure you return them.
  return  Order.create({
            timeOrdered : new Date(),
            location: req.body.location,
            orderState : 'pending',
            totalPrice : req.body.totalPrice
        }, {transaction: t}).then(function (order) {
            savedOrder = order.get({plain:true});
    return OrderLine.create(
             {
                 number:1,
                 price: 45.45,
                 mealId:1,
                 quantity: 3,
                 orderId : order.id
              }, {transaction: t});
  });

}).then(function (result) {
  // Transaction has been committed
  // result is whatever the result of the promise chain returned to the transaction callback
   console.log({ "Saved order": savedOrder });
       io.emit('order:placed',savedOrder);
                res.json(savedOrder);
}).catch(function (err) {
  // Transaction has been rolled back
  // err is whatever rejected the promise chain returned to the transaction callback
});
        
        /*
        
        //save order
        var newOrder = Order.build(
            {
            timeOrdered : new Date(),
            location: req.body.location,
            orderState : 'pending',
            totalPrice : req.body.totalPrice,
            });
         var lineOrder = OrderLine.build(
             {
                 number:1,
                 price: 45.45,
                 mealId:1,
                 quantity: 3,
                 order:newOrder
              });
              newOrder.orderLines = [lineOrder];
              lineOrder.save().then(function(data) {
     console.log({ "Saved order": data });
       io.emit('order:placed',data);
                res.json(data);
}).catch(function(error) {
    // Ooops, do some error-handling
  });
  
  */
         /*
        Order.create({
            timeOrdered : new Date(),
            location: req.body.location,
            orderState : 'pending',
            totalPrice : req.body.totalPrice,
            orderLine: [{price:1},{price:2}]
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
            */
    });
// /api/orders/:id
// ----------------------------------------------------
router.route('/orders/:id')
    .get(function(req, res) {
        //TODO get order with id
        res.json({ message: 'Return order with id ' + req.body.id });
    });
router.route('/orders/:id/status/:status')
    .put(function(req, res) {
        //TODO update order with id
        var id = req.params.id;
        var status = req.params.status;
        var  timeConfirmed = null;
        var  timeCancelled = null;
        if(status==='confirmed'){
            timeConfirmed = new Date();
        }
        if(status==='cancelled'){
            timeCancelled = new Date();
        }
        Order.update({orderState: status,timeConfirmed:timeConfirmed,timeCancelled:timeCancelled},{where: { id : id }})
        .then(function (result) {
            if(result[0]===1){
                io.emit('order:'+status,{'id':id});
                res.json({ message: 'Update  order with id ' + id });                
            }
            else{
                res.status(404).send({ message: 'Order with id ' + id +'not found'});
            }
        }, function(rejectedPromiseError){
            res.status(500).send({ message: 'ERROR Update  order with id ' + id +' ERROR' + rejectedPromiseError});
        });
    });

// /api/orders/table/:id
// ----------------------------------------------------
router.route('/orders/table/:id')
    .get(function(req, res) {
        console.log(req.params.id);
        Order.findAll({where:{'location':req.params.id}}).then(function(data) {
            console.log(data);
            res.json(data);
        }).catch(
            function(reason) {
                 console.log({ "Error while geting orders from database ": reason });
                 res.status(500).json({ "error": reason.message });
            });
        });


// /api/admin/mealCategory
// ----------------------------------------------------
router.route('/admin/mealCategory')
    .post(function(req, res) {
        MealCategory.create({
            name: req.body.name,
            state: req.body.state
        }).then(
            function(data, error) {               
                 res.json(data);
            }).catch(
            function(reason) {                
                console.log({ "Error while saving meal category ": reason });
                res.status(500).json({ "error": reason.message });
            });
    })
    .get(function(req, res) {
        MealCategory.findAll({}).then(function(data) {
             res.json(data);
        }).catch(
            function(reason) {
                console.log({ "Error while geting all meal categories ": reason });
                res.status(500).json({ "error": reason.message });
            });
    });

// /api/admin/mealCategory/:id
// ----------------------------------------------------
router.route('/admin/mealCategory/:id')
    .get(function(req, res) {
       MealCategory.findAll({where:{id:req.params.id}}).then(function(data) {
           if(data.length === 0){
               res.status(404).json({"error":"Meal Category not found"});
           }else{
            res.json(data);   
           }
            
        }).catch(
            function(reason) {
                 console.log({ "Error while geting all meal categories from database ": reason });
                 res.status(500).json({ "error": reason.message });
            });
        
    })
    .put(function(req, res) {
         var id = req.params.id;
         MealCategory.update({name: req.body.name, state :req.body.state },{where: { id : id }})
        .then(function (result) {
            if(result[0]===1){
                res.json({ message: 'Updated meal category with id ' + id });                
            }
            else{
                res.status(404).send({ message: 'Meal category with id ' + id +'not found'});
            }
        }, function(rejectedPromiseError){
            res.status(500).send({ message: 'ERROR while updating meal category with id ' + id +' ERROR' + rejectedPromiseError});
        });
    })
    .delete(function(req,res){          
          var id = parseInt(req.params.id);
          MealCategory.destroy({where: { id : id }})
        .then(function (result) {
            if(result===1){
                res.json({ message: 'Deleted meal category with id ' + id });                
            }
            else{
                res.status(404).send({ message: 'Meal category with id ' + id +' not found'});
            }
        }, function(rejectedPromiseError){
            res.status(500).send({ message: 'ERROR while deleting  meal category with id ' + id +' ERROR' + rejectedPromiseError});
        });
      
    });
    
    
// /api/admin/mealOption
// ----------------------------------------------------
router.route('/admin/mealOption')
    .post(function(req, res) {
        MealOption.create({
            name: req.body.name,
             price: req.body.price,
            state: req.body.state
        }).then(
            function(data, error) {               
                 res.json(data);
            }).catch(
            function(reason) {                
                console.log({ "Error while saving meal option ": reason });
                res.status(500).json({ "error": reason.message });
            });
    })
    .get(function(req, res) {
        MealOption.findAll({}).then(function(data) {
             res.json(data);
        }).catch(
            function(reason) {
                console.log({ "Error while geting all meal categories ": reason });
                res.status(500).json({ "error": reason.message });
            });
    });

    
// /api/admin/mealOption/:id
// ----------------------------------------------------
router.route('/admin/mealOption/:id')
    .get(function(req, res) {
       MealOption.findAll({where:{id:req.params.id}}).then(function(data) {
           if(data.length === 0){
               res.status(404).json({"error":"Meal Option not found"});
           }else{
            res.json(data);   
           }
            
        }).catch(
            function(reason) {
                 console.log({ "Error while geting all meal options from database ": reason });
                 res.status(500).json({ "error": reason.message });
            });
        
    })
    .put(function(req, res) {
         var id = req.params.id;
         MealOption.update({name: req.body.name, price :req.body.price, state :req.body.state },
         {where: { id : id }})
        .then(function (result) {
            if(result[0]===1){
                res.json({ message: 'Updated meal option with id ' + id });                
            }
            else{
                res.status(404).send({ message: 'Meal option with id ' + id +'not found'});
            }
        }, function(rejectedPromiseError){
           res.status(500).send({ message: 'ERROR while updating meal option with id ' + id +' ERROR' + rejectedPromiseError});
        });
    })
    .delete(function(req,res){          
          var id = parseInt(req.params.id);
          MealOption.destroy({where: { id : id }})
        .then(function (result) {
            if(result===1){
                res.json({ message: 'Deleted meal option with id ' + id });                
            }
            else{
                res.status(404).send({ message: 'Meal option with id ' + id +' not found'});
            }
        }, function(rejectedPromiseError){
             res.status(500).send({ message: 'ERROR while deleting  meal option with id ' + id +' ERROR' + rejectedPromiseError});
        });
    });




    
// /api/admin/meal
// ----------------------------------------------------
router.route('/admin/meal')
    .post(function(req, res) {
        Meal.create({
             name: req.body.name,
             description: req.body.description,
             imageUrl: req.body.imageUrl,
             price: req.body.price,
             state: req.body.state,
             mealCategoryId:req.body.mealCategoryId
        }).then(
            function(data, error) {               
                 res.json(data);
            }).catch(
            function(reason) {                
                console.log({ "Error while saving meal ": reason });
                res.status(500).json({ "error": reason.message });
            });
    })
    .get(function(req, res) {
        Meal.findAll({ include: [MealCategory]}).then(function(data) {
             res.json(data);
        }).catch(
            function(reason) {
                console.log({ "Error while geting all meal ": reason });
                res.status(500).json({ "error": reason.message });
            });
    });

    
// /api/admin/meal/:id
// ----------------------------------------------------
router.route('/admin/meal/:id')
    .get(function(req, res) {
       Meal.findAll({where:{id:req.params.id}}).then(function(data) {
           if(data.length === 0){
               res.status(404).json({"error":"Meal not found"});
           }else{
            res.json(data);   
           }
            
        }).catch(
            function(reason) {
                 console.log({ "Error while geting all meals from database ": reason });
                 res.status(500).json({ "error": reason.message });
            });
        
    })
    .put(function(req, res) {
         var id = req.params.id;
         Meal.update({
              name: req.body.name,
             description: req.body.description,
             imageUrl: req.body.imageUrl,
             price: req.body.price,
             state: req.body.state,
             mealCategoryId:req.body.mealCategoryId
            },
         {where: { id : id }})
        .then(function (result) {
            if(result[0]===1){
                res.json({ message: 'Updated meal with id ' + id });                
            }
            else{
                res.status(404).send({ message: 'Meal with id ' + id +'not found'});
            }
        }, function(rejectedPromiseError){
            res.status(500).send({ message: 'ERROR while updating meal with id ' + id +' ERROR' + rejectedPromiseError});
        });
    })
    .delete(function(req,res){          
          var id = parseInt(req.params.id);
          Meal.destroy({where: { id : id }})
        .then(function (result) {
            if(result===1){
                res.json({ message: 'Deleted meal with id ' + id });                
            }
            else{
                res.status(404).send({ message: 'Meal with id ' + id +' not found'});
            }
        }, function(rejectedPromiseError){
             res.status(500).send({ message: 'ERROR while deleting meal with id ' + id +' ERROR' + rejectedPromiseError});
        });
    });



app.use('/api', router);

app.get('/', function(req, res) {
    res.sendfile('public/index.html');
});
/*
io.on('connect', function() { console.log('SOCKET IO CONECTED'); });
io.on('order:ordered', function(data) { console.log('order:ordered');console.log(data);});
io.on('order:placed', function(data) { console.log('order:placed');console.log(data);});
io.on('order:cancelled', function(data) { console.log('order:cancelled');console.log(data);});
io.on('order:confirmed', function(data) { console.log('order:confimed');console.log(data);});
io.on('disconnect', function() { console.log('SOCKET IO DISCONECTED'); });
*/

sequelize.sync().then(function() {
    server.listen(port, function() {
        console.log('Server is up and listening on ' + port);
    });
});