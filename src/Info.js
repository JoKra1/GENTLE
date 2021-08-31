import React, { Component } from "react";
import ReactDOM from "react-dom";
import Welcome from "./Welcome.js";

class Info extends Component {

constructor(props){
    super(props);
    }

renderWELCOME = () => {
    ReactDOM.render(<Welcome/>,
        document.getElementById("root"))
}  

render() {
    return(

        <div className="container">
            <div className="ID_Box">
                <h3>Welcome to the GENTLE questionnaire!</h3>
                <p>{this.props.textDescription}</p>
            </div>
            <button id ="confirm_next" onClick={this.renderWELCOME}>Back</button>

        </div> 

    )
}

}

export default Info;