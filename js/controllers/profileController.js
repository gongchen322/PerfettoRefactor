angular.module('myApp').controller('profileController', ['$scope','dataService','Authorization', 
	function ($scope,dataService, Authorization) {
		$scope.toggleFunction = function(){
            document.getElementsByClassName("topnav")[0].classList.toggle("responsive");
            if($(".topnav li:nth-child(3)").css("float")!=="left"){
                $(".topnav li:lt(4)").css("float","");
            }
            else{
                $(".topnav li:gt(2)").css("float","right");
            }        
        };	
    	$scope.location = (Authorization.authorized)? 'profile.userInfo':'account_login';
    	$scope.name = (Authorization.authorized)?Authorization.userInfo.name:'';
    	$scope.isLoggedIn = !Authorization.authorized;
    }
]);
