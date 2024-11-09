import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()

const connect= async()=>{
try {
    await mongoose.connect(process.env.link as string)
    console.log("Base de datos conectada")
} catch (error) {
   console.error("error de conexion Base de datos",error)
   process.exit(1)
}
}

export default connect