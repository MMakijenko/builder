/*eslint jsx-quotes: [2, "prefer-double"]*/
var vcCake = require('vc-cake')
vcCake.add('ui-navbar-separator', function (api) {
  var React = require('react')
  var Control = React.createClass({
    render: function () {
      return <span className="vcv-ui-navbar-control-separator vcv-ui-pull-end"></span>
    }
  })
  api.module('ui-navbar').do('addElement', 'Separator', Control)
})
