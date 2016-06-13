/*global $*/
var iframeOffsetTop = 61
var iframeOffsetLeft = 0

function ControlsHandler () {
  this.$currentElement = undefined
  this.sliceSize = 3
  this.elementsTree = []
  this.outlines = []
  this.$controlsContainer = null
  this.$controlsList = null
}

ControlsHandler.prototype.showOutline = function ($el) {
  if ($el.data('vcElement') === undefined) {
    $el = $el.closest('[data-vc-element]')
  }

  if (!this.$currentElement || $el[ 0 ] !== this.$currentElement[ 0 ]) {
    this.$currentElement = $el
    this.updateElementsTree()
    this.drawOutlines()
    this.drawControls()
  }

  return this
}

ControlsHandler.prototype.hideOutline = function () {
  var outlines = this.getOutlines()
  for (var i in outlines) {
    outlines[ i ].css({
      'display': 'none'
    })
  }
  if (this.$currentElement !== undefined) {
    this.$currentElement = undefined
    this.clearElementsTree()
    this.removeControls()
  }

  return this
}

ControlsHandler.prototype.getElementsTree = function () {
  if (!this.elementsTree.length) {
    this.updateElementsTree()
  }
  return this.elementsTree
}

ControlsHandler.prototype.updateElementsTree = function () {
  var _this = this

  this.clearElementsTree()

  if (this.$currentElement === undefined) {
    return this
  }

  this.elementsTree.push(this.$currentElement)
  this.$currentElement.parents('[data-vc-element]').each(function () {
    _this.elementsTree.push($(this))
  })
  this.elementsTree = this.elementsTree.slice(0, this.sliceSize)
  this.elementsTree.reverse()

  return this
}

ControlsHandler.prototype.clearElementsTree = function () {
  this.elementsTree = []

  return this
}

ControlsHandler.prototype.getOutlines = function () {
  // Here comes wrapper for controls
  var controlsWrapper = document.getElementById('vcv-ui-controls-container')
  if (this.outlines.length < this.sliceSize) {
    var $outline
    $(controlsWrapper).find('.vcv-ui-outline').remove()
    this.outlines = []
    for (var i in this.getElementsTree()) {
      // todo: refactor, color is based on react component
      $outline = $('<svg class="vcv-ui-outline vcv-ui-outline-type-index-' + i + '"></svg>')
      this.outlines.push($outline)
      $outline.appendTo(controlsWrapper)
    }
  }
  return this.outlines
}

ControlsHandler.prototype.drawOutlines = function () {
  let outlines = this.getOutlines()
  let elemenstsTree = this.getElementsTree()
  let posLeft, posTop, width, height

  for (var i in outlines) {
    if (elemenstsTree[ i ] === undefined) {
      outlines[ i ].css({
        'display': 'none'
      })
    } else {
      posTop = elemenstsTree[ i ].offset().top + iframeOffsetTop - this.$currentElement[0].ownerDocument.defaultView.pageYOffset
      posLeft = elemenstsTree[ i ].offset().left + iframeOffsetLeft
      width = elemenstsTree[ i ].outerWidth()
      height = elemenstsTree[ i ].outerHeight()
      outlines[ i ].css({
        'top': posTop,
        'left': posLeft,
        'width': width,
        'height': height,
        'display': ''
      })
    }
  }

  this.setControlsPosition()

  return this
}

ControlsHandler.prototype.drawControls = function () {
  let elemenstsTree = this.getElementsTree()
  let $controlElement, $dropdownContent, $controlAction
  if (!this.$controlsContainer) {
    // Here comes wrapper for controls
    var controlsWrapper = $('#vcv-ui-controls-container')
    /* vcv-ui-controls-o-inset for inset controls
     * vcv-ui-controls-o-controls-left to stick controls to left side
     */
    this.$controlsContainer = $('<div class="vcv-ui-outline-controls-container"/>')
    this.$controlsContainer.appendTo(controlsWrapper)
  }

  if (!this.$controlsList) {
    this.$controlsList = $('<nav class="vcv-ui-outline-controls" />')
    this.$controlsList.appendTo(this.$controlsContainer)
  }

  this.$controlsList.html('')

  // add tree layout button
  if (elemenstsTree.length < this.$currentElement.parents('[data-vc-element]').length) {
    $controlElement = $('<a href="#" class="vcv-ui-outline-control" data-vc-control-event="tree-layout:show"/>')
    $('<span  class="vcv-ui-outline-control-content">' +
      '<i class="vcv-ui-outline-control-icon vcv-ui-icon vcv-ui-icon-more-dots" ></i>' +
      '</span>').appendTo($controlElement)
    $controlElement.appendTo(this.$controlsList)
  }

  // add elements controld in dropdown
  for (var i in elemenstsTree) {
    /* vcv-ui-outline-control-dropdown-o-drop-up to open dropdown up
     * vcv-ui-outline-control-dropdown-o-drop-right to open dropdown rightr
     */
    $controlElement = $('<dl class="vcv-ui-outline-control-dropdown vcv-ui-outline-control-type-index-' + i + '"/>')
    $controlElement.appendTo(this.$controlsList)
    var elementId = elemenstsTree[ i ][ 0 ].getAttribute('data-vc-element')
    var isElementContainer = elemenstsTree[ i ][ 0 ].getAttribute('data-vcv-dropzone') === 'true'

    // add dropdown trigger
    $('<dt class="vcv-ui-outline-control-dropdown-trigger vcv-ui-outline-control">' +
      '<span  class="vcv-ui-outline-control-content" title="' + elemenstsTree[ i ][ 0 ].getAttribute('data-vc-name') + '">' +
      '<i class="vcv-ui-outline-control-icon vcv-ui-icon vcv-ui-icon-cog"></i>' +
      '</span>' +
      '</dt>').appendTo($controlElement)

    // add dropdown content
    $dropdownContent = $('<dd class="vcv-ui-outline-control-dropdown-content"/>')
    $dropdownContent.appendTo($controlElement)

    // add button
    if (isElementContainer) {
      $controlAction = $('<a href="#" class="vcv-ui-outline-control" data-vc-control-event="app:add" data-vc-element-id="' + elementId + '"/>')
      $('<span  class="vcv-ui-outline-control-content">' +
        '<i class="vcv-ui-outline-control-icon vcv-ui-icon vcv-ui-icon-add-thin" ></i>' +
        '<span class="vcv-ui-outline-control-label" >Add</span>' +
        '</span>').appendTo($controlAction)
      $controlAction.appendTo($dropdownContent)
    }

    // edit button
    $controlAction = $('<a href="#" class="vcv-ui-outline-control"' +
      ' data-vc-control-event="app:edit"' +
      ' data-vc-element-id="' + elementId + '"/>')
    $('<span  class="vcv-ui-outline-control-content">' +
      '<i class="vcv-ui-outline-control-icon vcv-ui-icon vcv-ui-icon-edit" ></i>' +
      '<span class="vcv-ui-outline-control-label" >Edit</span>' +
      '</span>').appendTo($controlAction)
    $controlAction.appendTo($dropdownContent)

    // clone button
    $controlAction = $('<a href="#" class="vcv-ui-outline-control"' +
      ' data-vc-control-event="data:clone"' +
      ' data-vc-element-id="' + elementId + '"/>')
    $('<span  class="vcv-ui-outline-control-content">' +
      '<i class="vcv-ui-outline-control-icon vcv-ui-icon vcv-ui-icon-copy" ></i>' +
      '<span class="vcv-ui-outline-control-label" >Clone</span>' +
      '</span>').appendTo($controlAction)
    $controlAction.appendTo($dropdownContent)

    // remove button
    $controlAction = $('<a href="#" class="vcv-ui-outline-control"' +
      ' data-vc-control-event="data:remove"' +
      ' data-vc-element-id="' + elementId + '"/>')
    $('<span  class="vcv-ui-outline-control-content">' +
      '<i class="vcv-ui-outline-control-icon vcv-ui-icon vcv-ui-icon-close-thin" ></i>' +
      '<span class="vcv-ui-outline-control-label" >Remove</span>' +
      '</span>').appendTo($controlAction)
    $controlAction.appendTo($dropdownContent)
  }

  this.setControlsPosition()
}

ControlsHandler.prototype.removeControls = function () {
  if (this.$controlsContainer) {
    this.$controlsContainer.remove()
    this.$controlsContainer = null
    this.$controlsList = null
  }

  return this
}

ControlsHandler.prototype.setControlsPosition = function () {
  var posTop, posLeft, width

  if (this.$currentElement !== undefined && this.$controlsContainer !== null) {
    posTop = this.$currentElement.offset().top + iframeOffsetTop - this.$currentElement[ 0 ].ownerDocument.defaultView.pageYOffset
    posLeft = this.$currentElement.offset().left + iframeOffsetLeft
    width = this.$currentElement.outerWidth()
    this.$controlsContainer.css({
      'top': posTop,
      'left': posLeft,
      'width': width
    })
  } else {
    this.removeControls()
  }
  return this
}
module.exports = new ControlsHandler()
