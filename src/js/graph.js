var hsl = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;

module.exports = {
  externalPie: function(canvas, external) {
    var context = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    var cx = canvas.width / 2;
    var cy = canvas.height / 2;
    var r = canvas.width * .3;
    context.lineWidth = cx * .3;
    var start = Math.PI * -.5;

    //internal funding
    var end = ((1 - external) * Math.PI * 2 - Math.PI * .5);
    context.beginPath();
    context.arc(cx, cy, r, start, end);
    context.strokeStyle = "#585";
    context.lineWidth = cx * .5;
    context.stroke();

    context.beginPath();
    var end = Math.PI * 2 - Math.PI * 2 * external - Math.PI * .5;
    context.arc(cx, cy, r * .9, start, end, true);
    context.strokeStyle = "#888";
    context.lineWidth = cx * .4;
    context.stroke();
  },
  timeseries: function(canvas, data) {
    var context = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

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

    var week = 1000 * 60 * 60 * 24 * 7
    var barWidth = canvas.width / ((limits.x.max + week - limits.x.min) / week);

    timestamps.sort().forEach((t, i) => {

      var v = data[t];

      var x = scaleX(t) * canvas.width;
      var y = canvas.height - scaleY(v) * canvas.height;
      context.fillStyle = hsl(i * 2 + 100, 30, 50);
      context.fillRect(x, y, barWidth, canvas.height - y);
    })

  }
};