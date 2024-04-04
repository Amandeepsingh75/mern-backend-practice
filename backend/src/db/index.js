import mongoose from 'mongoose'
import {DB_NAME} from '../constants.js'

const connectDb=async()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log('db connected')
    } catch (error) {
        console.log('connection failed with db', error)
        process.exit(1)
    }
}

export default connectDb