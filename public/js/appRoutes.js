racingApp.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
		.when("/events", { templateUrl: "views/event-list.html", controller: "EventListCtrl", title: "Events" })
		.when("/event/:eventId", { templateUrl: "views/event-detail.html", controller: "EventDetailCtrl", title: "Event" })
        .when("/event/:eventId/race/:raceId", { templateUrl: "views/race-detail.html", controller: "RaceDetailCtrl", title: "Race" })
		.otherwise({ redirectTo: "/events" })
} ])