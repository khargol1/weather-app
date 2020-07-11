
let history = [];
const apiKey = "da20f084ab1f7b27369c4871773f5df7";
let inList = [];

$(".btn").click(getCity);
$("#history").on("click", pastSearch);

function getCity(event) {
    event.preventDefault();
    $("#uv").removeClass();
    let city = $("#city").val().trim();
    $("#city").val("");
    getCurrentWeather(city); //asynch call
    addSearchHistory(city); //adds to local
    createSearchHistory(city);//display on page
}

function addSearchHistory(city){
    if(!history.includes(city)){
    history.push(city);
    localStorage.setItem('city-history', JSON.stringify(history));
}
}

function pastSearch(event){
    $("#city").val(event.target.innerHTML);
    getCity(event);
}

function createSearchHistory(city){
    if(inList.includes(city)){
        //do nothing
    }else{

    inList.push(city);
    
    //find container
    let historyEl = document.getElementById('history');
    //create a new p element
    let newHistoryEl = document.createElement('p');
    //give it a class of history-item
    newHistoryEl.classList = 'history-item border rounded';
    //set text content to city
    newHistoryEl.textContent = city;
    //attach to page
    historyEl.prepend(newHistoryEl);
    

}
}

function onLoad(){
    if("city-history" in localStorage){
        history = JSON.parse(localStorage.getItem("city-history"));
        //only keep last 10 of the searches
        while(history.length > 10){
            history.shift();
        }
        for(let i = 0; i < history.length; i++){
            createSearchHistory(history[i]);
        }
    }
}


function getCurrentWeather(city) {
    const apiUrlCurent = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + apiKey;
    fetch(apiUrlCurent).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                displayCurrentWeather(data);
            });
        } else {
            alert("Error" + response.statusText);
        }
    });
}

function displayCurrentWeather(data) {
    let now = moment();
    let iconUrl = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";

    $("#name").text(data.name);
    $('#date').text(now.format('MM/DD/YYYY'));
    $('#icon').attr('src', iconUrl);
    $('#temp').text("Temp: " + Math.round(data.main.temp) + " F\u00B0");
    $('#humidity').text("Humidity: " + data.main.humidity);
    $('#wind').text("Wind Speed: " + Math.round(data.wind.speed));
    //need to make api call to onecall for uv index
    getUV(data);
}

function getUV(data) {
    const lon = data.coord.lon;
    const lat = data.coord.lat;

    fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=hourly,minutely&units=imperial&appid=" + apiKey)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    displayUvi(data.current.uvi);
                    displayFiveDay(data);
                });
            }
        });
}

function displayUvi(uvi) {
    
    $("#uv").text("UVI: " + uvi);
    $("#uv").addClass('city-info');
    
    switch (true) {
        case (uvi <= 2):
            $("#uv").addClass('low');
            break;
        case (uvi <= 5):
            $("#uv").addClass('moderate');
            break;
        case (uvi <= 7):
            $("#uv").addClass('high');
            break;
        case (uvi <= 10):
            $("#uv").addClass('very-high');
            break;
        
        default:
            $("#uv").addClass('extreme');
            break;
    }
}

function getFiveDayForecast(city) {
    
    fetch("https://api.openweathermap.org/data/2.5/forecast?q="+ city + "&units=imperial&appid=" +  apiKey)
    .then(function(response){
        if(response.ok){
            response.json().then(function(data){
                displayFiveDay(data);
            });
        }else{
            alert("Error: " + response.statusText);
        }
    });
}

function displayFiveDay(data) {
    $('#five-day-header').removeClass('hidden');
    
    //grab the container it goes in
    let fiveDay = document.getElementById('five-day');
    fiveDay.innerHTML= '';
    for(let i = 1; i < 6; i++){
    //make a new div "CARD"
    let card = document.createElement("div");
    card.classList = "card"
    //add class of card to CARD
    //make a new h3 ?? maybe h4
    let date = document.createElement("span");
    //add class of card-header
    date.classList = 'card-header'
    //add date to inner html
    date.textContent = moment().add(i, 'days').format('MM/DD/YYYY');//date not working
    //append to CARD
    card.appendChild(date);
    //create new img element
    let icon = document.createElement("img");
    //update and grab icon using iconUrl
    icon.setAttribute('src', "http://openweathermap.org/img/w/" + data.daily[i].weather[0].icon + ".png");
    icon.setAttribute('style', 'width: 50px; margin: auto');
    //append to CARD
    card.appendChild(icon);
    //create new p element
    let temp = document.createElement('p');
    //add class card-text
    temp.addClass = 'card-text'
    //add temp for the day to inner html
    temp.textContent ="Temp: " + Math.round(data.daily[i].temp.max);
    //append to CARD
    card.appendChild(temp);
    //create another p element
    let humidity = document.createElement('p');
    //class card-text
    humidity.addClass = 'card-text';
    //add humidity to inner html
    humidity.textContent = "Humidity: " + data.daily[i].humidity
    //apend to CARD
    card.appendChild(humidity);
    //append CARD to container
    fiveDay.appendChild(card);
    }//end for loop
}

onLoad();