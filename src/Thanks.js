import React, { Component } from "react";

class Thanks extends Component {

    constructor(props){
        super(props);
      }

    /**
    * Calls back to main component to store data.
    */
    transferCallBack(){
        if(this.props.transferCallBack) {
        this.props.transferCallBack();
        }
    } 

    // Just in case someone never actually used the traditional routing.
    componentDidMount(){
        this.transferCallBack();
    }

    render() {
        return(
            <div className="container">
                <div className="ID_Box">
                    <h3>Thank you very much!</h3>
                    <p>{this.props.textDescription}</p>
                </div>
            </div>  
        )
    }

}

export default Thanks;
