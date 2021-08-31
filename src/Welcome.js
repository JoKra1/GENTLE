import React, { Component } from "react";
import Main from "./Main";
import ReactDOM from "react-dom";
import "./css/bootstrap.css";
import "./css/style.css";
import Info from "./Info.js";
import {INFORMATION} from "./Utils.js";

class Welcome extends Component {
    /**
     * Screen design that involves a simple form
     * where users can insert an identifier. This identifier
     * is used to store the data.
     * 
     * References:
     * 
     * For further information on forms in React check:
     * https://reactjs.org/docs/forms.html
     */
    constructor(props) {
        super(props);
        this.state = {id:"",consent:false};
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }  


    handleChange = (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        const name = event.target.name;

        this.setState({
            [name]:value
        });
    }

    /**
     * Renders informed consent page.
     */
     renderIFC = () => {
        ReactDOM.render(<Info textDescription={INFORMATION}/>,
            document.getElementById("root"))
    }

    handleSubmit = (event) => {
        event.preventDefault();
        if (this.state.consent) {
            if(sessionStorage.getItem("nodeData")) {
                let data = JSON.parse(sessionStorage.getItem("nodeData"));
                ReactDOM.render(<Main ID = {this.state.id} nodes = {data.nodes} links = {data.links} foci = {data.foci}/>,
                document.getElementById("root"))
              } else {
                ReactDOM.render(<Main ID = {this.state.id} nodes = {[]} links = {[]} foci = {[]}/>,
                document.getElementById("root"))
              }
        } else {
            alert("Please provide consent.")
        }
        
    }

    render() {
        return (
            <div className="container">
            <form onSubmit={this.handleSubmit} className="loginForm">
                <h1>Login</h1>
                <input
                className="loginInput"
                type="text"
                name="id"
                placeholder="Enter ID"
                value={this.state.id}
                onChange={this.handleChange}
                required
                />
                <label style={{"text-align":"left"}}>
                I consent to my data being stored and confirm that I have read the <a style={{color:"blue","text-decoration":"underline"}} onClick={this.renderIFC} >informed consent sheet</a>.
                <input
                    name="consent"
                    type="checkbox"
                    checked={this.state.consent}
                    onChange={this.handleChange} />
                </label>
            <input className="loginInput" type="submit" value="Submit"/>
            </form>
            </div>
        );
    }

}
export default Welcome;