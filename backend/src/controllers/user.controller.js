import {User} from '../models/user.model.js'
import {uploadOnCloud} from '../utils/clodinary.js'
import jwt from 'jsonwebtoken'

// to generate refresh and access token function
const generateAccessAndRefreshToken= async(user_id)=>{
        try {
            const getUser=await User.findById(user_id)
            const accessToken = getUser.accessGenerateToken()
            const refreshToken = getUser.refreshGenerateToken()

            getUser.refreshToken = refreshToken
            getUser.save({validateBeforeSavr:false})
            return {accessToken , refreshToken}
        } catch (error) {
            res.status(500).json({message:'Error while generating access and refresh token'})
        }
}
// options for cookies
const optionsforCookies={
    httpOnly:true,
    secure:true
} 

// register logic
const userRegiter =async(req, res)=>{
    try{
    const {email , username, password, fullname} = req.body
    if([email, username, password, fullname].some((fields)=> fields?.trim() == '')){
      return res.status(400).json('All fields are required')
    }
   const userExist = await User.findOne({
    $or:[{email}, {username}]
    })
    if(userExist){
      return res.status(409).json('User already exist')
    }
    const avatarFilePath =await req.files?.avatar[0]?.path
    // const coverFilePath =await req.files?.coverImgae[0]?.path
    let coverFilePath;
    if(req.files && Array.isArray(req.files.coverImgae) && req.files.coverImgae.length >0){
        coverFilePath= await req.files.coverImgae[0].path
    }
    if(!avatarFilePath){return res.status(400).json('avatar not found')}

    const avatarUpload = await uploadOnCloud(avatarFilePath)
    const coverUpload = await uploadOnCloud(coverFilePath)
    if(!avatarUpload) return res.status(400).json('avatar not upload on cloudinary ')

   const user= await User.create({username:username.toLowerCase(), email , fullname , password , avatar:avatarUpload.url, coverImgae:coverUpload.url|| ''})
  const createdUser= await User.findById(user._id).select('-password -refreshToken')
   if(!createdUser){
    return res.status(500).json({msg :'user not created by backend'})
   }
   res.status(201).json({data:createdUser})

    }catch(error){
        res.status(400).json({message: 'resgisteration failed'})
    }
}


// login logic 
const userLogin = async(req, res)=>{
    try {
    const {email, username, password} = req.body
    if(!email && !username){
        console.log(email, username)
        return res.status(400).json('Invalid credentials')
    }
    const user= await User.findOne({$or:[{username}, {email}]})
    if(!user){
        return res.status(400).json({msg:'User does not exist'})
    }
    const isPasswordValid= await user.isPassworMatching(password)
    if(!isPasswordValid){ return res.status(400).json('Invalid credentials pass')};
    const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id)
    const getLoginUserData =await User.findById(user._id).select('-password -refreshToken')
    // const optionsforCookies={
    //     httpOnly:true,
    //     secure:true
    // }
    return res.status(200).cookie('accessToken', accessToken, optionsforCookies).cookie('refreshToken', refreshToken, optionsforCookies).json({message:'User Login Successfull',data: getLoginUserData})

} catch (error) {
    console.error(error);
        res.status(401).json('User does not login ')
}
}

// logout user logic
const userLogout= async(req, res)=>{
    try {
        // const userAccessToken=req.cookies.accessToken|| req.headers('Authorization')?.replace('Bearer ', '')
        // if(!userAccessToken) {return res.status(400).json({msg:"Can't access token from cookies or headers"})}
        // const decodedToken = jwt.verify(userAccessToken, process.env.ACCESS_TOKEN_SECRET)
        // const user= await User.findById(decodedToken?._id).select('-password -refreshToken')
        // if(!user){return res.status(400).json({msg:'User does not exist'})}
        // req.user= user

       await User.findByIdAndUpdate(req.user?._id,{
            set:{
                refreshToken:undefined
            }
        },{new:true})

        // const optionsforCookies={
        //     httpOnly:true,
        //     secure:true
        // } 

        return res.status(200).clearCookie('accessToken',optionsforCookies).clearCookie('refreshToken', optionsforCookies).json({data:{},msg:'User logout successfull'})

    } catch (error) {
        console.error(error);
        res.status(401).json('User logout failed ')
    }
}

//refresh access token . check with refresh token
const refreshAccessToken = async(req, res)=>{
    try {
       const getRefreshToken= req.cookies.refreshToken || req.body.refreshToken
       if(!getRefreshToken) return res.status(400).json('there is no token . first login')
       const decodedRefreshToken = jwt.verify(getRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user =await User.findById(decodedRefreshToken?._id)
        if(getRefreshToken !== user.refreshToken){
            return res.status(401).json('Wrong token or token expires or sed')
        }
        // const options={
        //     httpOnly:true,
        //     secure:true
        // }
        const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id)
        return res.status(200).cookie('accessToken', accessToken , optionsforCookies).cookie('refreshToken',refreshToken,optionsforCookies).json({message:'access token is refreshed',data:accessToken,refreshToken })
    } catch (error) {
        console.error(error);
        res.status(400).json('refresh access token failed ')
    }
}

const changePassword= async(req, res)=>{
    console.log(req)
}

export {userRegiter , userLogin, userLogout, refreshAccessToken , changePassword}