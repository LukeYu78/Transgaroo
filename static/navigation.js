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
    
    $(document).ready(function(){
      $("#new-search").on('click',()=>{
          console.log("inside text box empty")
          map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [144.946457, -37.840935],
            zoom: 13
            });      
          geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl
            });
          if($('#formCheck-4').prop('checked')){
            $('#formCheck-4').prop('checked', false);
          }      
          $('#geocoder').empty();
          $('#geocoder').append(geocoder.onAdd(map));        
      })
    })

    $(document).on('click', '#search', function(e) {
      if($(".mapboxgl-ctrl-geocoder--input").val() == ""){
        alert("Please input a place name before you click GO!!")
      }else{
          let encodedValue = encodeURIComponent($(".mapboxgl-ctrl-geocoder--input").val())
          console.log(encodedValue);
        $.ajax({
          url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+encodedValue+'.json?access_token='+accessToken,
          type: 'GET'
        })
        .done(function(data) {        
          //console.log(JSON.stringify(data.features[0].center));
          var requestJson = new Object();
          var coordinates = new Object();
          
          coordinates.lat = data.features[0].center[0];
          coordinates.long = data.features[0].center[1];

          // if($('#formCheck-4').is(":checked")){
          //     coordinates.isParkingBay = "True";
          // }else{
          //     coordinates.isParkingBay = "False";
          // }


          requestJson.coordinates = coordinates;
          sendRequestToServer(requestJson).then((success)=>{
            
            // if($('#formCheck-4').is(":checked")){
              
            // }else{
            //   coordinates.isParkingBay = "False";
            // } 
            success[0].forEach((item)=>{
              map.addLayer(item);
            });
            if($('#formCheck-4').is(":checked")){
              success[1].forEach((markers)=>{
                markers.features.forEach((marker)=>{
                  var el = document.createElement('div');
                  el.className = 'marker';

                  new mapboxgl.Marker(el)
                  .setLngLat(marker.geometry.coordinates)
                  .addTo(map);
                })
              })
            }
            
            $('#formCheck-4').on('change',()=>{
              if($('#formCheck-4').is(":checked")){
                success[1].forEach((markers)=>{
                  markers.features.forEach((marker)=>{
                    var el = document.createElement('div');
                    el.className = 'marker';

                    new mapboxgl.Marker(el)
                    .setLngLat(marker.geometry.coordinates)
                    .addTo(map);
                  })
                })
              }else{
                let markers = document.getElementsByClassName("marker");
                for (let i = 0; i < markers.length; i++) {
                    markers[i].style.visibility = "hidden";
                }
              }
            })


            // if($('#formCheck-4').is(":checked")){
            //   success[1].forEach((markers)=>{
            //     markers.features.forEach((marker)=>{
            //       var el = document.createElement('div');
            //       el.className = 'marker';

            //       new mapboxgl.Marker(el)
            //           .setLngLat(marker.geometry.coordinates)
            //           .addTo(map);
            //     })
            //   })
            // }
            // success.forEach((item)=>{
            //   if(item.type == "FeatureCollection"){
            //     item.features.forEach((marker)=>{
            //       var el = document.createElement('div');
            //       el.className = 'marker';

            //       new mapboxgl.Marker(el)
            //           .setLngLat(marker.geometry.coordinates)
            //           .addTo(map);
            //     });
            //   }else{
            //     map.addLayer(item);
            //   }
            // })
            
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


// function plotToMap(map,reponseList){
//   responseList[0].forEach((item)=>{
//     map.addLayer(item);
//   });
//   $(document).ready(function(){
//     if($('#formCheck-4').is(":checked")){

//     }


//   })
// }


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
     
      // if(requestJson.coordinates["isParkingBay"] === "False"){
      //   var transformedData = preparedataforMap(response);
      //   resolve(transformedData);
      // }else{
      //   var transformedPointData = prepareDataForParking(response);
      //   resolve(transformedPointData);
      // }
      preparedataforMap(response).then((processedPathData)=>{
        responseList.push(processedPathData);
        prepareDataForParking(response).then((processedParkingData)=>{
          responseList.push(processedParkingData);
          resolve(responseList);
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