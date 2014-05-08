racingControllers.controller("EventListCtrl", ["$rootScope", "$scope", "eventListService", "raceListService", function ($rootScope, $scope, eventListService, raceListService) {
    $rootScope.loading = true;
    var loading = true;
    eventListService.getEventList(function (data) {
        $scope.events = data;
        if (!loading) $rootScope.loading = false;
        else loading = false;
    });

    raceListService.getUpcomingRaces(3, function (rdata) {
        $scope.races = rdata;
        if (!loading) $rootScope.loading = false;
        else loading = false;
    });
} ]);

racingControllers.controller("EventDetailCtrl", ["$rootScope", "$scope", "$routeParams", "eventDetailService", "eventListService",
    function ($rootScope, $scope, $routeParams, eventDetailService, eventListService) {
        var eventId = $routeParams.eventId;
        $rootScope.loading = true;
        eventDetailService.getRaceList(eventId, function (id, data) {
            $scope.event = data;
            $rootScope.loading = false;
            $rootScope.title = data.name;
        });
    }
 ]);

racingControllers.controller("RaceDetailCtrl", ["$rootScope", "$scope", "$routeParams", "raceListService", "raceDetailService", "localStorageService",
    function ($rootScope, $scope, $routeParams, raceListService, raceDetailService, localStorageService) {
        var eventId = $routeParams.eventId;
        var raceId = $routeParams.raceId;
        $scope.calloutCrew = $routeParams.crewId;
        var pageId = eventId + "" + raceId;
        if (localStorageService.get("pageId") == pageId) $scope.showReload = true;
        else $scope.showReload = false;
        localStorageService.add("pageId", pageId)
        $rootScope.loading = true;
        raceDetailService.getRaceDetail(eventId, raceId, function (eventId, raceId, data) {
            $scope.race = data;
            $rootScope.loading = false;
            $rootScope.title = data.type_name + (data.type < 3 ? " " + data.event_type_index : "") + " - " + data.event_name;
        });
        $scope.reloadResults = function () {
            $rootScope.loading = true;
            raceDetailService.getRaceDetail($routeParams.eventId, $routeParams.raceId, function (eventId, raceId, data) {
                $scope.race = data;
                $rootScope.loading = false;
            });
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
    }
]);

racingControllers.controller("CrewCtrl", ["$rootScope", "$scope", "$routeParams", "crewService", function ($rootScope, $scope, $routeParams, crewService) {
    var crewId = $routeParams.crewId;
        $rootScope.loading = true;
        crewService.getCrew(crewId, function (id, data) {
            $scope.crew = data;
            $rootScope.loading = false;
        });
        $scope.bladeStyle = {backgroundImage: "url(http://dv.mandibleweb.com/server/api/blades/" + crewId + ")", backgroundColor:"white"};
}
]);

racingControllers.controller("CrewListCtrl", ["$rootScope", "$scope", "crewService", function ($rootScope, $scope, crewService) {
    $rootScope.loading = true;
    crewService.getCrewList(function (data) {
        $scope.crews = data;
        $rootScope.loading = false;
    });
} ]);


