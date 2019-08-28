
const accessToken = 'pk.eyJ1IjoiZ2lyaXNoMSIsImEiOiJjanp2NGIwcmkwaTRjM21tdnN5NTlqb3NqIn0.isvbmWcUY3d25ip9294Igg';



$(document).ready(function() { 

    mapboxgl.accessToken = accessToken;
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [144.946457, -37.840935],
        zoom: 13
        });

 
    var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
        });

    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
     
    $(document).on('click', '#search', function(e) {
        let encodedValue = encodeURIComponent($(".mapboxgl-ctrl-geocoder--input").val())
        console.log(encodedValue);
      $.ajax({
        url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+encodedValue+'.json?access_token='+accessToken,
        type: 'GET'
      })
      .done(function(data) {        
        console.log(JSON.stringify(data.features[0].center));
        var requestJson = new Object();
        var coordinates = new Object();
        

        coordinates.lat = data.features[0].center[0];
        coordinates.long = data.features[0].center[1];

        if($('#formCheck-4').is(":checked")){
            coordinates.isParkingBay = "True";
        }else{
            coordinates.isParkingBay = "False";
        }
        requestJson.coordinates = coordinates;
        sendRequestToServer(requestJson)
      })
      .fail(function(err) {
        console.log("error"+JSON.stringify(err))
      })
    });
  })


function sendRequestToServer(requestJson){
    $.ajax({
        url: 'getAllCyclePaths',
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify(requestJson),
        contentType:"application/json; charset=UTF-8"
      })
      .done(function(response) {
        console.log("data was recieved" + JSON.stringify(response));
        //prepareDataForPlot(response)
      })
      .fail(function(err) {
        console.log("error"+err)
      })
}