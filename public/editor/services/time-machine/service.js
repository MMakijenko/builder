var vcCake = require('vc-cake')
var TimeMachine = {
  stack: [],
  stackPosition: 0,
  zeroState: {},
  add: function (data) {
    if (this.can('redo')) {
      this.stack = this.stack.slice(0, this.stackPosition)
    }
    this.stack.push(data)
    this.stackPosition = this.stack.length
  },
  can: function (what) {
    var result = false
    if (what === 'undo') {
      result = this.stack.length > 0 && this.stackPosition > 0
    } else if (what === 'redo') {
      result = this.stack.length > 0 && this.stackPosition < this.stack.length
    }
    return result
  },
  undo: function () {
    if (this.can('undo')) {
      this.stackPosition -= 1
    }
  },
  redo: function () {
    if (this.can('redo')) {
      this.stackPosition += 1
    }
  },
  set: function (index) {
    if (this.stackPosition < index) {
      this.stack = this.stack.slice(index - this.stackPosition)
      return true
    }
    return false
  },
  get: function () {
    if (this.stackPosition < 1) {
      return this.zeroState
    } else {
      return this.stack[ this.stackPosition - 1 ]
    }
  },
  setZeroState: function (data) {
    this.zeroState = data
  }
}
var Module = module.exports = {
  add: function (document) {
    TimeMachine.add(document)
  },
  getCurrentPosition: function () {
    return TimeMachine.stackPosition
  },
  undo: function () {
    TimeMachine.undo()
    return this.get()
  },
  redo: function () {
    TimeMachine.redo()
    return this.get()
  },
  get: function () {
    return TimeMachine.get()
  },
  canUndo: function () {
    return TimeMachine.can('undo')
  },
  canRedo: function () {
    return TimeMachine.can('redo')
  },
  setZeroState: function (data) {
    TimeMachine.setZeroState(data)
  }
}
vcCake.addService('time-machine', Module)
