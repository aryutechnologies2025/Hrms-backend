import express from 'express';
import { createRecurringPayment, getRecurringPayments, editRecurringPayment, deleteRecurringPayment } from '../controllers/recurringPaymentController.js';

const recurringPaymentRouter = express.Router();
recurringPaymentRouter.post('/create', createRecurringPayment);
recurringPaymentRouter.get('/get', getRecurringPayments);
recurringPaymentRouter.put('/update/:id', editRecurringPayment);
recurringPaymentRouter.delete('/delete/:id', deleteRecurringPayment);
export default recurringPaymentRouter;