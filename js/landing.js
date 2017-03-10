var Landing = angular.module('Landing', [
  'Pathfinder.Directives',
  'Pathfinder.Services',
  'ui.bootstrap'
]);

Landing.controller('LandingController', function($scope, $http, $location, Modals, $modal, $anchorScroll) {
  $http.defaults.headers.post['Content-Type'] = 'application/json';
  $scope.login = {};
  $scope.loginPopupInstance = undefined;
  window.Stripe.setPublishableKey(window.stripe_key);
  
  $scope.scrollTo = function (id) {
    $location.hash(id);
    $anchorScroll();
  };

  // Sends a request to the server to login with email and password.
  var requestLogin = function(email, password) {
    $http.post('/login-now', {
      email: email,
      password: password
    }).success(function(user) {
      if (user.id) {
        $scope.loginPopupInstance.close();
        window.location.reload(true);
      } else {
        $scope.login.failed = true;
        $scope.loginLoading = false;
      }
    }).error(function(data) {
      $scope.login.failed = true;
      $scope.loginLoading = false;
      bootbox.confirm({
          title: "Invalid Email or Password",
          message: "Did you forget your password?",
          buttons: {
              cancel: {
                  label: '<i class="fa fa-times"></i> Close'
              },
              confirm: {
                  label: '<i class="fa fa-check"></i> I Forgot'
              }
          },
          callback: function (result) {
              $scope.loginPopupInstance.close();
              window.location='/forgot'
          }
      });
    });
  };

  $scope.onSubmitLogin = function(email, pass) {
    $scope.loginLoading = true;
    $scope.login.failed = false;
    if (email && pass){
      requestLogin(email, pass);
    }
    else {
      $scope.login.failed = true;
      $scope.loginLoading = false;

      if (!email && !pass) {
        bootbox.alert("Please enter an email address and password");
      }
      else if (!email) {
        bootbox.alert("Please enter an email address");
      }
      else if (!pass) {
        bootbox.alert("Please enter a password");
      }
    }
  };

  $scope.openRegisterModal = function() {
    Modals.openRegisterModal();
  }

  $scope.requestInfo = function() {
    $scope.requestLoading = true;
    $http.post('/request-info', {
      email: $('#request-email').val()
    }).success(function() {
      bootbox.alert("Thanks! You'll hear from us soon!");
      $scope.requestLoading = false;
    })
  };
  
  $scope.openLoginModal = function () {
      $scope.loginPopupInstance = $modal.open({
          templateUrl: '/views/modals/login.html',
          scope: $scope
      });
  };
  

});
