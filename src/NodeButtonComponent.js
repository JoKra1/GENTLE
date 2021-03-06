import React, { Component } from "react";
import Graph from "./Graph";
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";

/**
 * Screen design to generate names for nodes/alters.
 * 
 * References:
 * 
 * For further information on references in React check:
 * https://reactjs.org/docs/refs-and-the-dom.html
 */

class NodeButtonComponent extends Component {

  constructor(props){
    super(props);
    this.state = {counter:0};
    this.input = React.createRef();
    this.counter = 0;
    
  }

  /**
   * Checks whether enough nodes have been generated yet.
   * @param {*} event 
   * @returns bool, whether to prepare for next route or not
   */
  checkCondition(event){
    if(this.props.counter > (this.props.max - 1)) {
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
        <Graph counter={this.props.counter}
               nodes={this.props.nodes}
               prevNodes = {this.props.prevNodes}
               links={this.props.links}
               foci={this.props.foci}
               prevFoci= {this.props.prevFoci}
               callBack={this.props.callBackNodes}
               collectHistory = {this.props.collectHistory}/>

        <div className="container" id="userInputStd">
              <input id="usr" type="text" placeholder="Name" ref={this.input}/>
              <NavLink id="confirm_link"
                       exact to = {this.props.route}
                       onClick={this.checkCondition.bind(this)}>
                <button id="confirm" >{this.props.counter > (this.props.max - 1) ? "Confirm & Next":"Confirm"}</button>
              </NavLink>
        </div>
      </div>
      </HashRouter>
    );
  }
}
 
export default NodeButtonComponent;
