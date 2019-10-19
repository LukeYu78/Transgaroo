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
  var toiletLocations = new Array()
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
        placeholder: "Start Location",
        mapboxgl: mapboxgl
      });

  var dest_geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    countries: 'au',
    filter: function (item) {
      return item.context.map(function (i) {
        return (i.text === 'Melbourne');
      }).reduce(function (acc, cur) {
        return acc || cur;
      });
    },
    placeholder: "Destination Location",
    mapboxgl: mapboxgl
  });

  var draw = new MapboxDraw({
    // Instead of showing all the draw tools, show only the line string and delete tools
    displayControlsDefault: false,
    controls: {
      line_string: true,
      trash: true
    },
    styles: [
      // Set the line style for the user-input coordinates
      {
        "id": "gl-draw-line",
        "type": "line",
        "filter": ["all", ["==", "$type", "LineString"],
          ["!=", "mode", "static"]
        ],
        "layout": {
          "line-cap": "round",
          "line-join": "round"
        },
        "paint": {
          "line-color": "#438EE4",
          "line-dasharray": [0.2, 2],
          "line-width": 4,
          "line-opacity": 0.7
        }
      },
      // Style the vertex point halos
      {
        "id": "gl-draw-polygon-and-line-vertex-halo-active",
        "type": "circle",
        "filter": ["all", ["==", "meta", "vertex"],
          ["==", "$type", "Point"],
          ["!=", "mode", "static"]
        ],
        "paint": {
          "circle-radius": 12,
          "circle-color": "#FFF"
        }
      },
      // Style the vertex points
      {
        "id": "gl-draw-polygon-and-line-vertex-active",
        "type": "circle",
        "filter": ["all", ["==", "meta", "vertex"],
          ["==", "$type", "Point"],
          ["!=", "mode", "static"]
        ],
        "paint": {
          "circle-radius": 8,
          "circle-color": "#438EE4",
        }
      },
    ]
  });

  function updateRoute() {
    // Set the profile
    var profile = "cycling";
    // Get the coordinates that were drawn on the map
    var data = draw.getAll();
    var lastFeature = data.features.length - 1;
    var coords = data.features[lastFeature].geometry.coordinates;
    // Format the coordinates
    var newCoords = coords.join(';')
    // Set the radius for each coordinate pair to 25 meters
    var radius = [];
    coords.forEach(element => {
      radius.push(25);
    });
    getMatch(newCoords, radius, profile);
  }
  
  // Make a Map Matching request
  function getMatch(coordinates, radius, profile) {
    // Separate the radiuses with semicolons
    var radiuses = radius.join(';')
    // Create the query
    var query = 'https://api.mapbox.com/matching/v5/mapbox/' + profile + '/' + coordinates + '?geometries=geojson&radiuses=' + radiuses + '&steps=true&access_token=' + mapboxgl.accessToken;
  
    $.ajax({
      method: 'GET',
      url: query
    }).done(function(data) {
      // Get the coordinates from the response
      var coords = data.matchings[0].geometry;
      console.log(coords);
      // Code from the next step will go here
    });
  }

  // Draw the Map Matching route as a new layer on the map
  function addRoute(coords) {
    // If a route is already loaded, remove it
    if (map.getSource('route')) {
      map.removeLayer('route')
      map.removeSource('route')
    } else { // Add a new layer to the map
      map.addLayer({
        "id": "route",
        "type": "line",
        "source": {
          "type": "geojson",
          "data": {
            "type": "Feature",
            "properties": {},
            "geometry": coords
          }
        },
        "layout": {
          "line-join": "round",
          "line-cap": "round"
        },
        "paint": {
          "line-color": "#03AA46",
          "line-width": 8,
          "line-opacity": 0.8
        }
      });
    };
  }

  // Make a Map Matching request
  function getMatch(coordinates, radius, profile) {
    // Separate the radiuses with semicolons
    var radiuses = radius.join(';')
    // Create the query
    var query = 'https://api.mapbox.com/matching/v5/mapbox/' + profile + '/' + coordinates + '?geometries=geojson&radiuses=' + radiuses + '&steps=true&access_token=' + mapboxgl.accessToken;
    console.log(query)
    $.ajax({
      method: 'GET',
      url: query
    }).done(function(data) {
      // Get the coordinates from the response
      var coords = data.matchings[0].geometry;
      // Draw the route on the map
      addRoute(coords);
    });
  }

  function getInstructions(data) {
    // Target the sidebar to add the instructions
    var directions = document.getElementById('directions');
  
    var legs = data.legs;
    var tripDirections = [];
    // Output the instructions for each step of each leg in the response object
    for (var i = 0; i < legs.length; i++) {
      var steps = legs[i].steps;
      for (var j = 0; j < steps.length; j++) {
        tripDirections.push('<br><li>' + steps[j].maneuver.instruction) + '</li>';
      }
    }
    directions.innerHTML = '<br><h2>Trip duration: ' + Math.floor(data.duration / 60) + ' min.</h2>' + tripDirections;
  }

  // Make a Map Matching request
  function getMatch(coordinates, radius, profile) {
    // Separate the radiuses with semicolons
    var radiuses = radius.join(';')
    // Create the query
    var query = 'https://api.mapbox.com/matching/v5/mapbox/' + profile + '/' + coordinates + '?geometries=geojson&radiuses=' + radiuses + '&steps=true&access_token=' + mapboxgl.accessToken;
    console.log(query)
    $.ajax({
      method: 'GET',
      url: query
    }).done(function(data) {
      var coords = data.matchings[0].geometry;
      // Draw the route on the map
      addRoute(coords);
      getInstructions(data.matchings[0]);
    });
  }

  function removeRoute() {
    if (map.getSource('route')) {
      map.removeLayer('route');
      map.removeSource('route');
    } else {
      return;
    }
  }
    
  map.on('draw.create', updateRoute);
  map.on('draw.update', updateRoute);
  map.on('draw.delete', removeRoute);

  map.addControl(draw);
  document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
  document.getElementById('dest_geocoder').appendChild(dest_geocoder.onAdd(map));
  
  $('#downloadLink').on('click',() =>{
    // var img = map.getCanvas().toDataURL('../static/images/')
    // $('#downloadLink').prop("href",img);
    $('#map').css({'overflow':'hidden !important'})
    html2canvas($('#map')[0], {
       useCORS: true,
        allowTaint: true,
        height:500,
        width:926
    })
    .then(function(canvas) {
      var img = canvas.toDataURL('../static/images/');
      var link = document.createElement('a');
      link.href = img;
      link.download = "map.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

  });

  $("#new-search").on('click',()=>{
    location.reload(true);
  })

  $(document).on('click', '#search', function(e) {
    if($(".mapboxgl-ctrl-geocoder--input").val() == ""){
      alert("Please input a place name before you click GO!!")
    }else{
        let destEncodedValue= encodeURIComponent($('span#dest_geocoder input.mapboxgl-ctrl-geocoder--input').val());
        let encodedValue = encodeURIComponent($(".mapboxgl-ctrl-geocoder--input").val())
        var requestJson = new Object();

        if($("#dest_geocoder").is(":hidden")){
          $.ajax({
            url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+encodedValue+'.json?access_token='+accessToken,
            type: 'GET',
            async: false
          }).done(function(data) {
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
            });
          }).fail(function(err) {
            console.log("error"+JSON.stringify(err))
          })
        }else{
          $.ajax({
            url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+encodedValue+'.json?access_token='+accessToken,
            type: 'GET'
          })
          .done(function(sourceData) {
            $.ajax({
              url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+destEncodedValue+'.json?access_token='+accessToken,
              type: 'GET'
            }).done(function(destData){ 
                var coordinates = new Object();
                var source = new Object();
                var target = new Object();
        
                source.lat = sourceData.features[0].center[0];
                source.long = sourceData.features[0].center[1];
    
                target.lat = destData.features[0].center[0];
                target.long = destData.features[0].center[1];
    
                coordinates.source = source;
                coordinates.target = target;
                requestJson.coordinates = coordinates;
                requestJson.coordinates = coordinates;
                console.log(JSON.stringify(requestJson));
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

                if($('#formCheck-7').is(":checked")){
                  toiletLocations = responseFromServer[4];
                  toiletLocations.forEach((markers)=>{
                    markers.features.forEach((marker)=>{
                      var el = document.createElement('div');
                      el.className = 'toilet-marker';
    
                      new mapboxgl.Marker(el)
                      .setLngLat(marker.geometry.coordinates)
                      .addTo(map);
                    })
                  })
                }
                });
              }).fail(function(err) {
                console.log("error"+JSON.stringify(err))
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
                  if(Object.entries(markers).length != 0){
                    markers.features.forEach((marker)=>{
                      var el = document.createElement('div');
                      el.className = 'crash-marker';
  
                      new mapboxgl.Marker(el)
                      .setLngLat(marker.geometry.coordinates)
                      .addTo(map);
                    })
                  }
                })
            }
          }else{
            let markers = document.getElementsByClassName("crash-marker");
            for (let i = 0; i < markers.length; i++) {
                markers[i].style.visibility = "hidden";
            }
          }
        })

        $('#formCheck-7').on('change',()=>{
          if($('#formCheck-7').is(":checked")){
            if($(".mapboxgl-ctrl-geocoder--input").val() == ""){
              alert("Please input a place name before you click GO!!")
            }else{
                toiletLocations = responseFromServer[4];
                toiletLocations.forEach((markers)=>{
                  if(Object.entries(markers).length != 0){
                    markers.features.forEach((marker)=>{
                      var el = document.createElement('div');
                      el.className = 'toilet-marker';
  
                      new mapboxgl.Marker(el)
                      .setLngLat(marker.geometry.coordinates)
                      .addTo(map);
                    })
                  }
                })
            }
          }else{
            let markers = document.getElementsByClassName("toilet-marker");
            for (let i = 0; i < markers.length; i++) {
                markers[i].style.visibility = "hidden";
            }
          }
        })
      } 
  });  
});

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

$(document).ready(function(){
  $('input[type="radio"]').click(function(){
      var inputValue = $(this).prop("value");
      // var targetBox = $("." + inputValue);
      if(inputValue == "Wandering"){
        $("#dest_geocoder").hide();
        $('#search_button').css('padding-bottom','5px');
      }else{
        $("#dest_geocoder").show();
        $('#search_button').css('padding-bottom','60px');
      }
  });
})

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
            prepareDataForToiletLocations(response).then((processedToiletLocations)=>{
              responseList.push(processedToiletLocations);
              processAccidentIndicators(responseList).then((processedResponseList)=>{
                resolve(processedResponseList);
              },(err)=>{
                console.log(err);
                reject(err);
              });
            },(err)=>{
              console.log(err);
              reject(err);
            })
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

function prepareDataForToiletLocations(response){
  return new Promise((resolve,reject)=>{
    try {
        var multiPointData = new Array();
    
        response.forEach((element) => {
          var overallObj = new Object();
          var features = new Array();
          if(element.toiletLocations.length == 0){
            var crashData = new Object();
            multiPointData.push(crashData);
          }else{
            element.toiletLocations.forEach((eachToil)=>{
              var properties = new Object();
              var geometry = new Object();
              var innerObj = new Object();
        
              geometry.coordinates = eachToil.coordinates;
              geometry.type = "Point";
        
              properties.title = "ToiletLocation";
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


function processAccidentIndicators(responseList){
  return new Promise((resolve,reject)=>{
    try{
      for(let i=0;i<responseList[0].length;i++){
        if(Object.keys(responseList[3][i]).length == 0){
          responseList[0][i].paint["line-color"] = "#027A55";
        }else{
          if(responseList[3][i].features.length < 5){
            responseList[0][i].paint["line-color"] = "#027A55";
          }else if(responseList[3][i].features.length >= 5 && responseList[3][i].features.length < 10){
            responseList[0][i].paint["line-color"] = "#fc9803";
          }else{
            responseList[0][i].paint["line-color"] = "#ff5500"
          }
        } 
      }
      resolve(responseList);     
    }catch(error){
      reject(error);
    }
  });
}