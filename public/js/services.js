var BASE_URL = "https://dl.dropboxusercontent.com/u/3115379/vails_demo";
var LANE_COUNT = 6;

/*
racingServices.service("raceListService", function ($http, $q) {
    var raceListCache;

    var get = function (callback) {
        $http({ method: "GET", url: BASE_URL + "/races.json" }).success(function (data) {
            raceListCache = data;
            return callback(raceListCache);
        });
    }

    var sortBy

    var getCurrentRaceIndex = function (races) {
        var now = new Date();
        var offsetMins = now.getMinutes() - 5;
        now.setMinutes(offset);
        var index;

        while (!index);
        angular.forEach(races, function (race, i) {
            if (now <= new Date(race.timestamp)) index = 
        });
    }

});
*/

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
            for (var key in data.races) {
                var level = {};
                level.races = data.races[key];
                level.timestamp = new Date(level.races[0].timestamp);
                level.type = key;
                if (day != level.timestamp.getDay()) {
                    level.showDay = true;
                    day = level.timestamp.getDay();
                }
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