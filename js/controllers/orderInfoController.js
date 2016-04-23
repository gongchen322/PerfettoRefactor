angular.module('myApp').controller('orderInfoController', ['$scope','$http','dataService','Authorization', 
  function ($scope, $http, dataService, Authorization) {
      var req = {
          method: 'GET',
          url: '/orders',
          headers: {
              'Auth': localStorage.getItem('yourTokenKey')
          }
      };          
      $http(req).success(function(data, status) {
        console.log('Succuessfully retrieved saved orders');
        $scope.orders = data;         
      }); 
  }
]);
