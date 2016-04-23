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