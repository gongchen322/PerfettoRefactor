angular.module('myApp').service('dataService', ['$http',
	function ($http) {
		// var menProductsData;
		// var req1 = {
  //         method: 'GET',
  //         url: '/products/men'
  //       }; 
  //       $http(req1).success(function(data, status) {
  //       	menProductsData = data;
  //       	var myStore = new store(menProductsData);
  //     	});

      	function buildStore(gender){
      		var url = '/products/'+gender;
      		return $http.get(url).then(function(data){
      			console.log(data);
      			return new store(data.data);	
      		});
      	}

      	// var req2 = {
       //    method: 'GET',
       //    url: '/products/:gender=women'
       //  }; 
       //  $http(req2).success(function(data, status) {
       //  	var womenProducts = data;         
      	// }); 
		var myCart = new cart("AngularStore");
	    return {
	        cart: myCart,
	        buildStore:buildStore
	    };    	
    }
]);
