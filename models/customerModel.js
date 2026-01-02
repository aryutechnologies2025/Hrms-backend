import mongoose from 'mongoose';
import bcrypt from "bcrypt";
const customerModel = new mongoose.Schema(
    {
        customerName: {type:String},
        customerEmail: {type:String},
        password: {type:String},
        customerPhone: {type:String},
        customerWebsite:{type:String},
        companyName:{type:String},
        subscriptionType:{type:String},
        monthly:{type:String},
        active: {type:String, default:'1'}
    },{
        timestamps:true
    }
);

customerModel.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
const CustomerModel = mongoose.model('CustomerList', customerModel);
export default CustomerModel;