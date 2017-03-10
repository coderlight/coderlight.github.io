Pathfinder.controller('UserAdminController', function($scope, $http, $route, $routeParams, Auth) {

  $scope.activeTab = $route.current.activetab
  $scope.editing = false;
  $scope.employee = false;
  $scope.inUseSeatForFloorCount = 0;
  $scope.emptySeatForFloorCount = 0;
  var cuid = Auth.user.cuid;
  var currentFloor;

  var loadData = function(callback) {
    callback = callback || _.noop
    $http.get('/c/' + cuid).success(function(data) {
      $scope.buildings = data.company.buildings;
      $scope.floors = [];
      _.forEach($scope.buildings, function(building) {
        $scope.floors = $scope.floors.concat(building.floors)
      });
      $scope.layers = [];
      _.forEach($scope.floors, function(floor) {
        $scope.layers = $scope.layers.concat(floor.layers)
      });
      $scope.employees = [];
      _.forEach($scope.floors, function(floor) {
        $scope.employees = $scope.employees.concat(floor.layers[0].employees);
      });
      callback();
    });
  };
  loadData(function() {
    currentFloor = $scope.floors[0];
    $scope.seats = currentFloor.layers[0].seats;
    $scope.inUseSeatForFloorCount = getSeatsInUseForFloor().length;
    $scope.emptySeatForFloorCount = $scope.seats.length - $scope.inUseSeatForFloorCount;
    updateMapImage();
  });

  $scope.setupImage = function(callback) {
    callback = callback || _.noop
    console.log($('#map').height());
    $scope.image = {
      height: $('#map').height(),
      width: $('#map').width()
    };
    callback();
  };

  $scope.addMapper = function() {
    addMapper();
  };

  var updateMapImage = function(callback) {
    callback = callback || _.noop
    $scope.mapImage = 'c/' + cuid + '/b/' + currentFloor.buid + '/f/' + currentFloor.id + '/map';
    callback(arguments[1], arguments[2]);
  };

  $scope.setFloor = function(fuid) {
    console.log('setting floor: ' + fuid)
    currentFloor = _.where($scope.floors, {id: fuid})[0];
    $scope.seats = currentFloor.layers[0].seats;
    $scope.inUseSeatForFloorCount = getSeatsInUseForFloor().length;
    $scope.emptySeatForFloorCount = $scope.seats.length - $scope.inUseSeatForFloorCount;
    updateMapImage(removeMapper, $scope.setupImage, addMapper);
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

  $scope.editMode = function(employee) {
    $scope.editing = true;
    $scope.employee = employee;
    $scope.seatTrigger($scope.employee.seat, 'mouseover');
  };

  $scope.viewMode = function(employee) {
    $scope.employee = employee;
    $scope.employee.photo = 'img/photos/' + employee.username + '.png';
    $scope.seatTrigger($scope.employee.seat, 'mouseover');
  }

  $scope.exit = function() {
    $scope.seatTrigger($scope.employee.seat, 'mouseout');
    $scope.editing = false;
    $scope.employee = false;
    $('#save-edit').html('Save');
    loadData();
  }

  $scope.editEmployee = function() {
    if ($scope.employee && $scope.editing) {
      $http.put('/c/' + cuid + '/b/' + currentFloor.buid + '/f/' + currentFloor.id + '/l/' + currentFloor.layers[0].id + '/e/'+ $scope.employee.id, {
        name: $scope.employee.name,
        department: $scope.employee.department,
        title: $scope.employee.title,
        email: $scope.employee.email,
        im: $scope.employee.im,
        luid: $scope.employee.luid
      })
      .success(function() {
        $('#save-edit').html('Saved!');
      })
      .error(function() {
        $('#save-edit').html('Save Failed');
      });
    }
  }

  $scope.deleteEmployee = function(e) {
    bootbox.confirm("Are you sure you want to delete " + e.name + "?", function(result) {
      if (result) {
        layer = _.where($scope.layers, {id: e.luid})[0]
        floor = _.where($scope.floors, {id: layer.fuid})[0]
        $http.delete('/c/' + cuid + '/b/' + floor.buid + '/f/' + floor.id + '/l/' + e.luid + '/e/' + e.id)
        .success(function() {
          bootbox.alert(e.name + " has been deleted.");
          $scope.exit();
        })
        .error(function(error, status) {
          bootbox.alert("Something went wrong. \nStatus: " + status);
        })
      }
    })
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
      $http.put('/c/' + cuid + '/b/' + currentFloor.buid + '/f/' + currentFloor.id + '/l/' + currentFloor.layers[0].id + '/e/'+ $scope.employee.id, {
        seat: seat
      });
      $scope.exit();
    }
    else {
      var employee = findEmployee(seat);
      $scope.viewMode(employee);
    }
  };
});
