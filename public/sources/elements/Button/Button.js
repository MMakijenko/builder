var React = require('react');
var vcCake = require('vc-cake');
let Icon = require('../Icon/Icon');
let ElementDefaults = vcCake.getService('element').defaults;

var Button = React.createClass({
  render: function() {
    let {key, content, test, iconComponent, editor, ...other} = this.props;
    let IconDefaults = ElementDefaults.get('Icon');
    let IconProps = JSON.parse(iconComponent || null) || IconDefaults;

    return (<button type="button" className="vc-button-block " data-vc-test={test} key={key} {...other} {...editor}>
      <Icon {...IconProps} />{content}</button>);
  }
});
module.exports = Button;