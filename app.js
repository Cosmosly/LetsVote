const express = require('express')
const bodyParser = require('body-parser')
const ejs = require("ejs")
const _ = require('lodash')
const request = require('request')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3000

const homeStartingContent = "Welcome! LetsVote is a voting website aim to help you and your team make decision making easier and funnier";
const aboutContent = "Welcome! LetsVote is a voting website aim to help you and your team make decision making easier and funnier";
const contactContent = "To see the source code, please go to https://github.com/Cosmosly/LetsVote. If you want to contact the author, please email ylai20@ubishops.ca";

const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

// database
mongoose.set('strictQuery', false)
const connectDB = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host} `);
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
connectDB()
const itemsSchema = new mongoose.Schema({ name: String })
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    entryPoint: String,
    items: [itemsSchema]
})
const Item = mongoose.model("Item", itemsSchema)
const Post = mongoose.model('Post', postSchema)

// route
app.listen(port, () => {
    console.log('server is running on port: ' + port)
})
// get
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.get("/signIn", (req, res) => {
    res.sendFile(__dirname + '/signIn.html')
})

app.get("/signUp", (req, res) => {
    res.sendFile(__dirname + '/signUp.html')
})

app.get('/homepost', async (req, res) => {
    await Post.find({})
        .then(foundList => {
            let post = foundList
            res.render("home", {
                homeStartingContent: homeStartingContent,
                post: post
            })
        })
        .catch(err => console.log(err))
})

app.get('/about', (req, res) => {
    res.render("about", {
        aboutContent: aboutContent
    })
})

app.get('/contact', (req, res) => {
    res.render("contact", {
        contactContent: contactContent
    })
})

app.get('/compose', (req, res) => {
    res.render("compose")
})

app.get('/compose/:entryPoint', async (req, res) => {
    let postEntry = req.params.entryPoint
    await Post.findOne({ entryPoint: postEntry }).exec()
        .then(foundPost => {
            res.render('post', {
                compose_title: foundPost.title,
                compose_text: foundPost.content,
                compose_entryPoint: foundPost.entryPoint,
                newListItems: foundPost.items
            })
        })
        .catch(err => console.log(err))
})

// post
app.post('/compose', async (req, res) => {
    var post = new Post({
        title: req.body.compose_title,
        entryPoint: req.body.compose_entryPoint,
        content: req.body.compose_text
    })
    await post.save()
        .then(() => {
            res.redirect('/homepost')
        })
})


// vote
app.post("/addVoteOption", async (req, res) => {
    let newList = req.body.newItem
    let newEntryPoint = req.body.entryPoint
    const item = new Item({ name: newList })
    await Post.findOne({ entryPoint: newEntryPoint }).exec()
        .then(foundList => {
            foundList.items.push(item)
            foundList.save()
            res.redirect("/compose/" + newEntryPoint)
        })
        .catch(err => console.log(err))
})

app.post("/deleteVoteOption", async (req, res) => {
    let selectedCheckbox = req.body.checkbox
    console.log(selectedCheckbox)
    let selectedEntryPoint = req.body.entryPoint
    await Post.findOneAndUpdate({entryPoint : selectedEntryPoint}, {$pull : {items : {_id : selectedCheckbox}}}).exec()
    .then(() => {res.redirect('/compose/'+selectedEntryPoint)})
    .catch(err => console.log(err))

})