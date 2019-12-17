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
 
class NodeComponent extends Component {

  constructor(props){
    super(props);
    this.state = {counter:0};
    
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
        <Graph fixed = {this.props.fixed} counter={this.props.counter} nodes={this.props.nodes} prevNodes = {this.props.prevNodes} links={this.props.links} foci={this.props.foci} prevFoci= {this.props.prevFoci} callBack={this.props.callBackNodes} collectHistory = {this.props.collectHistory} categories = {(this.props.categories? this.props.categories:[])}/>
      </div>
    );
  }
}
 
export default NodeComponent;