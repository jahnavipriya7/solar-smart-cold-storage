const mongoose = require('mongoose');
const alertSchema = new mongoose.Schema({
  slotId:{type:mongoose.Schema.Types.ObjectId,ref:'StorageSlot',default:null},
  slotName:{type:String,default:'System'},
  type:{type:String,enum:['info','warning','danger'],default:'info'},
  message:{type:String,required:true},
  dismissed:{type:Boolean,default:false},
  createdAt:{type:Date,default:Date.now}
});
module.exports=mongoose.model('Alert',alertSchema);
