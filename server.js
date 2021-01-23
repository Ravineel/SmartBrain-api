const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors')
const knex = require('knex');
const { response } = require('express');

const db=knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'ravineel',
      password : 'root',
      database : 'smart-brain'
    }
});

const app = express();


app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{

    res.json(database.users)

})

app.post('/signin', (req,res)=>{
    const {email , password } = req.body;
    db.select('email','hash').from('login')
    .where('email','=',email)
    .then(data=>{
        const isValid= bcrypt.compareSync(password,data[0].hash);
      
        if(isValid){
            return db.select('*').from('users')
            .where('email','=',email)
            .then(user=>{
                res.json(user[0])
            })
            .catch(err => res.status(400).json("unable to get user"))
        }
        else{
            res.status(400).json("wrong credentials")
        }
    }).catch(err => res.status(400).json("wrong credentials"))

   
})

app.post('/register', (req, res)=>{

    const { name, email , password } = req.body;
    const hash = bcrypt.hashSync(password);

    db.transaction(trx=>{
        trx.insert({
           hash:hash,
           email:email
        }) 
        .into('login')
        .returning('email')
        .then(loginemail=>{
            return trx('users')
            .returning('*')
            .insert({
                email:loginemail[0],
                name:name,
                joined: new Date()
            })
            .then(user =>{
                res.json(user[0])
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
        
    .catch(err=>res.status(400).json('unable to register'))

})




app.get('/profile/:id', (req,res)=>{

    const { id } =req.params;
    db.select('*').from('users').where({id})
    .then(user=>{
        if(user.length){
            res.json(user[0])
        }
        else{
            res.status(400).json('Not Found')
        }
    })
    .catch(err=>res.status(400).json(' error getting info'))
})


app.put('/image',(req,res)=>{

    const { id } =req.body;
    db('users')
    .where('id', '=', id)
    .increment('entries',1)
    .returning('entries')
    .then(entries=>{
        res.json(entries[0])
    })
    .catch(err=>res.status(400).json("Unable to get enteries"))

})

app.listen(3000,()=>{

    console.log('app is running')
})



bcrypt.hash("bacon", null, null, function(err, hash) {
    // Store hash in your password DB.
});

// Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });




