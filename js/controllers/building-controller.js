Pathfinder.controller('BuildingController', function($scope, $http, $route, $routeParams, Auth) {

  $scope.activeTab = $route.current.activetab
  $scope.employee = false;
  $scope.layerToFloorName = [];
  $scope.inUseSeatForFloorCount = 0;
  $scope.emptySeatForFloorCount = 0;
  var cuid = Auth.user.cuid;
  var buid = $routeParams.buid;
  var currentFloor;

  var loadData = function(callback) {
    callback = callback || _.noop
    $http.get('/c/' + cuid + '/b/' + buid).success(function(data) {
      $scope.building = data.building;
      $scope.floors = data.building.floors;
      layerToFloorName = [];
      employees = [];
      _.forEach(data.building.floors, function(floor) {
        employees = employees.concat(floor.layers[0].employees);
        layerToFloorName[floor.layers[0].id] = floor.name;
      });
      $scope.employees = employees
      $scope.layerToFloorName = layerToFloorName;
      callback();
    });
  };
  loadData(function() {
    currentFloor = $scope.building.floors[0];
    $scope.seats = currentFloor.layers[0].seats;
    $scope.inUseSeatForFloorCount = getSeatsInUseForFloor().length;
    $scope.emptySeatForFloorCount = $scope.seats.length - $scope.inUseSeatForFloorCount;
    updateMapImage();
  });

  $scope.setupImage = function(callback) {
    callback = callback || _.noop
    $scope.image = {
      height: $('#map')[0].naturalHeight * 700 / $('#map')[0].naturalWidth,
      width: 700
    };
    callback();
  };

  $scope.addMapper = function() {
    addMapper();
  };

  var updateMapImage = function() {
    $scope.mapImage = 'c/' + cuid + '/b/' + buid + '/f/' + currentFloor.id + '/map';
  };

  $scope.setFloor = function(fuid) {
    if (currentFloor.id !== fuid) {
      currentFloor = _.where($scope.building.floors, {id: fuid})[0];
      $scope.seats = currentFloor.layers[0].seats;
      $scope.inUseSeatForFloorCount = getSeatsInUseForFloor().length;
      $scope.emptySeatForFloorCount = $scope.seats.length - $scope.inUseSeatForFloorCount;
      removeMapper(updateMapImage);
    }
  };

  $scope.isActiveFloor = function(fuid) {
      return currentFloor.id == fuid;
  };

  var findEmployee = function(seat) {
    for (var k = 0; k < $scope.employees.length; k++) {
      if ($scope.employees[k].seat == seat) {
        return $scope.employees[k];
      }
    }
    return false;
  };

  var getSeatsInUse = function() {
    var seatsInUse = [];
    _.forEach($scope.employees, function(employee) {
      (employee.seat) && seatsInUse.push(employee.seat);
    });
    return seatsInUse;
  }

  var getSeatsInUseForFloor = function() {
    var seatsInUse = getSeatsInUse();

    var seatsInUseForFloor = [];
    _.forEach($scope.seats, function(seat) {
      ((seatsInUse.indexOf(seat.id) >= 0) && (seat.luid == currentFloor.layers[0].id)) && seatsInUseForFloor.push(seat);
    });
    return seatsInUseForFloor;
  }

  $scope.seatTrigger = function(id, action) {
    $('#seat-'+id).trigger(action);
  };

  $scope.viewMode = function(employee) {
    $scope.employee = employee;
    $scope.employee.photo = 'img/photos/' + employee.username + '.png';
    $scope.seatTrigger($scope.employee.seat, 'mouseover');
  }

  $scope.exit = function() {
    $scope.seatTrigger($scope.employee.seat, 'mouseout');
    $scope.employee = false;
    loadData();
  }

  $scope.showEmptySeats = function() {
    $('.seat').trigger('mouseout');
    var seatsInUse = getSeatsInUse();
    _.forEach($scope.seats, function(seat) {
      (!_.contains(seatsInUse, seat.id)) && $scope.seatTrigger(seat.id, 'mouseover');
    });
  }

  $scope.showFullSeats = function() {
    $('.seat').trigger('mouseout');
    var seatsInUse = getSeatsInUse();
    _.forEach(seatsInUse, function(seat) {
      $scope.seatTrigger(seat, 'mouseover');
    })
  }

  $scope.showSelectedSeats = function(employees) {
    $('.seat').trigger('mouseout');
    _.forEach(employees, function(employee) {
      (employee.seat) && $scope.seatTrigger(employee.seat, 'mouseover');
    })
  }

  $scope.selectSeat = function(seat) {
    if ($scope.employee && $scope.editing) {
      $http.put('/c/' + cuid + '/b/' + buid + '/f/' + currentFloor.id + '/l/' + currentFloor.layers[0].id + '/e/'+ $scope.employee.id, {
        seat: seat
      });
      $scope.exit();
    }
    else {
      var employee = findEmployee(seat);
      $scope.viewMode(employee);
    }
  };

  $scope.getFloorNameForEmployee = function(employee) {
    return layerToFloorName[employee.luid];
  };
});
