import {User} from '../models/user.model.js'
import {uploadOnCloud} from '../utils/clodinary.js'

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
        res.status(409).json('User already exist')
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
// const login 
export {userRegiter}