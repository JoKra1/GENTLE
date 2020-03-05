import React, { Component } from "react";
import Graph from "./Graph";
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
 
class NodeComponent extends Component {

  constructor(props){
    super(props);
    this.state = {counter:0};
    
  }

  updateCounter(){
    if(this.props.updateCondition){
        this.props.updateCounter(this.props.updateCondition,"");
    }
  }

  componentDidMount(){
    this.setState(this.state);

  }


  render() {
    return (
      <div>
        <div className="textBox">
          <p>{this.props.textDescription}</p>
        </div>
        <Graph fixed = {this.props.fixed} float = {(this.props.float? 1:0)} opac = {(this.props.opac? 1:0)} counter={this.props.counter} nodes={this.props.nodes} prevNodes = {this.props.prevNodes} links={this.props.links} foci={this.props.foci} prevFoci= {this.props.prevFoci} callBack={this.props.callBackNodes} collectHistory = {this.props.collectHistory} categories = {(this.props.categories? this.props.categories:[])}/>
        <div>{this.props.route ? <NavLink exact to ={this.props.route} onClick={this.updateCounter.bind(this)}><button id ="confirm_next">Confirm & Next</button></NavLink> : <div/>}</div>
      </div>
    );
  }
}
 
export default NodeComponent;