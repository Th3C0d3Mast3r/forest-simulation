import mongoose from "mongoose";

const regSchema=new mongoose.Schema({
    uid:{type:String,required:true,unique:true},
    name:[{type:String,required:true}],
    mobile:{type:String,required:true},
    safariType:{
    type:String,
    enum:{values:["T1","T2","T3"],message:"Wrong Safari Type"},
    required:true
    },
    paymentStatus:{type:Boolean,required:true,default:false},
    ticketCreated:{type:Boolean,default:false}
},{timestamps:true});

const Reg=mongoose.model("Reg",regSchema);
export default Reg;