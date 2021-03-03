### The PostgreSQL instance has been temporarily removed while I work to reduce the volume to comply with Heroku's free tier.
### Please check out my code in the meantime!
Hosted Link: https://christianlmedlin.github.io/ipv4-heatmap-frontend/<br/>
Back End Repository: https://github.com/ChristianLMedlin/ipv4-heatmap<br/>
API Hosted on Heroku: https://ipv4-heatmap-christian-medlin.herokuapp.com/api/locationProvider/<br/>
<br/>
# API Documentation
### All requests are limited to 15,000 objects returned per response.
## GET retrieve by ID
`GET https://ipv4-heatmap-christian-medlin.herokuapp.com/api/locationProvider/1/`<br/>
This will return the object matching the ID provided.
```JSON
[
    {
        "id": 1,
        "latitude": -34.7825,
        "longitude": 138.6106,
        "accuracy_radius": 100
    }
]
```
## GET list without filter.
`GET https://ipv4-heatmap-christian-medlin.herokuapp.com/api/locationProvider/`<br/>
This will return any objects within the database, up to the maximum of 15,000.
```JSON
[
    {
        "id": 1,
        "latitude": -34.7825,
        "longitude": 138.6106,
        "accuracy_radius": 100
    },
    {
        "id": 2,
        "latitude": 24.4798,
        "longitude": 118.0819,
        "accuracy_radius": 50
    },
    {
        "id": 3,
        "latitude": 24.4798,
        "longitude": 118.0819,
        "accuracy_radius": 50
    },

    ...

    {
        "id": 14998,
        "latitude": 48.8167,
        "longitude": 33.1712,
        "accuracy_radius": 25
    },
    {
        "id": 14999,
        "latitude": 90.1131,
        "longitude": 112.12378,
        "accuracy_radius": 50
    },
    {
        "id": 15000,
        "latitude": 23.1423,
        "longitude": 74.1134,
        "accuracy_radius": 75
    }
]
```

## Query Parameters
Provides all objects up to the maximum that match the latitude range.<br/>
`latRange={startValue},{endValue}`<br/>
<br/>
Provides all objects up to the maximum that match the longitude range.<br/>
`longRange={startValue},{endValue}`<br/>
<br/>
If True, this will only return the latitude and longitude in the response<br/>
`latLongOnly=true`<br/>
```JSON
[
    {
        "latitude": -34.7825,
        "longitude": 138.6106
    },
    {
        "latitude": 24.4798,
        "longitude": 118.0819
    },
    {
        "latitude": 24.4798,
        "longitude": 118.0819
    }
]
```
## An example request
`GET https://ipv4-heatmap-christian-medlin.herokuapp.com/api/locationProvider/?latRange=50,60&longRange=100,110&latLongOnly=true`
```JSON
[
    {
        "latitude": 52.2978,
        "longitude": 104.2964
    },
    {
        "latitude": 52.2978,
        "longitude": 104.2964
    },
    {
        "latitude": 52.2978,
        "longitude": 104.2964
    },
    ...
    {
        "latitude": 56.1325,
        "longitude": 101.6142
    },
    {
        "latitude": 51.8333,
        "longitude": 107.6167
    },
    {
        "latitude": 52.2978,
        "longitude": 104.2964
    }
]
```
<br/>

# Project Overview
## From CSV To PostgreSQL
I knew my backend would end up on Heroku after deployment. Knowing that Heroku
supports PostgreSQL out of the box, I decided the most straight forward step would be to create my
model based on the format of each column within GeoLite-City-Blocks-IPv4.csv. After
purchasing Heroku's $9 Hobby Basic tier, I was allotted enough rows to fit the
entire file. 

After ensuring my model fields matched the CSV columns appropriately, I pushed my
code to Heroku, ran migrations, and copied my data to my Heroku PostgreSQL instance with the
following command: <br/> 
`\copy location_provider_locationprovider FROM GeoLite-City-Blocks-IPv4.csv DELIMITER ',' CSV HEADER;` <br/>
This would copy the content of my file into the table Django created for my model, 
location_provider_locationprovider. I needed to specify the delimiter and denote that
the CSV has a header row.

GeoLite-City-Blocks-IPv4.csv contains a little over 3 million rows, while the total number of possible IPv4 addresses is over 4 billion. I was disappointed to realize that my heatmap would not be able to provide the entire range of allocated IPv4 addresses. Even if provided, storing the full amount on Heroku's PostgreSQL implementation would start running into the hundreds of dollars per month.  

## API Endpoint Creation
Before writing any Python relating to my API, I first looked into Leaflet's functionality. I assumed that there must be a way to return the latitude and longitude data for the area that the user is currently looking at. I found that<br/>
```javascript
getBounds()
```
would do just that. After finding that I had an easy way to get the latitude and longitude ranges, I started building out my ViewSet for my LocationProvider model.
```python
queryset = LocationProvider.objects.all()
query = request.query_params
# Check if either latRange or longRange are in query_marams.
# If they are, filter the queryset based on the value ranges provided.
if "latRange" in query:
    low_lat, high_lat = query["latRange"].split(",")
    queryset = queryset.filter(
            latitude__range=(low_lat, high_lat))
if "longRange" in query:
    low_long, high_long = query["longRange"].split(",")
    queryset = queryset.filter(
            longitude__range=(low_long, high_long))
```
By listening for the above query parameters, I had a straight forward and succinct way to filter the data for the response. I then set a limit on the maximum amount of objects the user could request. I knew that if the user zoomed out far enough, they could potentially try to request the entire content of the database. I found setting a limit of 15,000 allowed for a quick enough response time while still providing an acceptable distribution of data when zoomed far out.
```python
# Limit large calls to 15,000 objects to reduce latency.
queryset = queryset[:15000]
```
The downside of putting any sort of limit on the total number of objects is that the user may not recieve a representative subset of the data as they would only receive the first 15,000 objects. I knew this distribution would get better as the user zoomed in, but I'm still not entirely happy with it. <br/>
I then added an additional query parameter, `latLongOnly=True`, that would further reduce the response size by omitting all data other than the latitude and longitude.

## The Front End
After digging further into Leaflet's documentation and reading through their Quick Start guide, I found that actually implementing the map was pretty straight forward. I needed to import Leaflets JavaScript and CSS within my HTML. I then needed to create an HTML Div, give it a predefined height within CSS, and define it as a Leaflet Map in Javascript with <br/>
```javascript
let myMap = L.map("mapid")
```
I now had an empty map without a tile layer on my page. After following the documentation further, I found that Mapbox would be able to provide this layer for free if I signed up and requested an API token.
```javascript
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: apiToken
}).addTo(myMap);
```
This allowed me to apply my tileLayer to my map and I was in business, on to the heat map itself.<br/>
Following the instructions in leaflet.heat's README file, I found that implementing my heatmap layer would be as straight forward as my tile layer, assuming I had access to the appropriate data. I used
`getBounds()`
to get my corresponding latitude and longitude ranges every time the user stopped moving the map, passed that into my API, and was returned the data I needed. I mapped over my data, set each point to the maximum default intensity, and passed my data into leaflet.heat's heatLayer with
```javascript
applyHeatmap = (boundsArray) => {
    let newBounds = boundsArray.map(datum => 
        [datum["longitude"], datum["latitude"], 1]
    );
    // Apply data points within newBounds to the heatLayer.
    heat = L.heatLayer(newBounds, {radius: 25}).addTo(myMap);
```
I found that Leaflet did not automatically write over previous layers with the same name, so every time I would query for more data, the previous locations on the map would get overlaid again and become darker. I added 
```javascript
// Remove old data points when called again.
myMap.removeLayer(heat)
```
to my function. This would remove any previously created layers with the same name, but would error out of that layer did not already exist. I added
```javascript
// Create an empty heat layer.
heat = L.heatLayer([], {radius: 25}).addTo(myMap);
```
outside of my function to create an empty heatLayer when the page was first loaded so that `removeLayer()` would actually have a layer to remove.
<br/>
At this point, my heatmap implementation was functional. I decided to set the default viewpoint near Turkey as it had some nice looking data distribution. While the dataset was limited, I found a few more interesting looking locations and created a few buttons that would allow the user to set their view to them. I've wanted to visit Svalbard for some years now, so I was pleased to be able to include that as a location.

## A few final thoughts
* I would have loved to provide a heatmap that includes every IPv4 location, but the total number is so large that it would likely get quite expensive to store that much data. The over 3 million that were provided still allowed this to be an interesting project to work through.
<br/><br/>
* Because the latitude and longitude coordinates have an accuracy range, many are not exactly where they should be. This leads to some odd scenarios that show large groups of IP addresses in strange locations, such as in the middle of open water.
<br/><br/>
* Many data points in the dataset have a rounded latitude or longitude number instead of the entire float value. For example, you may have a large amount of rows that all show 40 longitude and 12 latitude. This leads to what appears to be an extremely dense IPv4 distribution in areas that may be in the middle of nowhere.
<br/><br/>
* I'm still not entirely happy with the limitations I placed on the total number of objects that can be requested. It sometimes leads to strange looking distribution when zoomed far away. This could be worked through in the future in several ways. The first that comes to mind is providing a much higher object limit, perhaps 100,000 or more, and continuously sending smaller response chunks until that maximum value is reached. Even in this scenario, the user would have to stay at the same view location for a significant amount of time for enough data to be received
<br/><br/>
* The actual UI is pretty simple. It's nice to have buttons to show some interesting locations, but I still feel like something is missing.
