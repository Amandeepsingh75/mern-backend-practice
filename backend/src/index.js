import dotenv from 'dotenv'
import connectDb from "./db/index.js";
import {app} from './app.js'

dotenv.config({
    path:'./env'
})


connectDb().then(()=>{
app.listen(process.env.PORT|| 4000, ()=>{
    console.log(`server is running at port ${process.env.PORT}`)
})
}).catch((err)=>{
    console.log('error on index page , connectio failed with db')
})