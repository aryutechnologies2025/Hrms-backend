import mongoose from "mongoose";
const recurringPaymentSchema = new mongoose.Schema({
    account:{type: mongoose.Schema.Types.ObjectId, ref: "FinanceCompany",required:[true,"Please provide an account"]},
    lenderName:{type:String},
    paymentType:{type:String},
    amount:{type:String},
    dueDate:{type:Date},
    recurringType:{type:String},
    totalEmi:{type:String},
    totalAmount:{type:String},
    status:{type:String, default:"1"},
},{
    timestamps: true
});

const RecurringPayment = mongoose.model("RecurringPayment",recurringPaymentSchema);
export default RecurringPayment;