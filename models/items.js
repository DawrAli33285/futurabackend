const mongoose=require('mongoose')

const itemsSchema=mongoose.Schema({
    title:{
        type:String,
        required:true
    },

    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
image:{
    type:String,
    required:true
}
},{timestamps:true})


const itemsModel=mongoose.model('items',itemsSchema)

module.exports=itemsModel;