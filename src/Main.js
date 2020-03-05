import React, { Component } from "react";
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import NodeButtonComponent from"./NodeButtonComponent";
import NodeComponent from"./NodeComponent";
import { Navbar, Nav, NavItem} from 'react-bootstrap';


class Main extends Component {

  constructor(props){
    super(props);
    this.ID = this.props.ID;
    this.state = {nodes:[{key:0,name:"You",categoryColor:"green",color:"green",size:10,x:575,y:300,floatX:575,floatY:300,fixed:false,float:false,link:false,shouldFloat:false}],
                  links:[],
                  foci:[{key:0,x:600,y:320}],
                  counter:0,
                  colors:["red","orange","green","yellow"],
                  source:-1};
    this.prevNodes = [];
    this.prevFoci = [];
    
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
    let nodes = this.state.nodes.slice(1);
    for(let i = 0; i < nodes.length; ++i) {
      if(nodes[i][key] !== criterion){
        ++output;
      }
    }
    //console.log(output, key,criterion);
    this.setState({counter:output});
  }

  createNodesCallback = (counter) => {
    //updates counter for edits of name
    this.setState({counter:counter});
    

  }
  createNodesButtonCallback = (name) => {
    //data creation
    console.log(name,this.state.counter,this.state.nodes.length,this.state.nodes)
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
          let sex = (Math.floor(Math.random()*2)? "male":"female")
          let catColor = this.state.colors[Math.floor(Math.random()*4)]
          nodes.push({
            key:counter,
            name:name,
            size:(window.innerWidth < 700 ? 20:30),
            fixed:false,
            float:false,
            link:false,
            color:(sex == "male" ? "#4AABCA":"#DF6263"),
            sex:sex,
            age:"",
            categoryColor:catColor,
            x:250,
            y:250,
            floatX:0,
            floatY:0,
            shouldFloat:false
          })

          let svgWidth = (window.innerWidth < 700 ? document.getElementById("content").clientWidth - 50:document.getElementById("content").clientWidth);
          let svgHeight = window.innerHeight *0.7;


          

          foci.push({
            key:counter,
            x:((svgWidth/2) + ((counter % 2)?1.15*(svgHeight/2*0.8):svgHeight/2*0.8)*Math.cos((counter / 25 * Math.PI * 2) - 2)),
            y:((svgHeight/2) + ((counter % 2)?1.15*(svgHeight/2*0.7):svgHeight/2*0.7)*Math.sin((counter / 25 * Math.PI * 2) - 2))
          })
          
          this.setState({nodes:nodes,foci:foci,counter:counter + 1})
          ;
        }
    }
  }


  networkNodesCallback = (counter, forceNodes) => {
    /*
    Basic Principle:
       When a source is set below, a snapshot of the network is created
       and the nodes are fixed using foci. When a link is popped or created
       the nodes are allowed to float to find their position again.
    */
   
    let links = JSON.parse(JSON.stringify(this.state.links));
    let nodes = JSON.parse(JSON.stringify(this.state.nodes));
    let foci = JSON.parse(JSON.stringify(this.state.foci));
    let source = this.state.source;
    let hasLink = 0;
    let linkAt = 0;

    if(source === 0 || counter === 0) {
      //prevents connections with "You" Node. While the "You" node provides
      //a visual anchor it is often redundant to require participants to connect
      //each node to it since it is often explicitly asked to name xy people that you know
      //which makes those connections redundant.
      source = -1;
      this.setState({source:source})
    } else {
      if(source === -1) {
        //initializing source

        for(let i = 0; i < nodes.length; ++i) {
            nodes[i].floatX = forceNodes[i].x;
            nodes[i].floatY = forceNodes[i].y;
            nodes[i].shouldFloat = false;
        }
        this.setState({source:counter, nodes:nodes});
      } else {
          //"source != -1"
          if(source !== counter){
          
          for(let i = 0; i < links.length; ++i) {
            //check whether a link exists for a node that needs to be deleted
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
            //has link update link counter for both nodes that were seperated
            links.splice(linkAt,1);
              nodes[source].link -= 1;
              nodes[counter].link -= 1;
          } else {
              //has no link thus pushing link
              links.push({key:(links[links.length - 1] ? links[links.length -1].key + 1:1),
                          source:source,
                          target:counter
                        });
                nodes[source].link += 1;
                nodes[counter].link += 1;

          }
          for(let i = 0; i < nodes.length; ++i) {
            //Determines wheter a node should float. A node should float
            //if it is part of a Network. In that case the position of the node
            //is updated with the last known position in the network as rendered by the
            //Graph component. Otherwise a node just receives its traditional foci.
            if(nodes[i].link && i !== 0) {
              nodes[i].floatX = forceNodes[i].x;
              nodes[i].floatY = forceNodes[i].y;
              nodes[i].shouldFloat = true;
            } else {
                nodes[i].floatX = foci[i].x;
                nodes[i].floatY = foci[i].y;
                nodes[i].shouldFloat = false;
            }
          }

        }
        source = -1;
        this.setState({source:source, links:links, nodes:nodes});
        
      }
      
    }
  }



   

  render() {
    return (
      <HashRouter>
        <div>
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Navbar.Brand href="/">Dynamic Networks V1</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="mr-auto">

                  <NavItem>
                    <NavLink className ="nav-link" exact to="/" onClick={() => (this.setState({counter:this.state.nodes.length}))}>1) Enter Nodes</NavLink>
                  </NavItem>               
                  <NavItem>
                    <NavLink className ="nav-link" exact to="/Interconnection">9) Connect them!</NavLink>
                  </NavItem>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <div id="content" className="content container">
            <Route exact path="/" component={ () => <NodeButtonComponent nodes = {this.state.nodes.slice(1)}
                                                                         route = {"/Interconnection"}
                                                                         max = {24}
                                                                         prevNodes = {this.prevNodes}
                                                                         counter = {this.state.counter}
                                                                         links = {[]}
                                                                         foci = {this.state.foci.slice(1)}
                                                                         prevFoci= {this.prevFoci}
                                                                         callBackNodes = {this.createNodesCallback.bind(this)}
                                                                         callBackButton = {this.createNodesButtonCallback.bind(this)}
                                                                         collectHistory = {this.collectHistory.bind(this)}
                                                                         textDescription = {"1) Enter Names."}/> }/>
            
                                                            
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
                                                                                      x:(this.state.nodes[i].floatX ? this.state.nodes[i].floatX: focus.x),
                                                                                      y:(this.state.nodes[i].floatY ? this.state.nodes[i].floatY: focus.y)}
                                                                                ))}
                                                                         prevFoci= {this.prevFoci}
                                                                         callBackNodes = {this.networkNodesCallback.bind(this)}
                                                                         collectHistory = {this.collectHistory.bind(this)}
                                                                         textDescription = {"2) Connect the Nodes!"}/> }/>

          </div>
        </div>
      </HashRouter>
    );
  }
}

export default Main;