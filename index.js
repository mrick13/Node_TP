const { faker } = require('@faker-js/faker');
require('dotenv/config')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const cors = require('cors')
const bodyParser = require('body-parser')
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize (process.env.DB_USER, process.env.DB_PASS,process.env.DB_PORT,process.env.DB_NAME, {
    user: process.env.DB_USER,
    password : process.env.DB_PASS,
    name : process.env.DB_NAME,
    port : process.env.DB_PORT,
    dialect: 'postgres',
})

console.log(sequelize)



app.use(cors())

app.use(function (req, res, next) {
    if (req.headers.authorization !== process.env.PASSWORD) {
    return res.status(401).send('Mot de passe incorrect')
    }
    next();
})

function generateUser() {
    return {
        id : faker.string.uuid(),// uuid
        name : faker.person.fullName(),
        email : faker.internet.email(),
        avatar: faker.image.avatar()
    };
}



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.get('/users', function (req, res, next) {

    const users = []

    for (let i = 0; i < 10; i++) {
        users.push(generateUser());
    }

    res.status(200).json(users)
})

app.post('/users', function (req, res) {
    const { name, email } = req.body;

    if (email || name) {
        res.status(400).send("User not found")
    }
    res.status(201) ;
})

app.patch('/users/:id', function (req, res) {
    const { name, email } = req.body;
    if (email || name) {
        res.status(400).send("User not found")
    }
    res.status(200).send("User updated successfully") ;
})

app.delete('/users/:id', function (req, res) {
    res.status(204);
})

app.all('*', (req, res) => {
    res.status(404).send('Not Found')
})