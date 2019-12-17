let express = require('express');
let bodyParser = require('body-parser');
let monk = require("monk");

//create app
let app = express();

//database connection
let dbLoc = 'port to database';
let db = monk(dbLoc);
let collection = db.collection('gentle_react');

;
//show all entries in collection
collection.find().then((docs) =>{
    console.log(docs);
})

app.use(express.static(__dirname + "/src"));
app.use(bodyParser.urlencoded({extended: true}));


//serve react app
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
})


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
                                                                collection.insert(req.body.node).then((updated) =>{console.log(updated)})
                                                            } else {
                                                                collection.findOneAndUpdate({key:req.body.id},
                                                                    {$set:req.body.node}).then((updated) =>{console.log(updated)})
                                                            }
    })

    }

})

app.listen('port for express server');