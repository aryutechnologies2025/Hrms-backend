import RecurringPaymentLog from "../models/recurringPaymentLog.js";
import RecurringPayment from "../models/recurringPaymentModel.js";
import Account from "../models/financeCompanyModel.js";

const addPayment = async (req, res) => {
    try {
        const { 
            parent_id, 
            interest_rate,
            amount, 
            payment_date, 
            payment_status, 
            notes, 
            payment_method 
        } = req.body;

        const parentPayment = await RecurringPayment.findById(parent_id);
        if (!parentPayment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Recurring payment not found' 
            });
        }

        let totalAmount = 0;
        if (parentPayment.paymentType === 'Loan' || parentPayment.paymentType === 'Gold Loan') {
            totalAmount = Number(parentPayment.totalAmount) || 0;
        } else {
            totalAmount = Number(parentPayment.amount) || 0;
        }

        const existingLogs = await RecurringPaymentLog.find({ 
            parent_id: parent_id,
            payment_status: 'paid' 
        });
        
        const currentPaid = existingLogs.reduce((sum, log) => sum + (Number(log.amount) || 0), 0);
        
        const newPaidAmount = currentPaid + Number(amount);
        const newBalance = totalAmount - newPaidAmount;

        if (newBalance < 0) {
            return res.status(400).json({
                success: false,
                message: 'Payment amount cannot exceed remaining balance'
            });
        }

        const paymentLog = new RecurringPaymentLog({
            parent_id: parent_id,
            account: parentPayment.account,
            lenderName: parentPayment.lenderName,
            paymentType: parentPayment.paymentType,
            amount: amount,
            payment_date: payment_date || new Date(),
            payment_status: payment_status || 'paid',
            payment_method: payment_method,
            notes: notes || '',
            dueDate: parentPayment.dueDate,
            dueDay: parentPayment.dueDay,
            recurringType: parentPayment.recurringType,
            totalEmi: parentPayment.totalEmi,
            totalAmount: parentPayment.totalAmount,
            start_date: parentPayment.start_date,
            end_date: parentPayment.end_date,
            balance_amount: newBalance,
            interest_rate: parentPayment.interest_rate || interest_rate,
            monthlyInterest: parentPayment.monthlyInterest,
            monthlyPrincipal: parentPayment.monthlyPrincipal,
            loanStatus: parentPayment.loanStatus,
            status: parentPayment.status
        });

        await paymentLog.save();

        // Update parent payment status based on new balance
        let updatedPaymentStatus = parentPayment.payment_status;
        let updatedLoanStatus = parentPayment.loanStatus;

        if (newBalance === 0) {
            updatedPaymentStatus = 'paid';
            if (parentPayment.paymentType === 'Loan' || parentPayment.paymentType === 'Gold Loan') {
                updatedLoanStatus = 'completed';
            }
        } else if (newBalance < totalAmount) {
            updatedPaymentStatus = 'partial';
        }

        // Update parent payment
        await RecurringPayment.findByIdAndUpdate(parent_id, {
            payment_status: updatedPaymentStatus,
            loanStatus: updatedLoanStatus,
            balance_amount: newBalance
        });

        // Update account balance based on payment type
        if (parentPayment.paymentType === 'Loan' || parentPayment.paymentType === 'Gold Loan') {
            // For loans, receiving payment increases account balance
            const account = await Account.findById(parentPayment.account);
            if (account) {
                account.balance = (Number(account.balance) + Number(amount)).toString();
                await account.save();
            }
        } else if (parentPayment.paymentType === 'Saving') {
            // For savings, payment decreases account balance
            const account = await Account.findById(parentPayment.account);
            if (account) {
                account.balance = (Number(account.balance) - Number(amount)).toString();
                await account.save();
            }
        }

        res.status(201).json({
            success: true,
            message: 'Payment added successfully',
            data: paymentLog,
            balanceAmount: newBalance,
            paidAmount: newPaidAmount,
            totalAmount: totalAmount
        });

    } catch (error) {
        console.error("Error in addPayment:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

const editPaymentLogById = async(req,res) =>{
    const {id} = req.params;
    try {
        const updatedRecurringPayment = await RecurringPaymentLog.findByIdAndUpdate(
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

        res.status(200).json({ 
            success: true, 
            message: "Recurring Payment updated successfully", 
            data: updatedRecurringPayment 
        });
    } catch(error){
        res.status(404).json({ 
            success: false, 
            message: "Internal server error", 
            error: error.message 
        });
    }
}

// Delete a payment
const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the payment log
        const paymentLog = await RecurringPaymentLog.findById(id);
        if (!paymentLog) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const parentId = paymentLog.parent_id;
        const paymentAmount = Number(paymentLog.amount);

        // Find parent recurring payment
        const parentPayment = await RecurringPayment.findById(parentId);
        if (!parentPayment) {
            return res.status(404).json({
                success: false,
                message: 'Parent recurring payment not found'
            });
        }

        // Calculate total amount based on payment type
        let totalAmount = 0;
        if (parentPayment.paymentType === 'Loan' || parentPayment.paymentType === 'Gold Loan') {
            totalAmount = Number(parentPayment.totalAmount) || 0;
        } else {
            totalAmount = Number(parentPayment.amount) || 0;
        }

        // Get all remaining paid logs (excluding the one being deleted)
        const remainingLogs = await RecurringPaymentLog.find({ 
            parent_id: parentId,
            payment_status: 'paid',
            _id: { $ne: id }
        });
        
        const remainingPaid = remainingLogs.reduce((sum, log) => sum + (Number(log.amount) || 0), 0);
        
        // Calculate new balance
        const newBalance = totalAmount - remainingPaid;

        // Update parent payment status based on new balance
        let updatedPaymentStatus = parentPayment.payment_status;
        let updatedLoanStatus = parentPayment.loanStatus;

        if (remainingPaid === 0) {
            updatedPaymentStatus = 'unpaid';
            if (parentPayment.paymentType === 'Loan' || parentPayment.paymentType === 'Gold Loan') {
                updatedLoanStatus = 'inprogress';
            }
        } else if (remainingPaid < totalAmount) {
            updatedPaymentStatus = 'partial';
        } else if (remainingPaid === totalAmount) {
            updatedPaymentStatus = 'paid';
            if (parentPayment.paymentType === 'Loan' || parentPayment.paymentType === 'Gold Loan') {
                updatedLoanStatus = 'completed';
            }
        }

        // Update parent payment
        await RecurringPayment.findByIdAndUpdate(parentId, {
            payment_status: updatedPaymentStatus,
            loanStatus: updatedLoanStatus,
            balance_amount: newBalance > 0 ? newBalance : 0
        });

        // Reverse account balance changes
        if (parentPayment.paymentType === 'Loan' || parentPayment.paymentType === 'Gold Loan') {
            // For loans, removing payment decreases account balance
            const account = await Account.findById(parentPayment.account);
            if (account) {
                account.balance = (Number(account.balance) - paymentAmount).toString();
                await account.save();
            }
        } else if (parentPayment.paymentType === 'Saving') {
            // For savings, removing payment increases account balance
            const account = await Account.findById(parentPayment.account);
            if (account) {
                account.balance = (Number(account.balance) + paymentAmount).toString();
                await account.save();
            }
        }

        // Delete the payment log
        await RecurringPaymentLog.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Payment deleted successfully',
            balanceAmount: newBalance > 0 ? newBalance : 0,
            paidAmount: remainingPaid,
            totalAmount: totalAmount
        });

    } catch (error) {
        console.error("Error in deletePayment:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

// Update the existing getRecurringLog to include payment_method
const getRecurringLog = async (req, res) => {
    const { parent_id } = req.query;

    try {
        const recurringLog = await RecurringPaymentLog.find({ parent_id })
            .populate("account", "name")
            .populate("lenderName", "name")
            .sort({ createdAt: -1 });

        const totalPayment = await RecurringPayment.findById(parent_id);

        const paidAmount = recurringLog
            .filter(log => log.payment_status === 'paid')
            .map(item => Number(item.amount) || 0)
            .reduce((sum, amt) => sum + amt, 0);

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

// Update the existing createRecurringPayment to handle initial balance correctly
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
            interest_rate,
            monthlyInterest,
            monthlyPrincipal,
            loanStatus,
            payment_status,
            notes,
            status 
        } = req.body;
        
        // Calculate initial balance amount
        let initialBalance = 0;
        if (paymentType === 'Loan' || paymentType === 'Gold Loan') {
            initialBalance = totalAmount || 0;
        } else {
            initialBalance = amount || 0;
        }

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
            balance_amount: initialBalance,
            interest_rate,
            monthlyInterest,
            monthlyPrincipal,
            loanStatus,
            payment_status: payment_status || 'unpaid',
            notes,
            status
        });
        
        const savedRecurringPayment = await newRecurringPayment.save();

        // If payment_status is 'paid', create an initial payment log
        if (payment_status === 'paid') {
            const paymentAmount = paymentType === 'Loan' || paymentType === 'Gold Loan' ? totalAmount : amount;
            
            const paymentLog = new RecurringPaymentLog({
                parent_id: savedRecurringPayment._id,
                account: account,
                lenderName: lenderName,
                paymentType: paymentType,
                amount: paymentAmount,
                payment_date: new Date(),
                payment_status: 'paid',
                payment_method: 'cash', // Default method
                notes: 'Initial payment',
                dueDate: dueDate,
                dueDay: dueDay,
                recurringType: recurringType,
                totalEmi: totalEmi,
                totalAmount: totalAmount,
                start_date: start_date,
                end_date: end_date,
                balance_amount: 0,
                interest_rate: interest_rate,
                monthlyInterest: monthlyInterest,
                monthlyPrincipal: monthlyPrincipal,
                loanStatus: loanStatus,
                status: status
            });
            
            await paymentLog.save();

            // Update account balance for savings
            if (paymentType === 'Saving') {
                const accountDoc = await Account.findById(account);
                if (accountDoc) {
                    accountDoc.balance = (Number(accountDoc.balance) - Number(paymentAmount)).toString();
                    await accountDoc.save();
                }
            }
        }

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

// Export all functions including the new ones
export { 
    createRecurringPayment, 
    getRecurringPayments, 
    editRecurringPayment, 
    deleteRecurringPayment, 
    getRecurringLog,
    addPayment,
    deletePayment,
    editPaymentLogById
};




// import RecurringPaymentLog from "../models/recurringPaymentLog.js";
// import RecurringPayment from "../models/recurringPaymentModel.js";

// const createRecurringPayment = async (req, res) => {
//     try {
//         const { 
//             account, 
//             lenderName, 
//             paymentType, 
//             amount, 
//             dueDate,
//             dueDay,
//             recurringType, 
//             totalEmi, 
//             totalAmount, 
//             start_date, 
//             end_date,
//             balance_amount,
//             interest_rate,
//             monthlyInterest,
//             monthlyPrincipal,
//             loanStatus,
//             payment_status,
//             notes,
//             status 
//         } = req.body;
        
//         const newRecurringPayment = new RecurringPayment({
//             account,
//             lenderName,
//             paymentType,
//             amount,
//             dueDate,
//             dueDay,
//             recurringType,
//             totalEmi,
//             totalAmount,
//             start_date,
//             end_date,
//             balance_amount: totalAmount || balance_amount, // Initialize with total amount if available
//             interest_rate,
//             monthlyInterest,
//             monthlyPrincipal,
//             loanStatus,
//             payment_status,
//             notes,
//             status
//         });
        
//         const savedRecurringPayment = await newRecurringPayment.save();
//         res.status(200).json({
//             success: true,
//             message: "Recurring Payment created successfully",
//             data: savedRecurringPayment,
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             error: error.message,
//         });
//     }
// };

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

                let totalAmount = 0;
                if (payment.paymentType === 'Loan' || payment.paymentType === 'Gold Loan') {
                    totalAmount = Number(payment.totalAmount) || 0;
                } else {
                    totalAmount = Number(payment.amount) || 0;
                }

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

// const getRecurringLog = async (req, res) => {
//     const { parent_id } = req.query;

//     try {
//         const recurringLog = await RecurringPaymentLog.find({ parent_id })
//             .populate("account", "name")
//             .populate("lenderName", "name")
//             .sort({ createdAt: -1 }); // Sort by newest first

//         // Get the parent payment to calculate total
//         const totalPayment = await RecurringPayment.findById(parent_id);

//         // Calculate paid amount from logs
//         const paidAmount = recurringLog
//             .filter(log => log.payment_status === 'paid')
//             .map(item => Number(item.amount) || 0)
//             .reduce((sum, amt) => sum + amt, 0);

//         // Get total amount based on payment type
//         let totalAmount = 0;
//         if (totalPayment) {
//             if (totalPayment.paymentType === 'Loan' || totalPayment.paymentType === 'Gold Loan') {
//                 totalAmount = Number(totalPayment.totalAmount) || 0;
//             } else {
//                 totalAmount = Number(totalPayment.amount) || 0;
//             }
//         }

//         const balanceAmount = totalAmount - paidAmount;

//         res.status(200).json({
//             success: true,
//             data: recurringLog,
//             paidAmount,
//             totalAmount,
//             balanceAmount: balanceAmount > 0 ? balanceAmount : 0
//         });

//     } catch (error) {
//         console.error("Error in getRecurringLog:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             error: error.message
//         });
//     }
// };

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

// export { 
//     createRecurringPayment, 
//     getRecurringPayments, 
//     editRecurringPayment, 
//     deleteRecurringPayment, 
//     getRecurringLog 
// };