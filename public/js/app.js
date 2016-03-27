      
var orderingApp = angular.module('orderingApp', ['ngRoute','ngResource','ui.bootstrap']);
orderingApp.factory('Order', function($resource) {
  return $resource('/api/orders/:id');
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
      otherwise({
        redirectTo: '/'
      });
     //$locationProvider.html5Mode(true);
  }]);

// Controllers
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
    $http.get("/api/orders/table/"+$scope.deviceId).then(function(response) {
        $scope.myOrders = response.data;
    });
    $scope.placeOrder = function (){
        var orderData = {
            location:$scope.deviceId,
            totalPrice:55.5
        };
        var newOrder = new Order(orderData);
        newOrder.$save();
    };
    $scope.cancelOrder = function (e){
        orderId = e.currentTarget.attributes['data-id'].value;
       console.log('delete order with id '+orderId);
    };
}]);

orderingApp.controller('SalesmanCtrl', function ($scope,socket,Order) {
 $scope.orders = Order.query();
    $scope.alerts = [];
    $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
       $scope.confirmOrder = function (e){
        orderId = e.currentTarget.attributes['data-id'].value;
       console.log('confirm order with id '+orderId);
    }; 
 
 socket.on('order:placed', function (data) {
                console.log(data);
                $scope.alerts.push({msg: 'You have new order from table '+data.location+' with id: '+data.id});
                $scope.orders.push(data);
                $scope.$apply();
            });
});


