angular.module('myApp').controller('checkoutController', ['$scope','$state','dataService','Authorization', 
	function ($scope,$state,dataService, Authorization) {	
    	 $scope.cart = dataService.cart;
    	 $scope.savedCost = $scope.cart.getTotalPrice();
    	 $scope.location = (Authorization.authorized)? 'profile.userInfo':'account_login';
    	 $scope.name = (Authorization.authorized)?Authorization.userInfo.name:'';
    	 $scope.shippingAddress = Authorization.userInfo.shipping_address;
    	 $scope.cart.clearItems();   
    }
]);
