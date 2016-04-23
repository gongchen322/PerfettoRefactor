angular.module('myApp').controller('cartController', ['$scope','$http','$state','dataService','Authorization', 
    function ($scope,$http, $state,dataService, Authorization) {
      $scope.cart = dataService.cart;
      $scope.name = (Authorization.authorized)?Authorization.userInfo.name:'Guest';
      $scope.location = (Authorization.authorized)? 'profile.userInfo':'account_login';
      $scope.goCheckout = function () {
      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; 
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();
      var body = {
          Customer_name: Authorization.userInfo.name,
          Customer_email: Authorization.userInfo.email,
          phone_number: Authorization.userInfo.phone_number,
          shipping_address: Authorization.userInfo.shipping_address,
          billing_address: Authorization.userInfo.billing_address,
          totalPrice: $scope.cart.getTotalPrice(),
          totalItems: $scope.cart.getTotalCount(),
          Date: year + "/" + month + "/" + day
      };
      if(!Authorization.authorized){
        alert("please login first.");
      }else {
        var req = {
            method: 'POST',
            url: '/orders',
            headers: {
                'Auth': localStorage.getItem('yourTokenKey')
            },
            data: JSON.stringify(body)
        };          
        $http(req).success(function(data, status) {
          console.log("Successfully save orders");
          $state.go('checkout');      
        }); 
      }
      }
    }
]);
