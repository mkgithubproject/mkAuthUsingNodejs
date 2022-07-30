const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    token:{
        type:String,
        required:true
    }
},// second argument of Schema function is timestamps
{
    timestamps:true
}
);
const User=mongoose.model('User',userSchema);
module.exports=User;