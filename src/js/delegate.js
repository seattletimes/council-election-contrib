var matches = "matches webkitMatchesSelector mozMatchesSelector msMatchesSelector".split(" ").filter(s => s in document.body).shift();

module.exports = function(root, selector, event, listener) {
  root.addEventListener(event, function(e) {

    var element = e.target;
    while (!element[matches](selector) && element != root) element = element.parentElement;

    if (element == root || !element) return;

    listener.call(element, e);

  });
}