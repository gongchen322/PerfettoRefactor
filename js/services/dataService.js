angular.module('myApp').service('dataService', ['$http',
	function ($http) {
    function buildStore(gender){
  		var url = '/products/'+gender;
  		return $http.get(url).then(function(data){
  			console.log(data);
  			return new store(data.data);	
  		});
  	}
		var myCart = new cart("AngularStore");
	    return {
	        cart: myCart,
	        buildStore:buildStore
	    };    	
    }
]);
