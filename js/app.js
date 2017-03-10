// Declare app level module
var Pathfinder = angular.module('Pathfinder', [
  'Pathfinder.Services',
  'Pathfinder.Directives',
  'ngResource',
  'ngRoute',
  'ui.bootstrap',
  'ui.date',
  'angularFileUpload'
]);

Pathfinder.config(function ($routeProvider, $compileProvider, $locationProvider) {
  // Get the current user before actually routing.
  var resolve = {
    auth: ['Auth', function(Auth) {
      return Auth.getUser();
    }]
  };

  window.Stripe.setPublishableKey(window.stripe_key);

  $routeProvider
  .when('/', {
    templateUrl: 'views/main.html',
    controller: 'MainController',
    resolve: resolve,
    activenav: 'main'
  })
  .when('/building/:buid', {
    templateUrl: 'views/building.html',
    controller: 'BuildingController',
    resolve: resolve,
    activenav: 'building'
  })
  .when('/configure/:buid/:fuid/:luid', {
    templateUrl: 'views/configure.html',
    controller: 'ConfigureController',
    resolve: resolve,
    activenav: 'configure'
  })
  .when('/setup', {
    templateUrl: 'views/setup.html',
    controller: 'SetupController',
    resolve: resolve,
    activenav: 'setup'
  })
  .when('/useradmin', {
    templateUrl: 'views/useradmin.html',
    controller: 'UserAdminController',
    resolve: resolve,
    activenav: 'admin'
  })
  .when('/billing', {
    templateUrl: 'views/billing.html',
    controller: 'BillingController',
    resolve: resolve,
    activenav: 'setup'
  });

  // Allows Skype application links
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|skype):/);
});

Pathfinder.run(['$rootScope', '$http', '$location', 'Auth', function ($rootScope, $http, $location, Auth) {
  $rootScope.$on("$routeChangeStart", function(event, next, current) {
      if (!Auth.user) {
          Auth.getUser().then(function() {
              status = Auth.user.status;
              if (status && (status == 'canceled' || status == 'unpaid')) {
                  $location.path("/billing");
              }
          });
      }
      else {
          status = Auth.user.status;
          if (status && (status == 'canceled' || status == 'unpaid')) {
              $location.path("/billing");
          }
      }
  });
  $rootScope._ = _;

  // User object in $rootScope.auth to prevent conflicts with anything else called user.
  $rootScope.auth = {};

  $http.defaults.headers.put['Content-Type'] = 'application/json';
  $http.defaults.headers.post['Content-Type'] = 'application/json';
}]);
