// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");
// require("component-leaflet-map");

require("angular");
var moment = require("moment/min/moment.min.js");

var delegate = require("./delegate");

var app = angular.module("election-contrib", []);

var TableController = function($scope) {
  $scope.contributions = Object.keys(window.contribData).map(k => window.contribData[k]);
};

TableController.$inject = ["$scope"];

app.controller("table-controller", TableController);

app.directive("clickToggle", function() {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      var className = attrs.clickToggle;
      element.on("click", () => element.toggleClass(className));
    }
  }
})

app.directive("tinyPie", function() {
  return {
    template: `
<canvas></canvas>
    `,
    restrict: "E",
    scope: {
      data: "&"
    },
    link: function(scope, element, attrs) {
      var external = scope.data();
      var canvas = element.find("canvas")[0];
      var context = canvas.getContext("2d");
      canvas.width = 16;
      canvas.height = 16;

      var cx = canvas.width / 2;
      var cy = canvas.height / 2;

      //internal = full circle
      context.beginPath();
      context.moveTo(cx, cy);
      context.arc(cx, cy, cx, 0, Math.PI * 2);
      context.fillStyle = "#888";
      context.fill();

      //external = fill
      var start = Math.PI * -.5;
      var end = start + (external * Math.PI * 2);
      context.beginPath();
      context.moveTo(cx, cy);
      context.arc(cx, cy, cx, start, end);
      context.fillStyle = "#252";
      context.fill();

    }
  }
});

app.directive("weeklyHistogram", function() {
  return {
    template: `
<canvas></canvas>
<div class="tooltip">{{time}}
<span class="value">\${{value || 0 | number:2 }}</span></div>
    `,
    restrict: "E",
    scope: {
      data: "="
    },
    link: function(scope, element, attrs) {
      var el = element[0];

      var data = scope.data;
      var canvas = element.find("canvas")[0];
      var context = canvas.getContext("2d");
      canvas.width = 160;
      canvas.height = 16;

      var timestamps = Object.keys(data).map(Number);
      var values = timestamps.map(t => data[t]);
      var limits = {
        x: {
          min: Math.min.apply(null, timestamps),
          max: Math.max.apply(null, timestamps)
        },
        y: {
          min: 0,
          max: Math.max.apply(null, values)
        }
      };

      var scaleX = t => (t - limits.x.min) / (limits.x.max - limits.x.min);
      var scaleY = v => v / limits.y.max;
      var hsl = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;

      var week = 1000 * 60 * 60 * 24 * 7
      var barWidth = canvas.width / ((limits.x.max + week - limits.x.min) / week);

      var render = function(selected) {
        canvas.width = 160;
        canvas.height = 16;

        timestamps.sort().forEach((t, i) => {

          var v = data[t];

          var x = scaleX(t) * canvas.width;
          var y = canvas.height - scaleY(v) * canvas.height;
          context.fillStyle = t == selected ? hsl(i * 2 + 100, 30, 80) : hsl(i * 2 + 100, 30, 50);
          context.fillRect(x, y, barWidth, canvas.height - y);
        });
      };

      render();

      var tooltip = element.find("div");

      canvas.addEventListener("mousemove", function(e) {
        var bounds = canvas.getBoundingClientRect();
        var x = e.clientX - bounds.left;
        var y = e.clientY - bounds.top;

        var xScale = canvas.width / canvas.offsetWidth;

        var guess = Math.floor(x * xScale / barWidth);
        var bar = timestamps[guess];
        if (!bar) return;
        render(bar);

        tooltip.addClass("show");
        tooltip.css({
          top: y + 10 + "px",
          right: bounds.width - x + 10 + "px"
        });
        var time = moment(bar * 1).format("MMM. D, YYYY");
        scope.time = time;
        scope.value = data[bar];
        scope.$apply();
      });

      canvas.addEventListener("mouseout", function(e) {
        tooltip.removeClass("show");
        render();
      })
    }
  }
});

