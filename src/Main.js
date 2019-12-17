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
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import $ from 'jquery';
import NodeButtonComponent from"./NodeButtonComponent";
import NodeComponent from"./NodeComponent";
import NodeSliderComponent from"./NodeSliderComponent";
import NodesCategoriesComponent from "./NodeCategoriesComponent";
import { Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';


var ajax = "/ajax";


class Main extends Component {

  constructor(props){
    super(props);
    this.state = {nodes:[],
                  links:[],
                  foci:[],
                  counter:0,
                  source:-1};
    this.prevNodes = [];
    this.prevFoci = [];

    this.categories = [{key:0, text:"Category0", color:"#E27D60"},
                       {key:1, text:"Category1", color:"#85DCBA"},
                       {key:2, text:"Category2", color:"#E8A87C"}];

    this.boxes = (window.innerWidth > 700 ? [{key:0, text:"Box0", color:"#BA85DC", x:15, y:(window.innerHeight*0.7 -200), width:window.innerWidth*0.12, height:window.innerHeight*0.17},
                                             {key:1, text:"Box1", color:"#DCBA85", x:280, y:(window.innerHeight*0.7 -200), width:window.innerWidth*0.12, height:window.innerHeight*0.17},
                                             {key:2, text:"Box2", color:"#C38D9E", x:545, y:(window.innerHeight*0.7 -200), width:window.innerWidth*0.12, height:window.innerHeight*0.17},
                                             {key:3, text:"Box3", color:"#E8A87C", x:810, y:(window.innerHeight*0.7 -200), width:window.innerWidth*0.12, height:window.innerHeight*0.17}
                                            ]:
                                            [{key:0, text:"Box0", color:"#BA85DC", x:15, y:(window.innerHeight*0.7 -250 -window.innerHeight*0.20), width:window.innerWidth*0.725, height:window.innerHeight*0.20},
                                             {key:1, text:"Box1", color:"#DCBA85", x:15, y:(window.innerHeight*0.7 - 10 -window.innerHeight*0.20), width:window.innerWidth*0.725, height:window.innerHeight*0.20}
                                            ]
                  )

  }

    //fetch Data:
    fetchData = () => {
      $.ajax({url:"/fetch",
              method:"Post",
        success: function(data){
        }
  
      }).then((data) =>{if(data.length !== 0) {
                        let output = [];
                        for(let i = 0; i < data.length; ++i) {
                            output.push({
                              key:parseInt(data[i].key),
                              name:data[i].name,
                              size:parseInt(data[i].size),
                              fixed:("true" === data[i].fixed),
                              color:data[i].color,
                              sex:data[i].sex,
                              age:data[i].age,
                              category:data[i].category,
                              categoryColor:data[i].categoryColor,
                              box:data[i].box,
                              fixedPosX: parseInt(data[i].fixedPosX),
                              fixedPosY: parseInt(data[i].fixedPosY),
                              x:parseInt(data[i].x),
                              y:parseInt(data[i].y)      
                            })
                        }
                        this.setState({nodes:output})
                      }});
    }
  
    // send Data to server e.g. express:
    sendData = (id, key, value, url) => {
      if(key === "node") {
        $.ajax({
          url:url,
          method:"Post",
          data:{"id":id,
                "node": value[id]}
        })
  
      }
      if(key === "link") {
        $.ajax({
          url:url,
          method:"Post",
          data:{"id":id,
                "link": value[id]}
        })
  
      }
    }

  //Callback functions

  collectHistory = (nodes,foci) => {
    //collects previous nodes + positions used to decide type of render
    this.prevNodes = JSON.parse(JSON.stringify(nodes));
    this.prevFoci = JSON.parse(JSON.stringify(foci));
  }


  determineCounter = (key,criterion) => {
    //updates counter depending on completion
    let output = 0;
    let nodes = this.state.nodes;
    for(let i = 0; i < nodes.length; ++i) {
      if(nodes[i][key] !== criterion){
        ++output;
      }
    }
    this.setState({counter:output});
  }

  createNodesButtonCallback = (name) => {
    //data creation
    if(this.state.counter < this.state.nodes.length) {
      //received edit callback previously
      let nodes = JSON.parse(JSON.stringify(this.state.nodes));
      nodes[this.state.counter].name = name;
      this.setState({nodes:nodes,counter:this.state.nodes.length});
    } else {
        let counter = this.state.nodes.length;
        if(counter > 4){
          alert("You entered enough names, thank you. Click on a node to change their name!");
        }
        else if(!name) {
          alert("Provide a Name!");
        } else {
          let nodes = JSON.parse(JSON.stringify(this.state.nodes));
          let foci = JSON.parse(JSON.stringify(this.state.foci));
          nodes.push({
            key:counter,
            name:name,
            size:(window.innerWidth < 700 ? 20:40),
            fixed:false,
            color:"#85BADC",
            sex:"male",
            age:"",
            category:"",
            categoryColor:"white",
            box:"",
            fixedPosX: 0,
            fixedPosY: 0,
            x:250,
            y:250
          })

          let svgWidth = (window.innerWidth < 700 ? document.getElementById("content").clientWidth - 50:document.getElementById("content").clientWidth);
          let svgHeight = window.innerHeight *0.7;

          foci.push({
            key:counter,
            x:((svgWidth/2) + (svgHeight/2)*0.5*Math.cos((counter / 5 * Math.PI * 2) - 2)),

            y:((svgHeight/2) + (svgHeight/2)*0.5*Math.sin((counter / 5 * Math.PI * 2) - 2))
          })
          this.sendData(counter,"node", nodes, ajax);
          this.setState({nodes:nodes,foci:foci,counter:counter + 1});
        }
    }
  }

  createNodesCallback = (counter) => {
    //updates counter for edits of name
    this.setState({counter:counter});
    

  }

  changeAgeSliderCallback = (id, age) => {
    //updates age associated with node.
    if(id >= this.state.nodes.length){
      alert("You provided the age for every person, thank you. Click on a node to change their age!");
    } else{
        let nodes = JSON.parse(JSON.stringify(this.state.nodes));
        nodes[id].age = age;

        this.sendData(id,"node", nodes, ajax);
        this.setState({nodes:nodes, counter: id + 1});
    }

  }

  sliderUpdateValue = () => {
    let value = 1;
    if(this.state.counter < this.state.nodes.length) {
      if(this.state.nodes[this.state.counter].age){
          value = this.state.nodes[this.state.counter].age
      }
    }
    return value;
  }

  changeAgeNodesCallback = (counter) => {
    //updates counter for edits of Age
      this.setState({counter:counter});
  }

  changeCategoryButtonCallback = (counter, id, category) => {
    //updates background associated with node
    if(counter >= this.state.nodes.length) {
      alert("You provided the category for every person, thank you. Click on a node to change their category!")
    } else {
        let nodes = JSON.parse(JSON.stringify(this.state.nodes));
        nodes[counter].category = category;
        nodes[counter].categoryColor = this.categories[id].color;

        this.setState({nodes:nodes, counter: counter + 1});
    }
  }

  changeCategoryNodesCallback = (counter) => {
    //updates counter for edits background
      this.setState({counter:counter});
  }

  placeBoxDragCallback = (id, x, y) => {
    //collects final placement when drag has ended
    let nodes = JSON.parse(JSON.stringify(this.state.nodes));
    for(let i= 0; i < this.boxes.length; ++i) {
      if(x >= this.boxes[i].x &&
       x <= this.boxes[i].x + this.boxes[i].width &&
       y >= this.boxes[i].y &&
       y <= this.boxes[i].y + this.boxes[i].height) {

        nodes[id].fixedPosX = x;
        nodes[id].fixedPosY = y;
        nodes[id].box = this.boxes[i].text;

        this.sendData(id,"node", nodes, ajax);
        this.setState({nodes:nodes});

       }

    }
    
  }

  networkNodesCallback = (counter) => {
    let links = JSON.parse(JSON.stringify(this.state.links));
    let source = this.state.source;
    let hasLink = 0;
    let linkAt = 0;

    if(source === -1) {
      this.setState({source:counter});
    } else {
        for(let i = 0; i < links.length; ++i) {
          if((links[i].source === source &&
             links[i].target === counter) ||
             (links[i].target === source &&
             links[i].source === counter)) {
            hasLink = 1;
            linkAt = i;
            break;
          }
        }
        if(hasLink) {
          links.splice(linkAt,1);
        } else {
          links.push({key:links.length,
                      source:source,
                      target:counter
                    });
        }
        source = -1;
        this.setState({source:source, links:links});
      }
  }

  componentDidMount = () => {
    if(this.state.nodes.length === 0) {
      this.fetchData();
      let foci = [];
      for(let i = 0; i < 5; ++i){
        foci.push({
          key:i,
          x:((document.getElementById("content").clientWidth/2) + ((window.innerHeight*0.7)/2)*0.8*Math.cos((i / 5 * Math.PI * 2) - 2)),
          y:(((window.innerHeight*0.7)/2) + ((window.innerHeight*0.7)/2)*0.8*Math.sin((i / 5 * Math.PI * 2) - 2))
        })
      }
      this.setState({foci:foci});
    }

  }


  render() {
    return (
      <HashRouter>
        <div>
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Navbar.Brand href="/">GENTLE V 1.0</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="mr-auto">

                  <NavItem>
                    <NavLink className ="nav-link" exact to="/" onClick={() => (this.setState({counter:this.state.nodes.length}))}>NODEBUTTON</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink className ="nav-link" to="/NODESLIDER"  onClick={() => (this.determineCounter("age", ""))}>NODESLIDER</NavLink>
                  </NavItem >
                  <NavItem>
                    <NavLink className ="nav-link" to="/NODECATEGORIES"  onClick={() => (this.determineCounter("category", ""))}>NODECATEGORIES</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink className ="nav-link" to="/NODEBOXES" >NODEBOXES</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink className ="nav-link" exact to="/NODES" >NODES</NavLink>
                  </NavItem>
                  
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <div id="content" className="content container">

            <Route exact path="/" component={ () => <NodeButtonComponent nodes = {this.state.nodes}
                                                                         prevNodes = {this.prevNodes}
                                                                         counter = {-1}
                                                                         links = {[]}
                                                                         foci = {this.state.foci}
                                                                         prevFoci= {this.prevFoci}
                                                                         callBackNodes = {this.createNodesCallback.bind(this)}
                                                                         callBackButton = {this.createNodesButtonCallback.bind(this)}
                                                                         collectHistory = {this.collectHistory.bind(this)}
                                                                         textDescription = {"First example Page, showing the node creation process: NODE component."}/> }/>

            <Route exact path="/NODESLIDER" component={ () => <NodeSliderComponent nodes = {this.state.nodes}
                                                                         sliderUpdate = {this.sliderUpdateValue()}
                                                                         prevNodes = {this.prevNodes}
                                                                         counter = {this.state.counter}
                                                                         links = {[]}
                                                                         foci = {this.state.foci}
                                                                         prevFoci= {this.prevFoci}
                                                                         callBackNodes = {this.changeAgeNodesCallback.bind(this)}
                                                                         callBackButton = {this.changeAgeSliderCallback.bind(this)}
                                                                         collectHistory = {this.collectHistory.bind(this)}
                                                                         textDescription = {"Second example Page, showing the Node Slider. Use the Slider to update the Age of a person: NODE-SLIDER component."}/> }/>

            <Route exact path="/NODECATEGORIES" component={ () => <NodesCategoriesComponent nodes = {this.state.nodes}
                                                                         prevNodes = {this.prevNodes}
                                                                         counter = {this.state.counter}
                                                                         links = {[]}
                                                                         foci = {this.state.foci}
                                                                         prevFoci= {this.prevFoci}
                                                                         categories = {this.categories}
                                                                         callBackNodes = {this.changeCategoryNodesCallback.bind(this)}
                                                                         callBackButton = {this.changeCategoryButtonCallback.bind(this)}
                                                                         collectHistory = {this.collectHistory.bind(this)}
                                                                         textDescription = {"Third example Page, showing how to connect categories to Nodes. This description is rendered by the NODECATEGORIES component."}/> }/>  

            <Route exact path="/NODEBOXES" component={ () => <NodeComponent fixed = {1}
                                                                              nodes = {this.state.nodes.map((node, i) => (
                                                                                      {key:node.key,
                                                                                        name:node.name,
                                                                                        size:node.size,
                                                                                        color: node.color,
                                                                                        sex: node.sex,
                                                                                        age: node.age,
                                                                                        categoryColor: node.categoryColor,
                                                                                        fx:(node.fixedPosX !== 0 ? node.fixedPosX:((window.innerWidth > 700 ? 200 + (175*i): 35 + (50*i)))),
                                                                                        fy:(node.fixedPosY !== 0 ? node.fixedPosY:(window.innerWidth > 700? ((window.innerHeight *0.7)/2)+15:50))
                                                                                       }
                                                                              ))}
                                                                              prevNodes = {this.prevNodes}
                                                                              counter = {-1}
                                                                              links = {[]}
                                                                              foci = {this.state.foci}
                                                                              prevFoci= {this.prevFoci}
                                                                              categories = {this.boxes}
                                                                              callBackNodes = {this.placeBoxDragCallback.bind(this)}
                                                                              collectHistory = {this.collectHistory.bind(this)}
                                                                         textDescription = {"Fourth example Page, showing how to place Nodes in Boxes. Drag the Nodes into a box to link them to the box. This description is rendered by the NODE component."}/> }/>
                                                                        
            <Route exact path="/NODES" component={ () => <NodeComponent nodes = {this.state.nodes}
                                                                         prevNodes = {this.prevNodes}
                                                                         counter = {-1}
                                                                         links = {this.state.links}
                                                                         foci = {this.state.foci}
                                                                         prevFoci= {this.prevFoci}
                                                                         callBackNodes = {this.networkNodesCallback.bind(this)}
                                                                         collectHistory = {this.collectHistory.bind(this)}
                                                                         textDescription = {"Fifth example Page, showing the networking process. Tap the nodes to connect/detach them. This description is rendered by the NODE component."}/> }/>                                                               
          </div>
        </div>
      </HashRouter>
    );
  }
}

export default Main;