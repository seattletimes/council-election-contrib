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
  }
};