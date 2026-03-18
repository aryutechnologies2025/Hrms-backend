import express from 'express';
import {getRecurringPaymentReport,
    getLoanName,addPayment, deletePayment, editPaymentLogById, getRecurringLog, createRecurringPayment, getRecurringPayments, editRecurringPayment, deleteRecurringPayment } from '../controllers/recurringPaymentController.js';

const recurringPaymentRouter = express.Router();
recurringPaymentRouter.post('/create', createRecurringPayment);
recurringPaymentRouter.get('/get', getRecurringPayments);
recurringPaymentRouter.get('/log', getRecurringLog);
recurringPaymentRouter.put('/update/:id', editRecurringPayment);
recurringPaymentRouter.put('/update-log/:id', editPaymentLogById);
recurringPaymentRouter.delete('/delete/:id', deleteRecurringPayment);



recurringPaymentRouter.post('/add-payment', addPayment);
recurringPaymentRouter.delete('/delete-payment/:id', deletePayment);


//report
recurringPaymentRouter.get('/report', getRecurringPaymentReport);
recurringPaymentRouter.get('/loan-name', getLoanName);
export default recurringPaymentRouter;