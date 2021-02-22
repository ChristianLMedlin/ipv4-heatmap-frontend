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