const mongoose=require('mongoose')

const adminSchema=mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
},{
    timestamps:true
})


const adminsModel=mongoose.model('admins',adminSchema)


module.exports=adminsModel