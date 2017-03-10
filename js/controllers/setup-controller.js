Pathfinder.controller('SetupController', function($scope, $http, $route, Modals, Auth, BuildingService) {

  $scope.activeTab = $route.current.activetab
  cuid = Auth.user.cuid;

  loadData = function() {
    $http.get('/c/' + cuid).success(function(data) {
      $scope.company = data.company;
    });
  };
  loadData();

  // Modal for adding buildings.
  $scope.addBuildingModal = function()  {
    Modals.addBuildingModal(cuid, loadData);
  };

  // Modal for adding floors.
  $scope.addFloorModal = function(buid) {
    Modals.addFloorModal(cuid, buid, loadData);
  };

  // Modal for adding floor map.
  $scope.addFloorMapModal = function(buid, fuid, luid) {
    Modals.addFloorMapModal(cuid, buid, fuid, luid, loadData);
  };

  // Modal for editing buildings.
  $scope.editBuildingModal = function(building) {
    Modals.editBuildingModal(building, loadData);
  };

  $scope.showBuildings = function() {
    return $scope.company && $scope.company.buildings.length > 0;
  }

  $scope.deleteBuilding = function(building) {
    bootbox.confirm("Are you sure you want to delete building " + building.name + "?", function(result) {
      if (result == true) {
          index = 0;
          index = $scope.findBuildingIndex($scope.company.buildings, 'id', building.id);
          if (index != null) {
            BuildingService.deleteBuilding(building);
            $scope.company.buildings.splice(index, 1);
          }
      }
    })
  }

  $scope.findBuildingIndex = function(array, key, value) {
    for (var index = 0; index < array.length; index++) {
      if (array[index][key] === value) {
          return index;
      }
    }
    return null;
  };

  $scope.findBuilding = function(array, key, value) {
    for (var index = 0; index < array.length; index++) {
      if (array[index][key] === value) {
          return array[index];
      }
    }
    return null;
  };

});
