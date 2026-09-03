const express=require('express');
const router=express.Router();
const Alert=require('../models/Alert');
router.get('/',async(req,res)=>{
  try{const a=await Alert.find({dismissed:false}).sort({createdAt:-1}).limit(50);res.json(a);}
  catch(err){res.status(500).json({message:err.message});}
});
router.post('/',async(req,res)=>{
  try{const a=new Alert(req.body);const s=await a.save();res.status(201).json(s);}
  catch(err){res.status(400).json({message:err.message});}
});
router.delete('/:id',async(req,res)=>{
  try{const a=await Alert.findByIdAndUpdate(req.params.id,{dismissed:true},{new:true});
    if(!a)return res.status(404).json({message:'Not found'});res.json({message:'Dismissed'});}
  catch(err){res.status(500).json({message:err.message});}
});
module.exports=router;
