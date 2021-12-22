// node_modules
const express = require('express');
const app = express();
const path = require('path');
const colors = require('colors');
const cors = require('cors');
require('dotenv').config();


// tools
const networkTools = require(path.join(process.cwd(), 'tools/network-tools.js'));

const PORT = process.env.PORT;


app.options('*', cors());
app.use(cors());

app.use(express.json());  // parse application/json
app.use(express.json({type: 'application/vnd.api+json'}));  // parse application/vnd.api+json as json
app.use(express.urlencoded({ extended: true }));  // parse application/x-www-form-urlencoded



app.post('/users', (req, res) => 
{
    let username = req.body.username;
    let org = req.body.orgName;

    if (!username || !org) {
        return res.status(400).send("Username and org are required.");
    }

    let orgNumber = +org.match(/\d/g).join("");
    let orgName = `Org${orgNumber}`

    if (!(orgNumber) || orgNumber > 3) {
        return res.status(400).send("Org number can only be between 1 and 3")
    }

    // register and enroll the user
    return networkTools.registerUser(username, orgName, res);
});


app.post('/addAsset', (req, res) => 
{
    let username = req.body.username;
    let org = req.body.orgName;
    let args = req.body.args;

    if (!username || !org || !args) {
        return res.status(400).send("Username, org and args are required.");
    }

    let orgNumber = +org.match(/\d/g).join("");
    let orgName = `Org${orgNumber}`

    if (!(+orgNumber) || +orgNumber > 3) {
        return res.status(400).send("Org number can only be between 1 and 3")
    }

    return networkTools.invokeTransaction(username, orgName, orgNumber, args, res);
});


app.listen(PORT, 
    console.log(`\n**************************************************\n\n${colors.bgWhite.black(`<--- Server started listening on Port ${PORT} --->`)}\n\n**************************************************\n`)
);
