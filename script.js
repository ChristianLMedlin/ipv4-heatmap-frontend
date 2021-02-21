let myMap = L.map("mapid")
// Each of the below event listeners will set the map position to the corresponding
// country.
let svalbard = document.getElementById("svalbard").addEventListener("click", () => {
    myMap.setView([78.5, 18], 6);
})
let somalia = document.getElementById("somalia").addEventListener("click", () => {
    myMap.setView([8, 47], 7);
})
let saudiArabia = document.getElementById("saudi-arabia").addEventListener("click", () => {
    myMap.setView([24.5, 45], 6);
})
let egypt = document.getElementById("egypt").addEventListener("click", () => {
    myMap.setView([28, 30], 7);
})

// This is called from within queryBounds. Reads the lat/long data provided by
// queryBounds and applies a heatmap based on those data.
applyHeatmap = (boundsArray) => {
    let newBounds = boundsArray.map(datum => 
        [datum["longitude"], datum["latitude"], 1]
    );

    // Remove old data points when called again.
    myMap.removeLayer(heat)
    // Apply data points within newBounds to the heatLayer.
    heat = L.heatLayer(newBounds, {radius: 25}).addTo(myMap);
};

queryBounds = () => {
    // getBounds returns the latitude and longitude range that the
    // user is currently looking at.
    let bounds = myMap.getBounds()

    // Assign each value to a variable to make working with them easier.
    let south = bounds.getSouth()
    let north = bounds.getNorth()
    let west = bounds.getWest()
    let east = bounds.getEast()

    // Interpolate our bounds into the fetch request. Convert response to JSON
    // and apply the data to our map with applyHeatmap.
    fetch("https://ipv4-heatmap-christian-medlin.herokuapp.com/api/locationProvider/"
            + `?longRange=${south},${north}`
            + `&latRange=${west},${east}`
            + `&latLongOnly=true`)
        .then(response => response.json())
        .then(data => applyHeatmap(data))
        .catch(rejected => console.log(rejected))
}

let apiToken = "pk.eyJ1IjoiY2hyaXN0aWFubG1lZGxpbiIsImEiOiJja2xiaHl0M2wxYjdhMnBtdmg4NzQ2ZjIyIn0.X6XXwXNnMA9U4bTMU-HtLA"
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: apiToken
}).addTo(myMap);

myMap.on("moveend", () => {
    queryBounds()
})

// Set the default view, currently on Turkey
myMap.setView([40, 35], 6);
// Create an empty heat layer.
heat = L.heatLayer([], {radius: 25}).addTo(myMap);