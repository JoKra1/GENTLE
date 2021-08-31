import React, { Component } from "react";
import Graph from "./Graph";
import {
    Route,
    NavLink,
    HashRouter
  } from "react-router-dom";

import {
  MOBILE
} from "./Graph";

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
    this.sliderRef = React.createRef();
    this.value = 1;
    
  }

  /**
   * Calls back to main component to store data.
   */

   transferCallBack(){
    if(this.props.transferCallBack) {
      this.props.transferCallBack();
    }
  } 

  componentDidMount(){
    let updateValue = this.props.sliderUpdateValue;
    this.setState({value:updateValue});

    if (!MOBILE) {
      this.sliderRef.current.focus();
    }
    
    document.addEventListener("keydown",this.keypress_handler);
  }

  componentWillUnmount(){
    document.removeEventListener("keydown",this.keypress_handler);
  }

  checkCondition(event){
    let callbackMethod = this.props.callBackButton[0];
    let callbackKey = this.props.callBackButton[1];
    if(this.props.counter > (this.props.nodes.length - 1)) {
      callbackMethod(callbackKey,this.props.counter,this.state.value);
      this.transferCallBack();
      return true
    } else {
      event.preventDefault();
      callbackMethod(callbackKey,this.props.counter,this.state.value);
    }

  }

  updateSlider = (event) => {
    this.setState({value:event.target.value});
  }

  /**
   * Handles usage of the Enter key.
   * see: https://newbedev.com/how-to-submit-a-form-using-enter-key-in-react-js
   * To-Do: the example makes use of .code, which seems to be better.
   * @param {event} event 
   */
  keypress_handler(event) {
    if (event.keyCode == 13) {
      document.getElementById("confirm_link").click()
    }
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
                {MOBILE ? <div>
                          <p className="sliderValue">{this.state.value}</p>
                          <input className="slider" type="range" min="1" max="100" value={this.state.value} onChange={this.updateSlider}/>
                         </div>
                            :
                         <div>
                          <input className="sliderValue" type="number" min="1" max="100" value={this.state.value} onChange={this.updateSlider} ref={this.sliderRef}/>
                         </div>}
                
                <NavLink id="confirm_link"
                       exact to = {this.props.route}
                       onClick={this.checkCondition.bind(this)}>
                <button style={{"margin": (MOBILE? 0 : "auto"),
                                "display": (MOBILE? "inline" : "block")}} id="confirm" >
                                  {this.props.counter > (this.props.nodes.length - 1) ? "Confirm & Next":"Confirm"}
                </button>
              </NavLink>
            </div>
        </div>
      </HashRouter>
    );
  }
}
 
export default NodeSliderComponent;