import React, { Component } from "react";
import Graph from "./Graph";
import {
    Route,
    NavLink,
    HashRouter
  } from "react-router-dom";

/**
 * Screen design that involves a slider to assign
 * numeric values for each alter. For example useful to
 * assign age values to each alter.
 * 
 * References:
 * 
 * For further information on forms in React check:
 * https://reactjs.org/docs/forms.html
 */

class NodeSliderComponent extends Component {

  constructor(props){
    super(props);
    this.state = {counter:0,
                 value:1};

    this.value = 1;
    
  }

  componentDidMount(){
    let updateValue = this.props.sliderUpdateValue;
    this.setState({value:updateValue});
    

  }

  checkCondition(event){
    if(this.props.counter > this.props.max) {
      this.props.callBackButton(this.props.counter,this.state.value);
      return true
    } else {
      event.preventDefault();
      this.props.callBackButton(this.props.counter,this.state.value);
    }

  }

  updateSlider = (event) => {
    this.setState({value:event.target.value});
  }



  render() {
    return (
      <HashRouter>
        <div>
            <div className="textBox">
            <p>{this.props.textDescription}</p>
            </div>
            <Graph counter={this.props.counter}
                   nodes={this.props.nodes}
                   prevNodes = {this.props.prevNodes}
                   links={this.props.links}
                   foci={this.props.foci}
                   prevFoci= {this.props.prevFoci}
                   callBack={this.props.callBackNodes}
                   collectHistory = {this.props.collectHistory}/>

            <div className="container" id="userInputStd">
                <p className="sliderValue">{this.state.value}</p>
                <input className="slider" type="range" min="1" max="100" value={this.state.value} onChange={this.updateSlider}/>
                <NavLink id="confirm_link"
                       exact to = {this.props.route}
                       onClick={this.checkCondition.bind(this)}>
                <button id="confirm" >{this.props.counter > this.props.nodes.length ? "Confirm & Next":"Confirm"}</button>
              </NavLink>
            </div>
        </div>
      </HashRouter>
    );
  }
}
 
export default NodeSliderComponent;