/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	
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
	        /*
	         .state('shop.sale', {
	        url: '/sale',
	        templateUrl: 'js/view/sale.html'
	        })

	        

	         .state('shop.stores', {
	        url: '/stores',
	        templateUrl: 'js/view/stores.html'
	        });*/

	        
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


/***/ }
/******/ ]);