const express = require('express')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()


const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ users: [] })
  .write() 

const app = express()
PORT = 3000
 
app.use(express.json())

app.get('/',(req,res) => res.send("Hello world"))

app.get('/posts',authenticateToken, (req,res) => {
  res.send(req.user.username + " is authorized")
})

function authenticateToken(req,res,next){
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if(token == null) return res.status(401).send('User not authorized')

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if(err) return res.status(403).send({message:"Not authorized. Invalid access token."})
    
    req.user = user
    next()
  })
}



app.listen(PORT, () => console.log(`Server started on port:${PORT}`)) 