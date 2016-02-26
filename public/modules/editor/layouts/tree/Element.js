var React = require('react');
var Utils = require('../../../../helpers/Utils');
var Mediator = require('../../../../helpers/Mediator');
var ElementComponents = require('../../../../helpers/ElementComponents');
var classNames = require('classnames');

var Element = React.createClass(Mediator.installTo({
    getInitialState: function() {
      return {
        childExpand: true,
        hasChild: false
      }
    },
    clickChildExpand: function() {
      this.setState({childExpand: !this.state.childExpand});
    },
    clickAddChild: function(e) {
      e.preventDefault();
      this.publish('app:add', this.props.element.id);
    },
    clickClone: function(e) {
      e.preventDefault();
      this.publish('data:clone', this.props.element.getAttribute('id'));
    },
    clickEdit: function(e) {
      e.preventDefault();
      this.publish('app:edit', this.props.element);
    },
    clickDelete: function(e) {
      e.preventDefault();
      this.publish('data:remove', this.props.element.getAttribute('id'));
    },
    getContent: function() {
        if(this.props.data.length) {
			let level = this.props.level + 1;
            let elementsList = this.props.data.map(function( element ) {
                let data = Array.prototype.slice.call(element.childNodes);
                return <Element element={element} data={data} key={element.getAttribute('id')} level={level}/>;
            });
            return <ul className="vc-ui-tree-layout-node">{elementsList}</ul>;
        }
        return '';
    },
    render: function() {
        var element = this.props.element;
		var ElementComponent = ElementComponents.get(element);
		var treeChildClass = classNames({
			'vc-ui-tree-layout-node-child': true,
			'vc-ui-tree-layout-node-expand': this.state.childExpand,
			'vc-ui-tree-layout-node-state-draft': false
		});
		var child = 'container' == ElementComponent.type ? this.getContent() : ''; // yes == not === it is required :P
		this.state.hasChild = !!child;
		var addChildControl = 'container' == ElementComponent.type ? <a className="vc-ui-tree-layout-control-action" title="Add" onClick={this.clickAddChild}><i className="vc-ui-icon vc-ui-icon-add-thin"></i></a> : false;
		var expandTrigger = this.state.hasChild ?
				<i className="vc-ui-tree-layout-node-expand-trigger vc-ui-icon vc-ui-icon-expand"
						onClick={this.clickChildExpand}>
				</i> : '';
		var childControls =
			<span className="vc-ui-tree-layout-control-actions">
				{addChildControl}
				<a className="vc-ui-tree-layout-control-action" title="Edit" onClick={this.clickEdit}><i className="vc-ui-icon vc-ui-icon-edit"></i></a>
				<a className="vc-ui-tree-layout-control-action" title="Delete" onClick={this.clickDelete}><i className="vc-ui-icon vc-ui-icon-close-thin"></i></a>
				<a className="vc-ui-tree-layout-control-action" title="Clone" onClick={this.clickClone}><i className="vc-ui-icon vc-ui-icon-copy"></i></a>
			</span>;
        return <li className={treeChildClass}>
          <div className="vc-ui-tree-layout-control" style={{paddingLeft: this.props.level + 1 + 'em'}}>
            <div className="vc-ui-tree-layout-control-drag-handler"><i className="vc-ui-tree-layout-control-drag-handler-icon vc-ui-icon vc-ui-icon-drag-dots"></i></div>
            <div className="vc-ui-tree-layout-control-content">
              {expandTrigger}
              <span className="vc-ui-tree-layout-control-icon">
                 <i className="vc-ui-icon vc-ui-icon-bug"></i>
              </span>
              <span className="vc-ui-tree-layout-control-label">
                <span>{ElementComponent.name.toString()}</span>
              </span>
              {childControls}
            </div>
          </div>
          {child}
        </li>;
    }
}));
module.exports = Element;