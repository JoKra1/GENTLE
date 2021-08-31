# A description of the props and callbacks passed down from main

This document contains a list of the props and callback functions passed down from
the main component to the different node components.

## Callbacks
There are three different callback props.

### callBackButton
The function passed as argument to this prop is called when "the" button on
a screen is interacted with. This prop is only used for NodeButtonComponents,
NodeCategoriesComponents, and NodeSliderComponents since only those have buttons.

Pre-defined generic button callbacks are:
- createNodesButtonCallback
- changeCategoryButtonCallback
- changeSliderButtonCallback

Each of those basically is designed for one of the three compatible components listed above. The callbacks are defined in the main component. Generally, their
role is to update the state of the nodes, foci, and links once a button is pressed.

### callBackNodes
Like callBackButton but is called when a node is interacted with. What such an
interaction triggers depends on the arguments passed down with this callback in the
main component. callBackNodes basically needs to be provided for each screen.

Pre-defined generic node callbacks are:
- genericNodesCallback
- changeSexNodeCallback
- continuousGenericCallback
- booleanNodeCallback
- networkNodesCallback

The latter four should only be used with NodeComponents. The latter four are
very generic. Hence, the node attributes which they should manipulate need to be
passed down with the callback method (see main component examples).

### transferCallBack
Ensures that data is stored both locally and transferred back to the backend.
A relatively simple transferData() function is defined in the main component that
is always passed to this prop. Any other function can be defined, but it should
always update the session storage and transfer the data back to the backend.

Is usually called when the user navigates to the next screen.

## Simple Props

### counter
Most components receive this prop, which is used as an index to the next node that
should be updated after receiving input from the user.

### fixed
Used to determine whether nodes can be dragged around by the user and then stay
in the position where the drag ended.

### foci
Nodes are positioned using target foci, nodes are smoothly moved to their dedicated foci point.

### links
Similar to nodes, reflects the connection between two nodes using a source and target attribute as required by d3.

### max
Maximum number of nodes ( - 1) that the name generator should permit to be added.

### nodes
This prop receives the node data from the main component and passes it down to lower-order components. It includes, for example, the coordinates of a node, its size, its name, etc.

### opac
Should be a string to refer to the four opaque modes:

- static: all nodes have 0.7 opacity
- dynamic: opacity depends on x coordinate
- conditional: all "active" nodes have an opac of 1 (boolean)
- other: next-to-be updated node has 0.65 opacity

For the "conditional" mode, nodes need to have an .opac attribute that determines
whether a node counts as active or not.

### prevFoci
Similar to prevNodes. See collectHistory for more.

### prevNodes
Receives the last state of the nodes before they were manipulated. prevNodes are stored in the Main component but not in the state since no re-rendering is necessary after they have been updated. See collectHistory for more.

### route
Address to which to navigate from the current screen. Should be a string (see main component for examples).

### sliderUpdateValue
Function passed to this prop should return an integer value. Determines value displayed next to node on slider screen.

### textDescription
Simple string passed down to the components to provide an explanation for the users.

## Other

### collectHistory
since the graph visualizationv is extremly dynamic there are many re-renders. collectHistory is used to decide whether to render the nodes and their positions(foci) in a static or dynamic way. The functionality is implemented in the GRAPH component. A dynamic render updates the entire graph - resulting in nodes floating back in until they reach their foci. In case no changes to positions are necessary a static render is more appropriate. The collectHistory callbacl receives a function that stores a history of nodes and their foci to check which render is necessary.
