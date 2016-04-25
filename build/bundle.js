var myApp = angular.module('myApp', ['ui.router','ngAnimate', 'ui.bootstrap']);

myApp
.constant('_', window._)
.config(function($stateProvider, $urlRouterProvider, $provide) {
    $urlRouterProvider.otherwise('/home');
    
    //To make navigation to the top of the page, but not to the ui-view
    $provide.decorator('$uiViewScroll', function ($delegate) {
    return function (uiViewElement) { }; 
    });

    $stateProvider
        
        // HOME STATES 
        .state('home', {
            url: '/home',
            templateUrl: 'js/view/partial-home.html'
        })
        
        // CART PAGE
        .state('cart', {
            url: '/cart',
            templateUrl: 'js/view/cart.html',
            controller: 'cartController'
        })
        // CHECKOUT PAGE
        .state('checkout', {
            url: '/checkout',
            templateUrl: 'js/view/checkout.html',
            controller: 'checkoutController'
        })
        // LOGIN PAGE
        .state('account_login', {
            url: '/account_login',
            templateUrl: 'js/view/account_login.html',
            controller: 'loginController'
        })
        // PROFILE PAGE
        .state('profile', {
            url: '/profile',
            templateUrl: 'js/view/profile.html',
            controller: 'profileController',
            data: {
                authorization: true,
                redirectTo: 'account_login',
                
            }
        })
        // USERINFO PAGE
        .state('profile.userInfo', {
        url: '/',
        templateUrl: 'js/view/userInfo.html',
        controller: 'userInfoController'
        })
        // ORDER PAGE
        .state('profile.orders', {
        url: '/profile/orders',
        templateUrl: 'js/view/orderInfo.html',
        controller: 'orderInfoController'
        })
        .state('admin', {
        url: '/admin',
        templateUrl: 'js/view/admin.html',
        controller: 'adminController'
        })        
        // SHOP PAGE AND NESTED VIEWS  =================================
        .state('shop', {
          	url: '/shop',
            templateUrl: 'js/view/shop.html',
            controller: 'shopController'
        })
        // SHOPMEN PAGE
        .state('shop.men', {
        url: '/men',
        templateUrl: 'js/view/men.html',
        controller: 'menController'
    	})
        // SHOPWOMEN PAGE
         .state('shop.women', {
        url: '/women',
        templateUrl: 'js/view/women.html',
        controller: 'womenController'
        })
        .state('shop.collection', {
        url: '/collection',
        templateUrl: 'js/view/collection.html',
        controller: 'collectionController'
        })
        .state('shop.storemap', {
        url: '/storemap',
        templateUrl: 'js/view/storeMap.html',
        controller: 'storeMapController'
        });
})
.run(function(_,$rootScope, $state, Authorization) {
  $rootScope._ = window._;
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    if (!Authorization.authorized) {
      if (Authorization.memorizedState && (!_.has(fromState, 'data.redirectTo') || toState.name !== fromState.data.redirectTo)) {
        Authorization.clear();
      }
      if (_.has(toState, 'data.authorization') && _.has(toState, 'data.redirectTo')) {
        if (_.has(toState, 'data.memory')) {
          Authorization.memorizedState = toState.name;
        }
        $state.go(toState.data.redirectTo);
      }
    }

  });

  $rootScope.onLogout = function() {
    Authorization.clear();
    $state.go('home');
  };
});







//myApp.controller('mainCtrl', require('./js/controllers/mainCtrl'));

//----------------------------------------------------------------
// shopping cart
//
function cart(cartName) {
    this.cartName = cartName;
    this.clearCart = false;
    this.items = [];

    // load items from local storage when initializing
    this.loadItems();

    // save items to local storage when unloading
    var self = this;
    $(window).unload(function () {
        if (self.clearCart) {
            self.clearItems();
        }
        self.saveItems();
        self.clearCart = false;
    });
}

cart.prototype.loadItems = function () {
    var items = localStorage != null ? localStorage[this.cartName + "_items"] : null;
    if (items != null && JSON != null) {
        try {
            var items = JSON.parse(items);
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.id != null && item.name != null && item.color != null && item.size != null&& item.price != null && item.quantity != null  && item.images != null) {
                    item = new cartItem(item.id, item.name,item.color,item.size, item.price, item.quantity,item.images);
                    this.items.push(item);
                }
            }
        }
        catch (err) {
            // ignore errors while loading...
        }
    }
}




cart.prototype.saveItems = function () {
    if (localStorage != null && JSON != null) {
        localStorage[this.cartName + "_items"] = JSON.stringify(this.items);
    }
}




// adds an item to the cart
cart.prototype.addItem = function (id, name, color,size, price, quantity, images) {
    console.log("Added Items!"+ name);
    quantity = this.toNumber(quantity);
    if (quantity != 0) {

        // update quantity for existing item
        var found = false;
        for (var i = 0; i < this.items.length && !found; i++) {
            var item = this.items[i];
            if (item.id == id) {
                found = true;
                item.quantity = this.toNumber(item.quantity + quantity);
                if (item.quantity <= 0) {
                    this.items.splice(i, 1);
                }
            }
        }

        // new item, add now
        if (!found) {
            var item = new cartItem(id, name, color, size, price, quantity, images);
            this.items.push(item);
        }

        // save changes
        //this.saveItems();
    }
}

// get the total price for all items currently in the cart
cart.prototype.getTotalPrice = function (id) {
    var total = 0;
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (id == null || item.id == id) {
            total += this.toNumber(item.quantity * item.price);
        }
    }
    return total;
}

// get the total count for all items currently in the cart
cart.prototype.getTotalCount = function (id) {
    var count = 0;
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (id == null || item.id == id) {
            count += this.toNumber(item.quantity);
        }
    }
    return count;
}

// clear the cart
cart.prototype.clearItems = function () {
    this.items = [];
    this.saveItems();
}


cart.prototype.toNumber = function (value) {
    value = value * 1;
    return isNaN(value) ? 0 : value;
}


//----------------------------------------------------------------
// items in the cart
//
function cartItem(id, name, color, size, price, quantity, images) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.size = size;
    this.price = price;
    this.quantity = quantity;
    this.images = images;
}
function product(obj) {
   this.id = obj["id"];
   this.product_name = obj["product_name"];
   this.product_color = obj["product_color"];
   this.product_price = obj["product_price"];
   this.product_gender = obj["product_gender"];
   this.product_image1 = obj["product_image1"];
   this.product_image2 = obj["product_image2"];
   this.product_image3 = obj["product_image3"];
   this.product_description = obj["product_description"];
}
function store(obj) {
    // this.menproducts = [
    //     new product(1,'Double wool cashmere coat','Charles Black', 1150, 'assets/pictures/clothing/men/1s.jpg', ['assets/pictures/clothing/men/1.jpg','assets/pictures/clothing/men/1ss.jpg']),
    //     new product(2,'Belted trenchcoat','Minuto Balsam Green', 1250, 'assets/pictures/clothing/men/2s.jpg', ['assets/pictures/clothing/men/2.jpg','assets/pictures/clothing/men/2ss.jpg']),
    //     new product(3,'Charles Charcoal Gray','Charles Charcoal Gray', 1150, 'assets/pictures/clothing/men/3s.jpg', ['assets/pictures/clothing/men/3.jpg','assets/pictures/clothing/men/3ss.jpg']),
    //     new product(4,'Shiny bomber jacket','Who Black Black', 340, 'assets/pictures/clothing/men/4s.jpg', ['assets/pictures/clothing/men/4.jpg','assets/pictures/clothing/men/4ss.jpg']),
    //     new product(5,'Apolo double charcoal grey','Apolo double charcoal grey', 750, 'assets/pictures/clothing/men/5s.jpg', ['assets/pictures/clothing/men/5.jpg','assets/pictures/clothing/men/5ss.jpg'])
        
    // ];
   
    this.menproducts = [];
    this.womenproducts = [];

    for(var i=0;i<obj.length;i++){
        this.menproducts.push(new product(obj[i]));
    }

    for(var i=0;i<obj.length;i++){
        this.womenproducts.push(new product(obj[i]));
    }

    // this.womenproducts = [
    //     new product(1,'Sleeveless Coat','Vento Beige Melange', 1250, 'assets/pictures/clothing/women/1s.jpg', ['assets/pictures/clothing/women/1.jpg','assets/pictures/clothing/women/1ss.jpg']),
    //     new product(2,'Slim Fit Denim Jacket','Top It Vintage Light Vintage', 340, 'http://d3pfrs3be80x9y.cloudfront.net/media/catalog/product/cache/7/small_image/301x/17f82f742ffe127f42dca9de82fb58b1/1/2/12H156-94D_A_405.jpg', ['assets/pictures/clothing/women/2.jpg','assets/pictures/clothing/women/2ss.jpg']),
    //     new product(3,'Cashmere Blend Coat','Elsa Double Grey Melange', 1150, 'assets/pictures/clothing/women/3s.jpg', ['assets/pictures/clothing/women/3.jpg','assets/pictures/clothing/women/3ss.jpg']),
    //     new product(4,'Striped Trenchcoat','Verna Linen St Wide Black', 1250, 'assets/pictures/clothing/women/4s.jpg', ['assets/pictures/clothing/women/4.jpg','assets/pictures/clothing/women/4ss.jpg']),
    //     new product(5,'Fringed Poncho','Apolo Fringe Black', 380, 'assets/pictures/clothing/women/5s.jpg', ['assets/pictures/clothing/women/5.jpg','assets/pictures/clothing/women/5ss.jpg'])
        
    // ];

    this.collections = [
        [{src:'assets/pictures/collections/1/1.jpg', id:1},{src:'assets/pictures/collections/1/2.jpg', id:2},{src:'assets/pictures/collections/1/3.jpg', id:3}],
        [{src:'assets/pictures/collections/2/1.jpg', id:1},{src:'assets/pictures/collections/2/2.jpg', id:2},{src:'assets/pictures/collections/2/3.jpg', id:3}],
        [{src:'assets/pictures/collections/3/1.jpg', id:1},{src:'assets/pictures/collections/3/2.jpg', id:2},{src:'assets/pictures/collections/3/3.jpg', id:3}],
        [{src:'assets/pictures/collections/4/1.jpg', id:1},{src:'assets/pictures/collections/4/2.jpg', id:2},{src:'assets/pictures/collections/4/3.jpg', id:3}],
        [{src:'assets/pictures/collections/5/1.jpg', id:1},{src:'assets/pictures/collections/5/2.jpg', id:2},{src:'assets/pictures/collections/5/3.jpg', id:3}],
        [{src:'assets/pictures/collections/6/1.jpg', id:1},{src:'assets/pictures/collections/6/2.jpg', id:2},{src:'assets/pictures/collections/6/3.jpg', id:3}],
    ];
   
}
store.prototype.getMenProducts = function () { 
    return this.menproducts;
}

store.prototype.getMenProduct = function (id) {
    for (var i = 0; i < this.menproducts.length; i++) {
        if (this.menproducts[i].id == id)
            return this.menproducts[i];
    }
    return null;
}

store.prototype.getWomenProduct = function (id) {
    for (var i = 0; i < this.womenproducts.length; i++) {
        if (this.womenproducts[i].id == id)
            return this.womenproducts[i];
    }
    return null;
}
angular.module('myApp').service('Authorization', ['$state',
function($state) {
  console.log("this is your token"+localStorage.getItem('yourTokenKey'));
  this.authorized = (localStorage.getItem('yourTokenKey')==null)?false:true;
  this.memorizedState = null;
  this.userInfo = (localStorage.getItem('userInfo')== null)?{}:JSON.parse(localStorage.getItem('userInfo'));
  var
  clear = function() {
    console.log("logged out");
    this.authorized = false;
    this.memorizedState = null;
    this.userInfo = {};
    localStorage.removeItem('yourTokenKey');
    localStorage.removeItem('userInfo');
    $state.go('shop.women');
  },

  go = function(fallback) {
    this.authorized = true;
    var targetState = this.memorizedState ? this.memorizedState : fallback;
    $state.go(targetState);
  };

  return {
    authorized: this.authorized,
    memorizedState: this.memorizedState,
    userInfo:this.userInfo,
    clear: clear,
    go: go
  };
}
]);

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

angular.module('myApp').controller('collectionController', ['$scope','$state','dataService',
	function ($scope,$state,dataService) {	
		$scope.store=dataService.buildStore('women').then(function(data){
        	$scope.collection_imgs = data.collections;
        });
    		 
   		$scope.currentId=1;

		$('.collection-panel').each(function(){
	  		var $this = this;
	  		$('> :gt(0)', $this).hide();
	  		setInterval(function(){
	    		$('> :first-child',$this).fadeOut(1000)
	      		.next().fadeIn(1000).end()
	      		.appendTo($this);
	  		}, 2000);
		})
	}
]);
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

(function() {
    $(".popup_item").on('blur',function(){
    	$(this).fadeOut(300);
	});
    
    var menController = function ($scope,$uibModal,$log, dataService) {
        $scope.store=dataService.buildStore('men').then(function(data){
          $scope.items = data.menproducts;
        });

        $scope.id=1;
        
        $scope.animationsEnabled = true;

        $scope.open = function (id) {

	      var modalInstance = $uibModal.open({
  	      animation: $scope.animationsEnabled,
  	      templateUrl: 'myModalContent.html',
  	      controller: 'ModalInstanceCtrl',
  	      id: id,
  	      resolve: {
  	        item: function () {
  	          return dataService.buildStore('men').then(function(data){
                 console.log(data.getMenProduct(id));
                 return data.getMenProduct(id);
              });
  	        }
	        }
	      });
	       modalInstance.result.then(function (selectedItem) {
	         $scope.selected = selectedItem;
	       }, function () {
	         $log.info('Modal dismissed at: ' + new Date());
	       });
        };
        
  		$scope.setSize = function (size) {
    			$scope.size=size;
  		};
    };

    var ModalInstanceCtrl = function ($scope, $uibModalInstance, item, dataService) {

  		$scope.item=item;
  		$scope.size='Choose your size';
  		
      $scope.addToOrder= function (item) {

        if($scope.size ==='Choose your size' || $('#quantity').val()=== 0){
          alert('Please Choose a size and a quantity');
          return;
        }
        dataService.cart.addItem(item.id, item.product_name, item.product_color, $scope.size, item.product_price, $('#quantity').val(), item.product_image3);
        $uibModalInstance.dismiss('cancel');
        // console.log("item added "+item.product_name + " quantity is "+$('#quantity').val());

      };

  	  $scope.cancel = function () {
  	    $uibModalInstance.dismiss('cancel');
  	  };

  	  $scope.setSize = function (size) {
      			$scope.size=size;
    		};

      //When changing the route, the modalInstance will disappear. Otherwise, it may cause a bug
      $scope.$on('$routeChangeStart', function(){
          $modalInstance.close();
      });
      };  

  	menController.$inject = ['$scope', '$uibModal','$log','dataService'];
    ModalInstanceCtrl.$inject = ['$scope', '$uibModalInstance', 'item','dataService'];

    angular.module('myApp')
      .controller('menController', menController);
    angular.module('myApp')
      .controller('ModalInstanceCtrl', ModalInstanceCtrl);
    
    
}());
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

angular.module('myApp').controller('storeMapController', ['$scope','dataService', 
  function ($scope, dataService) {
      (function initMap() {
        var myLatLng = {lat: 37.772054, lng: -122.407411};
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 18,
          center: myLatLng
        });

        var marker = new google.maps.Marker({
          position: myLatLng,
          map: map,
          title: 'Headquarter of Perfetto'
        });
      })();
  }
]);

angular.module('myApp').controller('userInfoController', ['$scope','dataService','Authorization', 
    function ($scope,dataService,Authorization) {
       $scope.name = Authorization.userInfo.name;
       $scope.email = Authorization.userInfo.email;
       $scope.phone = Authorization.userInfo.phone_number;
       $scope.shippingAddress = Authorization.userInfo.shipping_address;
       $scope.billingAddress = Authorization.userInfo.billing_address;
    }
]);

(function() {
    $(".popup_item").on('blur',function(){
    	$(this).fadeOut(300);
	});
    
    var womenController = function ($scope,$uibModal,$log, dataService) {
        $scope.store=dataService.buildStore('women').then(function(data){
          $scope.items = data.womenproducts;
          console.log($scope.items);
        });
        $scope.id=1;
        
        $scope.animationsEnabled = true;

        $scope.open = function (id) {

	      var modalInstance = $uibModal.open({
  	      animation: $scope.animationsEnabled,
  	      templateUrl: 'myModalContent.html',
  	      controller: 'ModalInstanceCtrl2',
  	      id: id,
  	      resolve: {
            item: function () {
              return dataService.buildStore('women').then(function(data){
                 console.log(data.getWomenProduct(id));
                 return data.getWomenProduct(id);
              });
            }
          }
	      });
	    modalInstance.result.then(function (selectedItem) {
	      $scope.selected = selectedItem;
	    }, function () {
	      $log.info('Modal dismissed at: ' + new Date());
	    });
        };
        

  		$scope.setSize = function (size) {
    			$scope.size=size;
  		};

    };

    var ModalInstanceCtrl2 = function ($scope, $uibModalInstance, item, dataService) {
      console.log("aa");
      console.log(item);
  		$scope.item=item;
  		$scope.size='Choose your size';
  		
      $scope.addToOrder= function (item) {

        if($scope.size ==='Choose your size' || $('#quantity').val()=== 0){
          alert('Please Choose a size and a quantity');
          return;
        }
        dataService.cart.addItem(item.id, item.product_name, item.product_color, $scope.size, item.product_price, $('#quantity').val(), item.product_image3);
        $uibModalInstance.dismiss('cancel');
        // console.log("item added "+item.product_name + " quantity is "+$('#quantity').val());

      };

  	  $scope.cancel = function () {
  	    $uibModalInstance.dismiss('cancel');
  	  };

  	  $scope.setSize = function (size) {
      			$scope.size=size;
    		};

      //When changing the route, the modalInstance will disappear. Otherwise, it may cause a bug
      $scope.$on('$routeChangeStart', function(){
          $modalInstance.close();
      });
      };  

  	womenController.$inject = ['$scope', '$uibModal','$log','dataService'];
    ModalInstanceCtrl2.$inject = ['$scope', '$uibModalInstance', 'item','dataService'];

    angular.module('myApp')
      .controller('womenController', womenController);
    angular.module('myApp')
      .controller('ModalInstanceCtrl2', ModalInstanceCtrl2);
    
    
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiY2xhc3Nlcy9jYXJ0LmpzIiwiY2xhc3Nlcy9wcm9kdWN0LmpzIiwiY2xhc3Nlcy9zdG9yZS5qcyIsInNlcnZpY2VzL2F1dGhTZXJ2aWNlLmpzIiwic2VydmljZXMvZGF0YVNlcnZpY2UuanMiLCJjb250cm9sbGVycy9hZG1pbkNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9jYXJ0Q29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL2NoZWNrb3V0Q29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL2NvbGxlY3Rpb25Db250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvbG9naW5Db250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvbWVuQ29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL29yZGVySW5mb0NvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9wcm9maWxlQ29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL3Nob3BDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvc3RvcmVNYXBDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvdXNlckluZm9Db250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvd29tZW5Db250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgbXlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnbXlBcHAnLCBbJ3VpLnJvdXRlcicsJ25nQW5pbWF0ZScsICd1aS5ib290c3RyYXAnXSk7XG5cbm15QXBwXG4uY29uc3RhbnQoJ18nLCB3aW5kb3cuXylcbi5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJHByb3ZpZGUpIHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvaG9tZScpO1xuICAgIFxuICAgIC8vVG8gbWFrZSBuYXZpZ2F0aW9uIHRvIHRoZSB0b3Agb2YgdGhlIHBhZ2UsIGJ1dCBub3QgdG8gdGhlIHVpLXZpZXdcbiAgICAkcHJvdmlkZS5kZWNvcmF0b3IoJyR1aVZpZXdTY3JvbGwnLCBmdW5jdGlvbiAoJGRlbGVnYXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh1aVZpZXdFbGVtZW50KSB7IH07IFxuICAgIH0pO1xuXG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgXG4gICAgICAgIC8vIEhPTUUgU1RBVEVTIFxuICAgICAgICAuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgICAgICB1cmw6ICcvaG9tZScsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3ZpZXcvcGFydGlhbC1ob21lLmh0bWwnXG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgICAgICAvLyBDQVJUIFBBR0VcbiAgICAgICAgLnN0YXRlKCdjYXJ0Jywge1xuICAgICAgICAgICAgdXJsOiAnL2NhcnQnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy92aWV3L2NhcnQuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnY2FydENvbnRyb2xsZXInXG4gICAgICAgIH0pXG4gICAgICAgIC8vIENIRUNLT1VUIFBBR0VcbiAgICAgICAgLnN0YXRlKCdjaGVja291dCcsIHtcbiAgICAgICAgICAgIHVybDogJy9jaGVja291dCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3ZpZXcvY2hlY2tvdXQuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnY2hlY2tvdXRDb250cm9sbGVyJ1xuICAgICAgICB9KVxuICAgICAgICAvLyBMT0dJTiBQQUdFXG4gICAgICAgIC5zdGF0ZSgnYWNjb3VudF9sb2dpbicsIHtcbiAgICAgICAgICAgIHVybDogJy9hY2NvdW50X2xvZ2luJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdmlldy9hY2NvdW50X2xvZ2luLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ2xvZ2luQ29udHJvbGxlcidcbiAgICAgICAgfSlcbiAgICAgICAgLy8gUFJPRklMRSBQQUdFXG4gICAgICAgIC5zdGF0ZSgncHJvZmlsZScsIHtcbiAgICAgICAgICAgIHVybDogJy9wcm9maWxlJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdmlldy9wcm9maWxlLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ3Byb2ZpbGVDb250cm9sbGVyJyxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlZGlyZWN0VG86ICdhY2NvdW50X2xvZ2luJyxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLy8gVVNFUklORk8gUEFHRVxuICAgICAgICAuc3RhdGUoJ3Byb2ZpbGUudXNlckluZm8nLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3ZpZXcvdXNlckluZm8uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICd1c2VySW5mb0NvbnRyb2xsZXInXG4gICAgICAgIH0pXG4gICAgICAgIC8vIE9SREVSIFBBR0VcbiAgICAgICAgLnN0YXRlKCdwcm9maWxlLm9yZGVycycsIHtcbiAgICAgICAgdXJsOiAnL3Byb2ZpbGUvb3JkZXJzJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy92aWV3L29yZGVySW5mby5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ29yZGVySW5mb0NvbnRyb2xsZXInXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4nLCB7XG4gICAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdmlldy9hZG1pbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2FkbWluQ29udHJvbGxlcidcbiAgICAgICAgfSkgICAgICAgIFxuICAgICAgICAvLyBTSE9QIFBBR0UgQU5EIE5FU1RFRCBWSUVXUyAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIC5zdGF0ZSgnc2hvcCcsIHtcbiAgICAgICAgICBcdHVybDogJy9zaG9wJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdmlldy9zaG9wLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ3Nob3BDb250cm9sbGVyJ1xuICAgICAgICB9KVxuICAgICAgICAvLyBTSE9QTUVOIFBBR0VcbiAgICAgICAgLnN0YXRlKCdzaG9wLm1lbicsIHtcbiAgICAgICAgdXJsOiAnL21lbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdmlldy9tZW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdtZW5Db250cm9sbGVyJ1xuICAgIFx0fSlcbiAgICAgICAgLy8gU0hPUFdPTUVOIFBBR0VcbiAgICAgICAgIC5zdGF0ZSgnc2hvcC53b21lbicsIHtcbiAgICAgICAgdXJsOiAnL3dvbWVuJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy92aWV3L3dvbWVuLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnd29tZW5Db250cm9sbGVyJ1xuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3Nob3AuY29sbGVjdGlvbicsIHtcbiAgICAgICAgdXJsOiAnL2NvbGxlY3Rpb24nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3ZpZXcvY29sbGVjdGlvbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2NvbGxlY3Rpb25Db250cm9sbGVyJ1xuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3Nob3Auc3RvcmVtYXAnLCB7XG4gICAgICAgIHVybDogJy9zdG9yZW1hcCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdmlldy9zdG9yZU1hcC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3N0b3JlTWFwQ29udHJvbGxlcidcbiAgICAgICAgfSk7XG59KVxuLnJ1bihmdW5jdGlvbihfLCRyb290U2NvcGUsICRzdGF0ZSwgQXV0aG9yaXphdGlvbikge1xuICAkcm9vdFNjb3BlLl8gPSB3aW5kb3cuXztcbiAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZSwgZnJvbVBhcmFtcykge1xuICAgIGlmICghQXV0aG9yaXphdGlvbi5hdXRob3JpemVkKSB7XG4gICAgICBpZiAoQXV0aG9yaXphdGlvbi5tZW1vcml6ZWRTdGF0ZSAmJiAoIV8uaGFzKGZyb21TdGF0ZSwgJ2RhdGEucmVkaXJlY3RUbycpIHx8IHRvU3RhdGUubmFtZSAhPT0gZnJvbVN0YXRlLmRhdGEucmVkaXJlY3RUbykpIHtcbiAgICAgICAgQXV0aG9yaXphdGlvbi5jbGVhcigpO1xuICAgICAgfVxuICAgICAgaWYgKF8uaGFzKHRvU3RhdGUsICdkYXRhLmF1dGhvcml6YXRpb24nKSAmJiBfLmhhcyh0b1N0YXRlLCAnZGF0YS5yZWRpcmVjdFRvJykpIHtcbiAgICAgICAgaWYgKF8uaGFzKHRvU3RhdGUsICdkYXRhLm1lbW9yeScpKSB7XG4gICAgICAgICAgQXV0aG9yaXphdGlvbi5tZW1vcml6ZWRTdGF0ZSA9IHRvU3RhdGUubmFtZTtcbiAgICAgICAgfVxuICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5kYXRhLnJlZGlyZWN0VG8pO1xuICAgICAgfVxuICAgIH1cblxuICB9KTtcblxuICAkcm9vdFNjb3BlLm9uTG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgQXV0aG9yaXphdGlvbi5jbGVhcigpO1xuICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICB9O1xufSk7XG5cblxuXG5cblxuXG5cbi8vbXlBcHAuY29udHJvbGxlcignbWFpbkN0cmwnLCByZXF1aXJlKCcuL2pzL2NvbnRyb2xsZXJzL21haW5DdHJsJykpO1xuIiwiLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBzaG9wcGluZyBjYXJ0XG4vL1xuZnVuY3Rpb24gY2FydChjYXJ0TmFtZSkge1xuICAgIHRoaXMuY2FydE5hbWUgPSBjYXJ0TmFtZTtcbiAgICB0aGlzLmNsZWFyQ2FydCA9IGZhbHNlO1xuICAgIHRoaXMuaXRlbXMgPSBbXTtcblxuICAgIC8vIGxvYWQgaXRlbXMgZnJvbSBsb2NhbCBzdG9yYWdlIHdoZW4gaW5pdGlhbGl6aW5nXG4gICAgdGhpcy5sb2FkSXRlbXMoKTtcblxuICAgIC8vIHNhdmUgaXRlbXMgdG8gbG9jYWwgc3RvcmFnZSB3aGVuIHVubG9hZGluZ1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAkKHdpbmRvdykudW5sb2FkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHNlbGYuY2xlYXJDYXJ0KSB7XG4gICAgICAgICAgICBzZWxmLmNsZWFySXRlbXMoKTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLnNhdmVJdGVtcygpO1xuICAgICAgICBzZWxmLmNsZWFyQ2FydCA9IGZhbHNlO1xuICAgIH0pO1xufVxuXG5jYXJ0LnByb3RvdHlwZS5sb2FkSXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGl0ZW1zID0gbG9jYWxTdG9yYWdlICE9IG51bGwgPyBsb2NhbFN0b3JhZ2VbdGhpcy5jYXJ0TmFtZSArIFwiX2l0ZW1zXCJdIDogbnVsbDtcbiAgICBpZiAoaXRlbXMgIT0gbnVsbCAmJiBKU09OICE9IG51bGwpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IEpTT04ucGFyc2UoaXRlbXMpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gaXRlbXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uaWQgIT0gbnVsbCAmJiBpdGVtLm5hbWUgIT0gbnVsbCAmJiBpdGVtLmNvbG9yICE9IG51bGwgJiYgaXRlbS5zaXplICE9IG51bGwmJiBpdGVtLnByaWNlICE9IG51bGwgJiYgaXRlbS5xdWFudGl0eSAhPSBudWxsICAmJiBpdGVtLmltYWdlcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0gPSBuZXcgY2FydEl0ZW0oaXRlbS5pZCwgaXRlbS5uYW1lLGl0ZW0uY29sb3IsaXRlbS5zaXplLCBpdGVtLnByaWNlLCBpdGVtLnF1YW50aXR5LGl0ZW0uaW1hZ2VzKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAvLyBpZ25vcmUgZXJyb3JzIHdoaWxlIGxvYWRpbmcuLi5cbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5cblxuY2FydC5wcm90b3R5cGUuc2F2ZUl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChsb2NhbFN0b3JhZ2UgIT0gbnVsbCAmJiBKU09OICE9IG51bGwpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlW3RoaXMuY2FydE5hbWUgKyBcIl9pdGVtc1wiXSA9IEpTT04uc3RyaW5naWZ5KHRoaXMuaXRlbXMpO1xuICAgIH1cbn1cblxuXG5cblxuLy8gYWRkcyBhbiBpdGVtIHRvIHRoZSBjYXJ0XG5jYXJ0LnByb3RvdHlwZS5hZGRJdGVtID0gZnVuY3Rpb24gKGlkLCBuYW1lLCBjb2xvcixzaXplLCBwcmljZSwgcXVhbnRpdHksIGltYWdlcykge1xuICAgIGNvbnNvbGUubG9nKFwiQWRkZWQgSXRlbXMhXCIrIG5hbWUpO1xuICAgIHF1YW50aXR5ID0gdGhpcy50b051bWJlcihxdWFudGl0eSk7XG4gICAgaWYgKHF1YW50aXR5ICE9IDApIHtcblxuICAgICAgICAvLyB1cGRhdGUgcXVhbnRpdHkgZm9yIGV4aXN0aW5nIGl0ZW1cbiAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGggJiYgIWZvdW5kOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5pdGVtc1tpXTtcbiAgICAgICAgICAgIGlmIChpdGVtLmlkID09IGlkKSB7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGl0ZW0ucXVhbnRpdHkgPSB0aGlzLnRvTnVtYmVyKGl0ZW0ucXVhbnRpdHkgKyBxdWFudGl0eSk7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ucXVhbnRpdHkgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBuZXcgaXRlbSwgYWRkIG5vd1xuICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IG5ldyBjYXJ0SXRlbShpZCwgbmFtZSwgY29sb3IsIHNpemUsIHByaWNlLCBxdWFudGl0eSwgaW1hZ2VzKTtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNhdmUgY2hhbmdlc1xuICAgICAgICAvL3RoaXMuc2F2ZUl0ZW1zKCk7XG4gICAgfVxufVxuXG4vLyBnZXQgdGhlIHRvdGFsIHByaWNlIGZvciBhbGwgaXRlbXMgY3VycmVudGx5IGluIHRoZSBjYXJ0XG5jYXJ0LnByb3RvdHlwZS5nZXRUb3RhbFByaWNlID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgdmFyIHRvdGFsID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2ldO1xuICAgICAgICBpZiAoaWQgPT0gbnVsbCB8fCBpdGVtLmlkID09IGlkKSB7XG4gICAgICAgICAgICB0b3RhbCArPSB0aGlzLnRvTnVtYmVyKGl0ZW0ucXVhbnRpdHkgKiBpdGVtLnByaWNlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG90YWw7XG59XG5cbi8vIGdldCB0aGUgdG90YWwgY291bnQgZm9yIGFsbCBpdGVtcyBjdXJyZW50bHkgaW4gdGhlIGNhcnRcbmNhcnQucHJvdG90eXBlLmdldFRvdGFsQ291bnQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaV07XG4gICAgICAgIGlmIChpZCA9PSBudWxsIHx8IGl0ZW0uaWQgPT0gaWQpIHtcbiAgICAgICAgICAgIGNvdW50ICs9IHRoaXMudG9OdW1iZXIoaXRlbS5xdWFudGl0eSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvdW50O1xufVxuXG4vLyBjbGVhciB0aGUgY2FydFxuY2FydC5wcm90b3R5cGUuY2xlYXJJdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLml0ZW1zID0gW107XG4gICAgdGhpcy5zYXZlSXRlbXMoKTtcbn1cblxuXG5jYXJ0LnByb3RvdHlwZS50b051bWJlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhbHVlID0gdmFsdWUgKiAxO1xuICAgIHJldHVybiBpc05hTih2YWx1ZSkgPyAwIDogdmFsdWU7XG59XG5cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBpdGVtcyBpbiB0aGUgY2FydFxuLy9cbmZ1bmN0aW9uIGNhcnRJdGVtKGlkLCBuYW1lLCBjb2xvciwgc2l6ZSwgcHJpY2UsIHF1YW50aXR5LCBpbWFnZXMpIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgdGhpcy5zaXplID0gc2l6ZTtcbiAgICB0aGlzLnByaWNlID0gcHJpY2U7XG4gICAgdGhpcy5xdWFudGl0eSA9IHF1YW50aXR5O1xuICAgIHRoaXMuaW1hZ2VzID0gaW1hZ2VzO1xufSIsImZ1bmN0aW9uIHByb2R1Y3Qob2JqKSB7XG4gICB0aGlzLmlkID0gb2JqW1wiaWRcIl07XG4gICB0aGlzLnByb2R1Y3RfbmFtZSA9IG9ialtcInByb2R1Y3RfbmFtZVwiXTtcbiAgIHRoaXMucHJvZHVjdF9jb2xvciA9IG9ialtcInByb2R1Y3RfY29sb3JcIl07XG4gICB0aGlzLnByb2R1Y3RfcHJpY2UgPSBvYmpbXCJwcm9kdWN0X3ByaWNlXCJdO1xuICAgdGhpcy5wcm9kdWN0X2dlbmRlciA9IG9ialtcInByb2R1Y3RfZ2VuZGVyXCJdO1xuICAgdGhpcy5wcm9kdWN0X2ltYWdlMSA9IG9ialtcInByb2R1Y3RfaW1hZ2UxXCJdO1xuICAgdGhpcy5wcm9kdWN0X2ltYWdlMiA9IG9ialtcInByb2R1Y3RfaW1hZ2UyXCJdO1xuICAgdGhpcy5wcm9kdWN0X2ltYWdlMyA9IG9ialtcInByb2R1Y3RfaW1hZ2UzXCJdO1xuICAgdGhpcy5wcm9kdWN0X2Rlc2NyaXB0aW9uID0gb2JqW1wicHJvZHVjdF9kZXNjcmlwdGlvblwiXTtcbn0iLCJmdW5jdGlvbiBzdG9yZShvYmopIHtcbiAgICAvLyB0aGlzLm1lbnByb2R1Y3RzID0gW1xuICAgIC8vICAgICBuZXcgcHJvZHVjdCgxLCdEb3VibGUgd29vbCBjYXNobWVyZSBjb2F0JywnQ2hhcmxlcyBCbGFjaycsIDExNTAsICdhc3NldHMvcGljdHVyZXMvY2xvdGhpbmcvbWVuLzFzLmpwZycsIFsnYXNzZXRzL3BpY3R1cmVzL2Nsb3RoaW5nL21lbi8xLmpwZycsJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy9tZW4vMXNzLmpwZyddKSxcbiAgICAvLyAgICAgbmV3IHByb2R1Y3QoMiwnQmVsdGVkIHRyZW5jaGNvYXQnLCdNaW51dG8gQmFsc2FtIEdyZWVuJywgMTI1MCwgJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy9tZW4vMnMuanBnJywgWydhc3NldHMvcGljdHVyZXMvY2xvdGhpbmcvbWVuLzIuanBnJywnYXNzZXRzL3BpY3R1cmVzL2Nsb3RoaW5nL21lbi8yc3MuanBnJ10pLFxuICAgIC8vICAgICBuZXcgcHJvZHVjdCgzLCdDaGFybGVzIENoYXJjb2FsIEdyYXknLCdDaGFybGVzIENoYXJjb2FsIEdyYXknLCAxMTUwLCAnYXNzZXRzL3BpY3R1cmVzL2Nsb3RoaW5nL21lbi8zcy5qcGcnLCBbJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy9tZW4vMy5qcGcnLCdhc3NldHMvcGljdHVyZXMvY2xvdGhpbmcvbWVuLzNzcy5qcGcnXSksXG4gICAgLy8gICAgIG5ldyBwcm9kdWN0KDQsJ1NoaW55IGJvbWJlciBqYWNrZXQnLCdXaG8gQmxhY2sgQmxhY2snLCAzNDAsICdhc3NldHMvcGljdHVyZXMvY2xvdGhpbmcvbWVuLzRzLmpwZycsIFsnYXNzZXRzL3BpY3R1cmVzL2Nsb3RoaW5nL21lbi80LmpwZycsJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy9tZW4vNHNzLmpwZyddKSxcbiAgICAvLyAgICAgbmV3IHByb2R1Y3QoNSwnQXBvbG8gZG91YmxlIGNoYXJjb2FsIGdyZXknLCdBcG9sbyBkb3VibGUgY2hhcmNvYWwgZ3JleScsIDc1MCwgJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy9tZW4vNXMuanBnJywgWydhc3NldHMvcGljdHVyZXMvY2xvdGhpbmcvbWVuLzUuanBnJywnYXNzZXRzL3BpY3R1cmVzL2Nsb3RoaW5nL21lbi81c3MuanBnJ10pXG4gICAgICAgIFxuICAgIC8vIF07XG4gICBcbiAgICB0aGlzLm1lbnByb2R1Y3RzID0gW107XG4gICAgdGhpcy53b21lbnByb2R1Y3RzID0gW107XG5cbiAgICBmb3IodmFyIGk9MDtpPG9iai5sZW5ndGg7aSsrKXtcbiAgICAgICAgdGhpcy5tZW5wcm9kdWN0cy5wdXNoKG5ldyBwcm9kdWN0KG9ialtpXSkpO1xuICAgIH1cblxuICAgIGZvcih2YXIgaT0wO2k8b2JqLmxlbmd0aDtpKyspe1xuICAgICAgICB0aGlzLndvbWVucHJvZHVjdHMucHVzaChuZXcgcHJvZHVjdChvYmpbaV0pKTtcbiAgICB9XG5cbiAgICAvLyB0aGlzLndvbWVucHJvZHVjdHMgPSBbXG4gICAgLy8gICAgIG5ldyBwcm9kdWN0KDEsJ1NsZWV2ZWxlc3MgQ29hdCcsJ1ZlbnRvIEJlaWdlIE1lbGFuZ2UnLCAxMjUwLCAnYXNzZXRzL3BpY3R1cmVzL2Nsb3RoaW5nL3dvbWVuLzFzLmpwZycsIFsnYXNzZXRzL3BpY3R1cmVzL2Nsb3RoaW5nL3dvbWVuLzEuanBnJywnYXNzZXRzL3BpY3R1cmVzL2Nsb3RoaW5nL3dvbWVuLzFzcy5qcGcnXSksXG4gICAgLy8gICAgIG5ldyBwcm9kdWN0KDIsJ1NsaW0gRml0IERlbmltIEphY2tldCcsJ1RvcCBJdCBWaW50YWdlIExpZ2h0IFZpbnRhZ2UnLCAzNDAsICdodHRwOi8vZDNwZnJzM2JlODB4OXkuY2xvdWRmcm9udC5uZXQvbWVkaWEvY2F0YWxvZy9wcm9kdWN0L2NhY2hlLzcvc21hbGxfaW1hZ2UvMzAxeC8xN2Y4MmY3NDJmZmUxMjdmNDJkY2E5ZGU4MmZiNThiMS8xLzIvMTJIMTU2LTk0RF9BXzQwNS5qcGcnLCBbJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy93b21lbi8yLmpwZycsJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy93b21lbi8yc3MuanBnJ10pLFxuICAgIC8vICAgICBuZXcgcHJvZHVjdCgzLCdDYXNobWVyZSBCbGVuZCBDb2F0JywnRWxzYSBEb3VibGUgR3JleSBNZWxhbmdlJywgMTE1MCwgJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy93b21lbi8zcy5qcGcnLCBbJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy93b21lbi8zLmpwZycsJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy93b21lbi8zc3MuanBnJ10pLFxuICAgIC8vICAgICBuZXcgcHJvZHVjdCg0LCdTdHJpcGVkIFRyZW5jaGNvYXQnLCdWZXJuYSBMaW5lbiBTdCBXaWRlIEJsYWNrJywgMTI1MCwgJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy93b21lbi80cy5qcGcnLCBbJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy93b21lbi80LmpwZycsJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy93b21lbi80c3MuanBnJ10pLFxuICAgIC8vICAgICBuZXcgcHJvZHVjdCg1LCdGcmluZ2VkIFBvbmNobycsJ0Fwb2xvIEZyaW5nZSBCbGFjaycsIDM4MCwgJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy93b21lbi81cy5qcGcnLCBbJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy93b21lbi81LmpwZycsJ2Fzc2V0cy9waWN0dXJlcy9jbG90aGluZy93b21lbi81c3MuanBnJ10pXG4gICAgICAgIFxuICAgIC8vIF07XG5cbiAgICB0aGlzLmNvbGxlY3Rpb25zID0gW1xuICAgICAgICBbe3NyYzonYXNzZXRzL3BpY3R1cmVzL2NvbGxlY3Rpb25zLzEvMS5qcGcnLCBpZDoxfSx7c3JjOidhc3NldHMvcGljdHVyZXMvY29sbGVjdGlvbnMvMS8yLmpwZycsIGlkOjJ9LHtzcmM6J2Fzc2V0cy9waWN0dXJlcy9jb2xsZWN0aW9ucy8xLzMuanBnJywgaWQ6M31dLFxuICAgICAgICBbe3NyYzonYXNzZXRzL3BpY3R1cmVzL2NvbGxlY3Rpb25zLzIvMS5qcGcnLCBpZDoxfSx7c3JjOidhc3NldHMvcGljdHVyZXMvY29sbGVjdGlvbnMvMi8yLmpwZycsIGlkOjJ9LHtzcmM6J2Fzc2V0cy9waWN0dXJlcy9jb2xsZWN0aW9ucy8yLzMuanBnJywgaWQ6M31dLFxuICAgICAgICBbe3NyYzonYXNzZXRzL3BpY3R1cmVzL2NvbGxlY3Rpb25zLzMvMS5qcGcnLCBpZDoxfSx7c3JjOidhc3NldHMvcGljdHVyZXMvY29sbGVjdGlvbnMvMy8yLmpwZycsIGlkOjJ9LHtzcmM6J2Fzc2V0cy9waWN0dXJlcy9jb2xsZWN0aW9ucy8zLzMuanBnJywgaWQ6M31dLFxuICAgICAgICBbe3NyYzonYXNzZXRzL3BpY3R1cmVzL2NvbGxlY3Rpb25zLzQvMS5qcGcnLCBpZDoxfSx7c3JjOidhc3NldHMvcGljdHVyZXMvY29sbGVjdGlvbnMvNC8yLmpwZycsIGlkOjJ9LHtzcmM6J2Fzc2V0cy9waWN0dXJlcy9jb2xsZWN0aW9ucy80LzMuanBnJywgaWQ6M31dLFxuICAgICAgICBbe3NyYzonYXNzZXRzL3BpY3R1cmVzL2NvbGxlY3Rpb25zLzUvMS5qcGcnLCBpZDoxfSx7c3JjOidhc3NldHMvcGljdHVyZXMvY29sbGVjdGlvbnMvNS8yLmpwZycsIGlkOjJ9LHtzcmM6J2Fzc2V0cy9waWN0dXJlcy9jb2xsZWN0aW9ucy81LzMuanBnJywgaWQ6M31dLFxuICAgICAgICBbe3NyYzonYXNzZXRzL3BpY3R1cmVzL2NvbGxlY3Rpb25zLzYvMS5qcGcnLCBpZDoxfSx7c3JjOidhc3NldHMvcGljdHVyZXMvY29sbGVjdGlvbnMvNi8yLmpwZycsIGlkOjJ9LHtzcmM6J2Fzc2V0cy9waWN0dXJlcy9jb2xsZWN0aW9ucy82LzMuanBnJywgaWQ6M31dLFxuICAgIF07XG4gICBcbn1cbnN0b3JlLnByb3RvdHlwZS5nZXRNZW5Qcm9kdWN0cyA9IGZ1bmN0aW9uICgpIHsgXG4gICAgcmV0dXJuIHRoaXMubWVucHJvZHVjdHM7XG59XG5cbnN0b3JlLnByb3RvdHlwZS5nZXRNZW5Qcm9kdWN0ID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1lbnByb2R1Y3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLm1lbnByb2R1Y3RzW2ldLmlkID09IGlkKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWVucHJvZHVjdHNbaV07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG5zdG9yZS5wcm90b3R5cGUuZ2V0V29tZW5Qcm9kdWN0ID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndvbWVucHJvZHVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMud29tZW5wcm9kdWN0c1tpXS5pZCA9PSBpZClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndvbWVucHJvZHVjdHNbaV07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufSIsImFuZ3VsYXIubW9kdWxlKCdteUFwcCcpLnNlcnZpY2UoJ0F1dGhvcml6YXRpb24nLCBbJyRzdGF0ZScsXG5mdW5jdGlvbigkc3RhdGUpIHtcbiAgY29uc29sZS5sb2coXCJ0aGlzIGlzIHlvdXIgdG9rZW5cIitsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgneW91clRva2VuS2V5JykpO1xuICB0aGlzLmF1dGhvcml6ZWQgPSAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3lvdXJUb2tlbktleScpPT1udWxsKT9mYWxzZTp0cnVlO1xuICB0aGlzLm1lbW9yaXplZFN0YXRlID0gbnVsbDtcbiAgdGhpcy51c2VySW5mbyA9IChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlckluZm8nKT09IG51bGwpP3t9OkpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJJbmZvJykpO1xuICB2YXJcbiAgY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyhcImxvZ2dlZCBvdXRcIik7XG4gICAgdGhpcy5hdXRob3JpemVkID0gZmFsc2U7XG4gICAgdGhpcy5tZW1vcml6ZWRTdGF0ZSA9IG51bGw7XG4gICAgdGhpcy51c2VySW5mbyA9IHt9O1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd5b3VyVG9rZW5LZXknKTtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndXNlckluZm8nKTtcbiAgICAkc3RhdGUuZ28oJ3Nob3Aud29tZW4nKTtcbiAgfSxcblxuICBnbyA9IGZ1bmN0aW9uKGZhbGxiYWNrKSB7XG4gICAgdGhpcy5hdXRob3JpemVkID0gdHJ1ZTtcbiAgICB2YXIgdGFyZ2V0U3RhdGUgPSB0aGlzLm1lbW9yaXplZFN0YXRlID8gdGhpcy5tZW1vcml6ZWRTdGF0ZSA6IGZhbGxiYWNrO1xuICAgICRzdGF0ZS5nbyh0YXJnZXRTdGF0ZSk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBhdXRob3JpemVkOiB0aGlzLmF1dGhvcml6ZWQsXG4gICAgbWVtb3JpemVkU3RhdGU6IHRoaXMubWVtb3JpemVkU3RhdGUsXG4gICAgdXNlckluZm86dGhpcy51c2VySW5mbyxcbiAgICBjbGVhcjogY2xlYXIsXG4gICAgZ286IGdvXG4gIH07XG59XG5dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdteUFwcCcpLnNlcnZpY2UoJ2RhdGFTZXJ2aWNlJywgWyckaHR0cCcsXG5cdGZ1bmN0aW9uICgkaHR0cCkge1xuICAgIGZ1bmN0aW9uIGJ1aWxkU3RvcmUoZ2VuZGVyKXtcbiAgXHRcdHZhciB1cmwgPSAnL3Byb2R1Y3RzLycrZ2VuZGVyO1xuICBcdFx0cmV0dXJuICRodHRwLmdldCh1cmwpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gIFx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuICBcdFx0XHRyZXR1cm4gbmV3IHN0b3JlKGRhdGEuZGF0YSk7XHRcbiAgXHRcdH0pO1xuICBcdH1cblx0XHR2YXIgbXlDYXJ0ID0gbmV3IGNhcnQoXCJBbmd1bGFyU3RvcmVcIik7XG5cdCAgICByZXR1cm4ge1xuXHQgICAgICAgIGNhcnQ6IG15Q2FydCxcblx0ICAgICAgICBidWlsZFN0b3JlOmJ1aWxkU3RvcmVcblx0ICAgIH07ICAgIFx0XG4gICAgfVxuXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnbXlBcHAnKS5jb250cm9sbGVyKCdhZG1pbkNvbnRyb2xsZXInLCBbJyRzY29wZScsJyRodHRwJywnJHN0YXRlJywnZGF0YVNlcnZpY2UnLCdBdXRob3JpemF0aW9uJywgXG4gICAgZnVuY3Rpb24gKCRzY29wZSwkaHR0cCwgJHN0YXRlLGRhdGFTZXJ2aWNlLCBBdXRob3JpemF0aW9uKSB7XG4gICAgICAkc2NvcGUubmFtZSA9IFwiXCI7XG4gICAgICAkc2NvcGUuY29sb3IgPSBcIlwiO1xuICAgICAgJHNjb3BlLnByaWNlID0gXCJcIjtcbiAgICAgICRzY29wZS5nZW5kZXIgPSBcIlwiO1xuICAgICAgJHNjb3BlLmltYWdlX3NtYWxsID0gXCJcIjtcbiAgICAgICRzY29wZS5pbWFnZV9sYXJnZSA9IFwiXCI7XG4gICAgICAkc2NvcGUuaW1hZ2VfbGFyZ2UyID0gXCJcIjtcbiAgICAgICRzY29wZS5kZXNjcmlwdGlvbiA9IFwiXCI7XG4gICAgICBcblxuICAgICAgJHNjb3BlLnBvc3RQcm9kdWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBib2R5ID0ge1xuICAgICAgICAgIHByb2R1Y3RfbmFtZTogJHNjb3BlLm5hbWUsXG4gICAgICAgICAgcHJvZHVjdF9jb2xvcjogJHNjb3BlLmNvbG9yLFxuICAgICAgICAgIHByb2R1Y3RfcHJpY2U6ICRzY29wZS5wcmljZSxcbiAgICAgICAgICBwcm9kdWN0X2dlbmRlcjogJHNjb3BlLmdlbmRlcixcbiAgICAgICAgICBwcm9kdWN0X2ltYWdlMTogJHNjb3BlLmltYWdlX3NtYWxsICxcbiAgICAgICAgICBwcm9kdWN0X2ltYWdlMjogJHNjb3BlLmltYWdlX2xhcmdlICxcbiAgICAgICAgICBwcm9kdWN0X2ltYWdlMzogJHNjb3BlLmltYWdlX2xhcmdlMiAsXG4gICAgICAgICAgcHJvZHVjdF9kZXNjcmlwdGlvbjogJHNjb3BlLmRlc2NyaXB0aW9uXG4gICAgICAgIH07XG4gICAgICAgIHZhciByZXEgPSB7XG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgdXJsOiAnL3Byb2R1Y3RzJyxcbiAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShib2R5KVxuICAgICAgICB9OyBcbiAgICAgICAgICAgXG4gICAgICAgICRodHRwKHJlcSkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgIGFsZXJ0KFwiU3VjY3Vlc3NmdWxseSBwb3N0IHByb2R1Y3QgaW5mb1wiKTsgICAgICBcbiAgICAgICAgfSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICBhbGVydChcIkZhaWxlZCBwb3N0IHByb2R1Y3QgaW5mb1wiKTtcbiAgICAgICAgfSk7IFxuICAgICAgfVxuICAgICAgXG4gICAgfVxuXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnbXlBcHAnKS5jb250cm9sbGVyKCdjYXJ0Q29udHJvbGxlcicsIFsnJHNjb3BlJywnJGh0dHAnLCckc3RhdGUnLCdkYXRhU2VydmljZScsJ0F1dGhvcml6YXRpb24nLCBcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCRodHRwLCAkc3RhdGUsZGF0YVNlcnZpY2UsIEF1dGhvcml6YXRpb24pIHtcbiAgICAgICRzY29wZS5jYXJ0ID0gZGF0YVNlcnZpY2UuY2FydDtcbiAgICAgICRzY29wZS5uYW1lID0gKEF1dGhvcml6YXRpb24uYXV0aG9yaXplZCk/QXV0aG9yaXphdGlvbi51c2VySW5mby5uYW1lOidHdWVzdCc7XG4gICAgICAkc2NvcGUubG9jYXRpb24gPSAoQXV0aG9yaXphdGlvbi5hdXRob3JpemVkKT8gJ3Byb2ZpbGUudXNlckluZm8nOidhY2NvdW50X2xvZ2luJztcbiAgICAgICRzY29wZS5nb0NoZWNrb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRhdGVPYmogPSBuZXcgRGF0ZSgpO1xuICAgICAgdmFyIG1vbnRoID0gZGF0ZU9iai5nZXRVVENNb250aCgpICsgMTsgXG4gICAgICB2YXIgZGF5ID0gZGF0ZU9iai5nZXRVVENEYXRlKCk7XG4gICAgICB2YXIgeWVhciA9IGRhdGVPYmouZ2V0VVRDRnVsbFllYXIoKTtcbiAgICAgIHZhciBib2R5ID0ge1xuICAgICAgICAgIEN1c3RvbWVyX25hbWU6IEF1dGhvcml6YXRpb24udXNlckluZm8ubmFtZSxcbiAgICAgICAgICBDdXN0b21lcl9lbWFpbDogQXV0aG9yaXphdGlvbi51c2VySW5mby5lbWFpbCxcbiAgICAgICAgICBwaG9uZV9udW1iZXI6IEF1dGhvcml6YXRpb24udXNlckluZm8ucGhvbmVfbnVtYmVyLFxuICAgICAgICAgIHNoaXBwaW5nX2FkZHJlc3M6IEF1dGhvcml6YXRpb24udXNlckluZm8uc2hpcHBpbmdfYWRkcmVzcyxcbiAgICAgICAgICBiaWxsaW5nX2FkZHJlc3M6IEF1dGhvcml6YXRpb24udXNlckluZm8uYmlsbGluZ19hZGRyZXNzLFxuICAgICAgICAgIHRvdGFsUHJpY2U6ICRzY29wZS5jYXJ0LmdldFRvdGFsUHJpY2UoKSxcbiAgICAgICAgICB0b3RhbEl0ZW1zOiAkc2NvcGUuY2FydC5nZXRUb3RhbENvdW50KCksXG4gICAgICAgICAgRGF0ZTogeWVhciArIFwiL1wiICsgbW9udGggKyBcIi9cIiArIGRheVxuICAgICAgfTtcbiAgICAgIGlmKCFBdXRob3JpemF0aW9uLmF1dGhvcml6ZWQpe1xuICAgICAgICBhbGVydChcInBsZWFzZSBsb2dpbiBmaXJzdC5cIik7XG4gICAgICB9ZWxzZSB7XG4gICAgICAgIHZhciByZXEgPSB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIHVybDogJy9vcmRlcnMnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdBdXRoJzogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3lvdXJUb2tlbktleScpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoYm9keSlcbiAgICAgICAgfTsgICAgICAgICAgXG4gICAgICAgICRodHRwKHJlcSkuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlN1Y2Nlc3NmdWxseSBzYXZlIG9yZGVyc1wiKTtcbiAgICAgICAgICAkc3RhdGUuZ28oJ2NoZWNrb3V0Jyk7ICAgICAgXG4gICAgICAgIH0pOyBcbiAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdteUFwcCcpLmNvbnRyb2xsZXIoJ2NoZWNrb3V0Q29udHJvbGxlcicsIFsnJHNjb3BlJywnJHN0YXRlJywnZGF0YVNlcnZpY2UnLCdBdXRob3JpemF0aW9uJywgXG5cdGZ1bmN0aW9uICgkc2NvcGUsJHN0YXRlLGRhdGFTZXJ2aWNlLCBBdXRob3JpemF0aW9uKSB7XHRcbiAgICBcdCAkc2NvcGUuY2FydCA9IGRhdGFTZXJ2aWNlLmNhcnQ7XG4gICAgXHQgJHNjb3BlLnNhdmVkQ29zdCA9ICRzY29wZS5jYXJ0LmdldFRvdGFsUHJpY2UoKTtcbiAgICBcdCAkc2NvcGUubG9jYXRpb24gPSAoQXV0aG9yaXphdGlvbi5hdXRob3JpemVkKT8gJ3Byb2ZpbGUudXNlckluZm8nOidhY2NvdW50X2xvZ2luJztcbiAgICBcdCAkc2NvcGUubmFtZSA9IChBdXRob3JpemF0aW9uLmF1dGhvcml6ZWQpP0F1dGhvcml6YXRpb24udXNlckluZm8ubmFtZTonJztcbiAgICBcdCAkc2NvcGUuc2hpcHBpbmdBZGRyZXNzID0gQXV0aG9yaXphdGlvbi51c2VySW5mby5zaGlwcGluZ19hZGRyZXNzO1xuICAgIFx0ICRzY29wZS5jYXJ0LmNsZWFySXRlbXMoKTsgICBcbiAgICB9XG5dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdteUFwcCcpLmNvbnRyb2xsZXIoJ2NvbGxlY3Rpb25Db250cm9sbGVyJywgWyckc2NvcGUnLCckc3RhdGUnLCdkYXRhU2VydmljZScsXG5cdGZ1bmN0aW9uICgkc2NvcGUsJHN0YXRlLGRhdGFTZXJ2aWNlKSB7XHRcblx0XHQkc2NvcGUuc3RvcmU9ZGF0YVNlcnZpY2UuYnVpbGRTdG9yZSgnd29tZW4nKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICBcdCRzY29wZS5jb2xsZWN0aW9uX2ltZ3MgPSBkYXRhLmNvbGxlY3Rpb25zO1xuICAgICAgICB9KTtcbiAgICBcdFx0IFxuICAgXHRcdCRzY29wZS5jdXJyZW50SWQ9MTtcblxuXHRcdCQoJy5jb2xsZWN0aW9uLXBhbmVsJykuZWFjaChmdW5jdGlvbigpe1xuXHQgIFx0XHR2YXIgJHRoaXMgPSB0aGlzO1xuXHQgIFx0XHQkKCc+IDpndCgwKScsICR0aGlzKS5oaWRlKCk7XG5cdCAgXHRcdHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG5cdCAgICBcdFx0JCgnPiA6Zmlyc3QtY2hpbGQnLCR0aGlzKS5mYWRlT3V0KDEwMDApXG5cdCAgICAgIFx0XHQubmV4dCgpLmZhZGVJbigxMDAwKS5lbmQoKVxuXHQgICAgICBcdFx0LmFwcGVuZFRvKCR0aGlzKTtcblx0ICBcdFx0fSwgMjAwMCk7XG5cdFx0fSlcblx0fVxuXSk7IiwiYW5ndWxhci5tb2R1bGUoJ215QXBwJykuY29udHJvbGxlcignbG9naW5Db250cm9sbGVyJywgWyckc2NvcGUnLCckc3RhdGUnLCckaHR0cCcsJ2RhdGFTZXJ2aWNlJywnQXV0aG9yaXphdGlvbicsIFxuICBmdW5jdGlvbiAoJHNjb3BlLCRsb2NhdGlvbiwgJGh0dHAsIGRhdGFTZXJ2aWNlLCBBdXRob3JpemF0aW9uKSB7XG4gICAgICAkc2NvcGUubG9jYXRpb24gPSAoQXV0aG9yaXphdGlvbi5hdXRob3JpemVkKT8gJ3Byb2ZpbGUudXNlckluZm8nOidhY2NvdW50X2xvZ2luJztcbiAgICAgICRzY29wZS5sb2dpbk5hbWUgPSAoQXV0aG9yaXphdGlvbi5hdXRob3JpemVkKT9BdXRob3JpemF0aW9uLnVzZXJJbmZvLm5hbWU6J0d1ZXN0JztcbiAgICAgICRzY29wZS5uYW1lID0gXCJcIjtcbiAgICAgICRzY29wZS5waG9uZU51bWJlciA9XCJcIjtcbiAgICAgICRzY29wZS5zaGlwcGluZ0FkZHJlc3MgPSBcIlwiO1xuICAgICAgJHNjb3BlLmJpbGxpbmdBZGRyZXNzID0gXCJcIjtcbiAgICAgICRzY29wZS5lbWFpbDIgPSBcIlwiO1xuICAgICAgJHNjb3BlLnBhc3N3b3JkMiA9IFwiXCI7XG4gICAgICAkc2NvcGUudG9nZ2xlRnVuY3Rpb24gPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInRvcG5hdlwiKVswXS5jbGFzc0xpc3QudG9nZ2xlKFwicmVzcG9uc2l2ZVwiKTsgICAgICBcbiAgICAgICAgICAgIGlmKCQoXCIudG9wbmF2IGxpOm50aC1jaGlsZCgyKVwiKS5jc3MoXCJmbG9hdFwiKSE9PVwibGVmdFwiKXtcbiAgICAgICAgICAgICAgICAkKFwiLnRvcG5hdiBsaTpsdCgzKVwiKS5jc3MoXCJmbG9hdFwiLFwiXCIpOyBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgJChcIi50b3BuYXYgbGk6Z3QoMClcIikuY3NzKFwiZmxvYXRcIixcInJpZ2h0XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgIC8vU2lnbiBVcCBmdW5jdGlvblxuICAgICAgJHNjb3BlLnNpZ251cD0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciBib2R5PXsgICAgICBcbiAgICAgICAgICAgICAgICBuYW1lOiAkc2NvcGUubmFtZSxcbiAgICAgICAgICAgICAgICBzaGlwcGluZ19hZGRyZXNzOiRzY29wZS5zaGlwcGluZ0FkZHJlc3MsXG4gICAgICAgICAgICAgICAgYmlsbGluZ19hZGRyZXNzOiRzY29wZS5iaWxsaW5nQWRkcmVzcyxcbiAgICAgICAgICAgICAgICBwaG9uZV9udW1iZXI6JHNjb3BlLnBob25lTnVtYmVyLFxuICAgICAgICAgICAgICAgIGVtYWlsOiRzY29wZS5lbWFpbDIsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6JHNjb3BlLnBhc3N3b3JkMiAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgICAkaHR0cC5wb3N0KFwiL3VzZXJzXCIsIEpTT04uc3RyaW5naWZ5KGJvZHkpKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTdWNjZXNzZnVsIHNpZ251cFwiKTtcbiAgICAgICAgICAgIGFsZXJ0KFwiWW91IGhhdmUgc3VjY2Vzc2Z1bGx5IHNpZ25lZCB1cCFcIik7ICAgICAgIFxuICAgICAgICB9KS5lcnJvcihmdW5jdGlvbihkYXRhLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICBhbGVydChcIkJhZCBTaWduIFVwIHVzZXJuYW1lIG9yIHBhc3N3b3JkIVwiKVxuICAgICAgICAgIH0pXG4gICAgICB9O1xuXG4gICAgICAvL0xvZ2luIEZ1bmN0aW9uXG4gICAgICAkc2NvcGUubG9naW49IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgYm9keT17XG4gICAgICAgICAgICAgICAgZW1haWw6JHNjb3BlLmVtYWlsMSxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDokc2NvcGUucGFzc3dvcmQxICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICRodHRwLnBvc3QoXCIvdXNlcnMvbG9naW5cIiwgSlNPTi5zdHJpbmdpZnkoYm9keSkpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlN1Y2Nlc3NmdWwgbG9naW5cIik7XG4gICAgICAgICAgICBBdXRob3JpemF0aW9uLmdvKCdwcm9maWxlLnVzZXJJbmZvJyk7XG4gICAgXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgneW91clRva2VuS2V5JywgaGVhZGVycygnQXV0aCcpKTtcbiAgICAgICAgICAgIGRhdGE9SlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndXNlckluZm8nLGRhdGEpO1xuICAgICAgICAgICAgQXV0aG9yaXphdGlvbi51c2VySW5mbyA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImFhYSBcIitBdXRob3JpemF0aW9uLmF1dGhvcml6ZWQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coIEF1dGhvcml6YXRpb24udXNlckluZm8pO1xuICAgICAgICB9KS5lcnJvcihmdW5jdGlvbihkYXRhLCBzdGF0dXMpIHtcbiAgICAgICAgICAgYWxlcnQoXCJXcm9uZyB1c2VybmFtZSBvciBwYXNzd29yZCFcIilcbiAgICAgICAgICB9KSAgIFxuICAgICAgfTtcbiAgICB9XG5dKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgICAkKFwiLnBvcHVwX2l0ZW1cIikub24oJ2JsdXInLGZ1bmN0aW9uKCl7XG4gICAgXHQkKHRoaXMpLmZhZGVPdXQoMzAwKTtcblx0fSk7XG4gICAgXG4gICAgdmFyIG1lbkNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoJHNjb3BlLCR1aWJNb2RhbCwkbG9nLCBkYXRhU2VydmljZSkge1xuICAgICAgICAkc2NvcGUuc3RvcmU9ZGF0YVNlcnZpY2UuYnVpbGRTdG9yZSgnbWVuJykudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAkc2NvcGUuaXRlbXMgPSBkYXRhLm1lbnByb2R1Y3RzO1xuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuaWQ9MTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5hbmltYXRpb25zRW5hYmxlZCA9IHRydWU7XG5cbiAgICAgICAgJHNjb3BlLm9wZW4gPSBmdW5jdGlvbiAoaWQpIHtcblxuXHQgICAgICB2YXIgbW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcbiAgXHQgICAgICBhbmltYXRpb246ICRzY29wZS5hbmltYXRpb25zRW5hYmxlZCxcbiAgXHQgICAgICB0ZW1wbGF0ZVVybDogJ215TW9kYWxDb250ZW50Lmh0bWwnLFxuICBcdCAgICAgIGNvbnRyb2xsZXI6ICdNb2RhbEluc3RhbmNlQ3RybCcsXG4gIFx0ICAgICAgaWQ6IGlkLFxuICBcdCAgICAgIHJlc29sdmU6IHtcbiAgXHQgICAgICAgIGl0ZW06IGZ1bmN0aW9uICgpIHtcbiAgXHQgICAgICAgICAgcmV0dXJuIGRhdGFTZXJ2aWNlLmJ1aWxkU3RvcmUoJ21lbicpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEuZ2V0TWVuUHJvZHVjdChpZCkpO1xuICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5nZXRNZW5Qcm9kdWN0KGlkKTtcbiAgICAgICAgICAgICAgfSk7XG4gIFx0ICAgICAgICB9XG5cdCAgICAgICAgfVxuXHQgICAgICB9KTtcblx0ICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oZnVuY3Rpb24gKHNlbGVjdGVkSXRlbSkge1xuXHQgICAgICAgICAkc2NvcGUuc2VsZWN0ZWQgPSBzZWxlY3RlZEl0ZW07XG5cdCAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICRsb2cuaW5mbygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XG5cdCAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gIFx0XHQkc2NvcGUuc2V0U2l6ZSA9IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgXHRcdFx0JHNjb3BlLnNpemU9c2l6ZTtcbiAgXHRcdH07XG4gICAgfTtcblxuICAgIHZhciBNb2RhbEluc3RhbmNlQ3RybCA9IGZ1bmN0aW9uICgkc2NvcGUsICR1aWJNb2RhbEluc3RhbmNlLCBpdGVtLCBkYXRhU2VydmljZSkge1xuXG4gIFx0XHQkc2NvcGUuaXRlbT1pdGVtO1xuICBcdFx0JHNjb3BlLnNpemU9J0Nob29zZSB5b3VyIHNpemUnO1xuICBcdFx0XG4gICAgICAkc2NvcGUuYWRkVG9PcmRlcj0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICBpZigkc2NvcGUuc2l6ZSA9PT0nQ2hvb3NlIHlvdXIgc2l6ZScgfHwgJCgnI3F1YW50aXR5JykudmFsKCk9PT0gMCl7XG4gICAgICAgICAgYWxlcnQoJ1BsZWFzZSBDaG9vc2UgYSBzaXplIGFuZCBhIHF1YW50aXR5Jyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRhdGFTZXJ2aWNlLmNhcnQuYWRkSXRlbShpdGVtLmlkLCBpdGVtLnByb2R1Y3RfbmFtZSwgaXRlbS5wcm9kdWN0X2NvbG9yLCAkc2NvcGUuc2l6ZSwgaXRlbS5wcm9kdWN0X3ByaWNlLCAkKCcjcXVhbnRpdHknKS52YWwoKSwgaXRlbS5wcm9kdWN0X2ltYWdlMyk7XG4gICAgICAgICR1aWJNb2RhbEluc3RhbmNlLmRpc21pc3MoJ2NhbmNlbCcpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIml0ZW0gYWRkZWQgXCIraXRlbS5wcm9kdWN0X25hbWUgKyBcIiBxdWFudGl0eSBpcyBcIiskKCcjcXVhbnRpdHknKS52YWwoKSk7XG5cbiAgICAgIH07XG5cbiAgXHQgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gIFx0ICAgICR1aWJNb2RhbEluc3RhbmNlLmRpc21pc3MoJ2NhbmNlbCcpO1xuICBcdCAgfTtcblxuICBcdCAgJHNjb3BlLnNldFNpemUgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICAgICAgXHRcdFx0JHNjb3BlLnNpemU9c2l6ZTtcbiAgICBcdFx0fTtcblxuICAgICAgLy9XaGVuIGNoYW5naW5nIHRoZSByb3V0ZSwgdGhlIG1vZGFsSW5zdGFuY2Ugd2lsbCBkaXNhcHBlYXIuIE90aGVyd2lzZSwgaXQgbWF5IGNhdXNlIGEgYnVnXG4gICAgICAkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgIH0pO1xuICAgICAgfTsgIFxuXG4gIFx0bWVuQ29udHJvbGxlci4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJHVpYk1vZGFsJywnJGxvZycsJ2RhdGFTZXJ2aWNlJ107XG4gICAgTW9kYWxJbnN0YW5jZUN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyR1aWJNb2RhbEluc3RhbmNlJywgJ2l0ZW0nLCdkYXRhU2VydmljZSddO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ215QXBwJylcbiAgICAgIC5jb250cm9sbGVyKCdtZW5Db250cm9sbGVyJywgbWVuQ29udHJvbGxlcik7XG4gICAgYW5ndWxhci5tb2R1bGUoJ215QXBwJylcbiAgICAgIC5jb250cm9sbGVyKCdNb2RhbEluc3RhbmNlQ3RybCcsIE1vZGFsSW5zdGFuY2VDdHJsKTtcbiAgICBcbiAgICBcbn0oKSk7IiwiYW5ndWxhci5tb2R1bGUoJ215QXBwJykuY29udHJvbGxlcignb3JkZXJJbmZvQ29udHJvbGxlcicsIFsnJHNjb3BlJywnJGh0dHAnLCdkYXRhU2VydmljZScsJ0F1dGhvcml6YXRpb24nLCBcbiAgZnVuY3Rpb24gKCRzY29wZSwgJGh0dHAsIGRhdGFTZXJ2aWNlLCBBdXRob3JpemF0aW9uKSB7XG4gICAgICB2YXIgcmVxID0ge1xuICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgdXJsOiAnL29yZGVycycsXG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAnQXV0aCc6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd5b3VyVG9rZW5LZXknKVxuICAgICAgICAgIH1cbiAgICAgIH07ICAgICAgICAgIFxuICAgICAgJGh0dHAocmVxKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cykge1xuICAgICAgICBjb25zb2xlLmxvZygnU3VjY3Vlc3NmdWxseSByZXRyaWV2ZWQgc2F2ZWQgb3JkZXJzJyk7XG4gICAgICAgICRzY29wZS5vcmRlcnMgPSBkYXRhOyAgICAgICAgIFxuICAgICAgfSk7IFxuICB9XG5dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdteUFwcCcpLmNvbnRyb2xsZXIoJ3Byb2ZpbGVDb250cm9sbGVyJywgWyckc2NvcGUnLCdkYXRhU2VydmljZScsJ0F1dGhvcml6YXRpb24nLCBcblx0ZnVuY3Rpb24gKCRzY29wZSxkYXRhU2VydmljZSwgQXV0aG9yaXphdGlvbikge1xuXHRcdCRzY29wZS50b2dnbGVGdW5jdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwidG9wbmF2XCIpWzBdLmNsYXNzTGlzdC50b2dnbGUoXCJyZXNwb25zaXZlXCIpO1xuICAgICAgICAgICAgaWYoJChcIi50b3BuYXYgbGk6bnRoLWNoaWxkKDMpXCIpLmNzcyhcImZsb2F0XCIpIT09XCJsZWZ0XCIpe1xuICAgICAgICAgICAgICAgICQoXCIudG9wbmF2IGxpOmx0KDQpXCIpLmNzcyhcImZsb2F0XCIsXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICQoXCIudG9wbmF2IGxpOmd0KDIpXCIpLmNzcyhcImZsb2F0XCIsXCJyaWdodFwiKTtcbiAgICAgICAgICAgIH0gICAgICAgIFxuICAgICAgICB9O1x0XG4gICAgXHQkc2NvcGUubG9jYXRpb24gPSAoQXV0aG9yaXphdGlvbi5hdXRob3JpemVkKT8gJ3Byb2ZpbGUudXNlckluZm8nOidhY2NvdW50X2xvZ2luJztcbiAgICBcdCRzY29wZS5uYW1lID0gKEF1dGhvcml6YXRpb24uYXV0aG9yaXplZCk/QXV0aG9yaXphdGlvbi51c2VySW5mby5uYW1lOicnO1xuICAgIFx0JHNjb3BlLmlzTG9nZ2VkSW4gPSAhQXV0aG9yaXphdGlvbi5hdXRob3JpemVkO1xuICAgIH1cbl0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ215QXBwJykuY29udHJvbGxlcignc2hvcENvbnRyb2xsZXInLCBbJyRzY29wZScsJyRodHRwJywnJGxvY2F0aW9uJywnZGF0YVNlcnZpY2UnLCdBdXRob3JpemF0aW9uJywgXG4gICAgZnVuY3Rpb24gKCRzY29wZSwkaHR0cCwkbG9jYXRpb24sZGF0YVNlcnZpY2UsQXV0aG9yaXphdGlvbikge1xuICAgICAgICAkc2NvcGUudG9nZ2xlRnVuY3Rpb24gPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInRvcG5hdlwiKVswXS5jbGFzc0xpc3QudG9nZ2xlKFwicmVzcG9uc2l2ZVwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCQoXCIudG9wbmF2IGxpOm50aC1jaGlsZCg2KVwiKS5jc3MoXCJmbG9hdFwiKSk7XG4gICAgICAgICAgICBpZigkKFwiLnRvcG5hdiBsaTpudGgtY2hpbGQoNilcIikuY3NzKFwiZmxvYXRcIikhPT1cImxlZnRcIil7XG4gICAgICAgICAgICAgICAgJChcIi50b3BuYXYgbGk6bHQoNylcIikuY3NzKFwiZmxvYXRcIixcIlwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlbW92ZWQgZmxvYXQgcmlnaHRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICQoXCIudG9wbmF2IGxpOmd0KDMpXCIpLmNzcyhcImZsb2F0XCIsXCJyaWdodFwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNoYW5nZSBiYWNrIHRvIGZsb2F0IHJpZ2h0XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUubG9jYXRpb24gPSAoQXV0aG9yaXphdGlvbi5hdXRob3JpemVkKT8gJ3Byb2ZpbGUudXNlckluZm8nOidhY2NvdW50X2xvZ2luJztcbiAgICAgICAgY29uc29sZS5sb2coXCJsb2dpbiBzdGF0dXMgaXNcIitBdXRob3JpemF0aW9uLmF1dGhvcml6ZWQpO1xuICAgICAgICAkc2NvcGUubmFtZSA9IChBdXRob3JpemF0aW9uLmF1dGhvcml6ZWQpP0F1dGhvcml6YXRpb24udXNlckluZm8ubmFtZTonR3Vlc3QnO1xuICAgICAgICAkc2NvcGUuaXNMb2dnZWRJbiA9ICFBdXRob3JpemF0aW9uLmF1dGhvcml6ZWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiaXMgbG9nZ2VkSW4gaXMgXCIrICRzY29wZS5pc0xvZ2dlZEluKTtcbiAgICAgICAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGh0dHAuZGVsZXRlKFwiL3VzZXJzL2xvZ2luXCIse1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsnQXV0aCc6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd5b3VyVG9rZW5LZXknKX1cbiAgICAgICAgICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlN1Y2Nlc3NmdWwgbG9nb3V0XCIpOyAgICAgICAgIFxuICAgICAgICB9KVxuICAgICAgICAgICAgQXV0aG9yaXphdGlvbi5jbGVhcigpO1xuICAgICAgICAgICAgJHNjb3BlLmlzTG9nZ2VkSW4gPSAhQXV0aG9yaXphdGlvbi5hdXRob3JpemVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIF0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ215QXBwJykuY29udHJvbGxlcignc3RvcmVNYXBDb250cm9sbGVyJywgWyckc2NvcGUnLCdkYXRhU2VydmljZScsIFxuICBmdW5jdGlvbiAoJHNjb3BlLCBkYXRhU2VydmljZSkge1xuICAgICAgKGZ1bmN0aW9uIGluaXRNYXAoKSB7XG4gICAgICAgIHZhciBteUxhdExuZyA9IHtsYXQ6IDM3Ljc3MjA1NCwgbG5nOiAtMTIyLjQwNzQxMX07XG4gICAgICAgIHZhciBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAnKSwge1xuICAgICAgICAgIHpvb206IDE4LFxuICAgICAgICAgIGNlbnRlcjogbXlMYXRMbmdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgICAgICAgIHBvc2l0aW9uOiBteUxhdExuZyxcbiAgICAgICAgICBtYXA6IG1hcCxcbiAgICAgICAgICB0aXRsZTogJ0hlYWRxdWFydGVyIG9mIFBlcmZldHRvJ1xuICAgICAgICB9KTtcbiAgICAgIH0pKCk7XG4gIH1cbl0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ215QXBwJykuY29udHJvbGxlcigndXNlckluZm9Db250cm9sbGVyJywgWyckc2NvcGUnLCdkYXRhU2VydmljZScsJ0F1dGhvcml6YXRpb24nLCBcbiAgICBmdW5jdGlvbiAoJHNjb3BlLGRhdGFTZXJ2aWNlLEF1dGhvcml6YXRpb24pIHtcbiAgICAgICAkc2NvcGUubmFtZSA9IEF1dGhvcml6YXRpb24udXNlckluZm8ubmFtZTtcbiAgICAgICAkc2NvcGUuZW1haWwgPSBBdXRob3JpemF0aW9uLnVzZXJJbmZvLmVtYWlsO1xuICAgICAgICRzY29wZS5waG9uZSA9IEF1dGhvcml6YXRpb24udXNlckluZm8ucGhvbmVfbnVtYmVyO1xuICAgICAgICRzY29wZS5zaGlwcGluZ0FkZHJlc3MgPSBBdXRob3JpemF0aW9uLnVzZXJJbmZvLnNoaXBwaW5nX2FkZHJlc3M7XG4gICAgICAgJHNjb3BlLmJpbGxpbmdBZGRyZXNzID0gQXV0aG9yaXphdGlvbi51c2VySW5mby5iaWxsaW5nX2FkZHJlc3M7XG4gICAgfVxuXSk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICAgJChcIi5wb3B1cF9pdGVtXCIpLm9uKCdibHVyJyxmdW5jdGlvbigpe1xuICAgIFx0JCh0aGlzKS5mYWRlT3V0KDMwMCk7XG5cdH0pO1xuICAgIFxuICAgIHZhciB3b21lbkNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoJHNjb3BlLCR1aWJNb2RhbCwkbG9nLCBkYXRhU2VydmljZSkge1xuICAgICAgICAkc2NvcGUuc3RvcmU9ZGF0YVNlcnZpY2UuYnVpbGRTdG9yZSgnd29tZW4nKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICRzY29wZS5pdGVtcyA9IGRhdGEud29tZW5wcm9kdWN0cztcbiAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuaXRlbXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgJHNjb3BlLmlkPTE7XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuYW5pbWF0aW9uc0VuYWJsZWQgPSB0cnVlO1xuXG4gICAgICAgICRzY29wZS5vcGVuID0gZnVuY3Rpb24gKGlkKSB7XG5cblx0ICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XG4gIFx0ICAgICAgYW5pbWF0aW9uOiAkc2NvcGUuYW5pbWF0aW9uc0VuYWJsZWQsXG4gIFx0ICAgICAgdGVtcGxhdGVVcmw6ICdteU1vZGFsQ29udGVudC5odG1sJyxcbiAgXHQgICAgICBjb250cm9sbGVyOiAnTW9kYWxJbnN0YW5jZUN0cmwyJyxcbiAgXHQgICAgICBpZDogaWQsXG4gIFx0ICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgaXRlbTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZGF0YVNlcnZpY2UuYnVpbGRTdG9yZSgnd29tZW4nKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhLmdldFdvbWVuUHJvZHVjdChpZCkpO1xuICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5nZXRXb21lblByb2R1Y3QoaWQpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cdCAgICAgIH0pO1xuXHQgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoc2VsZWN0ZWRJdGVtKSB7XG5cdCAgICAgICRzY29wZS5zZWxlY3RlZCA9IHNlbGVjdGVkSXRlbTtcblx0ICAgIH0sIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgJGxvZy5pbmZvKCdNb2RhbCBkaXNtaXNzZWQgYXQ6ICcgKyBuZXcgRGF0ZSgpKTtcblx0ICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBcblxuICBcdFx0JHNjb3BlLnNldFNpemUgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICAgIFx0XHRcdCRzY29wZS5zaXplPXNpemU7XG4gIFx0XHR9O1xuXG4gICAgfTtcblxuICAgIHZhciBNb2RhbEluc3RhbmNlQ3RybDIgPSBmdW5jdGlvbiAoJHNjb3BlLCAkdWliTW9kYWxJbnN0YW5jZSwgaXRlbSwgZGF0YVNlcnZpY2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiYWFcIik7XG4gICAgICBjb25zb2xlLmxvZyhpdGVtKTtcbiAgXHRcdCRzY29wZS5pdGVtPWl0ZW07XG4gIFx0XHQkc2NvcGUuc2l6ZT0nQ2hvb3NlIHlvdXIgc2l6ZSc7XG4gIFx0XHRcbiAgICAgICRzY29wZS5hZGRUb09yZGVyPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgIGlmKCRzY29wZS5zaXplID09PSdDaG9vc2UgeW91ciBzaXplJyB8fCAkKCcjcXVhbnRpdHknKS52YWwoKT09PSAwKXtcbiAgICAgICAgICBhbGVydCgnUGxlYXNlIENob29zZSBhIHNpemUgYW5kIGEgcXVhbnRpdHknKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZGF0YVNlcnZpY2UuY2FydC5hZGRJdGVtKGl0ZW0uaWQsIGl0ZW0ucHJvZHVjdF9uYW1lLCBpdGVtLnByb2R1Y3RfY29sb3IsICRzY29wZS5zaXplLCBpdGVtLnByb2R1Y3RfcHJpY2UsICQoJyNxdWFudGl0eScpLnZhbCgpLCBpdGVtLnByb2R1Y3RfaW1hZ2UzKTtcbiAgICAgICAgJHVpYk1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiaXRlbSBhZGRlZCBcIitpdGVtLnByb2R1Y3RfbmFtZSArIFwiIHF1YW50aXR5IGlzIFwiKyQoJyNxdWFudGl0eScpLnZhbCgpKTtcblxuICAgICAgfTtcblxuICBcdCAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgXHQgICAgJHVpYk1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XG4gIFx0ICB9O1xuXG4gIFx0ICAkc2NvcGUuc2V0U2l6ZSA9IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICBcdFx0XHQkc2NvcGUuc2l6ZT1zaXplO1xuICAgIFx0XHR9O1xuXG4gICAgICAvL1doZW4gY2hhbmdpbmcgdGhlIHJvdXRlLCB0aGUgbW9kYWxJbnN0YW5jZSB3aWxsIGRpc2FwcGVhci4gT3RoZXJ3aXNlLCBpdCBtYXkgY2F1c2UgYSBidWdcbiAgICAgICRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgfSk7XG4gICAgICB9OyAgXG5cbiAgXHR3b21lbkNvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJywgJyR1aWJNb2RhbCcsJyRsb2cnLCdkYXRhU2VydmljZSddO1xuICAgIE1vZGFsSW5zdGFuY2VDdHJsMi4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJHVpYk1vZGFsSW5zdGFuY2UnLCAnaXRlbScsJ2RhdGFTZXJ2aWNlJ107XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnbXlBcHAnKVxuICAgICAgLmNvbnRyb2xsZXIoJ3dvbWVuQ29udHJvbGxlcicsIHdvbWVuQ29udHJvbGxlcik7XG4gICAgYW5ndWxhci5tb2R1bGUoJ215QXBwJylcbiAgICAgIC5jb250cm9sbGVyKCdNb2RhbEluc3RhbmNlQ3RybDInLCBNb2RhbEluc3RhbmNlQ3RybDIpO1xuICAgIFxuICAgIFxufSgpKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
