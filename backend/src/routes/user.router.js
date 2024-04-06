import express, {Router} from 'express'
import {userRegiter} from '../controllers/user.controller.js'
import {upload} from '../middlewares/multer.middleware.js'
const router = Router() 

router.route('/register').post(upload.fields([
    {name:'avatar', maxCount:1},
    {name:"coverImgae", maxCount:1}
]),userRegiter)


export {router}
