// SELECT ELEMENTS
const iconElement = document.querySelector(".weather-icon");
const tempElement = document.querySelector(".temperature-value p");

const KNOTS = 1.8;

const windElement = document.getElementById("wind-value");
const humidityElement = document.getElementById("humidity-value");
const descElement = document.querySelector(".temperature-description p");
const locationElement = document.querySelector(".location p");
const notificationElement = document.querySelector(".notification");
const searchElement = document.querySelector(".container-search");
const historyElement = document.querySelector(".container-history");
const forecastElement1 = document.querySelector(".container-forecast1")
const forecastElement2 = document.querySelector(".container-forecast2")
const forecastElement3 = document.querySelector(".container-forecast3")
const forecastElement4 = document.querySelector(".container-forecast4")
const forecastElement5 = document.querySelector(".container-forecast5")
let btn = document.getElementById("btn");
btn.addEventListener("click", searchCity);

const today = moment().format('Do MMMM YYYY');

document.getElementById("date").innerText = today;


var recent_cities = JSON.parse(window.localStorage.getItem('recent_cities'));

if (recent_cities == undefined) {
    recent_cities = [];
}

// App data
const weather = {};

weather.temperature = {
    unit: "celsius"
}

// APP CONSTS AND VARS
const KELVIN = 273;
// api key
const key = "7f204c1c9ced12a1bce11a5828f7a9d5";

// check if user has geolocation
if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(setPosition, showError);
} else {
    notificationElement.style.display = "block";
    notificationElement.innerHTML = "<p>Browser doesn't Support Geolocation</p>";
}

var latitude;
var longitude;
// get users current location
function setPosition(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    getWeather(latitude, longitude);
}

// error message if geoloaction not working 
function showError(error) {
    notificationElement.style.display = "block";
    notificationElement.innerHTML = `<p> ${error.message} </p>`;
}

// get automatic weather update for current city as soon as screen loads
function getWeather(latitude, longitude) {
    let api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;

    fetch(api)
        .then(function (response) {
            let data = response.json();
            return data;
        })
        .then(function (data) {
            weather.temperature.value = Math.floor(data.main.temp - KELVIN);
            weather.description = data.weather[0].description;
            weather.humidity = data.main.humidity;
            weather.wind = (data.wind.speed * KNOTS).toFixed(1);
            weather.iconId = data.weather[0].icon;
            weather.city = data.name;
            weather.country = data.sys.country;


            latitude = data.coord.lat;
            longitude = data.coord.lon;

            getUV(latitude, longitude);

            forecast();
        })
        .then(function () {
            displayWeather();
        });
}

//let user search by inputting city name then display on the screen.
function searchCity() {
    let userInputCity = document.getElementById("city");
    let cityName = userInputCity.value
    let api1 = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${key}`;

    fetch(api1)
        .then(function (response) {
            let data = response.json();

            return data;
        })
        .then(function (data) {
            weather.temperature.value = Math.floor(data.main.temp - KELVIN);
            weather.description = data.weather[0].description;
            weather.humidity = data.main.humidity;
            weather.wind = (data.wind.speed * KNOTS).toFixed(1);
            weather.iconId = data.weather[0].icon;
            weather.city = data.name;
            weather.country = data.sys.country;

            latitude = data.coord.lat;
            longitude = data.coord.lon;

            getUV(latitude, longitude);

            // set citys searched to local storage
            recent_cities.push({ "city": data.name, "country": data.sys.country });
            localStorage.setItem('recent_cities', JSON.stringify(recent_cities));
            recents();
        })
        .then(function () {
            displayWeather();
            forecast();
        })
        .then(function () {
            let city = document.getElementById("city");
            localStorage.setItem("cityName", $("#city").val());
            $("#container-history").append(localStorage.getItem("city"));
        });
}

// get UV data
function getUV(lat, lon) {
    let api2 = `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${key}`;

    fetch(api2)
        .then(function (response) {
            let data = response.json();

            return data;
        })
        .then(function (data) {
            $("#uv-value").html(data.value + " UV INDEX");
        });
}

// implemented the 5 day forecast information 
function forecast() {
    let userInputCity = document.getElementById("city");
    let query = `q=${userInputCity.value}`;

    if (userInputCity.value.length < 1) {
        query = `lat=${latitude}&lon=${longitude}`;
    }

    let api1 = `https://api.openweathermap.org/data/2.5/forecast?${query}&cnt=60&appid=${key}`;

    fetch(api1)
        .then(function (response) {
            let data = response.json();
            return data;
        })
        .then(function (data) {
            let forecast_days = [];

            let today = new Date();

            for (weather_day of data.list) {
                let date = new Date(weather_day.dt_txt);
                let day = date.getDay();

                if (date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()) {
                    continue;
                }

                if (forecast_days[day] == undefined) {
                    forecast_days[day] = [];
                    forecast_days[day].push(weather_day);
                }
            }

            let count = 1;
            for (const hour in forecast_days.slice(0)) {
                let day = forecast_days[hour][0];
                let temp = Math.floor(day.main.temp - KELVIN);
                let icon = "icons/" + day.weather[0].icon + ".png";
                let description = day.weather[0].description;

                let wind = (day.wind.speed * KNOTS).toFixed(1);
                let humidity = day.main.humidity;

                let dt = new Date(day.dt_txt);

                let date = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();
                $("#weather-container" + count).html('');
                $("#weather-container" + count).append("<div class='forecast-container'><p>" + wind + "KM/H</p><p>" + humidity + " % humidity</p></div><span class='temperature-small'><img class='icon-forecast' src='" + icon + "'/>" + temp + ",°c</span><p class='mini-description'>" + description + "</p>");
                count = count + 1;
            }
        });
}
// display weather icons from https://github.com/manifestinteractive/weather-underground-icons
function displayWeather() {
    let url = "icons/" + weather.iconId + ".png";
    iconElement.innerHTML = "<img id='wicon' src='" + url + "'/>";
    tempElement.innerHTML = `${weather.temperature.value} °C`;
    humidityElement.innerHTML = `${weather.humidity} % humidity`;
    windElement.innerHTML = `${weather.wind} KM/H`;
    descElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}, ${weather.country}`;
}

// C to F conversion
function celsiusToFahrenheit(temperature) {
    return (temperature * 9 / 5) + 32;
}

// change from celesius to farenheit on click visa versa
tempElement.addEventListener("click", function () {
    if (weather.temperature.value === undefined) return;

    if (weather.temperature.unit == "celsius") {
        let fahrenheit = celsiusToFahrenheit(weather.temperature.value);
        fahrenheit = Math.floor(fahrenheit);

        tempElement.innerHTML = `${fahrenheit}°<span>F</span>`;
        weather.temperature.unit = "fahrenheit";
    } else {
        tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
        weather.temperature.unit = "celsius"
    }
});

// added dates using moments for the 5 day forecast
$(document).ready(function () {
    $("#1day").text(moment().add(1, 'days').format('Do MMMM YYYY'));
    $("#2day").text(moment().add(2, 'days').format('Do MMMM YYYY'));
    $("#3day").text(moment().add(3, 'days').format('Do MMMM YYYY'));
    $("#4day").text(moment().add(4, 'days').format('Do MMMM YYYY'));
    $("#5day").text(moment().add(5, 'days').format('Do MMMM YYYY'));

    recents();
});
// append recent city to recent city container
function recents() {
    let qty_recent = recent_cities.length;
    $("#recent_container").html('');
    for (const recent of recent_cities.slice((qty_recent - 9), qty_recent)) {
        $("#recent_container").prepend("<div class='recent' data-city='" + recent.city + "'>" + recent.city + "," + recent.country + "</div>");
    }
}

function make(city) {
    $("#city").val(city);
    $("#btn").click();
}


$(document).on('click', ".recent", function () {
    $("#city").val($(this).data('city'));
    $("#btn").click();
});