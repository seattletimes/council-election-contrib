// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");
require("component-leaflet-map");

var delegate = require("./delegate");

var map = require("./geojson");
var graphing = require("./graph");

var dot = require("dot");
dot.templateSettings.varname = "data";
dot.templateSettings.selfcontained = true;
dot.templateSettings.evaluate = /<%([\s\S]+?)%>/g;
dot.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

var districtTemplate = dot.compile(require("./_district.html"));
var candidateTemplate = dot.compile(require("./_candidate.html"));

var interactive = document.querySelector("main.interactive");

var mapCard = document.querySelector(".map.card");
var districtCard = document.querySelector(".district.card");
var candidateCard = document.querySelector(".candidate.card");

var pushCard = function(next) {
  var top = document.querySelector(".focused.card");

  next.classList.remove("offscreen");
  top.classList.remove("focused");
  next.classList.add("focused");
  next.classList.add("enter");

  var _ = document.body.offsetWidth;

  next.classList.add("enable-transition");
  top.classList.add("enable-transition");
  next.classList.remove("enter");
  top.classList.add("background");

  setTimeout(_ => {
    next.classList.remove("enable-transition");
    top.classList.remove("enable-transition");
  }, 500)
};

map.onDistrict(function(e) {

  var district = window.contribData[e.district];
  districtCard.innerHTML = districtTemplate(district);

  pushCard(districtCard);

  graphing.externalPie(districtCard.querySelector(".external"), district.external / district.total);
  graphing.timeseries(districtCard.querySelector(".by-date"), district.byDate);

});

delegate(interactive, "select.choose-candidate", "change", function(e) {
  var value = e.target.value;
  if (!value) return;

  var district = e.target.getAttribute("data-district");
  var candidate = window.contribData[district].candidates.filter(c => c.name == value).pop();

  if (!candidate) return;

  candidateCard.innerHTML = candidateTemplate(candidate);

  pushCard(candidateCard);
});

delegate(interactive, ".card.background", "click", function(e) {

  var target = this;

  var remove = target.nextElementSibling;

  while (remove && remove.classList.contains("card")) {
    remove.classList.remove("focused");
    remove.classList.remove("background");
    remove.classList.add("offscreen");
    remove = remove.nextElementSibling;
  }

  target.classList.add("enable-transition");
  target.classList.add("focused");
  target.classList.remove("background");

});