var PathfinderServices = angular.module('Pathfinder.Services', [
  "Pathfinder.Directives",
  "angularPayments"
  ]);

PathfinderServices.service('BuildingService', function ($http) {
  var BuildingService = {};

  BuildingService.deleteBuilding = function(building) {
        //      $scope.buildingLoading = true;
     $http.delete('/c/' + building.cuid + '/b/' + building.id)
      .success(function() {
              //        $scope.buildingLoading = false;
        callback();
     })
     .error(function(error) {
             //        $scope.buildingLoading = false;
        var alertStr = '<ul>';
        _.forEach(error.error, function(e) {
          alertStr += '<li>' + e + '</li>';
        });
        alertStr += '</ul>';
        //        $scope.errorMessage = alertStr;
        });
    };

  return BuildingService;
});

PathfinderServices.service('BillingService', function ($http) {
  var BillingService = {};

  BillingService.getInfo = function() {
    return $http.get('/subscription');
  }

  BillingService.saveCard = function(data) {
    return $http.post('/card', data);
  }

  BillingService.unsubscribe = function() {
    return $http.delete('/subscription');
  }

  return BillingService;
});


PathfinderServices.service('Modals', function ($compile, $modal, $http, BillingService) {
  var Modals = {};

  Modals.openRegisterModal = function(callback) {
    callback = callback || _.noop;

    var registration = {};
    var openRegisterController = function($scope, $modalInstance) {
      $scope.errorMessage = '';

      $scope.registration = registration;

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

      $scope.ok = function() {
        var data = _.pick(registration,
          'email',
          'password',
          'fname',
          'lname');

        $scope.registerLoading = true;
        $http.post('/register-now', data)
        .success(function(resp) {
          $modalInstance.close();
          if (resp.user == null) {
            bootbox.alert("Please check your inbox to validate your email.");
          }
//          else if (resp.user.cuid) {
//            location.reload();
//          }
//          else {
            Modals.addCompanyModal();
//          }
        })
        .error(function(error) {
          $scope.registerLoading = false;
          var alertStr = '<ul>';
          _.forEach(error.error, function(e) {
            alertStr += '<li>' + e + '</li>';
          });
          alertStr += '</ul>';
          $scope.errorMessage = alertStr;
        });
      };
    };

    $modal.open({
      templateUrl: '/views/modals/register.html',
      controller: openRegisterController
    });
  };

  Modals.addCompanyModal = function(callback) {
    callback = callback || _.noop;

    var company = {};
    var addCompanyController = function($scope, $modalInstance, $location) {
      $scope.errorMessage = '';

      $scope.company = company;

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

      $scope.ok = function() {
        var data = _.pick(company,
          'name',
          'employees',
          'domain');

        $scope.addCompanyLoading = true;
        $http.post('/c', data)
        .success(function() {
          $modalInstance.close();
          callback();
          Modals.addCardModal();
        })
        .error(function(error) {
          $scope.addCompanyLoading = false;
          var alertStr = '<ul>';
          _.forEach(error.error, function(e) {
            alertStr += '<li>' + e + '</li>';
          });
          alertStr += '</ul>';
          $scope.errorMessage = alertStr;
        });
      };
    };

    $modal.open({
      templateUrl: '/views/modals/add_company.html',
      controller: addCompanyController
    });
  };

  Modals.addCardModal = function(callback) {
      callback = callback || _.noop;

      var card = {};

      var addCardController = function($scope, $modalInstance, $location, BillingService) {
        $scope.errorMessage = '';
        $scope.card = card;

        $scope.ok = function() {
          $scope.addCardLoading = true;
        };
        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
        $scope.stripeCallback = function (code, result) {
          if (result.error) {
            $scope.addCardLoading = false;
            $scope.errorMessage = result.error.message;
          } else {
            BillingService.saveCard(result)
            .success(function(response){
              $scope.addCardLoading = false;
              $modalInstance.close();
              callback();
              location.reload();
            })
            .error(function(error, status){
              $scope.addCardLoading = false;
              var alertStr = '<ul>';
              _.forEach(error.error, function(e) {
                alertStr += '<li>' + e + '</li>';
              });
              alertStr += '</ul>';
              $scope.errorMessage = alertStr;
            });
          }
        }
      };

      $modal.open({
        templateUrl: '/views/modals/add_card.html',
        controller: addCardController
      });
    };

  Modals.addBuildingModal = function(cuid, callback) {
    callback = callback || _.noop;

    var building = {};
    building.cuid = cuid;
    var addBuildingController = function($scope, $modalInstance) {
      $scope.errorMessage = '';

      $scope.building = building;

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

      $scope.ok = function() {
        var data = _.pick(building,
          'name',
          'cuid',
          'street',
          'city',
          'zipcode',
          'state');

        $scope.buildingLoading = true;
        $http.post('/c/'+ data.cuid + '/b', data)
        .success(function() {
          $modalInstance.close();
          callback();
        })
        .error(function(error) {
          $scope.buildingLoading = false;
          var alertStr = '<ul>';
          _.forEach(error.error, function(e) {
            alertStr += '<li>' + e + '</li>';
          });
          alertStr += '</ul>';
          $scope.errorMessage = alertStr;
        });
      };
    };

    $modal.open({
      templateUrl: '/views/modals/add_building.html',
      controller: addBuildingController
    });
  };

  Modals.editBuildingModal = function(building, callback) {
    callback = callback || _.noop;

    var editBuildingController = function($scope, $modalInstance) {
      $scope.errorMessage = '';

      $scope.building = building;
      var cuid = building.cuid;

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
        callback();
      };

      $scope.deleteFloor = function(floor) {
        $scope.buildingLoading = true;
        $http.delete('/c/' + cuid + '/b/' + building.id + '/f/' + floor.id)
        .success(function() {
          console.log("success");
          $scope.buildingLoading = false;
          $scope.building.floors.splice(_.findIndex($scope.building.floors,{'id':floor.id}),1);
        })
        .error(function(error) {
          $scope.buildingLoading = false;
          var alertStr = '<ul>';
          _.forEach(error.error, function(e) {
            alertStr += '<li>' + e + '</li>';
          });
          alertStr += '</ul>';
          $scope.errorMessage = alertStr;
        });
      }

      $scope.saveFloor = function(floor) {
        var data = _.pick(floor,
          'buid',
          'name',
          'floorNum');

        $scope.buildingLoading = true;
        $http.put('/c/' + cuid + '/b/' + building.id + '/f/' + floor.id, data)
        .success(function() {
          $scope.buildingLoading = false;
        })
        .error(function(error) {
          $scope.buildingLoading = false;
          var alertStr = '<ul>';
          _.forEach(error.error, function(e) {
            alertStr += '<li>' + e + '</li>';
          });
          alertStr += '</ul>';
          $scope.errorMessage = alertStr;
        });
      }

      $scope.ok = function() {
        var data = _.pick(building,
          'name',
          'id',
          'cuid',
          'street',
          'city',
          'zipcode',
          'state');

        $scope.buildingLoading = true;
        $http.put('/c/' + data.cuid + '/b/' + data.id, data)
        .success(function() {
          $scope.buildingLoading = false;
          $('#save').html("Saved");
        })
        .error(function(error) {
          $scope.buildingLoading = false;
          $('#save').html("Failed");
          var alertStr = '<ul>';
          _.forEach(error.error, function(e) {
            alertStr += '<li>' + e + '</li>';
          });
          alertStr += '</ul>';
          $scope.errorMessage = alertStr;
        });
      };

      $scope.delete = function(building) {
        if ($("#delete").html() == "Are you sure?") {
          $scope.buildingLoading = true;
          $http.delete('/c/' + building.cuid + '/b/' + building.id)
          .success(function() {
            $modalInstance.dismiss('cancel');
            bootbox.alert(building.name + ' has been deleted.');
            callback();
          })
          .error(function(error) {
            $scope.buildingLoading = false;
            $('#save').html("Failed");
            var alertStr = '<ul>';
            _.forEach(error.error, function(e) {
              alertStr += '<li>' + e + '</li>';
            });
            alertStr += '</ul>';
            $scope.errorMessage = alertStr;
          });
        }
        else {
          $("#delete").html('Are you sure?');
        }
      };
    };

    $modal.open({
      templateUrl: '/views/modals/edit_building.html',
      controller: editBuildingController
    });
  };

  Modals.addFloorModal = function(cuid, buid, callback) {
    callback = callback || _.noop;

    var floor = {};
    floor.buid = buid;
    var addFloorController = function($scope, $modalInstance) {
      $scope.errorMessage = '';

      $scope.floor = floor;
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

      $scope.ok = function() {
        var data = _.pick(floor,
          'buid',
          'name',
          'floorNum');

        $scope.floorLoading = true;
        $http.post('/c/'+ cuid + '/b/' + data.buid + '/f', data)
        .success(function(resp) {
          $http.post('/c/'+ cuid + '/b/' + data.buid + '/f/' + resp.floor.id + '/l', {name:"employees"})
          .success(function(response) {
            $modalInstance.close();
            callback();
            Modals.addFloorMapModal(cuid, data.buid,resp.floor.id,response.layer.id);
          })
          .error(function(error) {
            $scope.floorLoading = false;
            var alertStr = '<ul>';
            _.forEach(error.error, function(e) {
              alertStr += '<li>' + e + '</li>';
            });
            alertStr += '</ul>';
            $scope.errorMessage = alertStr;
          });
        })
        .error(function(error) {
          $scope.floorLoading = false;
          var alertStr = '<ul>';
          _.forEach(error.error, function(e) {
            alertStr += '<li>' + e + '</li>';
          });
          alertStr += '</ul>';
          $scope.errorMessage = alertStr;
        });
      };
    };

    $modal.open({
      templateUrl: '/views/modals/add_floor.html',
      controller: addFloorController
    });
  };

  Modals.addFloorMapModal = function(cuid,buid,fuid,luid,callback) {
    callback = callback || _.noop;


    var addFloorMapController = function($scope, $window, $modalInstance, $upload, $location) {

      var files;
      var maxSize = 3 * 1024 * 1024;

      $scope.setFiles = function(fls) {
        files = fls;
      }

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

      $scope.ok = function() {
        if (files) {
          var uploadUrl = '/c/' + cuid + '/b/' + buid + '/f/' + fuid + '/map';

          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            $scope.addFloorMapLoading = true;
            if (file.size < 3 * 1024 * 1024) {
              $scope.upload = $upload.upload({
                url: uploadUrl,
                method: 'PUT',
                file: file
              })
              .progress(function(evt) {
                $scope.percent = parseInt(100.0 * evt.loaded / evt.total);
              })
              .success(function() {
                $scope.addFloorMapLoading = false;
                $modalInstance.close();
                callback();
                $location.path('configure/' + buid + '/' + fuid + '/' + luid)
              })
              .error(function(error, status) {
                $scope.addFloorMapLoading = false;
                var alertStr = '<ul>';
                _.forEach(error.error, function(e) {
                  alertStr += '<li>' + e + '</li>';
                });
                alertStr += '</ul>';
                $scope.errorMessage = 'We\'re sorry, but we could not add your floor plan.<br>' + 'Error Code: ' + status + alertStr;
              });
            }
            else {
              $scope.addFloorMapLoading = false;
              var alertStr = '<ul>';
              $scope.errorMessage = '<li>Your image is too big (' + (file.size/1048576).toFixed(2) + 'MB), please upload an image smaller than ' + maxSize/1048576 + 'MB.</li></ul>'
            }
          };
        }
        else {
          alert("No Image Selected.");
        }
      };
    };

    $modal.open({
      templateUrl: '/views/modals/add_floor_map.html',
      controller: addFloorMapController
    });
  };

  return Modals;
});

/**
 * Auth service fetches user information and allows manipulation of it.
 */
PathfinderServices.service('Auth', function($http, $rootScope) {
  var Auth = {
    user: null
  };

  Auth.getUser = function() {
    return $http.get('/user')
    .success(function(user) {
      $rootScope.auth.user = user.user;
      Auth.user = user.user;

      // Identify the user and pass traits
      UserVoice.push(['identify', {
        email:      Auth.user.email,
        name:       Auth.user.name,
        id:         Auth.user.id
      }]);
    });
  };

  Auth.logout = function() {
    Auth.user = null;
    return $http.get('/logout');
  };

  Auth.isAdminUser = function() {
    if (Auth.user == null) {
        return false;
    }
    else {
        return (Auth.user.roleid == 1);
    }
  }

  return Auth;
});
