var racingApp = angular.module("racingApp", ["ngRoute", "racingControllers", "racingServices"]);
var racingControllers = angular.module("racingControllers", ["LocalStorageModule"]);
var racingServices = angular.module("racingServices", []);

racingApp.run(["$window", "$location", "$rootScope", function ($window, $location, $rootScope) {
    $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
        if (current.$$route) {
            $rootScope.title = current.$$route.title;
        }

        if ($location.$$path.indexOf("events") > -1) $rootScope.nav = "events";
        else if ($location.$$path.indexOf("crews") > -1) $rootScope.nav = "crews";

        $window.ga("send", "pageview", { page: $location.path() });
    });

    $rootScope.baseUrl = props.BASE_URL;
} ]);
