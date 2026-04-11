import mongoose from "mongoose";
const rfidSchema = new mongoose.Schema({
    rfid:{type:String, required:true},
    value:{type:Number, required:true},
    ttl:{type:Date, required:true},
}, {timestamps: true});

const Rfid = mongoose.model("Rfid", rfidSchema);
export default Rfid;