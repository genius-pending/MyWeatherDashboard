


// SELECT ELEMENTS
const iconElement = document.querySelector(".weather-icon");
const tempElement = document.querySelector(".temperature-value p");
const descElement = document.querySelector(".temperature-description p");
const locationElement = document.querySelector(".location p");
const notificationElement = document.querySelector(".notification");
const searchElement = document.querySelector(".container-search");
const historyElement = document.querySelector(".container-history");
const forecastElement1=document.querySelector(".container-forecast1")
const forecastElement2=document.querySelector(".container-forecast2")
const forecastElement3=document.querySelector(".container-forecast3")
const forecastElement4=document.querySelector(".container-forecast4")
const forecastElement5=document.querySelector(".container-forecast5")
let btn =document.getElementById("btn");
btn.addEventListener("click",searchCity );

const today = moment().format('Do MMMM YYYY');
//console.log(today)
document.getElementById("date").innerText = today;


// App data
const weather = {};

weather.temperature = {
    unit : "celsius"
}

// APP CONSTS AND VARS
const KELVIN = 273;
// api key
const key = "7f204c1c9ced12a1bce11a5828f7a9d5";

// check if user has geolocation
if('geolocation' in navigator){
    navigator.geolocation.getCurrentPosition(setPosition, showError);
}else{
    notificationElement.style.display = "block";
    notificationElement.innerHTML = "<p>Browser doesn't Support Geolocation</p>";
}

// get users current location
function setPosition(position){
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    
    getWeather(latitude, longitude);
}

// error message if geoloaction not working 
function showError(error){
    notificationElement.style.display = "block";
    notificationElement.innerHTML = `<p> ${error.message} </p>`;
}

// get automatic weather update for current city as soon as screen loads
function getWeather(latitude, longitude){
    let api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;
    let api2 =`http://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${key}`;

    fetch(api)
        .then(function(response){
            let data = response.json();
            return data;
        })
        .then(function(data){
            weather.temperature.value = Math.floor(data.main.temp - KELVIN);
            weather.description = data.weather[0].description; data.weather.humidity; data.weather.windspeed;
            weather.iconId = data.weather[0].icon;
            weather.city = data.name;
            weather.country = data.sys.country;
        })
        .then(function(){
            displayWeather();
        });
}

//search by city.
function searchCity(){
 let userInputCity =document.getElementById("city");
 let cityName = userInputCity.value
 let api1 = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${key}`;
 console.log("userInputCity" ,cityName)
 fetch(api1)
    .then(function(response){
        let data = response.json();
        return data;
    })
    .then(function(data){
        weather.temperature.value = Math.floor(data.main.temp - KELVIN);
        weather.description = data.weather[0].description; data.humidity; data.windspeed;
        weather.iconId = data.weather[0].icon;
        weather.city = data.name;
        weather.country = data.sys.country;
    })
    .then(function(){
        displayWeather();

    })
    .then(function(){
        let city = document.getElementById("city");
        localStorage.setItem("cityName", $("#city").val());
        $("#container-history").append(localStorage.getItem("city"));
    });
}

//5 day forecast'https://api.openweathermap.org/data/2.5/forecast?

console.log(searchCity)
 




// display weather icons from https://github.com/manifestinteractive/weather-underground-icons
function displayWeather(){
    iconElement.innerHTML = `<img src="icons/${weather.iconId}.png"/>`;
    tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
    descElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}, ${weather.country}`;
}

// C to F conversion
function celsiusToFahrenheit(temperature){
    return (temperature * 9/5) + 32;
}

// change from celesius to farenheit on click visa versa
tempElement.addEventListener("click", function(){
    if(weather.temperature.value === undefined) return;
    
    if(weather.temperature.unit == "celsius"){
        let fahrenheit = celsiusToFahrenheit(weather.temperature.value);
        fahrenheit = Math.floor(fahrenheit);
        
        tempElement.innerHTML = `${fahrenheit}°<span>F</span>`;
        weather.temperature.unit = "fahrenheit";
    }else{
        tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
        weather.temperature.unit = "celsius"
    }
});