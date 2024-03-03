const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { MongoClient, Collection } = require('mongodb')
const { isEmptyPayload, isInvalidEmail } = require('./validator')

// console.log(process.env.DB_USER)
// console.log(process.env.DB_PASS)

const url = 'mongodb://myapp:mysecretpass@127.0.0.1:27017?authSource=company_db';
const client = new MongoClient(url);
const dbName = 'company_db'
const collectionName = 'employees'

app.use(bodyParser.json())
app.use('/', express.static(__dirname + '/dist'))

app.get('/get-profile', async function(req, res) {   
    // connect to db
    await client.connect()
    console.log('Connected successfully to server')

    //initiate the db
    const db = client.db(dbName)
    const collection = db.collection(collectionName)


    // get data from db
    const result = await collection.findOne({id: 1})
    console.log(result)
    client.close()
    
    response = {}

    if (result !== null) {
        response = {
            name: result.name,
            email: result.email,
            interests: result.interests 
        }
    } 
    res.send(response)
})

app.post('/update-profile', async function(req, res){
    const payload = req.body
    console.log(payload)

    if (isEmptyPayload(payload) || isInvalidEmail(payload)) {
        res.status(404).send({error: "invalid payload. Couldn't update user profile data"})
    } else {
        //connect to db
        await client.connect()
        console.log('Connected successfully to server')

        //initiate the db
        const db = client.db(dbName)
        const collection = db.collection(collectionName)

        //save payload data to db
        payload['id'] = 1
        const updatedValues = { $set: payload}
        await collection.updateOne({id: 1}, updatedValues, {upsert: true})
        client.close()

        res.status(200).send({info: 'user profile data udpated successfully'})
    }
})

const server = app.listen(3000, function (){
    console.log('app listening on port 3000')
})

module.exports = {
    app,
    server
}