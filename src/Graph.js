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
import * as d3 from "d3";
import ReactDOM from "react-dom";
import {isEqual} from 'underscore';




var width = 1;
var height = window.innerHeight *0.7;

class Graph extends Component{

  constructor(props){

   super(props);
   this.force = d3.forceSimulation()
   .force("charge", d3.forceManyBody(5))
   .nodes([])
   .force("link", d3.forceLink().distance(150)
                                .links([]));
  }

  dragstarted = (d) => {
    if (!d3.event.active) {
      this.force.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  }
  
  dragged = (d) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  dragended = (d) => {
    if(this.props.fixed) {
      this.props.callBack(d.key, d.fx, d.fy);
    } else {
        d.fx = null;
        d.fy = null;
    }
  }

  callback = (d, _this) => {
    this.force.alpha(0.2);
    this.props.callBack(d.key);
  }
  
  enterCycleNodes = (v3d) => {
    
    v3d.classed("node", true).call(d3.drag()
                                  .on("start", this.dragstarted)
                                  .on("drag", this.dragged)
                                  .on("end", this.dragended))
                             .style("opacity", (d) => (d.key === this.props.counter ? 0.65: 1)); //current node has 0.65 opacity
    
    v3d.append("circle")
        .attr("class", "Node_center")
        .attr("id", (d) => d.key)
        .attr("r", (d) => d.size)
        .style("fill", (d) => d.color)
        //.on("touchstart", function(d){d3.event.preventDefault(); console.log(d)})
        .on("touchstart", (d) => {d3.event.preventDefault();})
        .on("touch", (d) => {this.callback(d,this);})
        .on("click", (d) => {this.callback(d,this);});
                          
    v3d.append("circle")
        .attr("class", "Node_rel")
        .attr("id", (d) => 'rel_' + d.key)
        .attr("r", (d) => d.size +5)
        .style("stroke", (d) => d.categoryColor)
        .style("stroke-width","1.5%")
        .style("fill","none");

    v3d.append("text")
        .attr("class", "node_text")
        .attr("text-anchor", "middle")
        .attr("dy", ".3em")
        .attr("pointer-events", "none")
        .text((d) => d.name);

    v3d.append("text") 
        .attr("class", "float_text")
        .attr("text-anchor", "middle")
        .attr("dx", (window.innerWidth < 700 ? "1em": "5em"))
        .attr("dy", (window.innerWidth < 700 ? "1.5em": "5em"))
        .attr("pointer-events", "none")
        .text((d) => d.age);

    v3d.exit().remove();
    this.force.nodes(v3d).alphaTarget(0.3).restart();
  };

  enterCycleLinks = (v3d) => {
    //enter cycle d3 for links
    //optional data driven style paramaters can be included here, e.g. stroke-width
    v3d.classed('link', true);
    v3d.exit().remove();
  };
  
  updateVirtualD3 = (v3d, foci) => {
    //update Node position determined by foci
    var k = this.force.alpha();
    var fixed = this.props.fixed;
    this.force.nodes().forEach(function (d, i) {

       if (!fixed){
        d.y += (foci[i].y - d.y) *k;
        d.x += (foci[i].x - d.x)* k;
        }
      });
  
    v3d.selectAll('.node')
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("name", (d) => d.name)
            .attr("id", (d) => d.key)
            .attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
    v3d.selectAll('.link')
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);
  };
  
  
  componentDidMount() {
    this.virtualD3 = d3.select(ReactDOM.findDOMNode(this.refs.graph));
    this.force.on('tick', () => {
      // d3 handles rendering
      this.virtualD3.call(this.updateVirtualD3, JSON.parse(JSON.stringify(this.props.foci)));
    }); 
  }



  componentDidUpdate() {
    //Props need to remain Pure in React, Force would manipulate props, thus deep copy.
    let nodes = JSON.parse(JSON.stringify(this.props.nodes));
    let links = JSON.parse(JSON.stringify(this.props.links));
    let foci = JSON.parse(JSON.stringify(this.props.foci));
    let conditionNode = 0;
    let conditionFoci = 0;
    if(this.props.prevNodes.length !== this.props.nodes.length) {
      //simple test for equality
      conditionNode = 1;
    } else {
      for(let i = 0; i < this.props.nodes.length; ++i) {
        //more elaborate test
        if(!isEqual(this.props.prevNodes[i], nodes[i])) {
          conditionNode = 1;
          break;
        }
      }

    }
    if(conditionNode) {
      this.virtualD3 = d3.select(ReactDOM.findDOMNode(this.refs.graph));

      var vd3Nodes = this.virtualD3.selectAll('.node')
        .data(nodes, (node) => node.key);
      
      //Update & Enter
      vd3Nodes.select(".node_text").text((d) => d.name);
      vd3Nodes.select(".Node").style("fill", (d) => d.color);
      vd3Nodes.select(".Node_rel").style("stroke", (d) => d.categoryColor);

      vd3Nodes.enter().append('g').call(this.enterCycleNodes);
      //vd3Nodes.exit().remove();

      var vd3Links = this.virtualD3.selectAll('.link')
        .data(links, (link) => link.key);
      vd3Links.enter().insert('line', '.node').call(this.enterCycleLinks);
      //vd3Links.exit().remove();

      //If data changed but positions remained the same use static rendering as well
      //to prevent "fading in"

      if(this.props.prevFoci.length !== foci.length) {
        //simple test for equality
        conditionFoci = 1;
      } else {
        for(let i = 0; i < foci.length; ++i) {
          //more elaborate test
          if(!isEqual(this.props.prevFoci[i], foci[i])) {   
            conditionFoci = 1;
            break;
          }
        }
  
      }

      this.props.collectHistory(nodes, foci);
      this.force.nodes(nodes)
      this.force.force("link").links(links);

      if(!conditionFoci) {
        
        for(let i = this.force.alpha(); i > 0.005; i = i - 0.001) {
          //static rendering prevents "fading in"
          this.virtualD3.call(this.updateVirtualD3, foci);
        }
      } else{
        this.virtualD3.call(this.updateVirtualD3, foci);
      }

      this.force.restart();

    } else{
      //skip update just rerender
      var vd3Nodes = this.virtualD3.selectAll('.node')
      .data(nodes);
      var vd3Links = this.virtualD3.selectAll('.link')
        .data(links);
      vd3Nodes.enter().append('g').call(this.enterCycleNodes);
      vd3Links.enter().insert('line', '.node').call(this.enterCycleLinks);
      this.force.nodes(nodes);
      this.force.force("link").links(links);

      for(let i = this.force.alpha(); i > 0.005; i = i - 0.001) {
        //static rendering prevents "fading in"
        this.virtualD3.call(this.updateVirtualD3, foci);

      }
      this.force.restart();
      
    }

  }


  render() {
    if(document.getElementById("content")){
      width = document.getElementById("content").clientWidth
    }
    return (
      <div className="container">
      <svg width="100%" height={height} ref='graph'>
        <g id="boxes">
        {(this.props.categories ? this.props.categories.map( (category, i) => (
            <text key={category.key} x={category.x} y={category.y -10}>{category.text}</text>
          )):<g/>)}
          {(this.props.categories ? this.props.categories.map( (category, i) => (
            <rect className="CategoryBox" key={category.key} width={category.width} height={category.height} x={category.x} y={category.y} fill="transparent" stroke={category.color} strokeWidth="5"/>
          )):<g/>)}
        </g>
      </svg>
      </div>
    );
  }
};

export default Graph;