angular.module('myApp').controller('loginController', ['$scope','$state','$http','dataService','Authorization', 
  function ($scope,$location, $http, dataService, Authorization) {
      $scope.location = (Authorization.authorized)? 'profile.userInfo':'account_login';
      $scope.loginName = (Authorization.authorized)?Authorization.userInfo.name:'Guest';
      $scope.name = "";
      $scope.phoneNumber ="";
      $scope.shippingAddress = "";
      $scope.billingAddress = "";
      $scope.email2 = "";
      $scope.password2 = "";
      $scope.toggleFunction = function(){
            document.getElementsByClassName("topnav")[0].classList.toggle("responsive");      
            if($(".topnav li:nth-child(2)").css("float")!=="left"){
                $(".topnav li:lt(3)").css("float",""); 
            }
            else{
                $(".topnav li:gt(0)").css("float","right");
            }
                 
        };
      //Sign Up function
      $scope.signup= function () {
          var body={      
                name: $scope.name,
                shipping_address:$scope.shippingAddress,
                billing_address:$scope.billingAddress,
                phone_number:$scope.phoneNumber,
                email:$scope.email2,
                password:$scope.password2        
        };
         $http.post("/users", JSON.stringify(body)).success(function(data, status) {
            console.log("Successful signup");
            alert("You have successfully signed up!");       
        }).error(function(data, status) {
             alert("Bad Sign Up username or password!")
          })
      };

      //Login Function
      $scope.login= function () {
          var body={
                email:$scope.email1,
                password:$scope.password1        
        };
         $http.post("/users/login", JSON.stringify(body)).success(function(data, status, headers) {
            console.log("Successful login");
            Authorization.go('profile.userInfo');
    
            localStorage.setItem('yourTokenKey', headers('Auth'));
            data=JSON.stringify(data);
            localStorage.setItem('userInfo',data);
            Authorization.userInfo = JSON.parse(data);
            console.log("aaa "+Authorization.authorized);
            console.log( Authorization.userInfo);
        }).error(function(data, status) {
           alert("Wrong username or password!")
          })   
      };
    }
]);
