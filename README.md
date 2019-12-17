# gentle_react_V3

## Introduction:

GENTLE - The Grapical Ego-Network Tool for Longitudinal Examination, is a frontend framework including multiple modular components designed to allow researchers to easily gather data about social networks. Gentle runs on React and relies on the D3.js library for the data-driven visualisation of individuals involved in a social network. Those individuals are represented as nodes and GENTLE offers various ways to manipulate, interact with, and change the nodes and relationships between them in an easy, playful way.

A Demo version of Gentle can be tested [here](https://gentle_react_demo-joshuakrause213781.codeanyapp.com/).
Note: The screen where nodes can be placed in boxes might not work on all screens. We do not collect any data during the demo process.

## Content:

GENTLE relies on React which allows the usage of multiple reusable components. GENTLE's core component is the GRAPH component, which handles everything related to D3.js. This includes nodes, links, rectangle boxes, and text fields. The GRAPH component is relatively low-level and allows deeper modifications to the way the nodes behave. Additionally, the GRAPH component handles the conncetion between the data and the visualization, which is the main objective of D3.js. D3 and React are similar in that they both want the control about the DOM, which can lead to conflicts. We decided to seperate the libraries as much as possible and let D3 take control of the dynamic parts of  each rendered view, including the nodes and links. React serves the remaining static content and most importantly provides the foundation for the routing ability. We rely on react-router for routing and this example will cover the HashRouter, other implementations however are possible as well (BrowserRouter offering native URLS).

To connect d3 and react we created several higher level components that we plan to extend in the future: NODEBUTTON, NODECATEGORIES, NODE, and NODESLIDER. Those components reference the GRAPH component and display the nodes and potential links between them. However, they also provide static content to interact with those nodes: buttons, sliders, input forms, etc.

The final important component is the MAIN one. Here we implement the routing as well as the logic of data manipulation. Its representation in the final App also serves as a navigation bar so that users can reach the different views. The data, either created in the app or fetched from a server, will only exist in the state of the MAIN component. We use props to pass the data to the lower components. The reason for this is that if changes occur in one of the lower components, React will make sure that they are reflected in all other components as well, because they all rely on the central state in the MAIN component. This fully utilizes React's typical parent -> child flow of information. To transport information from the children back to the parent component we rely on callback functions. Those are defined in the MAIN component and passed down to the lower components as props. Like regular props, those callback functions can then be used by the lower order components but will conveniently affect the state of the MAIN component, which will lead to the desirded re-render of the lower component.

The callback functions handle the logic and serve as the interface between the user and the underlying data. All components receive a node-callback, which listens to any interaction between the user and a node e.g. through clicking or dragging the node. Some components, like the NODEBUTTON and NODECATEGORY component receive additional callbacks that handle user interaction with the static elements such as buttons or sliders. We will cover the props more extensively in the next section.

## Props:
We use props to pass data down to the lower components and to receive updates about the manipulation of the data from lower components.

- nodes:
this prop receives the node data from the main component and passes it down to lower-order components. It includes, for example, the coordinates of a node, its size, its name, etc.

- prevNodes:
corresponds to the last state of the nodes before they were manipulated. prevNodes are stored in the Main component but not in the state since no re-rendering is necessary after they have been updated. See collectHistory for more.

- fixed:
used to alter functionality of the nodes. They can then be dragged around by the user and are used in the graph component to handle the specific dragNode callback: provides coordinates of the node after a drag has ended! This is utilized by views where nodes are placed in boxes.

- counter:
some components receive this prop, which is used in the GRAPH component to indicate which node is currently targeted.

- links:
similar to nodes, reflects the connection between two nodes using a source and target attribute as required by d3.

- foci:
we position nodes using foci points, the force.alpha() value is used to smoothly move nodes to their dedicated foci point.

- prevFoci:
similar to prevNodes. See collectHistory for more.

- categories:
used by the NODE, NODECATEGORIES, and even the GRAPH component. This prop contains a list of objects that correspond to a specifc category. They are either rendered as buttons in the NODECATEGORIES component later on or as boxes in the NODE component relying on the the GRAPH component. 

- callBackNodes:
callback for the nodes, the logic of this callback is implemented seperately for each view in the main component. Travels all the way down to the GRAPH component.

- callBackButton:
callback for static elements of second order components such as NODEBUTTON. Does not travel all the way down to GRAPH. The logic is again implemented for each view.

- sliderUpdate:
callback for the NODESLIDER component specifically. Connects the slider value to the corresponding node using the counter value.

- collectHistory:
since our visualization is extremly dynamic we experience a lot of re-renders. We use collectHistory to decide whether we want to render the nodes and their positions(foci) in a static or dynamic way. The functionality is implemented in the GRAPH component. If we would always render the nodes dynamically they would always "fade in" until they reach their foci. However, if we only want to update the color or name of a node we do not need to show any movement. For situations like this we implemented two checks in the GRAPH components that decide whether a node will be rendered statically or fly in dynamically. Those checks rely on the previous state of both the nodes and their corresponding foci.

- textDescription:
Simple string passed down to second order components to provide an explanation for the users.

## Second-order Components:

- NODESLIDER
This component renders the GRAPH component as well as a simple slider and a button. When clicked the button will call the callBackButton and return the current counter and slider value to the MAIN component. The slider value is updated on each slider change.

- NODEBUTTON
This component renders the GRAPH component as well as an input form and a button. When clicked the button will call the callBackButton and return the input value using React's createRef() function.

- NODECATEGORIES
This component renders the GRAPH component and a flexible number of buttons that are defined in the MAIN component as received in the category prop. The map fuction is used for this.

- NODE
This component renders only the GRAPH component. Optionally categories are passed down to the GRAPH component. The GRAPH component will then create a rectangle and text for each of the categories.

## Example:

In this section we will slowly walk through the different components and connect them in a simple example to show the functionality of GENTLE. We assume that the user went through the steps of creating a react app using for example [create-react-app](https://github.com/facebook/create-react-app). 

We start with a basic HTML construct that contains a single div that is of importance, which receives the id "root". Next we create a simple index.js file that serves as an entry point for our app:

```
import React from "react";
import ReactDOM from "react-dom";
import Main from "./Main";
import "./css/style.css";


ReactDOM.render(
  <Main/>, 
  document.getElementById("root")
);
```

Here we call our MAIN component in React's render function. The MAIN component basically encapsulates all the remaining components and it will always be visible in every view in form of the navigation bar. The MAIN component obviously also needs to be created in form of a simple Main.js. Let's start with importing all important modules:

```
import React, { Component } from "react";
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import NodeButtonComponent from"./NodeButtonComponent";
import NodeComponent from"./NodeComponent";
import NodeSliderComponent from"./NodeSliderComponent";
import NodesCategoriesComponent from "./NodeCategoriesComponent";
```
We imported React again, react-router-dom for the routing and the components we want to showcase in this example. In the Main.js file we now go through the basic steps of creating an ES6 class that extends React's component. In the constructor we will inherit all of component's functionality and later set up all of our data. In the end we import it so that the index.js file can make use of it:

```
class Main extends Component {

  constructor(props){
    super(props);
  }
  
  render() {
  return (
    <HashRouter>
      <div>
        <ul className="header">
        </ul>
        <div id= "content className="content container">
        </div>
      </div>
     </HashRouter>
    );
  }
}

export default Main;
```

We have set up everything of importance in the render function again. As you can notice we already wrapped everything in the HashRouter tag. The rendered div contains an unordered list that later corresponds to our taskbar and an empty div that we will fill with the content rendered by our second-order components. There are multiple tutorials out there showing how to setup NavLink and Routing for SPA's so we are just going to fill the header with the links to the 5 example pages we want to highlight:
  
 ```
<li><NavLink exact to="/">NODEBUTTON</NavLink></li>
<li><NavLink to="/NODESLIDER">NODESLIDER</NavLink></li>
<li><NavLink to="/NODECATEGORIES">Age</NavLink></li>
<li><NavLink to="/NODEBOXES">NODEBOXES</NavLink></li>
<li><NavLink to="/NODES">NODES</NavLink></li>
 ```
 
 Finally we fill the content div with the Routes that will ultimately render the component. We only picture one here:
  
 ```
 <Route exact path="/" component={ () => <NodeButtonComponent nodes = {}
                                                                         prevNodes = {}
                                                                         counter = {}
                                                                         links = {}
                                                                         foci = {}
                                                                         prevFoci= {}
                                                                         callBackNodes = {}
                                                                         callBackButton = {}
                                                                         collectHistory = {}
                                                                         textDescription = {"First example Page, showing the node
                                                                                             creation process. This description
                                                                                             is rendered by the NODE component."}/> }/>

 ```
 No we need to prepare the data that we will want to pass down to the components. Thus we need to go back to the constructor in the MAIN component. We update this constructor with placeholders for our data. Since we want to highlight the NODECATEGORY component as well as the NODE component's box functionality, we create some categories here as well:

```
  constructor(props){
    super(props);
    this.state = {nodes:[],
                  links:[],
                  foci:[],
                  counter:-1,
                  source:-1};

    this.prevNodes = [];
    this.prevFoci = [];

    this.categories = [{key:0, text:"Category0", color:"#E27D60"},
                       {key:1, text:"Category1", color:"#85DCBA"},
                       {key:2, text:"Category2", color:"#E8A87C"}];

    this.boxes = (window.innerWidth > 700 ? [{key:0, text:"Box0", color:"#BA85DC", x:15, y:(window.innerHeight*0.7 -200),
                                              width:window.innerWidth*0.22, height:window.innerHeight*0.17},
                                             {key:1, text:"Box1", color:"#DCBA85", x:280, y:(window.innerHeight*0.7 -200),
                                              width:window.innerWidth*0.22, height:window.innerHeight*0.17},
                                             {key:2, text:"Box2", color:"#C38D9E", x:545, y:(window.innerHeight*0.7 -200),
                                              width:window.innerWidth*0.22, height:window.innerHeight*0.17},
                                             {key:3, text:"Box3", color:"#E8A87C", x:810, y:(window.innerHeight*0.7 -200),
                                              width:window.innerWidth*0.22, height:window.innerHeight*0.17}
                                            ]:
                                            [{key:0, text:"Box0", color:"#BA85DC", x:15, y:(window.innerHeight*0.7 -365),
                                              width:window.innerWidth*0.8, height:window.innerHeight*0.20},
                                             {key:1, text:"Box1", color:"#DCBA85", x:15, y:(window.innerHeight*0.7 -150),
                                              width:window.innerWidth*0.8, height:window.innerHeight*0.20}
                                            ]
                  )

  }
```
The objects and lists we created here correspond to the props described in the earlier session. We initialize counter and source with -1 for reasons that we will discuss when creating our first callback. The key:value pairs that belong to each category and box are utilized by the lower order components to identify where to place a box and how many buttons to create. For example the NODECATEGORIES component handles the button placement like this:

```
<div className="container" id="userInputStd">
  {this.props.categories.map( (category, i) => (
      <button key = {category.key} type="button" style={{background:category.color}} className={category.text} value={category.text}
       onClick={() => this.updateCounter(category.key,category.text)}>{category.text}</button>
  ))}
</div>
```

The boxes are handled by the GRAPH component:

```
<g id="boxes">
{(this.props.categories ? this.props.categories.map( (category, i) => (
    <text key={category.key} x={category.x} y={category.y -10}>{category.text}</text>
  )):<g/>)}
  {(this.props.categories ? this.props.categories.map( (category, i) => (
    <rect className="CategoryBox" key={category.key} width={category.width} height={category.height} x={category.x}
     y={category.y} fill="transparent" stroke={category.color} strokeWidth="5"/>
  )):<g/>)}
</g>
```

Since the lower-order components rely on the props passed down, all important information can be specified in the MAIN component, ensuring modularity. Before we start implementing the views we need to include one important callback that all components will receive: collectHistory. This callback is passed all the way down to the GRAPH component which will use it to decide how to render the nodes. The callback looks like this:

```
  collectHistory = (nodes,foci) => {
    //collects previous nodes + positions used to decide type of render
    this.prevNodes = JSON.parse(JSON.stringify(nodes));
    this.prevFoci = JSON.parse(JSON.stringify(foci));
  }
```


Now let's start implementing some functionality to our five views. Typically, the first view should be used to create nodes for the desired number of individuals. Optimally, a node should be initialized with a name. Therefore, we use the NODEBUTTON component that offers an input form as well as a button. Since we want to create a node each time the button is clicked we implement this logic in a function that we will then pass to the callBackButton prop:

```
  createNodesButtonCallback = (name) => {
    //data creation
    if(this.state.counter < this.state.nodes.length) {
      //received edit callback previously
      let nodes = JSON.parse(JSON.stringify(this.state.nodes));
      nodes[this.state.counter].name = name;
      this.setState({nodes:nodes,counter:-1});
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
            size:40,
            fixed:false,
            color:"#85BADC",
            sex:"male",
            age:"",
            category:"",
            categoryColor:"white",
            x:250,
            y:250
          })

          foci.push({
            key:counter,
            x:((document.getElementById("content").clientWidth/2) + ((window.innerHeight*0.7)/2)*0.8*Math.cos((counter / 5 * Math.PI *
                2) - 2)),
            y:(((window.innerHeight*0.7)/2) + ((window.innerHeight*0.7)/2)*0.8*Math.sin((counter / 5 * Math.PI * 2) - 2))
          })

          this.setState({nodes:nodes,foci:foci});
        }
    }
  }
```
The control flow might appear confusing on first sight but will become more obvious as soon as we implement the callBackNode function:

```
  createNodesCallback = (counter) => {
    //updates counter for edits of name
    this.setState({counter:counter});

  }
```
The following happens in these two functions: The first function receives an attribute called name from the component it is passed to. In our case that is the NODEBUTTON component. We initialized the counter with -1. So we can ignore the first if-statement for now. Subsequently, we use the length of the nodes stored in the state (created in the constructor) of the MAIN component to determine whether we have reached our specified limit of nodes: in this example 5. A second check makes sure that the name this callback received from the lower-order component is not just an empty value. If all those checks are sucessfully passed the function creates a node and a focus that belongs to this node. It is up to you whether you want to store additional attributes in the nodes but those included in this example need to be present, unless you want to make changes to the GRAPH component. We create foci that correspond to a circular alignment of the nodes, but again it is up to you what coordinates you choose. Finally, we update the state using React's setState() function, which will enforce a re-render. This re-render ensures that the changes will be reflected in the lower-order component.

The second function is the callback for an interaction with the nodes. When an existing node is clicked, this callback will be received in the MAIN component, updating the counter stored in the state of MAIN. The counter argument reflects the Key/ID attribute of the respective node. This is handled in the GRAPH component:

```
    v3d.append("circle")
        .attr("class", "Node_center")
        .attr("id", (d) => d.key)
        .attr("r", (d) => d.size)
        .style("fill", (d) => d.color)
        .on("click", (d) => this.callback(d,this));

  callback = (d, _this) => {
    this.force.alpha(0.2);
    this.props.callBack(d.key);
  }
```
Now that we looked at the callback for the nodes, the first if-statement in the createNodesButtonCallback() function should make more sense to you: Once an existing node was clicked we do not want to add a new node when the confirm button is used the next time but rather update the name of an existing node. Afterwards we set the counter back to -1 and update the state again.

Now that we have created our first view let's move to the second one to make use of the NODESLIDER component. We again have to create callback for the button and the nodes, but also for the value of the slider. In our exammple we use the slider to update the age associated with a node. First let's look at the callback for the button:

```
  changeAgeSliderCallback = (id, age) => {
    //updates age associated with node.
    if(id >= this.state.nodes.length){
      alert("You provided the age for every person, thank you. Click on a node to change their age!");
    } else{
        let nodes = JSON.parse(JSON.stringify(this.state.nodes));
        nodes[id].age = age;
        this.setState({nodes:nodes, counter: id + 1});
    }

  }
```

Again we provide a simple warning message in case the user attempts to update the age for an index value out of bounds. This is necessary due to the way we initialize the counter when visiting a view:

```
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
```
This function will be called when visiting a page that relies on updating the attribute for each node one by one. Thus, when a user visits the view used to update the age for the first time, the counter will be zero since no node has a value for age. They can manually change the counter by clicking on nodes but otherwise it will simply increase until no nodes without age are left, which will trigger the warning described for the last function should the user attempt to click the confirm button again. This provides additional convenience for users that do not make many changes since they will simply be guided through all nodes. To use this function simply include it in the list of links created earlier:

 ```
<li><NavLink exact to="/">NODEBUTTON</NavLink></li>
<li onClick={() => (this.determineCounter("age", ""))}><NavLink to="/NODESLIDER">NODESLIDER</NavLink></li>
<li><NavLink to="/NODECATEGORIES">Age</NavLink></li>
<li><NavLink to="/NODEBOXES">NODEBOXES</NavLink></li>
<li><NavLink to="/NODES">NODES</NavLink></li>
 ```
Now we still need to implement the callback for the nodes and the slider value. The following two functions take care of this:

```
  changeAgeNodesCallback = (counter) => {
    //updates counter for edits of Age
      this.setState({counter:counter});
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
  
```

The callback for the Nodes works exactly like the last node callback. Thus you could simply use the same function. However, if you want to provide more functionality it might be useful to include seperate callBacks for each view. Thus, we provide a callback for the nodes of each view seperately. The sliderUpdateValue () function includes multiple checks to ensure that nothing goes wrong even when a person opens this page before creating any nodes. If there is a node corresponding to the current counter, the slider value will corectly reflect the age of that node. This is handled in the componentDidMount() function in the NODESLIDER component:

```
  componentDidMount(){
    let nodes = JSON.parse(JSON.stringify(this.props.nodes));
    if(this.props.counter < nodes.length){
      let updateValue = JSON.parse(JSON.stringify(this.props.sliderUpdate));
      this.setState({value:updateValue});
    } else {
      this.setState(this.state);
    }

  }
```

Now, our app features two views already. Let's create another one with the NODECATEGORIES component. This time we need two callbacks again, one for the nodes and one for the buttons. Let's start with the callback for the buttons.

```
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
```
Again, after a simple check the data of the corresponding node is updated. This callback relies on the categories we created in the constructor earlier, receiving all important attributes from them. The changes will be reflected in the nodes using the category and categoryColor attributes but also in the visualization. The GRAPH component uses the attribute categoryColor to add an additional distinctive colored ring to a node:

```
    v3d.append("circle")
        .attr("class", "Node_rel")
        .attr("id", (d) => 'rel_' + d.key)
        .attr("r", (d) => d.size +5)
        .style("stroke", (d) => d.categoryColor)
        .style("stroke-width","1.5%")
        .style("fill","none");
```

Finally, we simply add another callback for the nodes to update the counter and then we are already done with this view:

```
  changeCategoryNodesCallback = (counter) => {
    //updates counter for edits background
      this.setState({counter:counter});
  }
```

Again, you could use the same callback but we prefer creating an individual one to allow for later modifications more easily. Let's now create a view using the NODES component that features boxes. First, let's add a key value pair: box:"" to the createNodesCallback. Also add two key values pairs for: fixedPosX:0, fixedPosY:0. This will reflect in the data in which box a node was placed in. For this view we only need a callback for the nodes. However, we will make use of the fixed prop and also change the position of nodes in the actual component render call, highlighting more complex manipulations of the props. Let's start with the callback for the nodes:

```
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
        
        this.setState({nodes:nodes});
       }
    }
  }
```
Again, this function relies on the data from the boxes created in the constructor. We receive as arguments the key and coordinates of a node to determine whether a node was placed in a box and, if that is the case, in which one. The function is passed down as the callBackNodes prop but it is called differently in the GRAPH component:

```
  this.force.drag()
  .on("dragend", (e) => this.dragCallBack(e))
    
  dragCallBack = (e) => {
    //for fixed nodes
    if(this.props.fixed) {
      this.props.callBack(e.key, e.x, e.y);
    }
  }
    
```
The second function presented here also highlights why we need the fixed prop this time! Now we only need to manipulate the actual render call in the MAIN component and we will be done with this view as well:

```
            <Route exact path="/NODEBOXES" component={ () => <NodeComponent  fixed = {1}
                                                                              nodes = {this.state.nodes.map((node, i) => (
                                                                                      {key:node.key,
                                                                                        name:node.name,
                                                                                        size:node.size,
                                                                                        fixed:true,
                                                                                        color: node.color,
                                                                                        sex: node.sex,
                                                                                        age: node.age,
                                                                                        categoryColor: node.categoryColor,
                                                                                        x:(node.fixedPosX !== 0 ?
                                                                                            node.fixedPosX:(200 + (175*i))),
                                                                                        y:(node.fixedPosY !== 0 ?
                                                                                            node.fixedPosY:(250))
                                                                                       }
                                                                              ))}
                                                                              prevNodes = {this.prevNodes}
                                                                              counter = {-1}
                                                                              links = {[]}
                                                                              foci = {this.state.foci}
                                                                              prevFoci= {this.prevFoci}
                                                                              categories = {this.boxes}
                                                                              callBackNodes =
                                                                               {this.placeBoxDragCallback.bind(this)}
                                                                              collectHistory = {this.collectHistory.bind(this)}
                                                                              textDescription = {"Text"}/> }/>
```
This component render call not only shows how to implement all of the data we have created so far, it also makes use of the map() function to manipulate the props before being passed down. In this example we use the fixedPos attribute to determine where a node should be rendered. This utilizes the previously generated function for the callback for the nodes. Once a node was placed inside a box the fixedPos attribute will be updated and due to the manipulation in the rendering component accurately reflected in the final view. Let's create a final view using the NODE component to showcase links and the absence of boxes. Since we are using the NODE component we only need to create a callback for the nodes. This screen highlights the networking functionality, we want to allow the user to connect nodes with each other using simple clicks. The following node callback implements this:

```
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
```

The control flow looks complicated but what it does is actually relatively simple: We initialized source to -1. Now when a node is clicked we overwrite the value of source to correspond to the value of the key for the node we just clicked. If we now click another node, the first else-statement is executed. We iterate over the links we created in the constructor earlier. Should we find a link that includes the source (first node we clicked) and the target (second node we just clicked), the function drops that link from the list of all links. If, however, no link is found, one is created and pushed to the existing links. In the end we simply update the state again, causing a re-render. Since this is our only component using links it will be the only component that actually receives the links from the MAIN component as a prop. All other components will simply receive an empty array. This was the final view we wanted to showcase. The full source code is uploaded to this repo as well as the corresponding license.

## Server Interaction:

Since GENTLE is a Frontend framework we will limit this example to a general description, outlining possible choices for the communication with a Backend framework. We recommend to use an AJAX library for the data transfer and will use jquery's ajax functionality in this example. As a backend we chose express, because of its simplicity. Finally, we will rely on MongoDB to store the data. Monk is used to handle the interaction between express and the database instance. Before we start with the example, a short warning: this example is not ready for an production environment and was created merely to showcase the basics of server-client interaction using the GENTLE framework. Since there are countless Backend and AJAX libraries we leave the specific implementation to the user so that it can be tailored to their needs. Now let's start with the setup of the express server:

```
let express = require('express');
let bodyParser = require('body-parser');
let monk = require("monk");

//create app
let app = express();

//database connection
let dbLoc = 'port to the database';
let db = monk(dbLoc);
let collection = db.collection('gentle_react');

app.use(express.static(__dirname + "/build"));
app.use(bodyParser.urlencoded({extended: true}));
```
In the following step we tell express to serve the index.html file we created earlier in the process of building the react app:

```
//serve react app
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/build/index.html");
})
```

All further routing will be handled by React and since we used the Hashrouter we do not even need to specify that React should serve the html file to all possible URL requests. Now we create two Post request handlers to take care of the data exchange with the client:

```
//respond to request from client
app.post("/fetch", (req,res) => {
    collection.find().then((docs) =>{
        res.send(docs);
    })
})

//store client's data points
app.post("/ajax", (req,res) => {
    if(req.body.node) {
        collection.find({"key":req.body.id}).then((doc) => {if(doc.length == 0){
                                                                console.log("node does not exist");
                                                                collection.insert(req.body.node).then((updated) =>
                                                                {console.log(updated)})
                                                            } else {
                                                                collection.findOneAndUpdate({key:req.body.id},
                                                                    {$set:req.body.node}).then((updated) =>{console.log(updated)})
                                                            }
    })

    }

})
```

The first request will send all stored nodes that were retrieved from the database to the client. This is useful for the longitudinal usage of the framework as it ensures that deep-linking remains intact and meeningful. For example, participants could be asked to repeat some or all questions for the same individuals multiple times during a pre-defined time-period. The second request stores the nodes received from the client in the database. For simplicity reasons we simply overwrite already existing nodes in this example instead of  changing the values of attributes.
Now, all that remains is to implement the functionality to make use of the Backend in the React app. We leave it up to you to decide where to implement the Ajax logic sending data from the client to the server. One possible scenario might be to simply make this call once the study has been completed. However, while being very efficient, this method comes with the risk of loosing partial data in case participants do not complete the study. Thus, it might be useful to make the call everytime a node/link was actually manipulated. We will now show the implementation of this second scenario. We provide a very general helper function that implements the AJAX call:

```
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
```

This AJAX call includes all the information the backend requires. Now simply include this call in all the callBacks we created earlier. For example the implementation in the callback for age could look like this:

```
  changeAgeSliderCallback = (id, age) => {
    //updates age associated with node.
    if(id >= this.state.nodes.length){
      alert("You provided the age for every person, thank you. Click on a node to change their age!");
    } else{
        let nodes = JSON.parse(JSON.stringify(this.state.nodes));
        nodes[id].age = age;
        this.sendData(id,"node", nodes, "/ajax");
        this.setState({nodes:nodes, counter: id + 1});
    }

  }
```

The full implementation is included in the source code of this repository. Now, we will implement the remaining AJAX call that receives data from the server. We provide another function for this:

```
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
```
We use a promise to update the state in case data was retrieved from the server. There are multiple ways to implement this call but we decided to include it in React's componentDidUpdate function that will be called once the component was rendered:

```
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
```
Finally, all that is left to do is to run the build script to create an optimized version. For npm the command is npm run-script build. (the build version is not attached to this repository, but the express code assumes that it exists to serve the app).
