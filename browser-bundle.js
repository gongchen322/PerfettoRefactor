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

	//var jquery = require('jquery');
	//var angular = require('./js/lib/angular');

	var myApp = angular.module('myApp', ['ui.router','ngAnimate', 'ui.bootstrap']);

	//var menController = require('./js/controllers/menController.js');
	myApp.config(function($stateProvider, $urlRouterProvider) {
	    $urlRouterProvider.otherwise('/home');
	    
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
	        // SHOP PAGE AND NESTED VIEWS  =================================
	        .state('shop', {
	          	url: '/shop/men',
	            templateUrl: 'js/view/shop.html'
	        })

	        .state('shop.men', {
	        url: '/',
	        templateUrl: 'js/view/men.html',
	        controller: 'menController'
	    	})

	         .state('shop.women', {
	        url: '/women',
	        templateUrl: 'js/view/women.html',
	        controller: function($scope) {
	            $scope.dogs = ['Bernese', 'Husky', 'Goldendoodle'];
	        }})

	         .state('shop.sale', {
	        url: '/sale',
	        templateUrl: 'js/view/sale.html',
	        controller: function($scope) {
	            $scope.dogs = ['Bernese', 'Husky', 'Goldendoodle'];
	        }})

	         .state('shop.collections', {
	        url: '/collections',
	        templateUrl: 'js/view/collections.html',
	        controller: function($scope) {
	            $scope.dogs = ['Bernese', 'Husky', 'Goldendoodle'];
	        }})

	         .state('shop.stores', {
	        url: '/stores',
	        templateUrl: 'js/view/stores.html',
	        controller: function($scope) {
	            $scope.dogs = ['Bernese', 'Husky', 'Goldendoodle'];
	    	}});

	        
	});


	myApp.factory("DataService", function() {
	  var myStore = new store();
	  var myCart = new cart("AngularStore");
	  
	  return {
	    store: myStore,
	    cart: myCart
	  };
	});


	//myApp.controller('mainCtrl', require('./js/controllers/mainCtrl'));


/***/ }
/******/ ]);