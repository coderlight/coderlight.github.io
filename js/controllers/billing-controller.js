Pathfinder.controller('BillingController', function($scope, $http, $route, $routeParams, BillingService, Auth, $location) {
  var loadData = function() {
    BillingService.getInfo()
    .success(function(response){
      $scope.info = response;
    });
  }();
  $scope.unsubscribe = function () {
    BillingService.unsubscribe();
    Auth.logout().then(function () {
      window.location.reload();
    }
    );
  }
});
Pathfinder.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});
