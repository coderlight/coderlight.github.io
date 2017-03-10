var PathfinderDirectives = angular.module('Pathfinder.Directives', []);

PathfinderDirectives.directive('onFinishRender', function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      if (scope.$last) {
        scope.$evalAsync(attr.onFinishRender);
      }
    }
  }
});

// Hides images that don't exist
PathfinderDirectives.directive('errSrc', function() {
  return {
    link: function(scope, element) {
      element.bind('error', function() {
        element.addClass('ng-hide');
      });
    }
  }
});

/**
 * Directive to show loading when the attribute is truthy.
 * Credit - Aakash Patel
 */
PathfinderDirectives.directive('pfLoading', function() {
  return {
    restrict: 'A',
    transclude: true,
    templateUrl: '/views/directives/loading.html',
    scope: {
      pfLoading: '='
    }
  };
});

// Runs function after image loads.
PathfinderDirectives.directive('onImageLoad', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      element.on('load', function() {
        scope.$eval(attr.onImageLoad);
      });
    }
  };
});

PathfinderDirectives.directive('ngBindHtmlUnsafe', function($sce){
  return {
    scope: {
      ngBindHtmlUnsafe: '=',
    },
    template: "<div ng-bind-html='trustedHtml'></div>",
    link: function($scope, iElm, iAttrs, controller) {
      $scope.updateView = function() {
        $scope.trustedHtml = $sce.trustAsHtml($scope.ngBindHtmlUnsafe);
      };
      $scope.$watch('ngBindHtmlUnsafe', function(newVal, oldVal) {
        $scope.updateView(newVal);
      });
    }
  };
});
