angular.module('myApp').controller('shopController', ['$scope','$http','$location','dataService','Authorization', 
    function ($scope,$http,$location,dataService,Authorization) {
        $scope.toggleFunction = function(){
            document.getElementsByClassName("topnav")[0].classList.toggle("responsive");
            console.log($(".topnav li:nth-child(6)").css("float"));
            if($(".topnav li:nth-child(6)").css("float")!=="left"){
                $(".topnav li:lt(7)").css("float","");
                console.log("removed float right");
            }
            else{
                $(".topnav li:gt(3)").css("float","right");
                console.log("change back to float right");
            }
                 
        };

        $scope.location = (Authorization.authorized)? 'profile.userInfo':'account_login';
        console.log("login status is"+Authorization.authorized);
        $scope.name = (Authorization.authorized)?Authorization.userInfo.name:'Guest';
        $scope.isLoggedIn = !Authorization.authorized;
        console.log("is loggedIn is "+ $scope.isLoggedIn);
        $scope.logout = function() {
            $http.delete("/users/login",{
                headers: {'Auth': localStorage.getItem('yourTokenKey')}
            }).success(function(data, status) {
            console.log("Successful logout");         
        })
            Authorization.clear();
            $scope.isLoggedIn = !Authorization.authorized;
        }
    }
    ]);
