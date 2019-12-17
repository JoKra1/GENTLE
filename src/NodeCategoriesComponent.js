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
    this.props.callBackButton(this.props.counter, id, text);
}


  render() {
    
    return (
      <div>
        <div className="textBox">
          <p>{this.props.textDescription}</p>
        </div>
        <Graph counter={this.props.counter} nodes={this.props.nodes} prevNodes = {this.props.prevNodes} links={this.props.links} foci={this.props.foci} prevFoci= {this.props.prevFoci} callBack={this.props.callBackNodes} collectHistory = {this.props.collectHistory}/>
        <div className="container" id="userInputStd">
          {this.props.categories.map( (category, i) => (
              <button className="categoryButton"  key = {category.key} type="button" style={{background:category.color}} value={category.text} onClick={() => this.updateCounter(category.key,category.text)}>{category.text}</button>
          ))}
        </div>
      </div>
    );
  }
}
 
export default NodeCategoriesComponent;