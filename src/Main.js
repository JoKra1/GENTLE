import React, { Component } from "react";
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import NodeButtonComponent from"./NodeButtonComponent";
import NodeComponent from"./NodeComponent";
import NodeSliderComponent from "./NodeSliderComponent";
import NodeCategoriesComponent from "./NodeCategoriesComponent";
import { Navbar, Nav, NavItem} from 'react-bootstrap';
import $ from "jquery";

/**
 * Constants to detect mobile users, and to calculate the
 * size of the actual SVG element, which is used to calculate
 * important properties later on.
 */

const svgHeight = window.innerHeight * 0.75;
const svgWidth = (window.innerWidth > 1140? 1140:window.innerWidth) - 60;
const mobile = (window.innerWidth < 500 || window.innerHeight < 500 ? true : false) // to detect small displays, requiring different render
const nodeRadius = ((mobile ? 25:35) + 0.015 * svgWidth);
const avbWidth = svgWidth - 2 * nodeRadius;
const URL = "/ajax";

/**
 * Main class, acting as the router and logical interface between
 * the different components.
 * 
 * Here callbacks are defined and passed down to the different components.
 * 
 * References:
 * Screen layouts and layout calculations are partially inspired from and based on:
 * http://www.tobiasstark.nl/GENSI/GENSI.htm
 * 
 * 
 */
class Main extends Component {

  /**
   * The constructor inherits formally from component.
   * Thus it is possible to fetch existing user data from an
   * external source and pass that data along via props.
   * 
   * e.g. nodes:this.props.nodes could be used to fetch existing nodes.
   * @param {*} props 
   */
  constructor(props){
    super(props);
    this.ID = this.props.ID || "TestUser";
    console.log(this.ID);
    this.state = {nodes:[{key:0,name:"You",categoryColor:"green",
                          color:"green",size:10,x:svgWidth/2,y:svgHeight/2,
                          floatX:svgWidth/2,floatY:svgHeight/2,fixed:false,
                          float:false,link:false,shouldFloat:false}],
                  links:[],
                  foci:[{key:0,x:svgWidth/2,y:svgHeight/2}],
                  counter:0,
                  source:-1,
                  correction:0};

    this.prevNodes = [];
    this.prevFoci = [];

    /**
     * Add some basic categories for demonstration.
     */
    this.categories = [{key:0, text:"Cat1", color:"#E27D60"},
                       {key:1, text:"Cat2", color:"#85DCBA"},
                       {key:2, text:"Cat3", color:"#E8A87C"},
                       {key:3, text:"Cat4", color:"red"}];

    /**
     * Showing how the rendering of categories can also be
     * used to create visually seperating elements on screen.
     */
    this.seperator = [{key:0,text:"",color:"white",x:1015,y:35,width:0,height:0},
                      {key:1,text:"",color:"green",x:svgWidth*0.5,y:10,width:2,height:svgHeight*0.9}]

  }

  // Layout re-calculations

  /**
   * Adapts foci to work with different screen sizes.
   * @param {[foci]} foci The foci points of all nodes
   */
  recalculate_foci = (foci) => {
    let recalculated_f = [];
    for (let f = 0; f < foci.length; f++) {
      if (foci[f].key ==0) {
        recalculated_f.push({
          key:foci[f].key,
          x:svgWidth/2,
          y:svgHeight/2
        })
      } else {
        let r = (svgWidth < 500 ? 0.375:0.7);
        let x = ((svgWidth/2) + (1.15*(svgHeight/2*r))*Math.cos((f / 25 * Math.PI * 2) - 2));
        let y = ((svgHeight/2) + (1.15*(svgHeight/2*r))*Math.sin((f / 25 * Math.PI * 2) - 2));

        recalculated_f.push({
          key:foci[f].key,
          x:x,
          y:y
        })
      }
    }
    return recalculated_f;
  }

  /**
   * recalculate nodes to work with different screen sizes.
   * @param {[nodes]} nodes nodes existing in network
   * @param {[foci]} foci foci of nodes
   */
  recalculate_nodes = (nodes,foci) => {
    for (let n = 0; n < nodes.length; n++) {
      if (nodes[n].key == 0) {
        // set position of new node if device was changed
        nodes[n].floatX=svgWidth/2;
        nodes[n].floatY=svgHeight/2;
      }
      nodes[n].size = (mobile ? 20:30);

      if(nodes[n].link && n !== 0) {
        continue;
      } else {
          if (!mobile || n == 0) {
            nodes[n].floatX = foci[n].x;
            nodes[n].floatY = foci[n].y;
            nodes[n].shouldFloat = false;
          } else {
            nodes[n].floatX = ((n-1)%13+1) * 27;
            nodes[n].floatY = svgHeight*0.95 + ((n) > 13? 55:0);
            nodes[n].shouldFloat = false;
          }
          
      }
      
    }
    return nodes;
  }

  // Data transfer
  transferData = () => {
    $.ajax({url:URL,
                method:"Post",
                data:{"ID":this.state.id,
                    "data":JSON.stringify({nodes:this.state.nodes,links:this.state.links})},
                success: function(ID){
                  console.log("Success.")
                },
                error: function(){
                    alert("Failure")
                }})
  }

  //Callback functions

  /**
   * collects previous nodes + positions used to decide type of render
   * @param {[nodes]} nodes PRIOR array of nodes used to decide re-rendering
   * @param {[foci]} foci PRIOR array of foci used to decide re-rendering
   */
  collectHistory = (nodes,foci) => {
    this.prevNodes = JSON.parse(JSON.stringify(nodes));
    this.prevFoci = JSON.parse(JSON.stringify(foci));
  }

  /**
   * Used to determine to which node the next selection should apply
   * depending on (partial) completion for a given property of a node
   * @param {String} key property of node for which to determine selection
   * @param {String} criterion criterion on which to base determination
   */

  determineCounter = (key,criterion) => {
    let output = 0;
    let nodes = this.state.nodes.slice(1);
    for(let i = 0; i < nodes.length; ++i) {
      if(nodes[i][key] !== criterion){
        ++output;
      }
    }
    this.setState({counter:output});
  }

  determineCounterReturn = (key,criterion) => {
    let output = 1; // Skip "You" node
    let nodes = this.state.nodes.slice(1);

    if (this.state.correction !== 0) {
      return this.state.correction
    }

    for(let i = 0; i < nodes.length; ++i) {
      if(nodes[i][key] !== criterion){
        ++output;
      }
    }

    return output
  }

  /**
   * Receives name from lower components and creates a node
   * with all relevant properties
   * @param {String} name passed from NodeButtonComponent
   */
  createNodesButtonCallback = (name) => {

    if(this.state.counter < this.state.nodes.length-1) {
      //received edit callback previously
      let nodes = JSON.parse(JSON.stringify(this.state.nodes));
      nodes[this.state.counter].name = name;
      this.setState({nodes:nodes,counter:this.state.nodes.length});
    } else {
        let counter = this.state.nodes.length;
        if(counter > 25){
          alert("You entered enough names, thank you. Click on a node to change their name!");
        }
        else if(!name) {
          alert("Please provide a Name!");
        } else {
          let nodes = JSON.parse(JSON.stringify(this.state.nodes));
          let foci = JSON.parse(JSON.stringify(this.state.foci));
          // Just some example properties to provide examples how the
          // different screens can be used to collect different measurements.
          nodes.push({
            key:counter,
            name:name,
            size:(mobile ? 20:30),
            fixed:false,
            float:false,
            link:false,
            color:"grey",
            sex:"",
            age:"",
            category:"",
            categoryColor:"white",
            fixedPosX:svgWidth/2,
            fixedPosY:svgHeight*0.1 + (Math.random() * (svgHeight * 0.7)),
            continuous1:-1,
            continuous2:-1,
            x:250,
            y:250,
            floatX:0,
            floatY:0,
            shouldFloat:false
          })

          let r = (svgWidth < 500 ? 0.37:0.7);
          let x = ((svgWidth/2) + (1.15*(svgHeight/2*r))*Math.cos((counter / 25 * Math.PI * 2) - 2));
          let y = ((svgHeight/2) + (1.15*(svgHeight/2*r))*Math.sin((counter / 25 * Math.PI * 2) - 2));

          foci.push({
            key:counter,
            x:x,
            y:y
          })
          
          // Push state
          this.transferData();
          this.setState({nodes:nodes,foci:foci,counter:counter + 1});
          
          
          ;
        }
    }
  }

  /**
   * Keeps track of number of created nodes
   * @param {number} counter to keep track of nodes
   */
  genericNodesCallback = (counter) => {
    this.setState({correction:counter});
    

  }

  /**
   * This should probably also be converted to a generic method
   * for color changing. Need to get back to this.
   */
  changeSexNodeCallback = (counter) => {
    let nodes = this.state.nodes;

    if (nodes[counter].sex == "male") {
        nodes[counter].sex = "female";
        nodes[counter].color = "pink";
    } else {
        nodes[counter].sex = "male";
        nodes[counter].color = "blue";
    }
    this.transferData();
    this.setState({nodes:nodes});
  }

  /**
   * Determines value displayed next to node on slider screen
   * @param {string} key key of node property
   * @param {number} counter that identifies node
   */
  sliderUpdateValue = (key,counter) => {
    let value = 1;
    if(counter < this.state.nodes.length) {
      if(this.state.nodes[counter][key] !== ""){
          value = parseInt(this.state.nodes[counter][key]);
      }
    }
    this.transferData();
    return value;
  }

  /**
   * Changes specific slider key of a node
   * @param {string} key key of node property
   * @param {number} counter that identifies node
   * @param {number} value
   */
  changeSliderButtonCallback = (key, counter, value) => {
    //updates background associated with node
    if(counter >= this.state.nodes.length) {
      alert("You provided the age for every person, thank you. Click on a node to change their age!")
    } else {
        let nodes = JSON.parse(JSON.stringify(this.state.nodes));
        nodes[counter][key] = value;
        this.transferData();
        this.setState({nodes:nodes, counter: counter + 1, correction: 0});
    }
  }

  /**
   * Changes specific category key of a node
   * @param {string} key key of node property
   * @param {string} keyColor color key of node property
   * @param {object} categories object containing categories and colors  
   * @param {number} counter that identifies node
   * @param {number} id of category
   * @param {string} category category name
   */
  changeCategoryButtonCallback = (key, keyColor, categories, counter, id, category) => {
    //updates background associated with node
    if(counter >= this.state.nodes.length) {
      alert("You provided the category for every person, thank you. Click on a node to change their category!")
    } else {
        let nodes = JSON.parse(JSON.stringify(this.state.nodes));
        nodes[counter][key] = category;
        nodes[counter][keyColor] = categories[id].color;
        this.transferData();
        this.setState({nodes:nodes, counter: counter + 1, correction: 0});
    }
  }

  /**
   * Changes specific continuous key of a node
   * @param {string} key key of node property
   * @param {number} id of node
   * @param {number} x coordinate
   * @param {number} y coordinate
   */
  continuousGenericCallback = (key, id, x, y) => {
    //collects final placement when drag has ended
    let inner_dist = ((mobile ? 25:35) + 0.015 * svgWidth);
    let avb_width = svgWidth - 2 * inner_dist;
    let value = (x - inner_dist)/avb_width;
    //console.log(pos);
    let nodes = this.state.nodes;
    nodes[id].fixedPosX = x;
    //nodes[id].fixedPosY = y;
    nodes[id][key] = value;
    this.transferData();
    this.setState({nodes:nodes});
  }

  /**
   *   Calculates links between nodes and sets properties for static/dynamic rendering
       When a source is set below, a snapshot of the network is created
       and the nodes are fixed using foci. When a link is popped or created
       the nodes are allowed to float to find their position again.

   * @param {number} counter received from Graph
   * @param {[nodes]} forceNodes received from Graph - copy of nodes
                          for rendering purposes of the network constant position
                          information is necessary for X and Y coordinates. They are
                          stored in floatX and floatY respectively and are used by the
                          network/node view render defined below to update the foci.
   */
  networkNodesCallback = (counter, forceNodes) => {
      
    let links = JSON.parse(JSON.stringify(this.state.links));
    let nodes = JSON.parse(JSON.stringify(this.state.nodes));
    let foci = JSON.parse(JSON.stringify(this.state.foci));
    let source = this.state.source;
    let hasLink = 0;
    let linkAt = 0;

    if(source === 0 || counter === 0) {
      // prevent connections to anchor "you" node
      source = -1;
      this.setState({source:source})
    } else {

      if(source === -1) {
        // Initializing source

        for(let i = 0; i < nodes.length; ++i) {
            nodes[i].floatX = forceNodes[i].x;
            nodes[i].floatY = forceNodes[i].y;
            nodes[i].shouldFloat = false;
        }
        this.setState({source:counter, nodes:nodes});
      } else {
          // Source exists check for links
          if(source !== counter){
          
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
            // has link - break
            links.splice(linkAt,1);
              nodes[source].link -= 1;

              nodes[counter].link -= 1;

          } else {
              // has no link - create
              links.push({key:(links[links.length - 1] ? links[links.length -1].key + 1:1),
                          source:source,
                          target:counter
                        });

                nodes[source].link += 1;

                nodes[counter].link += 1;

          }
          // determine properties for rendering decision e.g. static vs. dynamic
          for(let i = 0; i < nodes.length; ++i) {
            if(nodes[i].link && i !== 0) {
              nodes[i].floatX = forceNodes[i].x;
              nodes[i].floatY = forceNodes[i].y;
              nodes[i].shouldFloat = true;
            } else {
                if (!mobile || i == 0) {
                  nodes[i].floatX = foci[i].x;
                  nodes[i].floatY = foci[i].y;
                  nodes[i].shouldFloat = false;
                } else {
                  nodes[i].floatX = ((i-1)%13+1) * 27;
                  nodes[i].floatY = svgHeight*0.95 + ((i) > 13? 55:0);
                  nodes[i].shouldFloat = false;
                }
                
            }
          }

        }
        // reset source
        source = -1;
        this.transferData();
        this.setState({source:source,nodes:nodes,links:links,counter:counter + 1});
      }
    }
  }


  render() {
    return (
      <HashRouter>
        <div>
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Navbar.Brand href="/">Gentle-1.1</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="mr-auto">

                  <NavItem>
                    <NavLink className ="nav-link"
                             exact to="/"
                             >1) Name generation example screen.</NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink className ="nav-link"
                             exact to="/Click"
                             >2) Clicking on Nodes to cycle through multiple options. </NavLink>
                  </NavItem>
                  
                  <NavItem>
                    <NavLink className ="nav-link"
                             exact to="/Numerical"
                             >3) Assign numerical features. </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink className ="nav-link"
                             exact to="/Categories"
                             >4) Assign categorical features. </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink className ="nav-link"
                             exact to="/Continuous1"
                             >5) Assign continuous relative values 1. </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink className ="nav-link"
                             exact to="/Continuous2"
                             >6) Assign continuous relative values 2. </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink className ="nav-link"
                             exact to="/Interconnection">6) Assign connections between nodes. </NavLink>
                  </NavItem>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <div id="content" className="content container">
            <Route exact path="/" component={ () => <NodeButtonComponent nodes = {this.state.nodes.slice(1)}
                                                                         route = {"/Click"}
                                                                         max = {25}
                                                                         prevNodes = {this.prevNodes}
                                                                         counter = {this.state.nodes.length}
                                                                         links = {[]}
                                                                         foci = {this.state.foci.slice(1)}
                                                                         prevFoci= {this.prevFoci}
                                                                         callBackNodes = {this.genericNodesCallback.bind(this)}
                                                                         callBackButton = {this.createNodesButtonCallback.bind(this)}
                                                                         collectHistory = {this.collectHistory.bind(this)}
                                                                         textDescription = {"1) Create Names for up to 25 alters. "}/> }/>

            <Route exact path="/Click" component={ () => <NodeComponent nodes = {this.state.nodes.slice(1)}
                                                                         route = {"/Numerical"}
                                                                         prevNodes = {this.prevNodes}
                                                                         counter = {this.determineCounterReturn("sex","")}
                                                                         links = {[]}
                                                                         foci = {this.state.foci.slice(1)}
                                                                         prevFoci= {this.prevFoci}
                                                                         callBackNodes = {this.changeSexNodeCallback.bind(this)}
                                                                         collectHistory = {this.collectHistory.bind(this)}
                                                                         textDescription = {"2) Cycle through multiple options, for example to collect the biological sex of alters."}/> }/>

            <Route exact path="/Numerical" component={ () => <NodeSliderComponent nodes = {this.state.nodes.slice(1)}
                                                                         route = {"/Categories"}
                                                                         prevNodes = {this.prevNodes}
                                                                         counter = {this.determineCounterReturn("age","")}
                                                                         sliderUpdateValue = {this.sliderUpdateValue("age",this.determineCounterReturn("age",""))}
                                                                         links = {[]}
                                                                         foci = {this.state.foci.slice(1)}
                                                                         prevFoci= {this.prevFoci}
                                                                         callBackNodes = {this.genericNodesCallback.bind(this)}
                                                                         callBackButton = {[this.changeSliderButtonCallback.bind(this),"age"]}
                                                                         collectHistory = {this.collectHistory.bind(this)}
                                                                         textDescription = {"3) Assign a numerical value, for example the age of participants."}/> }/>
            
            <Route exact path="/Categories" component={ () => <NodeCategoriesComponent nodes = {this.state.nodes.slice(1)}
                                                                         route = {"/Continuous1"}
                                                                         prevNodes = {this.prevNodes}
                                                                         counter = {this.determineCounterReturn("category","")}
                                                                         links = {[]}
                                                                         categories = {this.categories}
                                                                         foci = {this.state.foci.slice(1)}
                                                                         prevFoci= {this.prevFoci}
                                                                         callBackNodes = {this.genericNodesCallback.bind(this)}
                                                                         callBackButton = {[this.changeCategoryButtonCallback.bind(this),"category","categoryColor",this.categories]}
                                                                         collectHistory = {this.collectHistory.bind(this)}
                                                                         textDescription = {"4) Click on the buttons to assign a category to a node."}/> }/>

            <Route exact path="/Continuous1" component={ () => <NodeComponent   fixed = {1}
                                                                              opac = {"dynamic"}
                                                                              nodes = {this.state.nodes.slice(1).map((node, i) => (
                                                                                      {key:node.key,
                                                                                        name:node.name,
                                                                                        size:node.size,
                                                                                        fixed: true,
                                                                                        color: node.color,
                                                                                        sex: node.sex,
                                                                                        age: (node.continuous1 != -1 ? node.continuous1.toFixed(2):0.5),
                                                                                        categoryColor: node.categoryColor,
                                                                                        x:(node.continuous1 != -1 ? node.continuous1*avbWidth + nodeRadius:svgWidth/2),
                                                                                        y:node.fixedPosY
                                                                                       }
                                                                              ))}
                                                                              prevNodes = {this.prevNodes}
                                                                              route = {"/Continuous2"}
                                                                              counter = {-1}
                                                                              links = {[]}
                                                                              foci = {this.state.foci.slice(1)}
                                                                              prevFoci= {this.prevFoci}
                                                                              categories= {this.seperator}
                                                                              callBackNodes = {[this.continuousGenericCallback.bind(this),"continuous1"]}
                                                                              collectHistory = {this.collectHistory.bind(this)}
                                                                              textDescription = {"5) Move nodes closer to the line to indicate proximity. Useful to measure continuous relative scales."}/> }/>

            
            <Route exact path="/Continuous2" component={ () => <NodeComponent   fixed = {1}
                                                                              opac = {"dynamic"}
                                                                              nodes = {this.state.nodes.slice(1).map((node, i) => (
                                                                                      {key:node.key,
                                                                                        name:node.name,
                                                                                        size:node.size,
                                                                                        fixed: true,
                                                                                        color: node.color,
                                                                                        sex: node.sex,
                                                                                        age: (node.continuous2 != -1 ? node.continuous2.toFixed(2):0.5),
                                                                                        categoryColor: node.categoryColor,
                                                                                        x:(node.continuous2 != -1 ? node.continuous2*avbWidth + nodeRadius:svgWidth/2),
                                                                                        y:node.fixedPosY
                                                                                       }
                                                                              ))}
                                                                              prevNodes = {this.prevNodes}
                                                                              route = {"/Interconnection"}
                                                                              counter = {-1}
                                                                              links = {[]}
                                                                              foci = {this.state.foci.slice(1)}
                                                                              prevFoci= {this.prevFoci}
                                                                              callBackNodes = {[this.continuousGenericCallback.bind(this),"continuous2"]}
                                                                              collectHistory = {this.collectHistory.bind(this)}
                                                                              textDescription = {"6) Move nodes closer to the right to indicate proximity. Useful to measure continuous relative scales."}/> }/>

                                                    
            <Route exact path="/Interconnection" component={ () => <NodeComponent nodes = {this.state.nodes.map((node, i) => (
                                                                                      {key:node.key,
                                                                                        name:"",
                                                                                        size:10,
                                                                                        fixed: false,
                                                                                        float: (node.shouldFloat ? true:false),
                                                                                        color: node.color,
                                                                                        sex: node.sex,
                                                                                        age: node.name,
                                                                                        categoryColor: node.categoryColor,
                                                                                        x:node.floatX,
                                                                                        y:node.floatY,
                                                                                        link:node.link,
                                                                                        floatX:node.floatX,
                                                                                        floatY:node.floatY
                                                                                       }
                                                                              ))}
                                                                                  prevNodes = {this.prevNodes}
                                                                                  updateCounter = {this.determineCounter.bind(this)}
                                                                                  
                                                                                  counter = {-1}
                                                                                  float = {1}
                                                                                  links = {this.state.links}
                                                                                  foci = {this.state.foci.map((focus,i) => (
                                                                                                {key:focus.key,
                                                                                                x:(!mobile || i == 0 ? (this.state.nodes[i].floatX ? this.state.nodes[i].floatX: focus.x): (this.state.nodes[i].floatX ? this.state.nodes[i].floatX:((i-1)%13+1) * 27)),
                                                                                                y:(!mobile || i == 0 ? (this.state.nodes[i].floatY ? this.state.nodes[i].floatY: focus.y): (this.state.nodes[i].floatY ? this.state.nodes[i].floatY:svgHeight*0.95 + ((i) > 13? 55:0)))}
                                                                                          ))}
                                                                                  prevFoci= {this.prevFoci}
                                                                                  callBackNodes = {this.networkNodesCallback.bind(this)}
                                                                                  collectHistory = {this.collectHistory.bind(this)}
                                                                                  textDescription = {"7) Allows to link connected people together and to split existing links by clicking on two connected nodes."}/> }/>
          </div>
        </div>
      </HashRouter>
    );
  }
}

export default Main;
