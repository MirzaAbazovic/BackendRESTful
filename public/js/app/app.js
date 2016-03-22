var orderingApp = angular.module('orderingApp', ['ngRoute']);
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

orderingApp.controller('CustomerCtrl',  ['$scope', '$routeParams',function ($scope,$routeParams) {
  $scope.deviceId = $routeParams.deviceId;
  $scope.offers = [
    {'name': 'Ponuda 1',
     'description': 'Opis ponude 1',
    'price':4.5},
    {'name': 'Ponuda 2',
     'description': 'Opis ponude 2',
    'price':5.25}
    ];
}]);

orderingApp.controller('SalesmanCtrl', function ($scope) {
  
});
