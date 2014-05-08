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