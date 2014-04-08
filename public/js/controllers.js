racingControllers.controller("EventListCtrl", ["$scope", "eventListService", function ($scope, eventListService) {
    eventListService.getEventList(function (data) { $scope.events = data; });
} ]);

racingControllers.controller("EventDetailCtrl", ["$rootScope", "$scope", "$routeParams", "eventDetailService", "eventListService",
    function ($rootScope, $scope, $routeParams, eventDetailService, eventListService) {
        var eventId = $routeParams.eventId;
        eventDetailService.getRaceList(eventId, function (id, data) { $scope.races = data });
        eventListService.getEvent(eventId, function (data) {
            $scope.event = data;
            $rootScope.title = data.name;
        });
    } ]);

racingControllers.controller("RaceDetailCtrl", ["$scope", "$routeParams", "raceDetailService", function ($scope, $routeParams, raceDetailService) {
    var eventId = $routeParams.eventId;
    var raceId = $routeParams.raceId;
    raceDetailService.getRaceDetail(eventId, raceId, function (eventId, raceId, data) { $scope.race = data; });
} ]);