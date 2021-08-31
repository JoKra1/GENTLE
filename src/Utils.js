import React, { Component } from "react";

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

/**
 * Node template
 */

 export function returnTemplateNode(counter, name) {
     return {key:counter,
            name:name,
            size:(MOBILE ? 20:30),
            fixed:false,
            float:false,
            link:false,
            color:"grey",
            sex:"",
            age:"",
            category:"",
            categoryColor:"white",
            fixedPosX:SVGWIDTH/2,
            fixedPosY:SVGHEIGHT*0.1 + (Math.random() * (SVGHEIGHT * 0.8)),
            continuous1:-1,
            continuous2:-1,
            booleanCondition:false,
            x:250,
            y:250,
            floatX:0,
            floatY:0,
            shouldFloat:false};
}

/**
 * You Node template
 */

export function returnYouTemplate() {
    return {key:0,name:"You",categoryColor:"green",
            color:"green",size:10,x:SVGWIDTH/2,y:SVGHEIGHT/2,
            floatX:SVGWIDTH/2,floatY:SVGHEIGHT/2,fixed:false,
            float:false,link:false,shouldFloat:false}
}

/**
 * Informed consent
 */

export const INFORMATION = "Place-holder for informed consent sheet.";

/**
 * Categories example
 */

export const CATEGORIES = [{key:0, text:"Cat1", color:"#E27D60"},
                            {key:1, text:"Cat2", color:"#85DCBA"},
                            {key:2, text:"Cat3", color:"#E8A87C"},
                            {key:3, text:"Cat4", color:"red"}];


/**
 * Separator for showing how the rendering of categories can also be
 * used to create visually seperating elements on screen.
 */
export const SEPARATOR = [{key:0,text:"",color:"white",x:1015,y:35,width:0,height:0},
                          {key:1,text:"",color:"green",x:SVGWIDTH*0.5,y:10,width:2,height:SVGHEIGHT*0.9}];

/**
 * Descriptions
 */

export const SCREENDESCRIPTIONS = ["1) Create Names for up to 25 alters.",
                                    "2) Cycle through multiple options, for example to collect the biological sex of alters.",
                                    "3) Assign a numerical value, for example the age of participants.",
                                    "4) Click on the buttons to assign a category to a node.",
                                    "5) Cycle through two boolean options for each node.",
                                    "6) Move nodes closer to the line to indicate proximity. Useful to measure continuous relative scales.",
                                    "7) Move nodes closer to the right to indicate proximity. Useful to measure continuous relative scales.",
                                    (MOBILE ? "8) Link connected people together and split existing links by clicking on two connected nodes.":
                                              "8) Link connected people together by first selecting a node (becomes colored in green) and then clicking on all the other nodes connected to this one. Clicking on the green node again permits selecting a new connection source."),
                                    "Thank you very much for participating in our study. Your responses have been collected and you should close this window."];

/**
 * Alerts
 */

export const DELETEWARNING = "Cannot delete Nodes after linking them in the network stage!";
export const DUPLICATEWARNING = "You already chose this name. Please modify it to be slightly different!";
export const SLIDERWARNING = "You provided a value for every person, thank you. Click on a node to change their age!";
export const CATEGORYWARNING = "You provided the category for every person, thank you. Click on a node to change their category!";

/**
 * Layout calculations
 */

/**
   * Calculates rectangular layout position
   * for a given index
   * @param {number} counter the index of a node
   */
 export function rect_layout(counter) {
    let adjC = counter - 1;

    let y = NODERADIUS + (AVBHEIGHT*0.15)*Math.floor(adjC / 4);
    let x = NODERADIUS +  (AVBWIDTH*0.33)*(adjC % 4);
    return [x,y];
  }


  /**
   * Calculates box layout position
   * for a given index
   * @param {number} counter the index of a node
   */
   export function box_layout(counter) {
    let n = 25;
    // start x & y
    var x = NODERADIUS;
    var y = NODERADIUS;

    let ints = n/4; // Interval
    let x_ints = Math.floor(MOBILE ? ints -2: ints + 2);
    let y_ints = Math.floor(MOBILE ? ints  + 3: ints - 1);
    let avb_width_ratio = AVBWIDTH/x_ints;
    let avb_height_ratio = AVBHEIGHT/y_ints;
    let corrected_counter = counter - 1;

    if (corrected_counter < x_ints ) {
        return [x + corrected_counter * avb_width_ratio,y];
    } else if (corrected_counter < (x_ints + y_ints)) {
        return [AVBWIDTH,y + (corrected_counter - x_ints) * avb_height_ratio];
    } else if (corrected_counter < (2 * x_ints + y_ints)) {
        return [AVBWIDTH - (corrected_counter - (x_ints + y_ints)) * avb_width_ratio,AVBHEIGHT];
    } 
    return [x,AVBHEIGHT - (corrected_counter - (2 * x_ints + y_ints)) * avb_height_ratio];
  }
  

  /**
   * Adapts foci to work with different screen sizes.
   * @param {[foci]} foci The foci points of all nodes
   */
   export function recalculate_foci (foci) {
    let recalculated_f = [];
    for (let f = 0; f < foci.length; f++) {
      if (foci[f].key ==0) {
        //console.log("f==0")
        recalculated_f.push({
          key:foci[f].key,
          x:SVGWIDTH/2,
          y:SVGHEIGHT/2
        })
      } else {
        let coords = rect_layout(f);

        recalculated_f.push({
          key:foci[f].key,
          x:coords[0],
          y:coords[1]
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
   export function recalculate_nodes (nodes,foci) {
    for (let n = 0; n < nodes.length; n++) {
      if (nodes[n].key == 0) {
        // set position of new node if device was changed
        nodes[n].floatX=SVGWIDTH/2;
        nodes[n].floatY=SVGHEIGHT/2;
        continue;
      }
      nodes[n].size = NODESIZE;
      nodes[n].fixedPosY = SVGHEIGHT*0.1 + (Math.random() * (SVGHEIGHT * 0.8))

      if(nodes[n].link && n !== 0) {
        continue;
      } else {

          nodes[n].floatX = 0;
          nodes[n].floatY = 0;
          nodes[n].shouldFloat = false;

      }
      
    }
    return nodes;
  }

  /**
   * Network rendering utility functions
   */
  
  /**
   * Checks whether there exists a link between two
   * nodes. 
   * @param {[links]} links 
   * @param {number} source 
   * @param {number} current 
   * @returns {boolean} whether there exists a link between two nodes
   */
   export function hasLink(links,source,current) {
    if(source === -1) {
      return false;
    }

    for(let i = 0; i < links.length; ++i) {
      if((links[i].source === source &&
        links[i].target === current) ||
        (links[i].target === source &&
        links[i].source === current)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks whether a link exists between two nodes
   * and returns the index in the [links] object corresponding
   * to that connection.
   * @param {[links]]} links 
   * @param {number} source 
   * @param {number} current 
   * @returns {{boolean,number || null}}
   */
  export function hasLinkAt(links,source,current) {
    for(let i = 0; i < links.length; ++i) {
      if((links[i].source === source &&
        links[i].target === current) ||
        (links[i].target === source &&
        links[i].source === current)) {
        return {hasLink:true,
                linkAt:i};
      }
    }
    return {hasLink:false,
            linkAt:null};
  }

  /**
   * Recalculates the render-properties for nodes
   * @param {[nodes]]} nodes 
   * @param {[nodes]} forceNodes 
   */
  export function updateNodeRenderProps(nodes,forceNodes) {
    for(let i = 0; i < nodes.length; ++i) {
      if(nodes[i].link && i !== 0) {
        nodes[i].floatX = forceNodes[i].x;
        nodes[i].floatY = forceNodes[i].y;
        nodes[i].shouldFloat = true;
      } else {
          if (i == 0){
            nodes[i].floatX = SVGWIDTH/2;
            nodes[i].floatY = SVGHEIGHT/2;
            nodes[i].shouldFloat = false;
          } else {
            let coords = box_layout(i);
            nodes[i].floatX = coords[0];
            nodes[i].floatY = coords[1];
            nodes[i].shouldFloat = false;
          }  
      }
    }
  }

/**
 * Misc.
 */

/**
 * Removes a node at a specific index. Recalculates
 * all render properties of the nodes.
 * @param {[nodes]} nodes 
 * @param {[foci]} foci 
 * @param {number} removeAt which node to remove
 * @returns 
 */
 export function removeNodeAt(nodes,foci,removeAt) {
  nodes.splice(removeAt,1);
  foci.splice(removeAt,1);
  for(let i = 1; i < nodes.length; ++i){
    nodes[i].key = i;
    foci[i].key = i;
  }

  foci = recalculate_foci(foci);
  nodes = recalculate_nodes(nodes,foci);

  return({"nodes":nodes,
          "foci":foci})
}

/**
 * Checks whether a name is already in use for
 * an existing node.
 * @param {string} name 
 * @param {[nodes]} nodes 
 * @returns {boolean} whether a name is a duplicate or not
 */
export function doesNameOverlap(name,nodes) {
  for(let i = 0; i < nodes.length; ++i) {
    if(nodes[i].name === name) {
      return true
    }
  }
  return false
}
