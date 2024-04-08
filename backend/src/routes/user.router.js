import express, {Router} from 'express'
import {userRegiter, userLogin,userLogout, refreshAccessToken, changePassword, getLoginUser ,updateData} from '../controllers/user.controller.js'
import {upload} from '../middlewares/multer.middleware.js'
import CheckUserLoginOrNot from '../middlewares/authJwtCheck.middleware.js'
const router = Router() 

router.route('/register').post(upload.fields([
    {name:'avatar', maxCount:1},
    {name:"coverImgae", maxCount:1}
]),userRegiter)

//login router
router.route('/login').post(userLogin)
router.route('/logout').post(CheckUserLoginOrNot,userLogout)
router.route('/refreshAccessToken').post(refreshAccessToken)
router.route('/change-password').post(CheckUserLoginOrNot, changePassword)
router.route('/getUser').get(CheckUserLoginOrNot, getLoginUser)
router.route('/update-data').post(CheckUserLoginOrNot, updateData)

export {router}
