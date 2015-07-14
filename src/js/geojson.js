require("component-leaflet-map");
var Wherewolf = require("wherewolf");
var wolf = Wherewolf();

var mapElement = document.querySelector("leaflet-map");
var map = mapElement.map;
var L = mapElement.leaflet;

var listeners = [];
var layer = null;
var here = null;

var xhr = new XMLHttpRequest();
xhr.open("GET", "./assets/district_shapes.geojson");
xhr.onload = function() {
  var json = JSON.parse(xhr.responseText);
  layer = L.geoJson(json, {
    style: function(feature) {
      var colors = [null, "red", "orange", "yellow", "green", "blue", "indigo", "violet"];
      return {
        fillColor: colors[feature.properties.dist_name],
        stroke: null
      }
    },
    onEachFeature: function(feature, layer) {
      layer.on("click", function() {
        for (var i = 0; i < listeners.length; i++) {
          listeners[i]({ district: feature.properties.dist_name });
        }
      });
    }
  });
  wolf.add("council", json);

  layer.addTo(map);
};
xhr.send();

module.exports = {
  geolocate: function() {
    navigator.geolocation.getCurrentPosition(function(position) {
      var result = wolf.find({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      if (here) {
        here.setLatLng([position.coords.latitude, position.coords.longitude]);
      } else {
        here = new L.marker([position.coords.latitude, position.coords.longitude], {
          icon: L.divIcon({
            className: "you-are-here",
            html: `<i class="fa fa-map-marker"></i>`
          })
        });
        here.addTo(map);
      }
      setTimeout(function() {
        for (var i = 0; i < listeners.length; i++) {
          listeners[i]({ district: result.council.dist_name });
        }
      }, 500);
    });
  },
  onDistrict: function(fn) {
    listeners.push(fn);
  }
};