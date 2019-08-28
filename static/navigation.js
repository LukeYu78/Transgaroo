
 



$(document).ready(function() { 

    const accessToken = 'pk.eyJ1IjoiZ2lyaXNoMSIsImEiOiJjanp2NGIwcmkwaTRjM21tdnN5NTlqb3NqIn0.isvbmWcUY3d25ip9294Igg';

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

   
    

    // each
    // function plotOnMap(success){
    //   map.on('load',function(){
    //     success.forEach((eachItem)=>{
    //       map.addLayer(eachItem);
    //     })
    //   })
    // }
   
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
        sendRequestToServer(requestJson).then((success)=>{
          // if(requestJson.isParkingBay == "False"){
          //   success.forEach((item)=>{
          //     map.addLayer(item);
          //   });
          // }else{
          //   success.forEach((item)=>{
          //     map.loadImage('./parkingImage.png', function(error, image){
          //       if (error) throw error;
          //       map.addImage('parkingBay',image);
          //       map.addLayer(item);
          //     });
          //   });
          // }

          success.forEach((item)=>{
            if(item.type == "FeatureCollection"){
              // map.loadImage('/static/parkingImage.png', function(error, image){
              //     if (error) throw error;
              //     map.addImage('parkingBay',image);
              //     map.addLayer(item);
              // });
              item.features.forEach((marker)=>{
                var el = document.createElement('div');
                el.className = 'marker';

                new mapboxgl.Marker(el)
                    .setLngLat(marker.geometry.coordinates)
                    .addTo(map);
              });
            }else{
              map.addLayer(item);
            }
          })
          
        },(err)=>{
          console.log(err);
        });
      })
      .fail(function(err) {
        console.log("error"+JSON.stringify(err))
      })
    });
  })


function sendRequestToServer(requestJson){
  return new Promise((resolve,reject)=> {
    $.ajax({
      url: 'getAllCyclePaths',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(requestJson),
      contentType:"application/json; charset=UTF-8"
    })
    .done(function(response) {
      if(requestJson.coordinates["isParkingBay"] === "False"){
        var transformedData = preparedataforMap(response);
        resolve(transformedData);
      }else{
        var transformedPointData = prepareDataForParking(response);
        resolve(transformedPointData);
      }
      
    })
    .fail(function(err) {
      console.log("error"+err);
      reject(err);
    })
  })
}



function preparedataforMap(response){
  var multlineData = new Array();
  
  response.forEach((element) => {
    var eachLine = new Object();
    
    var source = new Object();
    var data = new Object();
    var properties = new Object();
    var geometry = new Object();
    var layout = new Object();
    var paint = new Object();



    geometry.type = "LineString";
    geometry.coordinates = element.geom_data[0];

    data.type = "Feature";
    data.properties = properties;
    data.geometry = geometry;

    source.type = "geojson";
    source.data = data;

    
    layout["line-join"] = "round";
    layout["line-cap"]= "round";

    paint["line-color"] = "#6600ff";
    paint["line-width"] = 6;

    eachLine.id = "route"+element.id.toString();
    eachLine.type = "line";
    eachLine.source = source;
    eachLine.layout = layout;
    eachLine.paint = paint;

    multlineData.push(eachLine);
  });

  return multlineData;
}



function prepareDataForParking(response){
  var multiPointData = new Array();
  
  response.forEach((element) => {
    var overallObj = new Object();
    var features = new Array();
    element.parkingBays.forEach((eachParkingBay)=>{
      var properties = new Object();
      var geometry = new Object();
      var innerObj = new Object();

      geometry.coordinates = eachParkingBay.coordinates;
      geometry.type = "Point";

      properties.title = "parkingBayLocation";
      properties.description = "CityOFMelbourne";

      innerObj.type = "Feature";
      innerObj.geometry = geometry;
      innerObj.properties = properties; 

      features.push(innerObj);
    })
    overallObj.type = "FeatureCollection";
    overallObj.features = features;

    // data.features = features;
    // data.type = "FeatureCollection";

    // source.data = data;
    // source.type = "geojson";

    // overallObj.source = source;
    // overallObj.id = "parkingBay"+element.id.toString();
    // overallObj.type = "symbol";

    // overallObj["icon-image"] = "parkingBay";
    // overallObj["icon-size"] = 0.1;

    // multiPointData.push(overallObj);
    multiPointData.push(overallObj);
   });

  return multiPointData;
}