var BASE_URL = "https://dl.dropboxusercontent.com/u/3115379/vails_demo";
var LANE_COUNT = 6;
var OFFSET_MINS = 5;
var TEST = true;

racingServices.service("raceListService", function ($http, $q) {
    var raceListCache;

    var get = function (callback) {
        $http({ method: "GET", url: BASE_URL + "/races.json" }).success(function (data) {
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
            race.event_name = "Event Name";
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
        getUpcomingRaces: function(count, callback){
            if (raceListCache){
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

racingServices.service('eventListService', function ($http, $q) {
    var eventListCache;

    var get = function (callback) {
        $http({ method: "GET", url: BASE_URL + "/events.json" }).success(function (data) {
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
        $http({ method: "GET", url: BASE_URL + "/events/" + id + ".json" }).success(function (data) {
            var newData = [];
            var day;
            var lrClass = "dayRight";
            for (var key in data.races) {
                var level = {};
                level.races = data.races[key];
                level.timestamp = new Date(level.races[0].timestamp);
                level.type = key;
                if (day != level.timestamp.getDay()) {
                    level.showDay = true;
                    day = level.timestamp.getDay();
                    if (lrClass == "dayLeft") lrClass = "dayRight";
                    else lrClass = "dayLeft";
                }
                level.dayClass = lrClass;
                newData.push(level);
            }
            console.dir(newData);
            eventRacesCache[id] = newData;
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
        $http({ method: "GET", url: BASE_URL + "/races/" + raceId + ".json" }).success(function (data) {
            var lanes = [];
            for (i = 0; i < 6; i++) {
                lanes.push({ index: i + 1 });
            }
            angular.forEach(data.lanes, function (lane, i) {
                lanes[lane.index - 1] = lane;
            });
            data.lanes = lanes;
            console.dir(data);
            return callback(eventId, raceId, data);
        });
    }
    return {
        getRaceDetail: function (eventId, raceId, callback) {
            var deferred = $q.defer();
            get(eventId, raceId, function (eid, rid, data) { deferred.resolve(data); });
            deferred.promise.then(function (res) { console.dir(res); return callback(eventId, raceId, res); });
        }
    }
});