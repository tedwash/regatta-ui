var racingApp = angular.module("racingApp", ["ngRoute", "racingControllers", "racingServices"]);
var racingControllers = angular.module("racingControllers", []);
var racingServices = angular.module("racingServices", []);

racingApp.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);
