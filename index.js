const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const port = 3000
const app = express()
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}))

app.listen(port, ()=>{
    console.log('server is running on port: ' + port)
})

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.get("/signIn", (req, res) =>{
    res.sendFile(__dirname+'/signIn.html')
})

app.get("/signUp", (req, res) =>{
    res.sendFile(__dirname+'/signUp.html')
})