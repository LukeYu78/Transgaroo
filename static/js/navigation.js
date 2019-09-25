$(document).ready(function() { 

  const accessToken = 'pk.eyJ1IjoiZ2lyaXNoMSIsImEiOiJjanp2NGIwcmkwaTRjM21tdnN5NTlqb3NqIn0.isvbmWcUY3d25ip9294Igg';
  mapboxgl.accessToken = accessToken;
  var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [144.946457, -37.840935],
      zoom: 11,
      preserveDrawingBuffer: true
      });
  var responseFromServer = new Array();
  var cyclePath = new Array();
  var parkingLocations = new Array();
  var drinkingLocations = new Array();
  var crashHotspots = new Array();
  var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        countries: 'au',
        filter: function (item) {
          return item.context.map(function (i) {
            return (i.text === 'Melbourne');
          }).reduce(function (acc, cur) {
            return acc || cur;
          });
        },
        mapboxgl: mapboxgl
      });

  document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
  
  $('#downloadLink').on('click',() =>{
    var img = map.getCanvas().toDataURL('../static/images/')
    $('#downloadLink').prop("href",img);
  });

  $(document).ready(function(){
    $("#new-search").on('click',()=>{
        //isNewSearch = true;
        console.log("inside text box empty")
        map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [144.946457, -37.840935],
          zoom: 11,
          preserveDrawingBuffer: true
          });      
          var geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            countries: 'au',
            filter: function (item) {
              return item.context.map(function (i) {
                return (i.text === 'Melbourne');
              }).reduce(function (acc, cur) {
                return acc || cur;
              });
            },
            mapboxgl: mapboxgl
          });
        if($('#formCheck-4').prop('checked')){
          $('#formCheck-4').prop('checked', false);
        }
        if($('#formCheck-5').prop('checked')){
          $('#formCheck-5').prop('checked', false);
        }
        if($('#formCheck-6').prop('checked')){
          $('#formCheck-6').prop('checked', false);
        }
        responseFromServer = new Array();
        cyclePath = new Array();
        parkingLocations = new Array();
        drinkingLocations = new Array();
        crashHotspots = new Array();        
        $('#geocoder').empty();
        $('#geocoder').append(geocoder.onAdd(map));        
    })
  })

  $(document).on('click', '#search', function(e) {
    if($(".mapboxgl-ctrl-geocoder--input").val() == ""){
      alert("Please input a place name before you click GO!!")
    }else{
        //isNewSearch = false;
        let encodedValue = encodeURIComponent($(".mapboxgl-ctrl-geocoder--input").val())
      $.ajax({
        url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+encodedValue+'.json?access_token='+accessToken,
        type: 'GET'
      })
      .done(function(data) {        
        var requestJson = new Object();
        var coordinates = new Object();

        console.log(data);
        coordinates.lat = data.features[0].center[0];
        coordinates.long = data.features[0].center[1];

        requestJson.coordinates = coordinates;
        sendRequestToServer(requestJson).then((success)=>{
          responseFromServer = success;
          cyclePath = responseFromServer[0];
          cyclePath.forEach((item)=>{
            map.addLayer(item);
          });
          if($('#formCheck-4').is(":checked")){
              parkingLocations = responseFromServer[1];
              parkingLocations.forEach((markers)=>{
                markers.features.forEach((marker)=>{
                  var el = document.createElement('div');
                  el.className = 'marker';

                  new mapboxgl.Marker(el)
                  .setLngLat(marker.geometry.coordinates)
                  .addTo(map);
                })
              })
          }
          if($('#formCheck-5').is(":checked")){
              drinkingLocations = responseFromServer[2];
              drinkingLocations.forEach((markers)=>{
                markers.features.forEach((marker)=>{
                  var el = document.createElement('div');
                  el.className = 'drinking-marker';

                  new mapboxgl.Marker(el)
                  .setLngLat(marker.geometry.coordinates)
                  .addTo(map);
                })
              })
          }

          if($('#formCheck-6').is(":checked")){
            crashHotspots = responseFromServer[3];
            crashHotspots.forEach((markers)=>{
              markers.features.forEach((marker)=>{
                var el = document.createElement('div');
                el.className = 'crash-marker';

                new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .addTo(map);
              })
            })
        }
          
          $('#formCheck-4').on('change',()=>{
            if($('#formCheck-4').is(":checked")){
              if($(".mapboxgl-ctrl-geocoder--input").val() == ""){
                alert("Please input a place name before you click GO!!")
              }else{
                  parkingLocations = responseFromServer[1];
                  parkingLocations.forEach((markers)=>{
                    markers.features.forEach((marker)=>{
                      var el = document.createElement('div');
                      el.className = 'marker';
  
                      new mapboxgl.Marker(el)
                      .setLngLat(marker.geometry.coordinates)
                      .addTo(map);
                    })
                  })
              }
            }else{
              let markers = document.getElementsByClassName("marker");
              for (let i = 0; i < markers.length; i++) {
                  markers[i].style.visibility = "hidden";
              }
            }
          })

          $('#formCheck-5').on('change',()=>{
            if($('#formCheck-5').is(":checked")){
              if($(".mapboxgl-ctrl-geocoder--input").val() == ""){
                alert("Please input a place name before you click GO!!")
              }else{
                  drinkingLocations = responseFromServer[2];
                  drinkingLocations.forEach((markers)=>{
                    markers.features.forEach((marker)=>{
                      var el = document.createElement('div');
                      el.className = 'drinking-marker';
  
                      new mapboxgl.Marker(el)
                      .setLngLat(marker.geometry.coordinates)
                      .addTo(map);
                    })
                  })
              }
            }else{
              let markers = document.getElementsByClassName("drinking-marker");
              for (let i = 0; i < markers.length; i++) {
                  markers[i].style.visibility = "hidden";
              }
            }
          })

          $('#formCheck-6').on('change',()=>{
            if($('#formCheck-6').is(":checked")){
              if($(".mapboxgl-ctrl-geocoder--input").val() == ""){
                alert("Please input a place name before you click GO!!")
              }else{
                  crashHotspots = responseFromServer[3];
                  crashHotspots.forEach((markers)=>{
                    markers.features.forEach((marker)=>{
                      var el = document.createElement('div');
                      el.className = 'crash-marker';
  
                      new mapboxgl.Marker(el)
                      .setLngLat(marker.geometry.coordinates)
                      .addTo(map);
                    })
                  })
              }
            }else{
              let markers = document.getElementsByClassName("crash-marker");
              for (let i = 0; i < markers.length; i++) {
                  markers[i].style.visibility = "hidden";
              }
            }
          })
        },(err)=>{
          console.log(err);
        });
      })
      .fail(function(err) {
        console.log("error"+JSON.stringify(err))
      })
    } 
  });
})


$(document).ready(function() {
  $('#cycle_map').on( "click", function() {
    window.location = "/cycling_map";
  });
});


$(document).ready(function() {
  $('#rules').on( "click", function() {
    window.location = "/rules";
  });
});


$(document).ready(function() {
  $('#save_plan').on( "click", function() {
    window.location = "/cycling_map";
  });
});

function sendRequestToServer(requestJson){
var responseList = new Array();
return new Promise((resolve,reject)=> {
  $.ajax({
    url: 'getAllCyclePaths',
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify(requestJson),
    contentType:"application/json; charset=UTF-8"
  })
  .done(function(response) {
    preparedataforMap(response).then((processedPathData)=>{
      responseList.push(processedPathData);
      prepareDataForParking(response).then((processedParkingData)=>{
        responseList.push(processedParkingData);
        prepareDataForDrinkingFountain(response).then((processFountainData)=>{
          responseList.push(processFountainData);
          prepareDataForCrashHotspots(response).then((processedCrashData)=>{
            responseList.push(processedCrashData);
            resolve(responseList);
          },(err)=>{
            console.err(err);
            reject(err);  
          });
        },(err)=>{
          console.err(err);
          reject(err);  
        });
      },(err)=>{
        console.err(err);
        reject(err);
      });
    },(err)=>{
      console.err(err);
      reject(err);
    });      
  })
  .fail(function(err) {
    console.log("error"+err);
    reject(err);
  })
})
}



function preparedataforMap(response){
  return new Promise((resolve,reject)=>{
    try {
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
    resolve(multlineData);  
    } catch (error) {
      console.error(error);
      reject(error);
    } 
})
}

function prepareDataForParking(response){
return new Promise((resolve,reject)=>{
  try {
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
        multiPointData.push(overallObj);
      });
      resolve(multiPointData);
    } catch (error) {
      console.error(error);
      reject(error); 
    }
  });
}

function prepareDataForDrinkingFountain(response){
return new Promise((resolve,reject)=>{
  try {
      var multiPointData = new Array();
  
      response.forEach((element) => {
        var overallObj = new Object();
        var features = new Array();
        element.drinkingFountains.forEach((eachDrinking)=>{
          var properties = new Object();
          var geometry = new Object();
          var innerObj = new Object();
    
          geometry.coordinates = eachDrinking.coordinates;
          geometry.type = "Point";
    
          properties.title = "drinkingLocation";
          properties.description = "CityOFMelbourne";
    
          innerObj.type = "Feature";
          innerObj.geometry = geometry;
          innerObj.properties = properties; 
    
          features.push(innerObj);
        })
        overallObj.type = "FeatureCollection";
        overallObj.features = features;
        multiPointData.push(overallObj);
      });
      resolve(multiPointData);
    } catch (error) {
      console.error(error);
      reject(error); 
    }
  }); 
}

function prepareDataForCrashHotspots(response){
return new Promise((resolve,reject)=>{
  try {
      var multiPointData = new Array();
  
      response.forEach((element) => {
        var overallObj = new Object();
        var features = new Array();
        if(element.cycleCrashHotspots.length == 0){
          var crashData = new Object();
          multiPointData.push(crashData);
        }else{
          element.cycleCrashHotspots.forEach((eachCrash)=>{
            var properties = new Object();
            var geometry = new Object();
            var innerObj = new Object();
      
            geometry.coordinates = eachCrash.coordinates;
            geometry.type = "Point";
      
            properties.title = "crashHotspot";
            properties.description = "CityOFMelbourne";
      
            innerObj.type = "Feature";
            innerObj.geometry = geometry;
            innerObj.properties = properties; 
      
            features.push(innerObj);
          })
          overallObj.type = "FeatureCollection";
          overallObj.features = features;
          multiPointData.push(overallObj);
        }
      });
      resolve(multiPointData);
    } catch (error) {
      console.error(error);
      reject(error); 
    }
  }); 
}