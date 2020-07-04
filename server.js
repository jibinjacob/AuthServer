const express = require('express')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const bcrypt = require('bcryptjs')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ users: [] })
  .write() 

const app = express()
PORT = 3000
 
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
  res.status(200).send("New user registered "+req.body.username)
})

app.listen(PORT, () => console.log(`Server started on port:${PORT}`)) 