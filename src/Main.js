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
import Thanks from "./Thanks";
import { Navbar, Nav, NavItem} from 'react-bootstrap';
import $ from "jquery";

// Constant imports
import {
  SVGHEIGHT,
  SVGWIDTH,
  MOBILE,
  NODESIZE,
  NODERADIUS,
  AVBWIDTH,
  AVBHEIGHT
} from "./Graph";

// Descriptions & Layout functions
import {
  CATEGORIES,
  SEPARATOR,
  SCREENDESCRIPTIONS,
  DELETEWARNING,
  DUPLICATEWARNING,
  SLIDERWARNING,
  CATEGORYWARNING,
  rect_layout,
  box_layout,
  recalculate_foci,
  recalculate_nodes,
  returnTemplateNode,
  returnYouTemplate,
  hasLink,
  hasLinkAt,
  updateNodeRenderProps,
  removeNodeAt,
  doesNameOverlap
} from "./Utils";

const STORAGEURL = "/ajax";

/**
 * Main class, acting as the router and logical interface between
 * the different components.
 * 
 * Here callbacks are defined and passed down to the different components.
 * 
 * References:
 * Screen layouts are partially inspired from and based on:
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
    this.ID = this.props.ID;
    this.state = {nodes:(this.props.nodes.length === 0 ? [returnYouTemplate()]:
                                                          recalculate_nodes(this.props.nodes,recalculate_foci(this.props.foci))),
                  links:this.props.links,
                  foci:(this.props.foci.length === 0 ? [{key:0,x:SVGWIDTH/2,y:SVGHEIGHT/2}]:recalculate_foci(this.props.foci)),
                  source:-1,
                  correction:0};
    this.prevNodes = [];
    this.prevFoci = [];
    
  }

  //Callback functions

  /**
   * Transfer callback. Called by the individual components once a screen is completed.
   */
   transferData = () => {
    sessionStorage.setItem("nodeData",JSON.stringify({nodes:this.state.nodes,links:this.state.links,foci:this.state.foci}));
    $.ajax({url:STORAGEURL,
                method:"Post",
                data:{"ID": this.ID,"data":JSON.stringify({nodes:this.state.nodes,links:this.state.links})},
            })
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
   * Returns the number of nodes + 1 which have a different value at
   * a specific criterion than the default value.
   * @param {string} key criterion at which to check the default value
   * @param {any} criterion default value for that specific criterion
   * @returns {int} output The next node which still has a default value
   */
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
   * Handles changes to existing nodes in the name generator screen.
   * Included cases are: re-naming and deletion of existing node.
   * @param {string} name 
   * @param {[nodes]} nodes 
   * @param {[foci]} foci 
   */
  handleNodeChange = (name,nodes,foci) => {
    //received edit callback previously
    if(!name) {
      // Plan to delete
      if(this.state.links.length > 0) {
        alert(DELETEWARNING);
        this.setState({correction:0});
      } else {
        let splicedObjs = removeNodeAt(nodes,foci,this.state.correction);
        foci = splicedObjs.foci;
        nodes = splicedObjs.nodes;
        this.setState({nodes:nodes,foci:foci,counter:this.state.nodes.length,correction:0});
      }
    } else {
      //Just rename selected node
      nodes[this.state.correction].name = name;
      this.setState({nodes:nodes,counter:this.state.nodes.length,correction:0});
    }
  }
 
  /**
   * Receives name from lower components and creates a node
   * with all relevant properties
   * @param {String} name passed from NodeButtonComponent
   */
  createNodesButtonCallback = (name) => {
    let nodes = JSON.parse(JSON.stringify(this.state.nodes));
    let foci = JSON.parse(JSON.stringify(this.state.foci));
    if(this.state.correction !== 0) {
      this.handleNodeChange(name,nodes,foci);
    }
    else {
      // Generate new node if name does not exist
      let counter = this.state.nodes.length;
      if(doesNameOverlap(name,nodes)) {
        alert(DUPLICATEWARNING);
      }
      else {
        nodes.push(returnTemplateNode(counter,name));
        let coords = rect_layout(counter);
        
        foci.push({
          key:counter,
          x:coords[0],
          y:coords[1]
        })
        // Push state
        this.setState({nodes:nodes,foci:foci});
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
   * Callback to change the "sex" of a node at
   * a specific index that is provided.
   * @param {number} counter index for the node
   */
  changeSexNodeCallback = (counter) => {
    let nodes = this.state.nodes;

    if (nodes[counter].sex == "female") {
        nodes[counter].sex = "male";
        nodes[counter].color = "#B5E0F1";
    } else if (nodes[counter].sex == "male") {
        nodes[counter].sex = "other";
        nodes[counter].color = "#FE9932";
    } else {
      nodes[counter].sex = "female";
      nodes[counter].color = "#FADADD";
    }
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
      alert(SLIDERWARNING);
    } else {
        let nodes = JSON.parse(JSON.stringify(this.state.nodes));
        nodes[counter][key] = value;
        this.setState({nodes:nodes, correction: 0});
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
      alert(CATEGORYWARNING);
    } else {
        let nodes = JSON.parse(JSON.stringify(this.state.nodes));
        nodes[counter][key] = category;
        nodes[counter][keyColor] = categories[id].color;
        this.setState({nodes:nodes, correction: 0});
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

    let value = (x - NODERADIUS)/AVBWIDTH;
    value = Math.max(0.00,value);
    value = Math.min(1.00,value);
    let nodes = this.state.nodes;
    nodes[id].fixedPosX = x;
    nodes[id][key] = value;
    this.setState({nodes:nodes});
  }

  /**
   * Switches a boolean property of a specific node.
   * @param {string} key property/criterion of a node
   * @param {number} counter index of a node
   */
  booleanNodeCallback = (key, counter) => {
    let nodes = this.state.nodes;

    if (nodes[counter][key]) {
      nodes[counter][key] = false;
    } else {
      nodes[counter][key] = true;
    }
    this.setState({nodes:nodes});
  }
  
  /**
   *   Calculates links between nodes and sets properties for static/dynamic rendering
       When a source is set below, a snapshot of the network is created
       and the nodes are fixed using foci. When a link is popped or created
       the nodes are allowed to float to find their position again.

   * @param {number} counter received from Graph
   * @param {[nodes]} callBackNodes received from Graph - copy of nodes
                          for rendering purposes of the network constant position
                          information is necessary for X and Y coordinates. They are
                          stored in floatX and floatY respectively and are used by the
                          network/node view render defined below to update the foci.
   */
  networkNodesCallback = (counter, callBackNodes) => {
    
    let links = JSON.parse(JSON.stringify(this.state.links));
    let nodes = JSON.parse(JSON.stringify(this.state.nodes));
    let forceNodes = callBackNodes;

    if (MOBILE) {
      // Mobile handling
      forceNodes = [returnYouTemplate()].concat(callBackNodes);
    }

    let source = this.state.source;

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
          
          let linkTest = hasLinkAt(links,source,counter);

          if(linkTest.hasLink) {
            // has link - break
            links.splice(linkTest.linkAt,1);
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
          updateNodeRenderProps(nodes,forceNodes);
        }

        // reset source
        if (MOBILE) {
          source = (source === counter ? -1 : source);
        } else {
          source = -1;
        }
        this.setState({source:source,nodes:nodes,links:links});
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
                             exact to="/Boolean"
                             >5) Assign boolean features. </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink className ="nav-link"
                             exact to="/Continuous1"
                             >6) Assign continuous relative values 1. </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink className ="nav-link"
                             exact to="/Continuous2"
                             >7) Assign continuous relative values 2. </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink className ="nav-link"
                             exact to="/Interconnection">6) Assign connections between nodes. </NavLink>
                  </NavItem>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <div id="content" className="content container">
            <Route exact path="/" component={
              () => <NodeButtonComponent nodes = {this.state.nodes.slice(1)}
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
                                          textDescription = {SCREENDESCRIPTIONS[0]}
                                          transferCallBack = {this.transferData.bind(this)}/>
            }/>

            <Route exact path="/Click" component={
              () => <NodeComponent nodes = {this.state.nodes.slice(1)}
                                    route = {"/Numerical"}
                                    prevNodes = {this.prevNodes}
                                    counter = {-1}
                                    links = {[]}
                                    foci = {this.state.foci.slice(1)}
                                    prevFoci= {this.prevFoci}
                                    callBackNodes = {this.changeSexNodeCallback.bind(this)}
                                    collectHistory = {this.collectHistory.bind(this)}
                                    textDescription = {SCREENDESCRIPTIONS[1]}
                                    transferCallBack = {this.transferData.bind(this)}/>
            }/>

            <Route exact path="/Numerical" component={
              () => <NodeSliderComponent nodes = {this.state.nodes.slice(1)}
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
                                          textDescription = {SCREENDESCRIPTIONS[2]}
                                          transferCallBack = {this.transferData.bind(this)}/>
            }/>
            
            <Route exact path="/Categories" component={
              () => <NodeCategoriesComponent nodes = {this.state.nodes.slice(1)}
                                              route = {"/Boolean"}
                                              prevNodes = {this.prevNodes}
                                              counter = {this.determineCounterReturn("category","")}
                                              links = {[]}
                                              categories = {CATEGORIES}
                                              foci = {this.state.foci.slice(1)}
                                              prevFoci= {this.prevFoci}
                                              callBackNodes = {this.genericNodesCallback.bind(this)}
                                              callBackButton = {[this.changeCategoryButtonCallback.bind(this),"category","categoryColor",CATEGORIES]}
                                              collectHistory = {this.collectHistory.bind(this)}
                                              textDescription = {SCREENDESCRIPTIONS[3]}
                                              transferCallBack = {this.transferData.bind(this)}/>
            }/>

            <Route exact path="/Boolean" component={
              () => <NodeComponent nodes = {this.state.nodes.slice(1).map((node, i) => (
                                              {key:node.key,
                                                name:node.name,
                                                size:node.size,
                                                fixed: false,
                                                color: node.color,
                                                sex: node.sex,
                                                age: node.age,
                                                categoryColor: node.categoryColor,
                                                x:node.fixedPosX,
                                                y:node.fixedPosY,
                                                opac:(node.booleanCondition ? true:false)
                                              }
                                            ))}
                                      route = {"/Continuous1"}
                                      opac = {"conditional"}
                                      prevNodes = {this.prevNodes}
                                      counter = {-1}
                                      links = {[]}
                                      foci = {this.state.foci.slice(1)}
                                      prevFoci= {this.prevFoci}
                                      callBackNodes = {[this.booleanNodeCallback.bind(this),"booleanCondition"]}
                                      collectHistory = {this.collectHistory.bind(this)}
                                      textDescription = {SCREENDESCRIPTIONS[4]}
                                      transferCallBack = {this.transferData.bind(this)}/>
            }/>

            <Route exact path="/Continuous1" component={
              () => <NodeComponent   fixed = {1}
                                      opac = {"dynamic"}
                                      nodes = {this.state.nodes.slice(1,this.determineCounterReturn("continuous1",-1) + 1).map((node, i) => (
                                        {key:node.key,
                                          name:node.name,
                                          size:node.size,
                                          fixed: true,
                                          color: node.color,
                                          sex: node.sex,
                                          age: (node.continuous1 != -1 ? node.continuous1.toFixed(2):0.5),
                                          categoryColor: node.categoryColor,
                                          x:(node.continuous1 != -1 ? node.continuous1*AVBWIDTH + NODERADIUS:SVGWIDTH/2),
                                          y:node.fixedPosY
                                        }
                                      ))}
                                      prevNodes = {this.prevNodes}
                                      route = {"/Continuous2"}
                                      counter = {-1}
                                      links = {[]}
                                      foci = {this.state.foci.slice(1)}
                                      prevFoci= {this.prevFoci}
                                      categories= {SEPARATOR}
                                      callBackNodes = {[this.continuousGenericCallback.bind(this),"continuous1"]}
                                      collectHistory = {this.collectHistory.bind(this)}
                                      textDescription = {SCREENDESCRIPTIONS[5]}
                                      transferCallBack = {this.transferData.bind(this)}/>
            }/>

            
            <Route exact path="/Continuous2" component={
              () => <NodeComponent   fixed = {1}
                                      opac = {"dynamic"}
                                      nodes = {this.state.nodes.slice(1,this.determineCounterReturn("continuous2",-1) + 1).map((node, i) => (
                                        {key:node.key,
                                          name:node.name,
                                          size:node.size,
                                          fixed: true,
                                          color: node.color,
                                          sex: node.sex,
                                          age: (node.continuous2 != -1 ? node.continuous2.toFixed(2):0.5),
                                          categoryColor: node.categoryColor,
                                          x:(node.continuous2 != -1 ? node.continuous2*AVBWIDTH + NODERADIUS:SVGWIDTH/2),
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
                                      textDescription = {SCREENDESCRIPTIONS[6]}
                                      transferCallBack = {this.transferData.bind(this)}/>
            }/>

                                                    
            <Route exact path="/Interconnection" component={
              () => (MOBILE ? <NodeComponent nodes = {this.state.nodes.slice(1).map((node, i) => (
                                                      {key:node.key,
                                                        name:node.name,
                                                        size:node.size,
                                                        fixed: false,
                                                        color: (this.state.source == node.key ? "#00ff00" : node.color),
                                                        sex: node.sex,
                                                        age: node.age,
                                                        categoryColor: node.categoryColor,
                                                        x:node.fixedPosX,
                                                        y:node.fixedPosY,
                                                        opac:(this.state.source === -1 ? node.link > 0 : hasLink(this.state.links,this.state.source,node.key)),
                                                        float:false,
                                                        link:node.link,
                                                        floatX:node.floatX,
                                                        floatY:node.floatY
                                                        }
                                              ))}
                                              route = {"/End_of_Study"}
                                              opac = {"conditional"}
                                              prevNodes = {this.prevNodes}
                                              counter = {-1}
                                              links = {[]}
                                              foci = {this.state.foci.slice(1)}
                                              prevFoci= {this.prevFoci}
                                              callBackNodes = {this.networkNodesCallback.bind(this)}
                                              collectHistory = {this.collectHistory.bind(this)}
                                              textDescription = {SCREENDESCRIPTIONS[7]}
                                              transferCallBack = {this.transferData.bind(this)}/>
                                                                                  
                                              :
                                                                                        
                              <NodeComponent nodes = {this.state.nodes.map((node, i) => (
                                                  {key:node.key,
                                                    name:"",
                                                    size:(MOBILE ? 10 : 12),
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
                                              route = {"/End_of_Study"}
                                              counter = {-1}
                                              float = {1}
                                              links = {this.state.links}
                                              foci = {this.state.foci.map((focus,i) => (
                                                            {key:focus.key,
                                                            x:(this.state.nodes[i].floatX? this.state.nodes[i].floatX: box_layout(i)[0]),
                                                            y:(this.state.nodes[i].floatY? this.state.nodes[i].floatY: box_layout(i)[1])}
                                                      ))}
                                              prevFoci= {this.prevFoci}
                                              callBackNodes = {this.networkNodesCallback.bind(this)}
                                              collectHistory = {this.collectHistory.bind(this)}
                                              textDescription = {SCREENDESCRIPTIONS[7]}
                                              transferCallBack = {this.transferData.bind(this)}/>)
            }/>

            <Route exact path = "/End_of_Study" component={ () => <Thanks textDescription = {SCREENDESCRIPTIONS[8]} transferCallBack = {this.transferData.bind(this)}/>}/>
          </div>
        </div>
      </HashRouter>
    );
  }
}

export default Main;
