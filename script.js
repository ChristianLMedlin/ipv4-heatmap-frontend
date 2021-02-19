let myMap = L.map('mapid').setView([51.505, -0.09], 13);


// applyHeatmap = (boundsArray) => {
//     console.log(boundsArray, "Hello")
//     let heat = L.heatLayer([
//         [50.5, 30.5], // lat, lng, intensity
//         [50.6, 30.4],
//     ], {radius: 25}).addTo(myMap);
// }

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
            + `&latRange=${west},${east}`)
        .then(response => response.json())
        .then (data => applyHeatmap(data))
        .catch(rejected => console.log(rejected))
}

let apiToken = "pk.eyJ1IjoiY2hyaXN0aWFubG1lZGxpbiIsImEiOiJja2xiaHl0M2wxYjdhMnBtdmg4NzQ2ZjIyIn0.X6XXwXNnMA9U4bTMU-HtLA"
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: apiToken
}).addTo(myMap);

myMap.on("click", e => {
    queryBounds()
})