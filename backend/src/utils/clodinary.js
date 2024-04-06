import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
              
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});


const uploadOnCloud = async(filePath)=>{
try {
    if(!filePath) return null
   const response= await cloudinary.uploader.upload(filePath,{
        resource_type:'auto'
    })
    console.log(response,' cloudinary file response and ulpoded successfully' )
    fs.unlinkSync(filePath)
    return response
} catch (error) {
    fs.unlinkSync(filePath)
    console.log('cloudinary file unlink ')
    return null
}
}

export {uploadOnCloud}