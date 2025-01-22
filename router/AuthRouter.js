
import express from 'express'
import {getAllUsers , createUser , patchUser , deleteUser , getOneUser} from '../controller/user-controller.js'
const userRouter = express.Router();

userRouter.get('/users', getAllUsers)
userRouter.get('/users/:id', getOneUser)
userRouter.post('/users', createUser)
userRouter.patch('/users/:id', patchUser)
userRouter.delete('/users/:id', deleteUser)

export default userRouter;