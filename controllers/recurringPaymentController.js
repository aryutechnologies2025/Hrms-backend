import RecurringPayment from "../models/recurringPaymentModel.js";
const createRecurringPayment = async (req, res) => {
    try {
        const { account, lenderName, paymentType, amount, dueDate, recurringType, totalEmi, totalAmount } = req.body;
        const newRecurringPayment = new RecurringPayment({
            account,
            lenderName,
            paymentType,
            amount,
            dueDate,
            recurringType,
            totalEmi,
            totalAmount,
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
        const recurringPayments = await RecurringPayment.find().populate("account", "name");
        res.status(200).json({ success: true, data: recurringPayments });
    } catch (error) {        console.error("Error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

const editRecurringPayment = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedRecurringPayment = await RecurringPayment.findByIdAndUpdate(id
            , req.body, { new: true });
        if (!updatedRecurringPayment) {
            return res.status(404).json({ success: false, message: "Recurring Payment not found" });
        }
        res.status(200).json({ success: true, message: "Recurring Payment updated successfully", data: updatedRecurringPayment });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

const deleteRecurringPayment = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedRecurringPayment = await RecurringPayment.findByIdAndDelete(id);
        if (!deletedRecurringPayment) {
            return res.status(404).json({ success: false, message: "Recurring Payment not found" });
        }
        res.status(200).json({ success: true, message: "Recurring Payment deleted successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
export { createRecurringPayment, getRecurringPayments, editRecurringPayment, deleteRecurringPayment };