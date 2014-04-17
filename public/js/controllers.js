racingControllers.controller("EventListCtrl", ["$scope", "eventListService", function ($scope, eventListService) {
    eventListService.getEventList(function (data) { $scope.events = data; });
} ]);

racingControllers.controller("EventDetailCtrl", ["$rootScope", "$scope", "$routeParams", "eventDetailService", "eventListService",
    function ($rootScope, $scope, $routeParams, eventDetailService, eventListService) {
        var eventId = $routeParams.eventId;
        eventDetailService.getRaceList(eventId, function (id, data) {
            $scope.races = data
        });
        eventListService.getEvent(eventId, function (data) {
            $scope.event = data;
            $rootScope.title = data.name;
        });
        $scope.today = new Date();
    } ]);

racingControllers.controller("RaceDetailCtrl", ["$scope", "$routeParams", "raceDetailService", "localStorageService",
    function ($scope, $routeParams, raceDetailService, localStorageService) {
        var eventId = $routeParams.eventId;
        var raceId = $routeParams.raceId;
        var pageId = eventId + "" + raceId;
        if (localStorageService.get("pageId") == pageId) $scope.showReload = true;
        else $scope.showReload = false;
        localStorageService.add("pageId", pageId)
        raceDetailService.getRaceDetail(eventId, raceId, function (eventId, raceId, data) { $scope.race = data; });
        $scope.reloadResults = function () {
            raceDetailService.getRaceDetail($routeParams.eventId, $routeParams.raceId, function (eventId, raceId, data) { $scope.race = data; });
        }
    } ]);