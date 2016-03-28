      
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
orderingApp.controller('CustomerCtrl',  ['$scope', '$routeParams','$http','socket','Order',
function ($scope,$routeParams,$http,socket,Order) {
  $scope.deviceId = $routeParams.deviceId;
   $scope.offers = [
    {'name': 'Ponuda 1',
     'description': 'Opis ponude 1',
    'price':4.5},
    {'name': 'Ponuda 2',
     'description': 'Opis ponude 2',
    'price':5.25}
    ];
    
    $scope.getOrders = function(){
    $http.get("/api/orders/table/"+$scope.deviceId).then(function(response) {
        $scope.myOrders = response.data;
    });    
    };
   $scope.getOrders();
   
    $scope.placeOrder = function (){
        var orderData = {
            location:$scope.deviceId,
            totalPrice:55.5
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


orderingApp.controller('AdminMealsCtrl', function ($scope,$http,socket,Order) {

});


orderingApp.controller('AdminMealOptionsCtrl', function ($scope,$http,socket,MealOption) {
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