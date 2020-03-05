# Visualizing Large Dynamic Networks using Gentle

GENTLE's main purpose is to handle the interaction between the powerfull data-driven visualization framework d3.js and the popular front-end framework React. As was shortly mentioned in the README in the main branch, those frameworks both come with the capacity for rendering content in the browser and are thus often in conflict. The basic graph component we introduced in the past thus detaches the rendering of the network from the remainder of the web-app. React handles the rest, including both the much needed routing which allows participants to navigate freely between all of the views included in a single study as well as the updates of all necessary information on all relevant views.

One of the problems with the Graph component stems from the fact that to determine the position of each node it relies on foci. Each node gravitates towards its focus as soon as the underlying force simulation of d3.js' force module is started. Additionally, nodes remain in place once they have reached the focus point. It is possible to disable the foci driven allocation of the nodes, and we do that for example for views that require participants to drag nodes into boxes to allocate them to some category. In that case d3.js relies on the position of the node itself, which is updated whenever one interacts with a node.

Why is the foci-based allocation of the nodes a problem you might ask? While it works perfectly for views where the nodes do not need to change there position frequently it limits the creation of large dynamic Networks: If for example one attempts to create a Network that dynamically rearranges the node positions based on connections between them using the standard Graph component the results will be disappointing. The nodes will be pulled towards both their original foci and the nodes they are connected to, which will interfere with a free re-allocation based only on the connections between the nodes.

Intuitively one might want to simple disable the foci-based allocation of the nodes for this component. However, the combination with React would render such a solution unfeasible. Since adding or removing links triggers a callback and requires an update of the state, so that the new information are correctly transferred to all relevant children, the nodes would literally fly all over the screen due to the re-rendering triggered by the update to the state of the components. Eventually, the nodes would settle due to the gravitational constraints applied to the force simulation as well as the constraints provided by the links. However, the visual experience would be a poor one. Additionally, the networks orientation would change after each re-render, which would require participants to re-orientate themselves before they can continue.

While it is possible to prevent React from re-rendering, doing so is a sub-optimal solution in many regards and might also not be supported in the future. Hence, to prevent those complications and to still allow for large re-arranging dynamic networks we reworked the Graph component and also provide an updated implementation of the callback responsible for updating the links for each node. The basic idea is to switch between disabling the foci-based allocation of the node positions, so that the Network can re-arrange itself based on the connections between the nodes and enabling it, to provide stability and stationarity to the Network so that the re-render does not propell nodes over the entire screen. 

We achieve this by using the callback responsible for inserting/removing links to determine whether a node should be allowed to float arround freely or should remain stationary. Nodes should float around when they are connected to another node. There is one exception to this rule: When a node is initially clicked (when the node is the source of a link) all nodes should remain stationary so that participants can then connect the node to the target node. This initial click to the source node triggers the callback, which then makes all nodes stationary: The current position of each node is used to determine its static position. This has the advantage that nodes currently part of a network are fixed in place, which prevents them flying all over the screen. As soon as the target node is then clicked all nodes currently connected to the network are allowed to float freely again, allowing the network to reorganize itself. Since the nodes were locked in position beforehand, they are not flying in from some distant position on the screen, which again prevents the poor visual experience of a sudden re-render of the network. If a node has no link to begin with or all links to a node are removed the position of the node simply becomes its original focus again.

```
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
```

The callback thus has to update the link count for each node. Additionally, it uses the link count to update the shouldFloat property of each node, which is then used by the render call to the Graph component in the Main component to determine the final float property of each node.

```
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
                                                                              ...

```
The float property is then used by the Graph component to determine whether foci-based allocation should be used for a node or not, exactly in the same way it was already determined for views where nodes could be dragged around.

```
this.force.nodes().forEach(function (d, i) {
       if ((!d.fixed & !d.float)){
        d.y += (foci[i].y - d.y) *k;
        d.x += (foci[i].x - d.x)* k;
        }
```

We also made some additional changes to the Graph component itself. It can now receive an addtional boolean float property (not to be confused with the float property for each node). This property is used to decide whether the gravity and linkDistance parameters of the underlying force simulation from d3 should be manipulated or not. For the dynamic network view we increased the gravity slightly to attract nodes to the center of the screen. Additionally, we use the link property of each node we introduced earlier to determine the length of each links. Links to Nodes that have multiple links already receive a higher length value to allow for a better distribution of the network.

```
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
```

Finally, in the example uploaded here we added a "You" node. In the callback we prevent links to the "You" node since we believe that its main purpose is to serve as a visual anchor. This is mainly due to the fact that commonly participants are asked to connect the nodes to individuals representing people that participants have some relationship with. If that is the case adding links from each node to the "You" node is not only redundant but can also be perceived to be frustrating. We still include the "You" node because due to the combination of the fact that nodes repell each other if they are not connected and the gravitational forces attracting nodes to the center, the networks will float around the "You" node providing a pleasant visual experience. It is however easy to omit the "You" node entirely or to enable links to the "You" node as described in the comments added to the callback.


