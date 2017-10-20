import React from 'react';

export class Tabs extends React.Component {
  constructor(){
    super();
    this.state = {selected: 'None'};
  }
  selectTab(selected){
    this.setState({selected});
  }
  render(){
    // this.props.children is just a description of the children, altering it does not alter the child elements
    let items = React.Children
      .map(this.props.children, (child) =>
        React.cloneElement(
          child,
          { onClick: this.selectTab.bind(this, child.props.value) }
        )
      );
    let marginBottom = {marginBottom: "20px"};
    return (
      <div id="navcontainer">
        <ul id="navlist" className="tables">{items}</ul>
        <div style={marginBottom}>{this.state.selected} content</div>
      </div>
    )
  }
}
