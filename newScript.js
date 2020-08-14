// ======================================================================
// Declaring global variables
// ======================================================================

const key = '&appid=23046ae67f0b02423b422525b360af5e'
// const city = 'sydney'
let citiesArray = JSON.parse(localStorage.getItem("cities")) || [];
const queryURL = "https://api.openweathermap.org/data/2.5/weather?q=";
const metric = "&units=metric"
const m = moment();

$(document).ready(function() {
	let city = citiesArray[citiesArray.length - 1];
	fiveDay(city);
	citySearch(city);


function citySearch(city) {
	// clear out previous city data
	$(".city").empty();
	$(".temp").empty();
	$(".humidity").empty();
	$(".wind").empty();
	$(".uvIndex").empty();

let citySearch = queryURL + city + metric + key;

    $.ajax({
        url: citySearch,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        // Primary Card - Line One
        // City Name
        $(".city").append(response.name);
        // Date
        let dateInfo = response.dt;
        let currentDate = moment.unix(dateInfo).format("DD-MM-YYYY");
        $(".city").append(" " + currentDate);
        // Weather Icon
        const iconSource = "https://openweathermap.org/img/wn/";
		const iconPng = "@2x.png";
		let iconWeather = response.weather[0].icon;
		let iconUrl = iconSource + iconWeather + iconPng;
		console.log(iconUrl);
		const iconImg = $("<img>");
        iconImg.attr("src", iconUrl);
        $(".city").append(iconImg);
        // Temperature in Celsius (metric system)
        $(".temp").append("Temperature: " + response.main.temp + "°C");
        // Humidity
        $(".humidity").append("Humidity: " + response.main.humidity + "%");
        // Wind speed in Metres per second (metric system)
        $(".wind").append("Wind Speed: " + response.wind.speed + " MPS");
        // UV Index
        const uvIndexQuery = "http://api.openweathermap.org/data/2.5/uvi?"
        let lat = "&lat=" + response.coord.lat;
        let lon = "&lon=" + response.coord.lon;
        let uvIndexSearch = uvIndexQuery + key + lat + lon;
        $.ajax({
            url: uvIndexSearch,
            method: "GET"
        }).then(function(response) {
            let uvIndex = response.value;

            // Append button with uvIndex printed to it
            $(".uvIndex").append("UV Index: ");
            let  uvBtn = $("<button>").text(uvIndex);
            $(".uvIndex").append(uvBtn);
            // Style uvIndex button according to conventional triage system (see: https://www.wikihow.com/images/f/fb/Jonathan-UV-Index-3.png)
            if (uvIndex < 3) {
                // If between 0-2: Green
                uvBtn.attr("class", "uvGreen");
            } else if (uvIndex < 6) {
                // If between 3-5: Yellow
                uvBtn.attr("class", "uvYellow");
            } else if (uvIndex < 8) {
                // If between 6-7: Orange
                uvBtn.attr("class", "uvOrange");
            } else if (uvIndex < 11) {
                // If between 8-10: Red
                uvBtn.attr("class", "uvRed");
            } else {
                // If greater than 11: Purple
                uvBtn.attr("class", "uvPurple");
            }
        });        
    });
};

// ======================================================================
// Please help - not rendering properly - date for the cards ok though
// ======================================================================

function renderButtons() {
	// Deleting the buttons prior to adding new cities
	$(".list-group").empty();

	// Looping through the array of cities
	for (let i = 0; i < 5; i++) {
		// Then dynamicaly generating buttons for each
		let a = $("<li>");
		// Adding a class
		a.addClass("cityName");
		a.addClass("list-group-item");
		// Adding a data-attribute
		a.attr("data-name", citiesArray[i]);
		// Providing the initial button text
		a.text(citiesArray[i]);
		// Adding the button to the buttons-view div
		$(".list-group").append(a);
	}

	$(".cityName").on("click", function(event) {
		event.preventDefault();

		var city = $(this).data("name");
		console.log("prev searched city" + city);

		//give city info to five day forcast cards as well
		fiveDay(city);
		//pull up the information display
		citySearch(city);
	});
}

    // Now for the 5-day forecast
    function fiveDay(city) {
        let fiveFront = "https://api.openweathermap.org/data/2.5/forecast?q=";
        let fiveURL = fiveFront + city + metric + key;
        console.log(fiveURL);
    
        //clear out previous data
        $(".card-text").empty();
        $(".card-title").empty();
    
        $.ajax({
            url: fiveURL,
            method: "GET"
        }).then(function(response) {
            console.log(response);
            //dates
            let dateOne = moment.unix(response.list[1].dt).utc().format("DD/MM/YYYY");
            $(".dateOne").append(dateOne);
            let dateTwo = moment.unix(response.list[9].dt).utc().format("DD/MM/YYYY");
            $(".dateTwo").append(dateTwo);
            let dateThree = moment.unix(response.list[17].dt).utc().format("DD/MM/YYYY");
            $(".dateThree").append(dateThree);
            let dateFour = moment.unix(response.list[25].dt).utc().format("DD/MM/YYYY");
            $(".dateFour").append(dateFour);
            let dateFive = moment.unix(response.list[33].dt).utc().format("DD/MM/YYYY");
            $(".dateFive").append(dateFive);
    
        
            //icon - selected 13:00 on each day for icon display for "Average temp"
            const iconOne = $("<img>");
            let iconOneSrc = "https://openweathermap.org/img/wn/" + response.list[4].weather[0].icon + "@2x.png"
            iconOne.attr("src", iconOneSrc);
            $(".iconOne").append(iconOne);
    
            const iconTwo = $("<img>");
            let iconTwoSrc = "https://openweathermap.org/img/wn/" + response.list[12].weather[0].icon + "@2x.png";
            iconTwo.attr("src", iconTwoSrc);
            $(".iconTwo").append(iconTwo);
    
            const iconThree = $("<img>");
            var iconThreeSrc = "https://openweathermap.org/img/wn/" + response.list[20].weather[0].icon + "@2x.png";
            iconThree.attr("src", iconThreeSrc);
            $(".iconThree").append(iconThree);
    
            const iconFour = $("<img>");
            let iconFourSrc = "https://openweathermap.org/img/wn/" + response.list[28].weather[0].icon + "@2x.png";
            iconFour.attr("src", iconFourSrc);
            $(".iconFour").append(iconFour);
    
            const iconFive = $("<img>");
            let iconFiveSrc = "https://openweathermap.org/img/wn/" + response.list[36].weather[0].icon + "@2x.png";
            iconFive.attr("src", iconFiveSrc);
            $(".iconFive").append(iconFive);
        
            //temp - daily averages unavailable on 5 day / 3 hour Forecast - selected 13:00 on each day for temp
            $(".tempOne").append("Temperature: " + response.list[4].main.temp + "°C");       
            $(".tempTwo").append("Temperature: " + response.list[12].main.temp + "°C");
            $(".tempThree").append("Temperature: " + response.list[20].main.temp + "°C");
            $(".tempFour").append("Temperature: " + response.list[28].main.temp + "°C");
            $(".tempFive").append("Temperature: " + response.list[36].main.temp + "°C");
    
           //humidity - daily averages unavailable on 5 day / 3 hour Forecast - selected 13:00 on each day for humidity
            $(".humidityOne").append("Humidity: " + response.list[4].main.humidity + "%");
            $(".humidityTwo").append("Humidity: " + response.list[12].main.humidity + "%");
            $(".humidityThree").append("Humidity: " + response.list[20].main.humidity + "%");
            $(".humidityFour").append("Humidity: " + response.list[28].main.humidity + "%");
            $(".humidityFive").append("Humidity: " + response.list[36].main.humidity + "%");
        });
    
    };
// =================================================================
// Please help - not rendering properly
// =================================================================

$("#add-city").on("click", function(event) {
	event.preventDefault();

	//line that grabs input from the textbox
	let city = $("#city-input")
		.val()
		.trim();

	//push new city into the Array
	let containsCity = false;

	if (citiesArray != null) {
		$(citiesArray).each(function(x) {
			if (citiesArray[x] === city) {
				containsCity = true;
			}
		});
	}

	if (containsCity === false) {
		citiesArray.push(city);
	}

	// add to local storage
	localStorage.setItem("cities", JSON.stringify(citiesArray));

	//give city info to five day forcast cards as well
	fiveDay(city);

	// search for the city
	citySearch(city);

	// then setting up a button that is created for each city searched for
	renderButtons();
});

});





