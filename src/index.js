import React from "react";
import ReactDOM from "react-dom";
import Welcome from "./Welcome";
import "./css/bootstrap.css";
import "./css/style.css";

/**
 * GENTLE is desgined as a single page application, build on
 * React. For a tutorial on single page applications and how
 * the routing between components is achieved check:
 * https://www.taniarascia.com/using-react-router-spa/
 */

ReactDOM.render(
  <Welcome/>, 
  document.getElementById("root")
);