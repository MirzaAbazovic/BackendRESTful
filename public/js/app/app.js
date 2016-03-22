var orderingApp = angular.module('orderingApp', []);

orderingApp.controller('IndexCtrl', function ($scope) {
  $scope.offers = [
    {'name': 'Ponuda 1',
     'description': 'Opis ponude 1',
    'price':4.5},
    {'name': 'Ponuda 2',
     'description': 'Opis ponude 2',
    'price':5.25}
    ];
});