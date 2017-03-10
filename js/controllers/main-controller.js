Pathfinder.controller('MainController', function($scope, $http, $route, Auth) {

  $scope.activeTab = $route.current.activetab
  cuid = Auth.user.cuid;

  var loadData = function() {
    $http.get('/c/' + cuid).success(function(data) {
      $scope.company = data.company;
    });
  };
  loadData();
});
