let express = require('express');
let monk = require("monk");
let bodyParser = require('body-parser')
require('dotenv').config();

/* Content:
Simple node server that can call to MONGODB ATLAS
*/


//Setup
const port = process.env.PORT || 3002;
const location = process.env.URI || `super_admin:DbPassword@gentle_db:27017/GENTLE_DEMO`;
const local = process.env.LOCAL_DEVELOPMENT || 'true';

//create app
let app = express();
app.use(express.urlencoded());

// Connect db
if (local === 'true') {
    console.log('Building for local environment...');
    var db = monk(location,{authSource:'admin'});
} else {
    var db = monk(location);
}
let collection = db.collection(`GENTLE_COLLECT_DEMO`);


//show all entries in collection
collection.find().then((docs) =>{
    console.log("Connected to data")
    console.log(docs.length);
})

app.use(express.static(__dirname + "/build"));


//serve react app
app.get('/', (req, res) => {
    console.log("SERVING APP")
    res.sendFile(__dirname + "/index.html");
})

/**
 * Sends data to db
 */
app.post("/ajax",(req,res) => {
    let ID = req.body.ID;
    let data = req.body.data;
    
    data = JSON.parse(data);
    collection.find({ID:ID}).then((doc) =>{if(doc.length == 0){
                                                        console.log("User does not exist");
                                                        collection.insert({ID:ID,data:data}).then(() =>{res.send("Success")})
                                                    } else {
                                                        collection.findOneAndUpdate({ID:ID},
                                                        {$set:{ID:ID,data:data}}).then(() =>{res.send("Success")})
                                                    }}
                                            )
})

app.listen(port);
