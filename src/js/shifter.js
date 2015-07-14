var transform =
  "transform" in document.body.style ? "transform" :
  "webkitTransform" in document.body.style ? "webkitTransform" :
  "msTransform" in document.body.style ? "msTransform" :
  "mozTransform" in document.body.style ? "mozTransform" : "transform";

module.exports = {
  x: function(container, element) {
    var offset = element.offsetLeft;
    container.setAttribute("transform-x", -offset);
    var y = container.getAttribute("transform-y") || "0%";
    container.style[transform] = `translateX(${-offset}px) translateY(${y})`;
  },
  y: function(container, position) {
    var x = container.getAttribute("transform-x") || 0;
    container.setAttribute("transform-y", position);
    container.style[transform] = `translateX(${x}px) translateY(${position})`;
  }
}