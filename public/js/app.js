      
var orderingApp = angular.module('orderingApp', ['ngRoute','ngResource','ui.bootstrap']);

//Factories and services
// ------------------------------------------------------------------------------
orderingApp.factory('Order', function($resource) {
  return $resource('/api/orders/:id',null,
  {
      'update' : { method : 'PUT'},
  }
  );
});

orderingApp.factory('MealCategory', function($resource) {
  return $resource('/api/admin/mealCategory/:id',{id:'@id'},{
        update: {
            method: 'PUT'
        }
    });
});

orderingApp.factory('MealOption', function($resource) {
  return $resource('/api/admin/mealOption/:id',{id:'@id'},{
        update: {
            method: 'PUT'
        }
    });
});

orderingApp.factory('Meal', function($resource) {
  return $resource('/api/admin/meal/:id',{id:'@id'},{
        update: {
            method: 'PUT'
        }
    });
});

orderingApp.factory('socket', ['$rootScope', function($rootScope) {
  //var socket = io.connect();
  var socket = null;
  return {
      connect:function(namespace){
          socket = io.connect(namespace);
      },
    on: function(eventName, callback){
      if(socket === null){
          socket = io.connect();
      }
      socket.on(eventName, callback);
    },
    emit: function(eventName, data) {
      if(!socket){
          socket = io.connect();
      }
      socket.emit(eventName, data);
    }
  };
}]);

// Routing
// ------------------------------------------------------------------------------
orderingApp.config(['$routeProvider','$locationProvider',
  function($routeProvider,$locationProvider) {
    $routeProvider.
      when('/customer/:deviceId', {
        templateUrl: 'partials/customer.html',
        controller: 'CustomerCtrl'
      }).
      when('/salesman', {
        templateUrl: 'partials/salesman.html',
        controller: 'SalesmanCtrl'
      }).
       when('/admin', {
        templateUrl: 'partials/admin.html',
        controller: 'AdminCtrl'
      }).
       when('/admin/meal-categories', {
        templateUrl: 'partials/admin-meal-categories.html',
        controller: 'AdminMealCategoriesCtrl'
      }).
      when('/admin/meals', {
        templateUrl: 'partials/admin-meals.html',
        controller: 'AdminMealsCtrl'
      }).
       when('/admin/meal-options', {
        templateUrl: 'partials/admin-meal-options.html',
        controller: 'AdminMealOptionsCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
     //$locationProvider.html5Mode(true);
  }]);

// Controllers
// ------------------------------------------------------------------------------
orderingApp.controller('CustomerCtrl',  ['$scope', '$routeParams','$http','socket','Order','Meal',
function ($scope,$routeParams,$http,socket,Order,Meal) {
  $scope.deviceId = $routeParams.deviceId;
   $scope.order = {"orderLines":[{"quantity":1}]};
   
   $scope.addOrderLine = function(){ $scope.order.orderLines.push({"quantity":1});};   
   $scope.meals = Meal.query();
   $scope.total=0;
   $scope.orderPrice = function() { 
     var orderPrice = 0;
     for(var  i = 0; i<$scope.order.orderLines.length;i++){
         if($scope.order.orderLines[i].selectedMeal)
         {
             var line = $scope.order.orderLines[i];
             orderPrice+=line.selectedMeal.price+line.quantity;
         }
     }   
     return orderPrice;
   };
    
    $scope.getOrders = function(){
    $http.get("/api/orders/table/"+$scope.deviceId).then(function(response) {
        $scope.myOrders = response.data;
    });    
    };
   $scope.getOrders();
   
    $scope.placeOrder = function (){
        var orderData = {
            location:$scope.deviceId,
            order : $scope.order,
            totalPrice: $scope.orderPrice()
        };
        var newOrder = new Order(orderData);
        newOrder.$save(function(order, putResponseHeaders) {
            //console.log(order);
            $scope.myOrders.push(order);
            //$scope.getOrders();    
        });
    };
    $scope.cancelOrder = function (id){
       console.log('cancel order with id '+ id);
       $http({method: 'PUT', url: 'api/orders/'+id+'/status/cancelled'})
       .then(function successCallback(response) {
              $scope.getOrders();
            }, 
            function errorCallback(response) {
                
            });
        };
        
        socket.on('order:confirmed', function (data) {
                //console.log('order confimred '+data.id);
                //u postojecoj listi
                //$scope.myOrders[_.findIndex($scope.myOrders, function(o) { return o.id == data.id; })].orderState = 'confirmed';
                //$scope.$apply();
                //refreshaj ponovo
                $scope.getOrders();
          
            });
}]);

orderingApp.controller('SalesmanCtrl', function ($scope,$http,socket,Order) {
 $scope.orders = Order.query();
    $scope.alerts = [];
    $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
       $scope.confirmOrder = function (id){
           console.log('confirm order with id '+ id);
           $http({method: 'PUT', url: 'api/orders/'+id+'/status/confirmed'})
       .then(function successCallback(response) {
            $scope.orders = Order.query();
            //$scope.$apply();
            }, 
            function errorCallback(response) {
                
            });
           
    }; 
 
 socket.on('order:placed', function (data) {
                console.log(data);
                $scope.alerts.push({msg: 'You have new order from table '+data.location+' with id: '+data.id});
                $scope.orders.push(data);
                $scope.$apply();
            });
             socket.on('order:cancelled', function (data) {
                $scope.orders = Order.query();
          
            });
});


orderingApp.controller('AdminCtrl', function ($scope,$http,socket,Order) {

});


orderingApp.controller('AdminMealCategoriesCtrl', function ($scope,MealCategory) {
  $scope.categories = [];
  $scope.newCategory = {
      id:-1,
      state:'active',
      name:''};
    $scope.clearCategory = function (){
    $scope.newCategory = {
      id:-1,
      state:'active',
      name:''};
  };   
  
  $scope.getMealCategories = function (){
     $scope.categories = MealCategory.query();
  };    
  
  $scope.getMealCategories();

  $scope.addCategory = function (){
      //console.log($scope.newCategory);
        category =$scope.newCategory;
        if(category.id===-1){
            category.id=null;
        var newCategory = new MealCategory(category);
        newCategory.$save(function(category, putResponseHeaders) { 
            $scope.categories.push(category);
            $scope.clearCategory();    
         });   
        }
        else{
             var newCategory = new MealCategory(category);
            newCategory.$update(function(){
            $scope.clearCategory();    
               $scope.getMealCategories();
        });
        }
};    
$scope.editCategory = function (category){
        console.log(category);
        $scope.newCategory = category;       
};    


 $scope.deleteCategory = function (c){
      console.log(c);
       c.$delete(function(){
               //console.log('deleted');
                 $scope.getMealCategories();
            });
        //var newCategory = new MealCategory(category);
        //newOrder.$save(function(category, putResponseHeaders) { $scope.categories.push(order);});
};    

});


orderingApp.controller('AdminMealsCtrl', function ($scope,Meal,MealCategory) {
    
     $scope.meals = [];
     MealCategory.query(function(data)
     {
         $scope.categories = data;
     });
  
  $scope.newMeal = {
      id:-1,
      state:'active'
    };
    $scope.clearMeal = function (){
    $scope.newMeal = {
      id:-1,
      state:'active',
      name:''};
  };   
  
  $scope.getMeals = function (){
     $scope.meals = Meal.query();
  };    
  
  $scope.getMeals();

  $scope.addMeal = function (){
      //console.log($scope.newCategory);
        meal = $scope.newMeal;
        if(meal.MealCategory){
                meal.mealCategoryId = meal.MealCategory.id;    
        }
        
        if(meal.id===-1){
            meal.id=null;
        var newMeal = new Meal(meal);
        newMeal.$save(function(meal, putResponseHeaders) { 
            $scope.getMeals();
            $scope.clearMeal();    
         });   
        }
        else{
             var newMeal = new Meal(meal);
            newMeal.$update(function(){
            $scope.clearMeal();    
               $scope.getMeals();
        });
        }
};    
$scope.editMeal = function (meal){
        $scope.newMeal = meal;       
};    


 $scope.deleteMeal = function (c){
       c.$delete(function(){
                 $scope.getMeals();
            });
};    


});


orderingApp.controller('AdminMealOptionsCtrl', function ($scope,MealOption) {
  $scope.options = [];
  $scope.newOption = {
      id:-1,
      state:'active',
      name:'',
      price:0
    };
    $scope.clearOption = function (){
    $scope.newOption = {
      id:-1,
      state:'active',
      name:'',
     price:0
    };
  };   
  
  $scope.getMealOptions = function (){
     $scope.options = MealOption.query();
  };    
  
  $scope.getMealOptions();

  $scope.addOption = function (){
      //console.log($scope.newCategory);
        option =$scope.newOption;
        if(option.id===-1){
            option.id=null;
        var newOption = new MealOption(option);
        newOption.$save(function(option, putResponseHeaders) { 
            $scope.options.push(option);
            $scope.clearOption();    
         });   
        }
        else{
             var newOption = new MealOption(option);
            newOption.$update(function(){
            $scope.clearOption();    
               $scope.getMealOptions();
        });
        }
};    

$scope.editOption = function (option){
        $scope.newOption = option;       
};    


 $scope.deleteOption = function (option){
       option.$delete(function(){
                 $scope.getMealOptions();
            });
};    

});