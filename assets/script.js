//To run JavaScript code after the DOM is ready
$(document).ready(function () {
  var cityHistoryArray = [];
  var storeCities = localStorage.getItem("cities");
  var APIKey = "485a30f7b8cebea0111006986b00bf18";
  
  if (storeCities) {
    cityHistoryArray = JSON.parse(storeCities);
  }
  console.log(cityHistoryArray);
  console.log(cityHistoryArray.length);
  
  cityHistory();

  weatherGet(cityHistoryArray[cityHistoryArray.length-1])
  //Listen search button, trim user input and store the value in city.
  $("#searchBtn").on("click", function (event) {
    event.preventDefault();
    var city = $("#cityInput").val().toLowerCase().trim();
    
    weatherGet(city);
  });
  //Search history be displayed in button. Every click call back the weather forecast again
  $(".cityList").on("click", ".btmCity", function (event) {
    event.preventDefault();
    city = $(this).text();

    weatherGet(city);
  });

  //Fetch openweather API by user input argument: city.
  function weatherGet(city) {
    var queryURL =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      city +
      "&units=imperial&appid=" +
      APIKey;
    // Send an API request by using the JQuery ajax method.
    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      //Parse API response, get current Day
      var currentDay = response.dt;
      console.log(response)
      $("#currentWeather").empty()
      //dynamically add HTML element and CSS class to the CurrentWeather
      var card = $("<div>").addClass("card text-black bg-light");
      var cardBody = $("<div>").addClass("card-body currentWeather");
      var cardTitle = $("<div>")
        .addClass("card-title")
        .text(dayjs.unix(currentDay).format("MMM D, YYYY, hh:mm:ss A"));

      var cityDiv = $("<div>")
        .addClass("card-text")
        .text("City: " + city);
      //Apply weather-conditions, use https://openweathermap.org/img/wn/ type of icon to show the condition
      var iconDiv = $(`<img src=" https://openweathermap.org/img/wn/${response.weather[0].icon}.png"></img>`);
      var tempDiv = $("<div>")
        .addClass("card-text")
        .text("Temperature: " + Math.floor(response.main.temp) + "°F");
      var humDiv = $("<div>")
        .addClass("card-text")
        .text("Humidity: " + Math.floor(response.main.humidity) + "%");
      var windSpeed = $("<div>").text(
        "Wind speed: " + response.wind.speed + " MPH"
      );

      $("#currentWeather")
       .append(
          card.append(
            cardBody
              .append(cardTitle)
              .append(cityDiv, iconDiv, tempDiv, humDiv, windSpeed)
          )
        );
      //Parse lat & lon from API response, 
      forcastGet(response.coord.lat, response.coord.lon);
      uvGet(response.coord.lat, response.coord.lon);
      cityHistory(city);
      console.log("city: ", city);
      console.log("Lat & Lon: ", response.coord.lat, response.coord.lon)
    });
  }
  function forcastGet(lat, lon) {
    var queryURLF = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=hourly&appid=${APIKey}`;
    
    // Send an API request byusing the JQuery ajax method.
    $.ajax({
      url: queryURLF,
      method: "GET",
    }).then(function (responseF) {
      $("#forecast").empty();

      for (var i = 1; i < 6; i++) {
        var currentDay = responseF.daily[i];
      //dynamically add HTML element and CSS class to the 5 day forcast
        var card = $("<div>").addClass("card text-white bg-primary col-sm-12 col-md-5 col-lg-2");
        var cardBody = $("<div>").addClass("card-body");
        var cardTitle = $("<div>")
          .addClass("card-title")
          .text(moment.unix(currentDay.dt).format("MMM Do"));
        var iconDiv = $(`<img src=" https://openweathermap.org/img/wn/${currentDay.weather[0].icon}.png"></img>`);

        var tempDiv = $("<div>")
          .addClass("card-text")
          .text("Temp: " + Math.floor(currentDay.temp.day) + "°F");
        var humDiv = $("<div>")
          .addClass("card-text")
          .text("Humidity: " + Math.floor(currentDay.humidity) + "%");
        var uviC = $("<div>").text("UVI: ");
        var newSpan = $("<span>").addClass("dangerr").text(currentDay.uvi);
        $("#forecast").append(
          card.append(
            cardBody
              .append(cardTitle)
              .append(iconDiv, tempDiv, humDiv, uviC.append(newSpan))
          )
        );

        if (parseInt(currentDay.uvi) > 5) {
          $(".dangerr").attr("style", "background-color : red");
        } else {
          $(".dangerr").attr("style", "background-color : green");
        }
      }
    });
  }
  //Using openweather API to retrive the ultraviolet number of the city
  function uvGet(lat, lon) {
    var queryURLU = `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${APIKey}`;

    $.ajax({
      url: queryURLU,
      method: "GET",
    }).then(function (responseU) {
      var uviC = $("<div>").text("UVI ");
      var newSpan = $("<span>").addClass("dangerr").text(responseU.value);

      $(".currentWeather").append(uviC.append(newSpan));

      if (parseInt(responseU.value) > 5) {
        newSpan.attr("style", "background-color : red");
      } else {
        newSpan.attr("style", "background-color : green");
      }
    });
  }

  function cityHistory(city) {
    $("#cityInput").val("");
    console.log(cityHistoryArray);
    console.log(cityHistoryArray.indexOf(city));
    //Array Deduplication:push a new city to the history, if this city not in array by call indexOf().
    if (city && cityHistoryArray.indexOf(city) === -1) {
      cityHistoryArray.push(city);
    }
    localStorage.setItem("cities", JSON.stringify(cityHistoryArray));
    //Delete child element in cityList, for every page load, iterate over the localStorage and generate the search histery again.
    $(".input-group").empty();
    // localStorage.clear();
    cityHistoryArray.forEach(function (city) {
      var newDiv = $("<button>")
        .addClass("btmCity")
        .attr("id", city)
        .text(city);
      $(".input-group").append(newDiv);
    });
  }
});
