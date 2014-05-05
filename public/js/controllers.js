racingControllers.controller("EventListCtrl", ["$scope", "eventListService", "raceListService", function ($scope, eventListService, raceListService) {
    eventListService.getEventList(function (data) {
        $scope.events = data;
    });

    raceListService.getUpcomingRaces(3, function (rdata) {
        $scope.races = rdata;
    });
} ]);

racingControllers.controller("EventDetailCtrl", ["$rootScope", "$scope", "$routeParams", "eventDetailService", "eventListService",
    function ($rootScope, $scope, $routeParams, eventDetailService, eventListService) {
        var eventId = $routeParams.eventId;
        eventDetailService.getRaceList(eventId, function (id, data) {
            $scope.event = data;
        });
        /*eventListService.getEvent(eventId, function (data) {
            $scope.event = data;
            $rootScope.title = data.name;
        });
        $scope.today = new Date();
        */
    } ]);

racingControllers.controller("RaceDetailCtrl", ["$scope", "$routeParams", "raceListService", "raceDetailService", "localStorageService",
    function ($scope, $routeParams, raceListService, raceDetailService, localStorageService) {
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

        $scope.toHumanTime = function (ms) {
            var seconds = (ms / 1000) % 60;
            seconds = +seconds.toFixed(3);
            if (seconds <= 10) seconds = "0" + seconds;

            var minutes = Math.floor((ms / (1000 * 60)) % 60);
            return minutes + ":" + seconds;
        }

        $scope.placeSuffix = function (place) {
            switch (place) {
                case 1:
                    return "st";
                case 2:
                    return "nd";
                case 3:
                    return "rd";
                default:
                    return "th";
            }
        }
    } ]);