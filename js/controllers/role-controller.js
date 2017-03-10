Pathfinder.controller('RoleController', function($scope, Auth) {

  auth = Auth;

  $scope.isAdminUser = function()  {
    return (auth.isAdminUser());
  };

})
