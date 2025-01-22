import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
import bodyParser from 'body-parser'
import DbConfigurator from "./database/database.js";
import {authenticate} from "./middlewares/AuthMiddleware.js";
import routes from "./router/routes.js";
import UserModel from "./models/user.js";

const start = async () => {
    await new DbConfigurator().connect()
    // await UserModel.sync({ alter: true });
    app.use(bodyParser.json())
    app.use(authenticate)
    app.use(routes)
    app.use('*', (req, res) => {
        res.status(404).json('Not found')
    })
    app.listen(process.env.PORT, () => {
        console.info(`Application est en cours sur le port ${process.env.PORT}`)
    })

}

start()









