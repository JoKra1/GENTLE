import React, { Component } from "react";
import Graph from "./Graph";
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
 
class NodeButtonComponent extends Component {

  constructor(props){
    super(props);
    this.state = {counter:0};
    this.input = React.createRef();
    this.counter = 0;
  }

  checkCondition(event){
    if(this.props.counter > this.props.max) {
      this.props.callBackButton(this.input.current.value);
      return true
    } else {
      event.preventDefault();
      this.props.callBackButton(this.input.current.value);
    }

  }

  componentDidMount(){
    this.setState(this.state);

  }

  render() {
    
    return (
      <HashRouter>
      <div>
        <div className="textBox">
          <p>{this.props.textDescription}</p>
        </div>
        <Graph counter={this.props.counter} nodes={this.props.nodes} prevNodes = {this.props.prevNodes} links={this.props.links} foci={this.props.foci} prevFoci= {this.props.prevFoci} callBack={this.props.callBackNodes} collectHistory = {this.props.collectHistory}/>
        <div className="container" id="userInputStd">
              <input id="usr" type="text" placeholder="Name" ref={this.input}/>
              <NavLink exact to = {this.props.route} onClick={this.checkCondition.bind(this)}><button id="confirm" >{this.props.counter > this.props.max ? "Confirm & Next":"Confirm"}</button></NavLink>
        </div>
      </div>
      </HashRouter>
    );
  }
}
 
export default NodeButtonComponent;