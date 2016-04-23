angular.module('myApp').controller('collectionController', ['$scope','$state','dataService',
	function ($scope,$state,dataService) {	
    	$scope.collection_imgs = dataService.store.collections;	 
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