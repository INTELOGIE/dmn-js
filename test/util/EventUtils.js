'use strict';

var TestHelper = require('../spec/helper');

var domQuery = require('min-dom/lib/query');

var mouseEvent = require('table-js/test/util/MouseEvents').performMouseEvent;


function clickElement(element) {
  return TestHelper.getDmnJS().invoke(function(elementRegistry) {

    var target = elementRegistry.getGraphics(element);

    if (!target) {
      target = element;
    }

    mouseEvent('click', target);
  });
}

module.exports.clickElement = clickElement;


function rightClickElement(element) {
  return TestHelper.getDmnJS().invoke(function(elementRegistry) {

    var target = elementRegistry.getGraphics(element);

    if (!target) {
      target = element;
    }

    mouseEvent('contextmenu', target);
  });
}

module.exports.rightClickElement = rightClickElement;


function clickAndQuery(element, selector) {
  return TestHelper.getDmnJS().invoke(function(elementRegistry, sheet) {

    var target = elementRegistry.getGraphics(element),
        table = sheet.getContainer();

    if (!target) {
      target = element;
    }

    mouseEvent('click', target);

    return domQuery(selector, table);
  });
}

module.exports.clickAndQuery = clickAndQuery;


function dragElement(element, destElement, options) {
  return TestHelper.getDmnJS().invoke(function() {
    var elementBounds = element.getBoundingClientRect();

    mouseEvent('mousedown', element, {
      clientX: elementBounds.left,
      clientY: elementBounds.top,
      relatedTarget: element
    });

    mouseEvent('mousemove', destElement, options);

    mouseEvent('mouseup', element, options);
  });
}

module.exports.dragElement = dragElement;
