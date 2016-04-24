angular.module('myApp').controller('adminController', ['$scope','$http','$state','dataService','Authorization', 
    function ($scope,$http, $state,dataService, Authorization) {
      $scope.name = "";
      $scope.color = "";
      $scope.price = "";
      $scope.gender = "";
      $scope.image_small = "";
      $scope.image_large = "";
      $scope.image_large2 = "";
      $scope.description = "";
      

      $scope.postProduct = function() {
        var body = {
          product_name: $scope.name,
          product_color: $scope.color,
          product_price: $scope.price,
          product_gender: $scope.gender,
          product_image1: $scope.image_small ,
          product_image2: $scope.image_large ,
          product_image3: $scope.image_large2 ,
          product_description: $scope.description
        };
        var req = {
          method: 'POST',
          url: '/products',
          data: JSON.stringify(body)
        }; 
           
        $http(req).then(function(){
          alert("Succuessfully post product info");      
        }, function(){
          alert("Failed post product info");
        }); 
      }
      
    }
]);
