import React, { Component } from "react";
import * as d3 from 'd3';
import ReactDOM from "react-dom";
import {isEqual} from 'underscore';



var width = 1;
var height = window.innerHeight *0.7;

class Graph extends Component{

  constructor(props){

    super(props);
    this.force = d3.layout.force()
    .charge(-1)
    .gravity(0.01)
    .linkDistance(150)
    .linkStrength(1)
    .size([width, height]);
    this.conditionNode = 1;
    this.force.drag()
    .on("dragend", (e) => this.dragCallBack(e))
  }


  dragCallBack = (e) => {
    //for fixed nodes
    if(this.props.fixed) {
      this.props.callBack(e.key, e.x, e.y);
    }

  }

  callback = (d, _this) => {
    let nodes = JSON.parse(JSON.stringify(this.force.nodes()));
    this.force.alpha(0.2);
    //extension of callback compared to static network component because
    //information about the nodes is required.
    this.props.callBack(d.key, nodes);
  }
  
  enterCycleNodes = (v3d) => {
    //enter cycle d3 for nodes
    this.force.start();
    if(this.props.opac) {
      v3d.classed('node', true)
      .call(this.force.drag)
      .style("opacity", (d) => (d.x/1000 > 0.1? d.x/1000: 0.1)); //current node has 0.65 opacity
    } else{
        v3d.classed('node', true)
            .call(this.force.drag)
            .style("opacity", (d) => (d.key === this.props.counter ? 0.65: 1)); //current node has 0.65 opacity
    }
    v3d.append("circle")
        .attr("class", "Node_center")
        .attr("id", (d) => d.key)
        .attr("r", (d) => d.size)
        .style("fill", (d) => d.color)
        //.on("touchstart", function(d){d3.event.preventDefault(); console.log(d)})
        .on("touchstart", (d) => {d3.event.preventDefault();})
        .on("touchend", (d) => {this.callback(d,this);})
        .on("click", (d) => {this.callback(d,this);});
        
  
    v3d.append("circle")
        .attr("class", "Node_rel")
        .attr("id", (d) => 'rel_' + d.key)
        .attr("r", (d) => (d.size == 10 ? d.size +1 : d.size +5))
        .style("stroke", (d) => d.categoryColor)
        .style("stroke-width",(d) => (d.size == 10 ? "0.5%":"1.5%"))
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
        .attr("dx", (window.innerWidth < 700 ? "1em": "1.25em"))
        .attr("dy", (window.innerWidth < 700 ? "1.5em": "1.25em"))
        .attr("pointer-events", "none")
        .text((d) => d.age);

  };

  enterCycleLinks = (v3d) => {
    //enter cycle d3 for links
    //optional data driven style paramaters can be included here, e.g. stroke-width
    v3d.classed('link', true);
  };
  
  updateVirtualD3 = (v3d, foci) => {
    //update Node position determined by foci
    var k = this.force.alpha();

    this.force.nodes().forEach(function (d, i) {
       if ((!d.fixed & !d.float)){
        d.y += (foci[i].y - d.y) *k;
        d.x += (foci[i].x - d.x)* k;
        }

        
        if(d.x < 0) {
          d.x = 35;
        } else if (d.x > 1077) {
          d.x = 1077-25;
        }

        if(d.y < 0) {
          d.y = 35;
        } else if (d.y > 1077) {
          d.y = 1077 - 25;
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
    //console.log("this.props.links: ", this.props.links);
    this.virtualD3 = d3.select(ReactDOM.findDOMNode(this.refs.graph));
    this.force.on('tick', (e) => {
      // d3 handles rendering
      this.virtualD3.call(this.updateVirtualD3, JSON.parse(JSON.stringify(this.props.foci)));
    }); 
  }



  componentDidUpdate() {
    //Props need to remain Pure in React, Force would manipulate props, thus deep copy.
    //console.log(this.props.nodes, this.props.links);
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
      vd3Nodes.exit().remove();
      var vd3Links = this.virtualD3.selectAll('.link')
        .data(links, (link) => link.key);
      vd3Links.enter().insert('line', '.node').call(this.enterCycleLinks);
      vd3Links.exit().remove();

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

      if(this.props.float) {
        //Manipulate gravity to prevent Nodes from escaping.
        this.force.gravity(0.25);
        conditionFoci = 0;
        //Manipulate charge. Higher charge for those Nodes in the Network
        //minimizing the chance that links/nodes are overlapping.
        this.force.charge((d) =>((d.float ? - 1500:-30)))
        //Manipulate Link Distance for each node individually. Nodes with more
        //Links receive longer distances to allow for a better distribution of the
        //network. Those parameters should be tuned depending on the network size.
        //The link property is determined in the callback.
        this.force.linkDistance(function(d,i) {

                                  let link = (d.source.link > d.target.link ?
                                              d.source.link *10: d.target.link *10)
                                  if (link < 35) {
                                      return 35;
                                  } else if (link > 55) {
                                      return 55;
                                  } else {
                                      return link;
                                  }
                                })
      }

      this.props.collectHistory(nodes, foci);
      this.force.nodes(nodes).links(links);

      if(!conditionFoci) {
        for(let i = this.force.alpha(); i > 0.005; i = i - 0.001) {

          //static rendering prevents "fading in"
          this.virtualD3.call(this.updateVirtualD3,foci);
        }
      } else{
        this.virtualD3.call(this.updateVirtualD3,foci);
        
      }
      this.force.start();

    } else{
      //skip update just rerender
      var vd3Nodes = this.virtualD3.selectAll('.node')
      .data(nodes);
      var vd3Links = this.virtualD3.selectAll('.link')
        .data(links);
      vd3Nodes.enter().append('g').call(this.enterCycleNodes);
      vd3Links.enter().insert('line', '.node').call(this.enterCycleLinks);
      this.force.nodes(nodes).links(links);

      for(let i = this.force.alpha(); i > 0.005; i = i - 0.001) {
        //static rendering prevents "fading in"
        this.virtualD3.call(this.updateVirtualD3,foci);
      }
      this.force.start();
      this.force.alpha(0.01); //stop unnecessary calculations
      
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