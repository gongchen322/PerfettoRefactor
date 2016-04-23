angular.module('myApp').controller('userInfoController', ['$scope','dataService','Authorization', 
    function ($scope,dataService,Authorization) {
       $scope.name = Authorization.userInfo.name;
       $scope.email = Authorization.userInfo.email;
       $scope.phone = Authorization.userInfo.phone_number;
       $scope.shippingAddress = Authorization.userInfo.shipping_address;
       $scope.billingAddress = Authorization.userInfo.billing_address;
    }
]);
