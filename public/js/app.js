var racingApp = angular.module("racingApp", ["ngRoute", "racingControllers", "racingServices"]);
var racingControllers = angular.module("racingControllers", ["LocalStorageModule"]);
var racingServices = angular.module("racingServices", []);

racingApp.run(['$location', '$rootScope', function ($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        if (current.$$route) {
            $rootScope.title = current.$$route.title;
        }
    });

    $rootScope.baseUrl = props.BASE_URL;
} ]);
