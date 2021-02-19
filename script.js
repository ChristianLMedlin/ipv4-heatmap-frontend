let myMap = L.map('mapid').setView([51.505, -0.09], 13);

let apiToken = "pk.eyJ1IjoiY2hyaXN0aWFubG1lZGxpbiIsImEiOiJja2xiaHl0M2wxYjdhMnBtdmg4NzQ2ZjIyIn0.X6XXwXNnMA9U4bTMU-HtLA"
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: apiToken
}).addTo(myMap);