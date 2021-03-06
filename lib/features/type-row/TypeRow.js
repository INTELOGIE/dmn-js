'use strict';

var assign = require('lodash/object/assign');

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    ComboBox = require('table-js/lib/features/combo-box');

var typeTemplate = require('./TypeTemplate.html');

var OFFSET_X = -4,
    OFFSET_Y = -17;

/**
 * Adds a control to the table to define the datatypes for clauses
 */
function TypeRow(eventBus, sheet, elementRegistry, graphicsFactory, complexCell, rules) {

  this.row = null;

  // add row when the sheet is initialized
  eventBus.on([ 'sheet.init', 'sheet.cleared' ], function(event) {

    eventBus.fire('typeRow.add', event);

    this.row = sheet.addRow({
      id: 'typeRow',
      isHead: true,
      isTypeRow: true
    });

    eventBus.fire('typeRow.added', this.row);

    graphicsFactory.update('row', this.row, elementRegistry.getGraphics(this.row.id));
  }, this);

  // remove the row when the sheet is destroyed
  eventBus.on([ 'sheet.clear', 'sheet.destroy' ], function(event) {

    eventBus.fire('typeRow.destroy', this.row);

    sheet.removeRow({
      id: 'typeRow'
    });

    eventBus.fire('typeRow.destroyed', this.row);

    this.row = null;
  }, this);

  // when an input cell on the mappings row is added, setup the complex cell
  eventBus.on('cell.added', function(evt) {
    if (evt.element.row.id === 'typeRow' &&
       evt.element.column.businessObject) {

      evt.element.content = evt.element.column.businessObject;

      var template = domify(typeTemplate);

      // initializing the comboBox
      var comboBox = new ComboBox({
        label: 'Type',
        classNames: [ 'dmn-combobox', 'datatype' ],
        options: [ 'string', 'boolean', 'integer', 'long', 'double', 'date' ],
        dropdownClassNames: [ 'dmn-combobox-suggestions' ]
      });

      comboBox.addEventListener('valueChanged', function(valueEvent) {
        if (valueEvent.oldValue !== valueEvent.newValue) {
          eventBus.fire('typeRow.editDataType', {
            element: evt.element,
            dataType: valueEvent.newValue
          });

          graphicsFactory.update('column', evt.element.column, elementRegistry.getGraphics(evt.element.column));
        }
      });

      // add comboBox to the template
      template.insertBefore(
        comboBox.getNode(),
        template.firstChild
      );

      // set the complex property to initialize complex-cell behavior
      evt.element.complex = {
        className: 'dmn-clausevalues-setter',
        template: template,
        element: evt.element,
        comboBox: comboBox,
        type: 'type',
        offset: {
          x: 0,
          y: OFFSET_Y
        }
      };

      graphicsFactory.update('cell', evt.element, elementRegistry.getGraphics(evt.element));
    }
  });


  // whenever an type cell is opened, we have to position the template, because the x offset changes
  // over time, when columns are added and deleted
  eventBus.on('complexCell.open', function(evt) {
    var config = evt.config;

    if (config.type === 'type') {
      var gfx = elementRegistry.getGraphics(config.element),
          // feed the values to the template and combobox
          content = config.element.content;

      if (content.inputExpression) {
        config.comboBox.setValue(content.inputExpression.typeRef);
      } else {
        config.comboBox.setValue(content.typeRef);
      }

      var template = config.template;

      assign(template.parentNode.style, {
        left: (gfx.offsetLeft + gfx.offsetWidth + OFFSET_X) + 'px'
      });

      // disable all input fields if editing is not allowed
      if (!rules.allowed('dataType.edit')) {
        config.comboBox.disable();

        // also set a disabled css class on the template
        domClasses(template.parentNode).add('read-only');
      }
    }
  });

}

TypeRow.$inject = [ 'eventBus', 'sheet', 'elementRegistry', 'graphicsFactory', 'complexCell', 'rules' ];

module.exports = TypeRow;

TypeRow.prototype.getRow = function() {
  return this.row;
};
