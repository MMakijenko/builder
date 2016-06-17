import {getService} from 'vc-cake'
import Item from './item'
const cook = getService('cook')
const $ = require('jquery')
const _ = require('lodash')
/**
 * Drag&drop builder.
 *
 * @param {string} container DOMNode to use as container
 * @param {Object} options Settings for Dnd builder to define how it should interact with layout
 * @constructor
 */
var Builder = function (container, options) {
  /**
   * Container to work with
   * @type {DOMNode}
   */
  this.container = container
  this.items = {}
  this.hover = ''
  this.dragingElement = null
  this.dragingElementObject = null
  this.currentElement = null
  this.frame = null
  this.position = null
  this.options = _.defaults(options, {
    cancelMove: false,
    moveCallback: function () {
    },
    startCallback: function () {
    },
    endCallback: function () {
    },
    document: document,
    offsetTop: 0,
    offsetLeft: 0
  })
}
Builder.prototype.init = function () {
  this.initContainer()
  this.buildHelper()
}
Builder.prototype.initContainer = function () {
  this.container.addEventListener('drag', this.handleDrag.bind(this), false)
}
Builder.prototype.addItem = function (id) {
  this.items[ id ] = new Item(id, this.options.document)
    .on('dragstart', this.handleDragStart.bind(this))
    .on('dragend', this.handleDragEnd.bind(this))
}
Builder.prototype.removeItem = function (id) {
  this.items[ id ]
    .off('dragstart', this.handleDragStart.bind(this))
    .off('dragend', this.handleDragEnd.bind(this))
  delete this.items[ id ]
}
Builder.prototype.watchMouse = function () {
  this.container.addEventListener('drag', _.debounce(this.handleDrag.bind(this), 150), false)
}
Builder.prototype.forgetMouse = function () {
  this.container.removeEventListener('drag', _.debounce(this.handleDrag.bind(this), 150), false)
}
/**
 * Helper
 */
Builder.prototype.buildHelper = function () {
  this.helper = this.options.document.createElement('div')
  this.helper.classList.add('vcv-drag-helper')
  this.options.document.body.appendChild(this.helper)
}
Builder.prototype.getHelper = function () {
  this.helper.classList.add('vcv-visible')
  return this.helper
}
Builder.prototype.hideHelper = function () {
  _.defer(function () {
    this.helper.classList.remove('vcv-visible')
  }.bind(this))
}
Builder.prototype.createFrame = function () {
  this.frame = document.createElement('svg')
  this.frame.id = 'vcv-dnd-frame'
  document.body.appendChild(this.frame)
}
Builder.prototype.removeFrame = function () {
  this.frame = null
  var frame = document.getElementById('vcv-dnd-frame')
  frame && document.body.removeChild(frame)
}
/**
 * Menage items
 */
Builder.prototype.renderControls = function () {
  _.defer(function () {
    Object.keys(this.items).forEach(function (key) {

    }, this)
  }.bind(this))
}
Builder.prototype.hideControls = function () {

}
Builder.prototype.checkItems = function (point) {
  let DOMelement = this.options.document.elementFromPoint(point.x, point.y)

  if (DOMelement && !DOMelement.getAttribute('data-vc-element')) {
    DOMelement = $(DOMelement).closest('[data-vc-element]')
  }
  let isElement = DOMelement && DOMelement.getAttribute && DOMelement.getAttribute('data-vc-element') !== this.dragingElementId
  if (!isElement) {
    return false
  }
  let id = DOMelement.getAttribute('data-vc-element')
  let parentId = $(DOMelement).parents('[data-vc-element]:first').attr('data-vc-element')
  let data = getService('document').get(id)
  let element = cook.get(data)
  let parentData = getService('document').get(parentId)
  let parentElement = cook.get(parentData)
  // console.log('parent: ' + parentElement.get('name'))
  // console.log('hover: ' + element.get('name'))
  if (element) {
    this.redrawFrame(DOMelement, point, {
      allowBeforeAfter: !parentElement || this.dragingElementObject.relatedTo(parentElement.containerFor()),
      allowAppend: element.containerFor() ? this.dragingElementObject.relatedTo(element.containerFor()) : false
    })
  }

  /* if (this.dragingElement.getAttribute('name') === 'Column') {
   this.redrawFrame(element, point, {
   allowBeforeAfter: element.getAttribute('name') === 'Column',
   allowAppend: element.getAttribute('name') === 'Row'
   })
   } else {
   this.redrawFrame(element, point, {
   allowBeforeAfter: element.getAttribute('name') !== 'Column',
   allowAppend: element.getAttribute('name') !== 'Row'
   })
   } */
}
Builder.prototype.redrawFrame = function (element, point, settings) {
  if (this.currentElement === element.getAttribute('data-vc-element')) {
    return false
  }
  this.currentElement = element.getAttribute('data-vc-element')
  this.frame.className = ''
  settings = _.defaults(settings || {}, {
    allowAppend: true,
    allowBeforeAfter: true
  })
  var rect = element.getBoundingClientRect()
  var offset = $(element).offset()
  var positionY = point.y - (rect.top + rect.height / 2)
  var positionX = point.x - (rect.left + rect.width / 2)
  var isContainer = element.getAttribute('type') === 'container'

  this.setFrameStyle(rect, offset)
  this.position = null
  if (
    settings.allowAppend === true &&
    isContainer &&
    $(element).find('[data-vc-element]').length === 0 &&
    Math.abs(positionY) / rect.height < 0.3
  ) {
    this.setPosition('append')
    this.frame.classList.add('vcv-dnd-frame-center')
  } else if (settings.allowBeforeAfter === true && Math.abs(positionX) / rect.width > Math.abs(positionY) / rect.height) {
    this.setPosition(positionX > 0 ? 'after' : 'before')
    this.frame.classList.add('vcv-dnd-frame-' + (this.position === 'after' ? 'right' : 'left'))
  } else if (settings.allowBeforeAfter === true) {
    this.setPosition(positionY > 0 ? 'after' : 'before')
    this.frame.classList.add('vcv-dnd-frame-' + (this.position === 'after' ? 'bottom' : 'top'))
  }
  window.setTimeout(function () {
    this.frame && this.frame.classList.add('vcv-js-show')
  }.bind(this), 0)
}
Builder.prototype.setPosition = function (position) {
  this.position = position
}
Builder.prototype.setFrameStyle = function (rect, offset) {
  this.frame.setAttribute('style', _.reduce({
      width: rect.width,
      height: rect.height,
      top: offset.top + this.depositionTop(),
      left: offset.left + this.depositionLeft()
    },
    function (result, value, key) {
      return result + key + ':' + value + 'px;'
    },
    ''
  ))
}
Builder.prototype.depositionTop = function () {
  return this.options.offsetTop - this.options.document.body.scrollTop
}
Builder.prototype.depositionLeft = function () {
  return this.options.offsetLeft - this.options.document.body.scrollLeft
}
/**
 * Drag handlers
 */
Builder.prototype.handleDrag = function (e) {
  this.frame && this.checkItems({ x: e.clientX, y: e.clientY })
}
/**
 * @param {object} e Handled event
 */
Builder.prototype.handleDragStart = function (e) {
  if (e.stopPropagation) {
    e.stopPropagation()
  }
  this.dragingElement = e.currentTarget
  this.dragingElementId = this.dragingElement.getAttribute('data-vc-element')
  if (e.dataTransfer) {
    e.dataTransfer.setDragImage(this.getHelper(), 20, 20)
    e.dataTransfer.effectAllowed = 'copy' // only dropEffect='copy' will be droppable
    e.dataTransfer.setData('Text', this.dragingElementId) // required otherwise doesn't work
    this.hideHelper()
  }
  let data = getService('document').get(this.dragingElementId)
  this.dragingElementObject = cook.get(data)

  this.watchMouse()
  this.createFrame()
  this.renderControls()
  if (typeof this.options.startCallback === 'function') {
    this.options.startCallback(this.dragingElement)
  }
}
Builder.prototype.handleDragEnd = function (e) {
  if (e.stopPropagation) {
    e.stopPropagation()
  }
  this.forgetMouse()
  this.hideControls()
  this.removeFrame()
  if (typeof this.options.endCallback === 'function') {
    this.options.endCallback(this.dragingElement)
  }
  if (typeof this.options.moveCallback === 'function') {
    this.position && this.options.moveCallback(
      this.dragingElement.getAttribute('data-vc-element'),
      this.position,
      this.currentElement
    )
  }
  this.dragingElement = null
  this.currentElement = null
  this.dragingElementObject = null
  this.position = null
}
/**
 * Global Constructor
 * @type {Builder}
 */
module.exports = Builder
