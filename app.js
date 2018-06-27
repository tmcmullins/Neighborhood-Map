'use strict';

var map;
var toggleMenu = $(".toggleMenu");
var navToggle = $(".navToggle");
var navMenu = $("#navMenu");
var toggle = false;
var upArrow = "\u25B2";
var downArrow = "\u25Bc";

// Define the search term
var term = ko.observable('');	

var favLocations = ko.observableArray([
	{name: 'Virtual Images',
	coordinates: {latitude: 34.06018, longitude: -118.15301650000004},
	info: "<p>Worked as a graphic designer here from 2006 - 2017.</p>"
	},
	{name: 'Starbucks', 
	coordinates: {latitude: 34.1223404, longitude: -118.10578129999999},
	info: "<p>Who doesn't know about Starbucks. There's one on every corner. I served Dr. Drew cups of coffee here on more than one occasion.</p>"
	},
	{name: 'Victoria Gardens',
	coordinates: {latitude: 34.111653, longitude: -117.5331645},
	info: "<p>Victoria Gardens is an open-air town center that includes Macy's, JCPenney, AMC Theater, Bass Pro Shops Outdoor World, and 170 specialty stores.</p>"
	},
	{name: 'Cal Poly Pomona',
	coordinates: {latitude: 34.0575651, longitude: -117.820741},
	info: "<p>Cal Poly Pomona (my alma mater) offers an affordable, life-changing education. Less than 30 miles east of Los Angeles, it enjoys the excitement of a diverse metropolitan while retaining the serenity of a foothill community.</p>"
	},
	{name: 'Edward Cinemas',
	coordinates: {latitude: 34.1779247, longitude: -118.160462},
	info: "<p>Regal Entertainment Group (NYSE: RGC) operates the largest and most geographically diverse theatre circuit in the United States. Me and my friends like to visit here from time to time to watch the IMAX.</p>"
	},
	{name: 'Whispering Lakes Golf Course', 
	coordinates: {latitude: 34.020954, longitude: -117.60525200000001},
	info: "<p>Whispering Lakes Golf Course – the 18-hole, par-72, city-owned course in Ontario, California – sports a brand-new clubhouse, with improved playing conditions and equipment! I come here to keep my game sharp and my scores low.</p>"
	},
	{name: 'Pasadena Paseo', 
	coordinates: {latitude: 34.1456259, longitude: -118.14402359999997},
	info: "<p>From 1980 - 2001, this was known as the Pasadena Shopping Mall. Paseo Colorado, also known as The Paseo, is now an upscale outdoor mall, covering three city blocks with office space, shops, restaurants, a movie theater, and 400 loft-style condominiums above.</p>"
	},
	{name: 'Ishi Sushi', 
	coordinates: {latitude: 33.9921929, longitude: -117.89076999999997},
	info: "<p>I met Ishimori when he first opened up a shop in Rancho Cucamonga. Since then he has grown his business and made his mark as one of the best sushi chefs this side of the 605 freeway.</p>"
	}
]);	
// Array that stores the Yelp locaitons.
var yelpLocations = ko.observableArray([]);

var markers = [];
var yelpMarkers = [];

function viewModel() {
	var self = this;

	// This code interacting with yelp fusion is from Greg Sandell's Youtube https://www.youtube.com/watch?v=0Sy14hX8T-A&t=391s
	self.yelpRequest = function() {
		if (term().length > 0) {
			zoomOut();
			var currentTerm = term();
			var currentLoc = 'Southern California';
			// Required variables for yelp fusion API to work with this page
			var corsURL = 'https://cors-anywhere.herokuapp.com/';
			var yelpURL = 'https://api.yelp.com/v3/businesses/search';
			// Set headers and parameters for the yelp request.
			var requestObj = {
				url: corsURL + yelpURL,
				data: {term: currentTerm, location: currentLoc, radius: 40000},
				headers: {'Authorization': tmcmullins}
			};
			yelpLocations([]);	
			term('');
			clearMarkers();

			// perform Ajax request
			$.ajax(requestObj)
				.done(function(response) {
					// Store response
					var data = response.businesses;
					console.log(data);
					// Itterate through the response object and populate yelp locations array with specified data.
					for (var i = 0; i < data.length ; i++) {
						var place = data[i];
						var title = place.name.toString();
						var phone = place.display_phone;
						var address = place.location.display_address;
						var rating = place.rating;
						var review = place.review_count;
						var location = place.coordinates;
						var url = place.url;
						var infoContent = "<h3>" + title + "</h3><b>" + phone + "</b><p>" + address + "</p><p>Rating: " + rating + " | Review Count: " + review + "</p> <img class=\"yelpIcon\"src=\"img/Yelp_burst_positive_RGB.png\"></img> <a target=\"_blank\" href=\"" + url + "\">More Info</a>";

						yelpLocations.push(place);
						addNewMarker(title, location, infoContent, yelpMarkers);
					}
				})
				.fail(function() {
					alert('We were unable to return any results from Yelp. We apologize for the inconvenience.');
				});
				showFavMarkers();
		}
	};
		

	// I was getting duplicate favorite markers when I click on the search button. This route makes the search button perform like the submit data-bind on the parent element. 
	self.toggledRequest = function() {
		self.yelpRequest();
	};

	// Add one to the favLocations array.
	self.addFavorite = function() {
		var i = yelpLocations.indexOf(this);
        favLocations.push(this);
        yelpLocations.splice(i, 1);
        markers.push(yelpMarkers[i]);
        yelpMarkers.splice(i, 1);
    };

    // Subtract one from the favLocations array.
	self.minusFavorite = function() {
		var i = favLocations.indexOf(this);
        yelpLocations.push(this);
        favLocations.splice(i, 1);
		yelpMarkers.push(markers[i]);
		markers.splice(i, 1);
    };
}

// Initialize the map.
function initMap() {
	// Place Google's map into the html.
	map = new google.maps.Map(document.getElementById('mapContainer'), {
		center: {lat: 34.0686208, lng: -117.9389526},
		zoom: 10/*,
		gestureHandling: "greedy"*/
	});

	setFavMarkers();
}

// This function makes a marker and attaches an info window to it.
function addNewMarker (title, loc, content, array) {

	//Convert loc input to a latlng literal
	var location = {
		lat: loc.latitude, 
		lng: loc.longitude,
	};

	// Create a new infowindow.
	var infowindow = new google.maps.InfoWindow({
		content: content,
		maxWidth: 300
	});	

	// Create a marker.
	var marker = new google.maps.Marker({
		position: location,
		map: map,
		title: title,
		animation: google.maps.Animation.DROP,
		info: infowindow
	});

	// Click on the marker to open the info window.
	marker.addListener('click', function() {
		infowindow.open(map, marker);
		marker.setAnimation(4);
	});
	marker.addListener('mouseover', function() {
		toggleBounceOn(marker);
	});

	array.push(marker);
}

// Loop through favLocations and place a marker for each favLocations object. This looks like a good place to add content to the info window.
function setFavMarkers () {
	for (var i = 0; i < favLocations().length; i++) {
		// Get data from the favLocations array.
		var title = favLocations()[i].name ;
		var position = favLocations()[i].coordinates;
		var info = favLocations()[i].info;
		var infoContent = "<p><b>" + title + "</b></p><p>" + info + "</p>";

		addNewMarker(title, position, infoContent, markers);
	}
}

// Sets the map on all markers in the array.
function clearMarkers (map) {
	for (var i = 0; i < yelpMarkers.length; i++) {
		yelpMarkers[i].setMap(null);
		yelpMarkers = [];
	}
}

function showFavMarkers () {
	for (var i = 0; i < markers.length; i++) {
		markers[i].visible = true;
	}
}

// Filter markers based on searchbar input.
function filterMarkers () {
	for (var i = 0; i < markers.length; i++) {
		if (markers[i].title.toUpperCase().indexOf(term().toUpperCase()) > -1) {
			markers[i].setVisible(true);
		} else {
            markers[i].setVisible(false);
        }
	}
	for (var i = 0; i < yelpMarkers.length; i++) {
		if (yelpMarkers[i].title.toUpperCase().indexOf(term().toUpperCase()) > -1) {
			yelpMarkers[i].setVisible(true);
		} else {
            yelpMarkers[i].setVisible(false);
        }
	}
}

// Click one of the buttons to zoom in on that particular location.
function zoomFav () {

    var location = {
		lat: this.coordinates.latitude, 
		lng: this.coordinates.longitude,
	}; 
	// Loop through array of markers
	for (var i = 0; i < markers.length; i++) {
		// Compare this DOM element to the markers.
		if (this.name == markers[i].title) {
			// Intiate the marker bounce.
			google.maps.event.trigger(markers[i], 'click');
			toggleBounceOn(markers[i]);
			
		}
	}

    map.setZoom(12);
	map.setCenter(location);
	hideNav();	    	
}

// Click one of the buttons to zoom in on that particular location.
function zoomYelp () {
    var location = {
		lat: this.coordinates.latitude, 
		lng: this.coordinates.longitude,
	}; 
	
	// Loop through array of yelp markers
	for (var i = 0; i < yelpMarkers.length; i++) {
		// Compare this DOM element to the markers.
		if (this.name == yelpMarkers[i].title) {
			// Intiate the marker bounce.
			google.maps.event.trigger(yelpMarkers[i], 'click');
			toggleBounceOn(yelpMarkers[i]);

		} 
	}

    map.setZoom(12);
	map.setCenter(location);
	hideNav();
}

// Animate a bouncing marker.
function toggleBounceOn (marker) {
	marker.setAnimation(google.maps.Animation.BOUNCE);
	setTimeout(function () {
	    marker.setAnimation(null);
	}, 1000); 
}

// Click one of the buttons to zoom in on that particular location.
function zoomOut () {
	var location = {lat: 34.0686208, lng: -117.9389526};
    map.setZoom(10);
	map.setCenter(location);
}

// Hide the navigation menu.
function hideNav () {
	navMenu.animate({
		"opacity": "0",
		"top": "-600"
	}, 200);
	navToggle.text(downArrow);
	toggle = false;
}
// Nav menu starts closed.
// hideNav();

// Show the navigation menu.
function showNav () {
	navMenu.animate({
		"opacity": "0.8",
		"top": "0"
	}, 200);
	navToggle.text(upArrow);
	toggle = true;
}
// Nav menu starts open.
showNav();

// Toggle the navigation menu on and off when toggle menu div is clicked.
function toggleNav () {
	if (toggle === true) {
		hideNav();
	} else if (toggle === false) {
		showNav();
	}
}

function googleError() {
	alert('We were unable to communicate with Google API services at this time. Please try back later. We apologize for the inconvenience.');
}

ko.applyBindings(new viewModel());