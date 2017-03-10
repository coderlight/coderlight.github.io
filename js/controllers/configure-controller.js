Pathfinder.controller('ConfigureController', function($scope, $http, $route,$routeParams, Auth) {

  $scope.activeTab = $route.current.activetab
  $scope.width = 960;

  cuid = Auth.user.cuid;
  buid = $routeParams.buid;
  fuid = $routeParams.fuid;
  luid = $routeParams.luid;

  $scope.loadData = function() {
    $http.get('/c/' + cuid + '/b/' + buid + '/f/' + fuid + '/l/' + luid + '/s').success(function(data) {
      $scope.seats = data.seats;
      updateMapImage();
    });
  };
  $scope.loadData();

  $scope.setupImage = function() {
    var image = $('#map')
    $scope.image = {
      height: image.height(),
      width: image.width()
    };
  };

  var updateMapImage = function() {
    $scope.mapImage = 'c/' + cuid + '/b/' + buid + '/f/' + fuid + '/map';
  }

  $scope.zoomIn = function() {
    $scope.width += 25;
  }

  $scope.zoomOut = function() {
    $scope.width -= 25;
  }

  $scope.addLoc = function(event) {
    $scope.addLocLoading = true;
    var m = $('#map')
    var e = event
    var mouseX, mouseY, x, y
    var id = $('#id').val()
    if ( event.offsetX == null ) { // Firefox
      mouseX = event.originalEvent.layerX;
      mouseY = event.originalEvent.layerY;
    }
    else {                         // Other browsers
      mouseX = event.offsetX;
      mouseY = event.offsetY;
    }
    x = mouseX/m.width() * 100
    y = mouseY/m.height() * 100
    if ($(e.target).is("img")) {
      $http.post('/c/' + cuid + '/b/' + buid + '/f/' + fuid + '/l/' + luid + '/s', {
        x_coordinate: x,
        y_coordinate: y
      })
      .success(function(data) {
        $('#id').val(+id + 1);
        $scope.loadData();
        $scope.addLocLoading = false;
      });
    }
  }
});
