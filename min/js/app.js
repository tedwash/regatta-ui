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

racingApp.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
		.when("/events", { templateUrl: "views/event-list.html", controller: "EventListCtrl", title: "Events" })
		.when("/events/:eventId", { templateUrl: "views/event-detail.html", controller: "EventDetailCtrl", title: "Event" })
        .when("/events/:eventId/races/:raceId", { templateUrl: "views/race-detail.html", controller: "RaceDetailCtrl", title: "Race" })
        .when("/events/:eventId/races/:raceId/:crewId", { templateUrl: "views/race-detail.html", controller: "RaceDetailCtrl", title: "Race" })
        .when("/crews/:crewId", { templateUrl: "views/crew.html", controller: "CrewCtrl", title: "Crew" })
        .when("/crews", { templateUrl: "views/crew-list.html", controller: "CrewListCtrl", title: "Crews" })
        .when("/about", { templateUrl: "views/about.html", controller: "AboutCtrl", title: "About" })
		.otherwise({ redirectTo: "/events" });
} ]);

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

racingControllers.controller("AboutCtrl", ["$rootScope", "$scope",
    function ($rootScope, $scope) {

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
    $scope.bladeStyle = { backgroundColor: "white" };
}
]);

racingControllers.controller("CrewListCtrl", ["$rootScope", "$scope", "crewService", function ($rootScope, $scope, crewService) {
    $rootScope.loading = true;
    crewService.getCrewList(function (data) {
        $scope.crews = data;
        $rootScope.loading = false;
    });
} ]);

var TEST = false;
var devProps = { BASE_URL: "https://dl.dropboxusercontent.com/u/3115379/vails_demo", EXT: ".json" };
var prdProps = { BASE_URL: "http://dv.mandibleweb.com/server/api", EXT: "" };
var props = prdProps;
if (TEST) props = devProps;
var LANE_COUNT = 6;
var OFFSET_MINS = 5;


racingServices.service("raceListService", ["$http", "$q", function ($http, $q) {
    var raceListCache;

    var get = function (callback) {
        $http({ method: "GET", url: props.BASE_URL + "/races" + props.EXT }).success(function (data) {
            data.sort(dateCompare);
            raceListCache = data;
            return callback(raceListCache);
        });
    }

    function dateCompare(a, b) {
        var da = Date.parse(a.timestamp);
        var db = Date.parse(b.timestamp);
        if (da < db) return -1;
        if (da > db) return 1;
        return 0;
    }

    var getCurrentRaces = function (races, count) {
        var now = new Date();

        if (TEST) {
            now.setYear(2013);
            now.setMonth(4);
            now.setDate(10);
        }
        var offsetMins = now.getMinutes() - OFFSET_MINS;
        now.setMinutes(offsetMins);
        var index;

        angular.forEach(races, function (race, i) {
            var d = Date.parse(race.timestamp);
            if (now >= d) index = i;
        });

        return races.slice(index, index + count);
    }

    var getRaceById = function (races, id) {
        var r;
        angular.forEach(races, function (race, i) {
            if (race.id == id) r = race;
        });
        return r;
    }

    return {
        getUpcomingRaces: function (count, callback) {
            if (raceListCache) {
                return callback(getCurrentRaces(raceListCache, count));
            } else {
                var deferred = $q.defer();
                get(function (data) { deferred.resolve(data); });
                deferred.promise.then(function (res) { callback(getCurrentRaces(raceListCache, count)); })
            }
        },

        getRace: function (id, callback) {
            if (raceListCache) {
                return callback(getRaceById(raceListCache, id));
            } else {
                var deferred = $q.defer();
                get(function (data) { deferred.resolve(data); });
                deferred.promise.then(function (res) {
                    return callback(getRaceById(res, id));
                });
            }
        }
    }

}]);

racingServices.service("eventListService", ["$http", "$q", function ($http, $q) {
    var eventListCache;

    var get = function (callback) {
        $http({ method: "GET", url: props.BASE_URL + "/events" + props.EXT }).success(function (data) {
            eventListCache = data;
            return callback(eventListCache);
        });
    }

    var getEventById = function (events, id) {
        var e;
        angular.forEach(events, function (event, i) {
            if (event.id == id) e = event;
        });
        return e;
    }

    return {
        getEventList: function (callback) {
            if (eventListCache) {
                return callback(eventListCache);
            } else {
                var deferred = $q.defer();
                get(function (data) { deferred.resolve(data); });
                deferred.promise.then(function (res) { return callback(res); })
            }
        },

        getEvent: function (id, callback) {
            if (eventListCache) {
                return callback(getEventById(eventListCache, id));
            } else {
                var deferred = $q.defer();
                get(function (data) { deferred.resolve(data); });
                deferred.promise.then(function (res) {
                    return callback(getEventById(res, id));
                });
            }
        }
    }
}]);

racingServices.service("eventDetailService", ["$http", "$q", function ($http, $q) {
    var eventRacesCache = {};
    var get = function (id, callback) {
        $http({ method: "GET", url: props.BASE_URL + "/events/" + id + "" + props.EXT }).success(function (data) {
            var newData = { left: [], right: [] };
            var isLeft = false;
            var day;
            angular.forEach(data.race_types, function (level, i) {
                level.timestamp = new Date(level.races[0].timestamp);
                if (day != level.timestamp.getDay()) {
                    level.showDay = true;
                    day = level.timestamp.getDay();
                    isLeft = !isLeft;
                }
                if (isLeft) newData.left.push(level);
                else newData.right.push(level);
            });
            data.race_types = newData;
            eventRacesCache[id] = data;
            return callback(id, eventRacesCache[id]);
        });
    }
    return {
        getRaceList: function (id, callback) {
            if (eventRacesCache[id]) {
                return callback(id, eventRacesCache[id]);
            } else {
                var deferred = $q.defer();
                get(id, function (id, data) { deferred.resolve(data); });
                deferred.promise.then(function (res) { return callback(id, res); });
            }

        }
    }
}]);

racingServices.service("raceDetailService", ["$http", "$q", function ($http, $q) {
    var get = function (eventId, raceId, callback) {
        $http({ method: "GET", url: props.BASE_URL + "/races/" + raceId + "" + props.EXT }).success(function (data) {
            var lanes = [];
            var laneCount = data.length > 6 ? data.length : 6;
            for (i = 0; i < laneCount; i++) {
                lanes.push({ index: i + 1 });
            }
            angular.forEach(data.lanes, function (lane, i) {
                lanes[lane.index - 1] = lane;
            });
            data.lanes = lanes;
            return callback(eventId, raceId, data);
        });
    }
    return {
        getRaceDetail: function (eventId, raceId, callback) {
            var deferred = $q.defer();
            get(eventId, raceId, function (eid, rid, data) { deferred.resolve(data); });
            deferred.promise.then(function (res) { return callback(eventId, raceId, res); });
        }
    }
}]);

racingServices.service("crewService", ["$http", "$q", function ($http, $q){
    var crewListCache;

    var getCrew = function (universityId, callback) {
        $http({ method: "GET", url: props.BASE_URL + "/universities/" + universityId + "" + props.EXT }).success(function (data) {
            return callback(universityId, data);
        });
    }

    var getCrewList = function (callback) {
        $http({ method: "GET", url: props.BASE_URL + "/universities" + props.EXT }).success(function (data) {
            return callback(data);
        });
    }

    return {
        getCrew: function (universityId, callback) {
            var deferred = $q.defer();
            getCrew(universityId, function (uid, data) { deferred.resolve(data); });
            deferred.promise.then(function (res) { return callback(universityId, res); });
        },

        getCrewList: function(callback) {
            if (crewListCache) {
                return callback(crewListCache);
            } else {
                var deferred = $q.defer();
                getCrewList(function (data) { deferred.resolve(data); });
                deferred.promise.then(function (res) { return callback(res); })
            }

        }
    }
}]);

