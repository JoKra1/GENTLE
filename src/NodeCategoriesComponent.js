import React, { Component } from "react";
import Graph from "./Graph";
import {
    Route,
    NavLink,
    HashRouter
  } from "react-router-dom";

/**
 * Screen design to assign some categories to nodes.
 * 
 */

class NodeCategoriesComponent extends Component {

  constructor(props){
    super(props);
    this.state = {counter:0};
    this.counter = 0;
    
  }

  componentDidMount(){
    this.setState(this.state);

  }

  updateCounter = (id, text) => {
    let callbackMethod = this.props.callBackButton[0];
    let callbackKey = this.props.callBackButton[1];
    let callbackKeyColor = this.props.callBackButton[2];
    let categories = this.props.callBackButton[3];
    callbackMethod(callbackKey,callbackKeyColor,categories,this.props.counter, id, text);
}


  render() {
    
    return (
      <HashRouter>
        <div>
          <div className="textBox">
            <p>{this.props.textDescription}</p>
          </div>
          <Graph fixed = {this.props.fixed}
                 float = {(this.props.float? 1:0)}
                 opac = {(this.props.opac? 1:0)}
                 counter={this.props.counter}
                 nodes={this.props.nodes}
                 prevNodes = {this.props.prevNodes}
                 links={this.props.links}
                 foci={this.props.foci}
                 prevFoci= {this.props.prevFoci}
                 callBack={this.props.callBackNodes}
                 collectHistory = {this.props.collectHistory}
                 categories = {[]}/>
          <div className="container" id="userInputStd">
            {this.props.categories.map( (category, i) => (
                <button className="categoryButton" 
                        key = {category.key}
                        type="button"
                        style={{background:category.color}}
                        value={category.text}
                        onClick={() => this.updateCounter(category.key,category.text)}>
                      {category.text}
                </button>
            ))}
          </div>
          <div>
            {this.props.route ? <NavLink exact to ={this.props.route}>
                                    <button id ="confirm_next">Confirm & Next</button>
                                </NavLink> : <div/>}
          </div>
        </div>
      </HashRouter>
    );
  }
}
 
export default NodeCategoriesComponent;