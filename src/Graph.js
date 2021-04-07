import React, { Component } from "react";
import * as d3 from 'd3';
import ReactDOM from "react-dom";
import {isEqual} from 'underscore';

var width = (window.innerWidth > 1140? 1140:window.innerWidth) - 60;
var height = window.innerHeight *0.75;

/**
 * Graph class handling dynamic and static rendering for networks.
 * 
 * References:
 * 
 * d3 API:
 * https://github.com/d3/d3-3.x-api-reference/blob/master/Force-Layout.md
 * 
 * d3 Foci based example:
 * https://bl.ocks.org/mbostock/1021953
 * 
 * d3 & REACT interaction:
 * The class here is very bloated due to all the checks and
 * conditional adaptations necessary to the graph. A much cleaner
 * but slightly outdated example of the interaction between the
 * two frameworks is presented here:
 * http://bl.ocks.org/sxywu/fcef0e6dac231ef2e54b
 * 
 * The reference keeping is discussed here:
 * https://reactjs.org/docs/refs-and-the-dom.html
 * https://stackoverflow.com/questions/43873511/deprecation-warning-using-this-refs
 * 
 */

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

  /**
   * Handles callbacks for views that allow for node dragging into boxes (desktop only)
   * @param {event} e d3.js event
   */
  dragCallBack = (e) => {
    //for fixed nodes
    if(this.props.fixed) {
      this.props.callBack(e.key, e.x, e.y);
    }

  }

  /**
   * Handles all remaining callback cases (clicking, connecting, etc.)
   * @param {node} d data object of a node
   * @param {this} _this 
   */
  callback = (d, _this) => {
    let nodes = JSON.parse(JSON.stringify(this.force.nodes()));
    this.force.alpha(0.2);
    this.props.callBack(d.key, nodes);
  }
  
  /**
   * Enter cycle for nodes (see d3.js docs)
   * @param {*} v3d virtual dom object
   */
  enterCycleNodes = (v3d) => {
    this.force.start();
    if(this.props.opac == "static") {
      v3d.classed('node', true)
      .call(this.force.drag)
      .style("opacity", (d) => (0.65)); //all nodes have 0.7 opacity
    } else if(this.props.opac == "dynamic") {
      v3d.classed('node', true)
      .call(this.force.drag)
      .style("opacity", (d) => (d.x/width + 0.1)); //all nodes have 0.7 opacity
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

  /**
   * Enter cycle for links (see d3.js docs)
   * @param {*} v3d virtual dom object
   */
  enterCycleLinks = (v3d) => {
    //optional data driven style paramaters can be included here, e.g. stroke-width
    v3d.classed('link', true);
  };

  /**
   * Update positions of nodes using foci and alpha
   * to gradually move nodes to their designated foci points.
   * @param {*} v3d virtual dom object
   * @param {*} foci foci of nodes
   */
  
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
        } else if (d.x > width) {
          d.x = width-35;
        }

        if(d.y < 0) {
          d.y = 35;
        } else if (d.y > height) {
          d.y = height - 35;
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
  
  
  /**
   * D3 takes over to render node parts, independet of REACT
   */
  componentDidMount() {
    this.virtualD3 = d3.select(ReactDOM.findDOMNode(this.graphRef));
    this.force.on('tick', (e) => {
      this.virtualD3.call(this.updateVirtualD3, JSON.parse(JSON.stringify(this.props.foci)));
    }); 
  }


  /**
   * Decision method for rendering. Renders nodes statically (cools down force in network
   * if no changes were made) or dynamically (lets nodes take on positions freely)
   * Additionally assigns individual node properties for the network screen using
   * properties definded by network callback (see main)
   */
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
    // something about the nodes is in-equal - might be data or position
    if(conditionNode) {
      this.virtualD3 = d3.select(ReactDOM.findDOMNode(this.graphRef));

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

      // For network connection screen we need to further diverge from the static/dynamic distinction.
      // The following lines use the float property set by network callback to
      // decide link strength and charge properties.
      // Additionally, the conditionFoci variable is set to 0
      // since for the network screen we always want a static render first

      if(this.props.float) {
        this.force.gravity(0.25);
        conditionFoci = 0;
        if (window.innerWidth > 500) {
          this.force.charge((d) =>((d.float ? -1500:-30)))
        } else {
          this.force.charge((d) =>((d.float ? -450:-30)))
        }
        this.force.linkDistance(function(d,i) {
                                  if (window.innerWidth > 500) {
                                    let link = (d.source.link > d.target.link ?
                                      d.source.link *10: d.target.link *10)
                                    if (link < 35) {
                                        return 35;
                                    } else if (link > 55) {
                                        return 55;
                                    } else {
                                        return link;
                                    }
                                  } else {
                                    let link = (d.source.link > d.target.link ?
                                      d.source.link *3: d.target.link *3)
                                    if (link < 5) {
                                        return 5;
                                    } else if (link > 10) {
                                        return 10;
                                    } else {
                                        return link;
                                    }
                                  }
                                  
                                })
      }

      this.props.collectHistory(nodes, foci);
      this.force.nodes(nodes).links(links);

      // cool down network sufficiently to prevent fading in == static rendering
      // will always take place on the network connection screen.
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

      //skip update just rerender in case nothing changed (or data only)
      var vd3Nodes = this.virtualD3.selectAll('.node')
      .data(nodes);
      var vd3Links = this.virtualD3.selectAll('.link')
        .data(links);
      vd3Nodes.enter().append('g').call(this.enterCycleNodes);
      vd3Links.enter().insert('line', '.node').call(this.enterCycleLinks);
      this.force.nodes(nodes).links(links);

      // cool down network sufficiently to prevent fading in == static rendering
      // will always take place on the network connection screen.
      for(let i = this.force.alpha(); i > 0.005; i = i - 0.001) {
        //static rendering prevents "fading in"
        this.virtualD3.call(this.updateVirtualD3,foci);
      }
      this.force.start();
      this.force.alpha(0.01); //stop unnecessary calculations
      
    }

  }


  render() {
    
    return (
      <div className="container">
        <svg width="100%" height="75VH" ref={(e) => this.graphRef = e}>
          <g id="boxes">
          {(this.props.categories ? this.props.categories.map( (category, i) => (
              <text key={category.key} x={category.x} y={category.y -10}>{category.text}</text>
            )):<g/>)}
            {(this.props.categories ? this.props.categories.map( (category, i) => (
              <rect className="CategoryBox"
                    key={category.key}
                    width={category.width}
                    height={category.height}
                    x={category.x}
                    y={category.y}
                    fill="transparent"
                    stroke={category.color}
                    strokeWidth="5"/>
            )):<g/>)}
          </g>
        </svg>
      </div>
    );
  }
};

export default Graph;
