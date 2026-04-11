import mongoose from "mongoose";
const rfidSchema = new mongoose.Schema({
    rfid:{type:String,required:true,unique:true}
    value:{type:Number,required:true,min:0},
    ttl:{type:Date, required:true},
    regId:{type:mongoose.Schema.Types.ObjectId,ref:"Reg",required:true},    
}, {timestamps: true});

const Rfid = mongoose.model("Rfid", rfidSchema);
export default Rfid;