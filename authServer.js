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
PORT = 4000

let refreshTokens = []
 
app.use(express.json())

app.get('/',(req,res) => res.send("Hello world"))

/**
 * Register new user
 */
app.post('/users',(req,res) => {
    
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(req.body.password, salt);
  id = db.get('users')
    .size()
    .value()

  db.get('users')
    .push({id : id+1,
            username: req.body.username, 
            email: req.body.email,
            password: hash  } )
    .write()
  res.status(201).send("New user registered "+req.body.username)
})

/**
 * User authentication
 */
app.post('/users/authenticate',(req,res) => {

  user = db.get('users')
           .find({email: req.body.email})
           .value()

  if (user === undefined)
    return res.status(401).send({message:"User not found"})

  if (user && !bcrypt.compareSync(req.body.password, user.password))
    return res.status(401).send({message:"Username and password did not match."})

  accessToken = generateAccessToken(user)
  refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
  refreshTokens.push(refreshToken)

  return res.status(200).send({message:"User successfully logged in "+user.username, 
                               accesstoken: accessToken,
                              refreshToken: refreshToken})
}) 

/**
 * get new access token 
 */

 app.post('/token',(req,res) =>{
  const refreshToken = req.body.token

  if(refreshToken === null) return res.status(401).send({message:"No refreshToken found"})

  if(!refreshTokens.includes(refreshToken)) return res.status(403).send({message:"Invalid refreshToken"})

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err,user) => {
    if(err) return res.status(403).send({message:"Invalid refreshToken"})

    const accessToken = generateAccessToken({username:user.username, email:user.email, password:user.password})

    return res.status(200).send({message:"New access token created for "+user.username, 
                               accesstoken: accessToken})
  })
 })

function generateAccessToken(user){
  return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET, {expiresIn:'30s'})
}



app.listen(PORT, () => console.log(`Server started on port:${PORT}`)) 