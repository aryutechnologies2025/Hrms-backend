import RecurringPaymentLog from "../models/recurringPaymentLog.js";
import RecurringPayment from "../models/recurringPaymentModel.js";

const createRecurringPayment = async (req, res) => {
    try {
        const { 
            account, 
            lenderName, 
            paymentType, 
            amount, 
            dueDate,
            dueDay,
            recurringType, 
            totalEmi, 
            totalAmount, 
            start_date, 
            end_date,
            balance_amount,
            interest_rate,
            monthlyInterest,
            monthlyPrincipal,
            loanStatus,
            payment_status,
            notes,
            status 
        } = req.body;
        
        const newRecurringPayment = new RecurringPayment({
            account,
            lenderName,
            paymentType,
            amount,
            dueDate,
            dueDay,
            recurringType,
            totalEmi,
            totalAmount,
            start_date,
            end_date,
            balance_amount: totalAmount || balance_amount, // Initialize with total amount if available
            interest_rate,
            monthlyInterest,
            monthlyPrincipal,
            loanStatus,
            payment_status,
            notes,
            status
        });
        
        const savedRecurringPayment = await newRecurringPayment.save();
        res.status(200).json({
            success: true,
            message: "Recurring Payment created successfully",
            data: savedRecurringPayment,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

const getRecurringPayments = async (req, res) => {
    try {
        const recurringPayments = await RecurringPayment.find()
            .populate("account", "name balance")
            .populate("lenderName", "name balance")
            .lean(); // Use lean() for better performance

        // Calculate balance amount for each payment based on logs
        const paymentsWithBalance = await Promise.all(
            recurringPayments.map(async (payment) => {
                // Get all logs for this payment
                const logs = await RecurringPaymentLog.find({ 
                    parent_id: payment._id 
                }).select('amount payment_status');

                // Calculate total paid amount
                const totalPaid = logs
                    .filter(log => log.payment_status === 'paid')
                    .reduce((sum, log) => sum + (Number(log.amount) || 0), 0);

                // Get the total amount based on payment type
                let totalAmount = 0;
                if (payment.paymentType === 'Loan' || payment.paymentType === 'Gold Loan') {
                    totalAmount = Number(payment.totalAmount) || 0;
                } else {
                    totalAmount = Number(payment.amount) || 0;
                }

                // Calculate balance amount
                const calculatedBalance = totalAmount - totalPaid;

                return {
                    ...payment,
                    total_paid: totalPaid,
                    calculated_balance: calculatedBalance > 0 ? calculatedBalance : 0,
                    balance_amount: calculatedBalance > 0 ? calculatedBalance.toString() : "0"
                };
            })
        );

        res.status(200).json({ 
            success: true, 
            data: paymentsWithBalance 
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

const getRecurringLog = async (req, res) => {
    const { parent_id } = req.query;

    try {
        const recurringLog = await RecurringPaymentLog.find({ parent_id })
            .populate("account", "name")
            .populate("lenderName", "name")
            .sort({ createdAt: -1 }); // Sort by newest first

        // Get the parent payment to calculate total
        const totalPayment = await RecurringPayment.findById(parent_id);

        // Calculate paid amount from logs
        const paidAmount = recurringLog
            .filter(log => log.payment_status === 'paid')
            .map(item => Number(item.amount) || 0)
            .reduce((sum, amt) => sum + amt, 0);

        // Get total amount based on payment type
        let totalAmount = 0;
        if (totalPayment) {
            if (totalPayment.paymentType === 'Loan' || totalPayment.paymentType === 'Gold Loan') {
                totalAmount = Number(totalPayment.totalAmount) || 0;
            } else {
                totalAmount = Number(totalPayment.amount) || 0;
            }
        }

        const balanceAmount = totalAmount - paidAmount;

        res.status(200).json({
            success: true,
            data: recurringLog,
            paidAmount,
            totalAmount,
            balanceAmount: balanceAmount > 0 ? balanceAmount : 0
        });

    } catch (error) {
        console.error("Error in getRecurringLog:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const editRecurringPayment = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedRecurringPayment = await RecurringPayment.findByIdAndUpdate(
            id, 
            req.body, 
            { new: true }
        );
        
        if (!updatedRecurringPayment) {
            return res.status(404).json({ 
                success: false, 
                message: "Recurring Payment not found" 
            });
        }
        
        // Create log entry only if payment status is 'paid'
        if(updatedRecurringPayment) {
            await RecurringPaymentLog.create({
                parent_id: id,
                account: updatedRecurringPayment.account,
                lenderName: updatedRecurringPayment.lenderName,
                paymentType: updatedRecurringPayment.paymentType,
                amount: updatedRecurringPayment.amount,
                dueDate: updatedRecurringPayment.dueDate,
                dueDay: updatedRecurringPayment.dueDay,
                recurringType: updatedRecurringPayment.recurringType,
                totalEmi: updatedRecurringPayment.totalEmi,
                totalAmount: updatedRecurringPayment.totalAmount,
                start_date: updatedRecurringPayment.start_date,
                end_date: updatedRecurringPayment.end_date,
                balance_amount: updatedRecurringPayment.balance_amount,
                interest_rate: updatedRecurringPayment.interest_rate,
                monthlyInterest: updatedRecurringPayment.monthlyInterest,
                monthlyPrincipal: updatedRecurringPayment.monthlyPrincipal,
                loanStatus: updatedRecurringPayment.loanStatus,
                payment_status: updatedRecurringPayment.payment_status,
                notes: updatedRecurringPayment.notes,
                status: updatedRecurringPayment.status
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Recurring Payment updated successfully", 
            data: updatedRecurringPayment 
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

const deleteRecurringPayment = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedRecurringPayment = await RecurringPayment.findByIdAndDelete(id);
        if (!deletedRecurringPayment) {
            return res.status(404).json({ 
                success: false, 
                message: "Recurring Payment not found" 
            });
        }
        
        // Delete related logs
        await RecurringPaymentLog.deleteMany({ parent_id: id });
        
        res.status(200).json({ 
            success: true, 
            message: "Recurring Payment deleted successfully" 
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

export { 
    createRecurringPayment, 
    getRecurringPayments, 
    editRecurringPayment, 
    deleteRecurringPayment, 
    getRecurringLog 
};