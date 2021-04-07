# Visualizing Large Dynamic Networks using Gentle
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3604009.svg)](https://doi.org/10.5281/zenodo.3604009)


![Example Networks](https://github.com/JoKra1/GENTLE/blob/dynamic-networks/examples/Gentle_Github_Network_Image.jpg)

## Introduction:

![Example Network](https://github.com/JoKra1/GENTLE/blob/master/examples/Gentle_Github_Network_Image.jpg)

GENTLE - The Grapical Ego-Network Tool for Longitudinal Examination, is a frontend framework including multiple modular components designed to allow researchers to easily gather data about social networks. Gentle runs on React and relies on the D3.js library for the data-driven visualisation of individuals involved in a social network. Those individuals are represented as nodes and GENTLE offers various ways to manipulate, interact with, and change the nodes and relationships between them in an easy, playful way.

## Disclaimer

The repository is currently undergoing a much needed overhaul. The API is outdated and documentation is missing. The repository will be updated over the course of the next weeks!

A Demo version of Gentle can be tested [here](https://www.gentle.eu/#/).
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

