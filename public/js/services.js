var TEST = false;
var devProps = { BASE_URL: "https://dl.dropboxusercontent.com/u/3115379/vails_demo", EXT: ".json" };
var prdProps = { BASE_URL: "http://dv.mandibleweb.com/server/api", EXT: "" };
var props = prdProps;
if (TEST) props = devProps;
var LANE_COUNT = 6;
var OFFSET_MINS = 5;


racingServices.service("raceListService", function ($http, $q) {
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

});

racingServices.service("eventListService", function ($http, $q) {
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
});

racingServices.service("eventDetailService", function ($http, $q) {
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
});

racingServices.service("raceDetailService", function ($http, $q) {
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
});

racingServices.service("crewService", function ($http, $q){
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
})