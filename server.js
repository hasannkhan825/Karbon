require("dotenv").config()

const express = require("express")
const app = express()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
// app.set('view-engine', 'ejs')

app.use(express.json())


const posts = [  
    {username: 'Kyle',
    title: 'Post 1'},

    {username: 'Tim',
    title: 'Post 2'}
]

const users = []


app.get('/posts', authenticationToken,(req, res) =>{

    res.json(posts.filter(post => post.username === req.body.username))

})

app.get('/users', (req, res) =>{

    res.json(users)

})

app.post('/users', async (req, res)=>{

    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = {username: req.body.username, password: hashedPassword}
        users.push(user)
        res.status(201).send()

    }
    catch{
        res.sendStatus(500)
    }
})

app.post('/login', async(req, res) =>{
    const user = users.find(user => user.username === req.body.username)
    console.log(user)
    if(user == null) { 
        return res.status(400).send('Cannot find user')
    }

    try{
        if(await bcrypt.compare(req.body.password, user.password)) {
            const username = req.body.username
            const user1= {name : username}
            const accessToken = jwt.sign(user1, process.env.ACCESS_TOKEN_SECRET)
            res.json({accessToken : accessToken})
            // res.send("success")
        }
        else{
            res.send("fail")
        }
    }
    catch{
                
        res.send('err')
    }
})

function authenticationToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token === null) return res.sendStatus(401)
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        if(err) return res.sendStatus(403)
        req.user = user 
        next()
    })
}


app.listen(3000)