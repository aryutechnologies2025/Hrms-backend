import Customer from '../models/customerModel.js';
const createCustomer = async (req, res) => {
    try{
        const {customerName, customerEmail, password, customerPhone, customerWebsite, companyName, subscriptionType, monthly} = req.body;

        const newCustomer = new Customer({
            customerName,
            customerEmail,
            password,
            customerPhone,
            customerWebsite,
            companyName,
            subscriptionType,
            monthly
        });
        const savedCustomer =  await newCustomer.save();

        res.status(201).json({
            success:true,
            message:"Customer created successfully",
            data:savedCustomer
        });
    }
    catch(error){
        console.error("Error:", error);
        res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        });
    }
}

const getCustomerDetails = async(req, res) => {
    try{
        const customers = await Customer.find();
        res.status(200).json({
            success:true,
            data:customers
        });
    }
    catch(error){
        console.error("Error:", error);
        res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        });
    }
}

const editCustomerDetails =async (req, res) => {
    const{id} = req.params;
    try{
        const updated = await Customer.findByIdAndUpdate(id, req.body,{
            new:true,
            runValidators: true,
        });
        if(!updated){
            return res.status(404).json({ success: false, message: "Customer not found" });
        }
        res.status(200).json({ success: true, message: "Customer updated successfully", data: updated });
    }
    catch(error){
        console.error("Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const customerDelete = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findByIdAndUpdate(id, { active: '0' }, { new: true });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, message: "Customer Inactive successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


export{
    createCustomer,
    getCustomerDetails,
    editCustomerDetails,
    customerDelete
}
