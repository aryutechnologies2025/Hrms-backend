import mongoose from "mongoose";

const recurringPaymentLogSchema = new mongoose.Schema({
    parent_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "RecurringPayment",
        required: true
    },
    account: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "FinanceCompany",
        required: [true, "Please provide an account"]
    },
    lenderName: { type: mongoose.Schema.Types.ObjectId, 
            ref: "FinanceLender",
            required:[false]
        },
    paymentType: { type: String },
    start_date: { type: Date },
    end_date: { type: Date },
    amount: { type: String },
    dueDate: { type: Date },
    dueDay: { type: Number },
    recurringType: { type: String },
    totalEmi: { type: String },
    totalAmount: { type: String },
    balance_amount: { type: String },
    interest_rate: { type: String },
    monthlyInterest: { type: String },
    monthlyPrincipal: { type: String },
    loanName:{
        type:String
    },
    loanStatus: { 
        type: String, 
        enum: ["inprogress", "completed", "pending"],
        default: "inprogress"
    },
    payment_status: { 
        type: String,
        enum: ["paid", "unpaid","partial"],
        default: "unpaid"
    },
    payment_date:{
        type:String
    },
    notes: { type: String },
    status: { type: String, default: "1" }
}, {
    timestamps: true
});

const RecurringPaymentLog = mongoose.model("RecurringPaymentLog", recurringPaymentLogSchema);
export default RecurringPaymentLog;