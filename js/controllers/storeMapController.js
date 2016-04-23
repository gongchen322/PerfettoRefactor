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
