/* 
Copyright 2019 J.Krause B.F.Jeronimus>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import React, { Component } from "react";
import Graph from "./Graph";
 
class NodeSliderComponent extends Component {

  constructor(props){
    super(props);
    this.state = {counter:0,
                 value:1};

    this.value = 1;
    
  }

  componentDidMount(){
    let nodes = JSON.parse(JSON.stringify(this.props.nodes));
    if(this.props.counter < nodes.length){
      let updateValue = JSON.parse(JSON.stringify(this.props.sliderUpdate));
      this.setState({value:updateValue});
    } else {
      this.setState(this.state);
    }

  }

  componentDidUpdate(){
    
  }

  updateSlider = (event) => {
    this.setState({value:event.target.value});
  }

  updateCounter = (event) => {
      this.props.callBackButton(this.props.counter, this.state.value);
  }



  render() {
    return (
      <div>
        <div className="textBox">
          <p>{this.props.textDescription}</p>
        </div>
        <Graph counter={this.props.counter} nodes={this.props.nodes} prevNodes = {this.props.prevNodes} links={this.props.links} foci={this.props.foci} prevFoci= {this.props.prevFoci} callBack={this.props.callBackNodes} collectHistory = {this.props.collectHistory}/>
        <div className="container" id="userInputStd">
            <p className="sliderValue">{this.state.value}</p>
            <input className="slider" type="range" min="1" max="100" value={this.state.value} onChange={this.updateSlider}/>
            <button id="confirm" onClick={this.updateCounter}>Bevestigen</button>
        </div>
      </div>
    );
  }
}
 
export default NodeSliderComponent;