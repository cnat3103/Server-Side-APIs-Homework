let APIKEY = "23046ae67f0b02423b422525b360af5e";
let metric = "&units=metric"
let searchKeywords = new Array();
let localStorageKey = "lskeywords";

init();
function init(){
    let city = getLastSearchedCity();
    // console.log(city);
    // city is empty when history localStorage is empty. 
    if (city == "empty") {
        searchByGeoLocation();
    } else {
        clear();
        getCurrentWeather(city, null, null);
        getFiveDaysFocast(city, null, null);
    }
}

function getLastSearchedCity() {
    // let city = "Sydney";// City to display by default
    let city = "empty";
    searchKeywords = JSON.parse(localStorage.getItem(localStorageKey));
    if (Array.isArray(searchKeywords) && searchKeywords.length > 0) {
        // When searchKeywords is null, error occurs at this line.
        city = searchKeywords[searchKeywords.length - 1];
    } 
    return city;
}

function renderSearchKeywords() {
    // console.log("renderSearchKeywords");
    searchKeywords = JSON.parse(localStorage.getItem(localStorageKey));
    if (Array.isArray(searchKeywords) && searchKeywords.length > 0) {
        // When searchKeywords is null, error occurs at this line.
        let ul = $("<ul>");
        ul.addClass("list-group list-group-flush");
        $("#previousSearchKeywords").append(ul);
        let ulEl = $("#previousSearchKeywords ul");
        for (let i = searchKeywords.length - 1; i >= 0; i--) {
            let li = $("<li>");
            li.addClass("list-group-item city-list");
            li.text(searchKeywords[i]);
            ulEl.append(li);
        }
    } else {
        $("#previousSearchKeywords").empty();
    }
};

// When a search history is clicked, search again. 
$("#previousSearchKeywords").on("click", ".city-list", function () {
    // Event binding on dynamically created elements
    // https://stackoverflow.com/questions/203198/event-binding-on-dynamically-created-elements
    var city = $(this).text();
    clear();
    $("#searchTxt").val(city);
    getCurrentWeather(city, null, null);
    getFiveDaysFocast(city, null, null);
});

// Perform search when Enter key pressed
$("#searchTxt").on("keypress", function () {
    if (event.keyCode == 13) {
        searchWeather();
    }
});

// Perform search when search button is clicked
$("#searchBtn").on("click", searchWeather);
function searchWeather() {
    var city = $("#searchTxt").val().trim();
    // console.log(city);
    clear();
    getCurrentWeather(city, null, null);
    getFiveDaysFocast(city, null, null);
};

// Perform search based on current location when location button is clicked
$("#locationBtn").on("click", searchByGeoLocation);

function searchByGeoLocation(){
    $("#loadingTodayWeather").show(); 
    if (navigator.geolocation) {
        clear();
        navigator.geolocation.getCurrentPosition(searchByGeoLocationHandler, showGeoLocationError);
    } else { 
        $("#errorMessage").text("Geolocation is not supported by this browser.");
    }
};

function searchByGeoLocationHandler(position) {
    getCurrentWeather(null, position.coords.latitude, position.coords.longitude);
    getFiveDaysFocast(null, position.coords.latitude, position.coords.longitude);
    $("#loadingTodayWeather").hide; 
};

$("#trashBtn").on("click", function(){
    console.log("trashbtn clicked");
    localStorage.removeItem(localStorageKey);
    renderSearchKeywords();    
});

function showGeoLocationError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        $("#errorMessage").text("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        $("#errorMessage").text("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        $("#errorMessage").text("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        $("#errorMessage").text("An unknown error occurred.");
        break;
    }
};

function addCityToLocalStorage(city){

    if (Array.isArray(searchKeywords) && searchKeywords.length > 0) {
        // Ignore case
        var searchKeywordsLower = new Array();
        for (var i=0; i<searchKeywords.length; i++){
            searchKeywordsLower[i] = searchKeywords[i].toLowerCase();
        }
    
        var pos = searchKeywordsLower.indexOf(city.toLowerCase()); 
        if (pos !== -1){
            searchKeywords.splice(pos,1); // Remove duplicate
        }
        searchKeywords.push(city);
        localStorage.setItem(localStorageKey, JSON.stringify(searchKeywords));
    } else {
        //console.log(searchKeywords);
        var skw = [];
        skw[0] = city;
        localStorage.setItem(localStorageKey, JSON.stringify(skw));
    }
    renderSearchKeywords();
}

function clear() {
    // Clear today's weather
    $("#todayCity").empty();
    $("#todayTemp").empty();
    $("#todayHumidity").empty();
    $("#todayWind").empty();
    $("#todayUV").empty();

    // Clear error message
    $("#errorMessage").empty();

    // Clear 5 days forcast 
    for (var day = 1; day < 6; day++) {
        $("#" + day + "day").empty();
        $("#" + day + "dayIcon").empty();
        $("#" + day + "dayTemp").empty();
        $("#" + day + "dayHumidity").empty();
    }
    // Clear search history
    $("#previousSearchKeywords").empty();
}

function getCurrentWeather(city, lat, lon) {
    var queryWeatherURL;
    if (city !== null) {
        queryWeatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + metric + "&appid=" + APIKEY;
    } else if (lat !== null && lon !== null) {
        queryWeatherURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + metric + "&appid=" + APIKEY;
    }
    $("#loadingTodayWeather").show(); 
    $.ajax({
        url: queryWeatherURL,
        method: "GET"
    }).then(
        function (response) {
            $("#loadingTodayWeather").hide(); 
            let city = response.name;
            let temp = response.main.temp;
            let weather = response.weather[0].description;
            let icon = response.weather[0].icon;
            let iconURL = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
            let humidity = response.main.humidity;
            let wind = response.wind.speed;
            let longitude = response.coord.lon;
            let latitude = response.coord.lat;
            let gmtEpoc = response.dt;
            let timezone = response.timezone; // unit is second
            let formattedLocalDate = getFormattedLocalDate(gmtEpoc, timezone);

            
            let queryUvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKEY + "&lat=" + latitude + "&lon=" + longitude;
            
            $.ajax({
                url: queryUvURL,
                method: "GET",
                aync: false
            }).then(function (res) {
                let uvIndex = res.value;
                renderTodayWeather(city, formattedLocalDate, iconURL, temp, humidity, wind, uvIndex);
            })
            addCityToLocalStorage(city);
        }, //end of success case 

        function (response) {
            // Failure case
            $("#loadingTodayWeather").hide(); 
            $("#errorMessage").text(response.responseJSON.message);
            if (response.responseJSON.cod == "404"){
                $("#todayCity").text("City not found!");
            }
            renderSearchKeywords();
        }
    ) // end of Ajax     
};


function getFormattedLocalDate(gmtEpoc, timezone) {
    let localTime = moment.unix(gmtEpoc).utcOffset(timezone / 60);
    let formattedLocalDate = localTime.format("DD/MM/YYYY");
    return formattedLocalDate;
};

function renderTodayWeather(city, formattedLocalDate, iconURL, temp, humidity, wind, uvIndex) {
    $("#todayCity").text(city + " (" + formattedLocalDate + ")");
    let img = $("<img>");
    $("#todayCity").append(img);
    img.attr("src", iconURL);
    img.attr("height", "80px")

    $("#todayTemp").text(temp);
    $("#todayHumidity").text(humidity);
    $("#todayWind").text(wind);
    let  uvBtn = $("<button>").text(uvIndex);
    $("#todayUV").append(uvBtn);
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
};

function getFiveDaysFocast(city, lat, lon) {
    let queryFocastURL;
    if (city !== null) { 
        queryFocastURL = "https://api.openweathermap.org/data/2.5/forecast?appid=" + APIKEY + "&q=" + city + metric;
    } else if (lat !== null && lon !== null) {
        queryFocastURL = "https://api.openweathermap.org/data/2.5/forecast?appid=" + APIKEY + "&lat=" + lat + "&lon=" + lon + metric;       
    }

    $.ajax({
        url: queryFocastURL,
        method: "GET"
    }).then(function (response) {

        let city = response.city.name;
        let day = 0;
        for (let i = 4; i < response.list.length; i = i + 8) {
            let temp = response.list[i].main.temp;
            let weather = response.list[i].weather[0].description;
            let icon = response.list[i].weather[0].icon;
            let iconURL = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
            let humidity = response.list[i].main.humidity;
            let gmtEpoc = response.list[i].dt;
            let timezone = response.city.timezone;
            let formattedLocalDate = getFormattedLocalDate(gmtEpoc, timezone);

        
            day = day + 1;
            renderFocast(day, formattedLocalDate, iconURL, temp, humidity);
        }
    });
};

function renderFocast(day, formattedLocalDate, iconURL, temp, humidity) {
    $("#" + day + "day").text(formattedLocalDate);
    let img = $("<img>");
    $("#" + day + "dayIcon").append(img);
    img.attr("src", iconURL);
    img.attr("height", "60px")
    $("#" + day + "dayTemp").text(temp);
    $("#" + day + "dayHumidity").text(humidity);
};

