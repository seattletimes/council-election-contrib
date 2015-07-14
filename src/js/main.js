// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("es6-promise");
require("component-responsive-frame/child");
require("component-leaflet-map");
var dot = require("dot");
dot.templateSettings.varname = "data";
dot.templateSettings.selfcontained = true;
dot.templateSettings.evaluate = /<%([\s\S]+?)%>/g;
dot.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

var candidateTemplate = dot.compile(require("./_candidate.html"));

var delegate = require("./delegate");

var map = require("./geojson");
var shift = require("./shifter");
var graphing = require("./graph");

var interactive = document.querySelector("main.interactive");
var breadcrumbs = document.querySelector("header.breadcrumbs");
var mapRow = document.querySelector(".map.row");
var districtRow = document.querySelector(".district.row");
var candidateRow = document.querySelector(".candidate.row");

//draw district graphs
var districtCards = districtRow.querySelectorAll(".card");
for (var i = 0; i < districtCards.length; i++) {
  var card = districtCards[i];
  var district = card.getAttribute("data-district");
  var race = window.contribData[district];
  var external = race.external / race.total;
  var graph = graphing.externalPie(card.querySelector(".external-funding"), external);
}

var generateCandidates = function(district) {
  var html = candidateTemplate(window.contribData[district]);
  candidateRow.innerHTML = html;
};

var switchLevel = function(destRow, direction) {
  direction = direction || "up";
  var srcRow = document.querySelector(".row.focused");
  srcRow.style.width = srcRow.offsetWidth + "px";
  srcRow.classList.add("offscreen");
  srcRow.classList.remove("focused");
  destRow.style.width = null;
  destRow.classList.remove("offscreen");
  destRow.classList.add("focused");
  shift.y(destRow, direction == "up" ? "100%" : "-100%");

  var _ = destRow.offsetWidth;
  srcRow.classList.add("enable-transition");
  destRow.classList.add("enable-transition");
  shift.y(destRow, "0%");
  shift.y(srcRow, direction == "up" ? "-200%" : "200%");

  setTimeout(function() {
    srcRow.classList.remove("enable-transition");
    destRow.classList.remove("enable-transition");
  }, 500);
}

map.onDistrict(function(e) {
  districtRow.classList.remove("offscreen");
  shift.x(districtRow, districtRow.querySelector(`[data-district="${e.district}"]`));
  switchLevel(districtRow, "down");
  generateCandidates(e.district);
});

interactive.querySelector(".geolocate").addEventListener("click", function() {
  map.geolocate();
});

delegate(interactive, "select.choose-candidate", "change", function(e) {
  var chose = e.target.value;
  if (!chose) return;
  var district = e.target.getAttribute("data-district");
  candidateRow.classList.remove("offscreen");
  shift.x(candidateRow, candidateRow.querySelector(`[data-name="${chose}"]`));
  switchLevel(candidateRow, "down");
  breadcrumbs.querySelector(".district").innerHTML = `<i class="fa fa-chevron-circle-right"></i> District ${district}`;
});

delegate(interactive, ".breadcrumbs a", "click", function(e) {
  var row = e.target.getAttribute("row");
  var dest = row == "map" ? mapRow : districtRow;
  switchLevel(dest, "up");
  if (row == "map") breadcrumbs.querySelector(".district").innerHTML = "";
});