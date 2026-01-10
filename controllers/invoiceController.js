import Invoice from "../models/invoiceModel.js";
import InvoiceSettings from "../models/invoiceSettingModel.js";
import InvoiceStatusLog from "../models/invoiceStatusLog.js";
import ProjectModel from "../models/projectModel.js";
const createInvoice = async (req, res) => {
  console.log("req.body", req.body);
  try {
    //     const lastInvoice = await Invoice.findOne({}).sort({ createdAt: -1 });

    //     let nextNumber = 1;

    //     if (lastInvoice && lastInvoice.invoice_number) {
    //       const lastNumber = parseInt(lastInvoice.invoice_number.split("-")[1]);
    //       nextNumber = lastNumber + 1;
    //     }

    //     // const invoice_number = `INV-${String(nextNumber).padStart(4, "0")}`;
    //    let invoice_number;

    // // Only use user-provided number if it's a valid string of your pattern
    // if (req.body.invoice_number && typeof req.body.invoice_number === "string" && req.body.invoice_number.trim() !== "") {
    //   invoice_number = req.body.invoice_number.trim();
    // } else {
    //   invoice_number = `INV-${String(nextNumber).padStart(4, "0")}`;
    // }

    // Get last invoice
    const lastInvoice = await Invoice.findOne({
      invoice_number: /^INV-\d{4}$/,
    }).sort({ createdAt: -1 });
    let nextNumber = 1;

    if (lastInvoice && lastInvoice.invoice_number) {
      const lastNum = parseInt(lastInvoice.invoice_number.split("-")[1], 10);
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }

    let invoice_number;
    if (req.body.invoice_number && req.body.invoice_number.trim() !== "") {
      invoice_number = req.body.invoice_number.trim();
    } else {
      invoice_number = `INV-${String(nextNumber).padStart(4, "0")}`;
    }

    const {
      clientId,
      project,
      invoice_date,
      due_date,
      currency,
      items,
      tax,
      total_amount,
      notes,
      invoice_type,
      status,
      igst,
      cgst,
      sgst,
      subTotal,
      paid_date,
      paymentType,
      amount,
    } = req.body;

    const newInvoice = new Invoice({
      clientId,
      invoice_number,
      project,
      invoice_date,
      due_date,
      currency,
      items,
      tax,
      total_amount,
      notes,
      invoice_type,
      status,
      igst,
      cgst,
      sgst,
      subTotal,
      paid_date,
      paymentType,
      amount,
    });

    const savedInvoice = await newInvoice.save();

    if (req.body.status === "invoice_raised") {
      await InvoiceStatusLog.create({
        invoiceId: savedInvoice._id,
        clientId: savedInvoice.clientId,
        project: savedInvoice.project,
        status: req.body.status,
        amount: req.body.total_amount,
        paymentType: req.body.paymentType,
        paidDate: req.body.paidDate,
      });
    } else {
      InvoiceStatusLog.create({
        invoiceId: savedInvoice._id,
        clientId: savedInvoice.clientId,
        project: savedInvoice.project,
        status: req.body.status,
        amount: req.body.amount,
        paymentType: req.body.paymentType,
        paidDate: req.body.paidDate,
      });
    }

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: savedInvoice,
      // statusLog,
    });
  } catch (error) {
    console.error("Error:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }

    return res.status(500).json({ success: false, message: error });
  }
};
const getInvoiceDetails = async (req, res) => {
  const { client, project, status } = req.query;

  try {
    const filter = { is_deleted: "0" };

    if (client) filter.clientId = client;
    if (project) filter.project = project;
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .populate("clientId", "client_name")
      .populate("project", "name");

    const invoiceIds = invoices.map((inv) => inv._id);

    const logs = await InvoiceStatusLog.find({
      invoiceId: { $in: invoiceIds },
      amount: {
        $exists: true,
        $nin: ["", " ", "0", 0, null],
      },
    }).sort({ createdAt: -1 });

    const invoicesWithBalance = invoices.map((invoice) => {
      const selectedDocument = invoice.documents?.filter(
        (doc) => doc.select === true
      );
      const invoiceLogs = logs.filter(
        (log) => log.invoiceId.toString() === invoice._id.toString()
      );
      const totalPaymentAmount = invoiceLogs.reduce(
        (total, log) => total + Number(log.amount),
        0
      );

      const balance = (invoice.total_amount - totalPaymentAmount).toFixed(2);
      //   const totalAmount = logs.aggregate([
      //   {
      //     $group: {
      //       _id: null,
      //       amount: { $sum: { $toInt: "$amount" } },
      //     },
      //   },
      // ]);

      return {
        ...invoice._doc,
        document: selectedDocument || null,
        balance,
        totalPaymentAmount,
        invoiceLogs,
      };
    });

    res.status(200).json({
      success: true,
      data: invoicesWithBalance,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// const getInvoiceDetails = async (req, res) => {
//   try {
//     const invoiceDetails = await Invoice.find({ is_deleted: "0" })
//       .sort({
//         createdAt: -1,
//       })
//       .populate("clientId", "client_name")
//       .populate("project", "name");
//     res.status(200).json({ success: true, data: invoiceDetails });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

const editInvoiceDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const updateData = { ...req.body };

    if (updateData.status === "") {
      delete updateData.status;
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (req.body.status) {
      await InvoiceStatusLog.create({
        invoiceId: updatedInvoice._id,
        clientId: updatedInvoice.clientId,
        project: updatedInvoice.project,
        status: req.body.status,
        amount: req.body.amount,
        paidDate: req.body.paidDate,
        paymentType: req.body.paymentType,
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editInvoiceLogDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInvoice = await InvoiceStatusLog.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteInvoiceLogDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInvoiceLog = await InvoiceStatusLog.findByIdAndDelete(id);
    if (!deletedInvoiceLog) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Invoice Deleted successfully",
      data: deletedInvoiceLog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// const uploadClientInvoice = async (req, res) => {
//   try {
//     const { id, invoice_type } = req.body;

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Invoice id is required",
//       });
//     }

//     let invoiceDocs = [];

//     if (req.files?.clientInvoice?.length) {
//       invoiceDocs = req.files.clientInvoice.map((file) => ({
//         fieldname: file.fieldname,
//         originalName: file.originalname,
//         filename: file.filename,
//         path: file.path,
//         mimetype: file.mimetype,
//         size: file.size,
//       }));
//     }

//     const updatedInvoice = await Invoice.findOneAndUpdate(
//       { _id: id },
//       {
//         $set: { invoice_type },
//         ...(invoiceDocs.length && {
//           $push: { documents: { $each: invoiceDocs } },
//         }),
//       },
//       { new: true }
//     );
//     // const updatedInvoice = await Invoice.findOneAndUpdate(
//     //   { _id: id },
//     //   {
//     //     $set: {
//     //       invoice_type,
//     //       ...(invoiceDocs.length && { documents: invoiceDocs }),
//     //     },
//     //   },
//     //   { new: true }
//     // );

//     if (!updatedInvoice) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Invoice updated successfully",
//       data: updatedInvoice,
//     });
//   } catch (error) {
//     console.error("Upload Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };
const uploadClientInvoice = async (req, res) => {
  try {
    const { id, invoice_document_type } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invoice id is required",
      });
    }

    if (!invoice_document_type) {
      return res.status(400).json({
        success: false,
        message: "invoice document type is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const invoiceDoc = {
      fieldname: req.file.fieldname,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      invoice_document_type,
      select: false,
    };

    const invoice = await Invoice.findOne({
      _id: id,
      "documents.invoice_document_type": invoice_document_type,
    });

    let updatedInvoice;

    if (invoice) {
      updatedInvoice = await Invoice.findOneAndUpdate(
        {
          _id: id,
          "documents.invoice_document_type": invoice_document_type,
        },
        {
          $set: {
            "documents.$": invoiceDoc,
          },
        },
        { new: true }
      );
    } else {
      updatedInvoice = await Invoice.findOneAndUpdate(
        { _id: id },
        {
          $push: { documents: invoiceDoc },
        },
        { new: true }
      );
    }

    if (!updatedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: invoice
        ? "Document updated successfully"
        : "Document uploaded successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// const selectInvoiceDocument = async (req, res) => {
//   try {
//     const { invoiceId, documentId } = req.body;

//     if (!invoiceId || !documentId) {
//       return res.status(400).json({
//         success: false,
//         message: "invoiceId and documentId are required",
//       });
//     }

//     const invoiceExists = await Invoice.updateOne(
//       { _id: invoiceId },
//       { $set: { "documents.$[].select": false } }
//     );

//     if (!invoiceExists.matchedCount) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     await Invoice.updateOne(
//       { _id: invoiceId, "documents._id": documentId },

//       { $set: { "documents.$.select": true } }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Document selected successfully",
//     });
//   } catch (error) {
//     console.error("Select Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

const selectInvoiceDocument = async (req, res) => {
  try {
    const { invoiceId, documentId } = req.body; // documentId is now an array

    if (
      !invoiceId ||
      !documentId ||
      !Array.isArray(documentId) ||
      documentId.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "invoiceId and documentId (array) are required",
      });
    }

    // Reset all documents to select = false
    const invoiceExists = await Invoice.updateOne(
      { _id: invoiceId },
      { $set: { "documents.$[].select": false } }
    );

    if (!invoiceExists.matchedCount) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // Select multiple documents
    await Invoice.updateOne(
      { _id: invoiceId },
      { $set: { "documents.$[doc].select": true } },
      {
        arrayFilters: [{ "doc._id": { $in: documentId } }],
      }
    );

    res.status(200).json({
      success: true,
      message: "Document(s) selected successfully",
    });
  } catch (error) {
    console.error("Select Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const clientInvoiceById = async (req, res) => {
  const { id } = req.query;
  console.log(id, "id");
  try {
    const invoiceSetting = await InvoiceSettings.findOne({});
    const invoiceDetails = await Invoice.findById(id)
      .populate("clientId")
      .populate("project", "name");

    res.status(200).json({
      success: true,
      data: invoiceDetails,
      setting: invoiceSetting,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const clientDashboard = async (req, res) => {
  const { clientId, project } = req.query;

  try {
    let invoices;

    if (!project) {
      invoices = await Invoice.find({ clientId })
        .sort({ createdAt: -1 })
        .populate("clientId", "client_name")
        .populate("project", "name");
    } else {
      invoices = await Invoice.find({ clientId, project })
        .sort({ createdAt: -1 })
        .populate("clientId", "client_name")
        .populate("project", "name");
    }

    const invoiceIds = invoices.map((inv) => inv._id);

    const logs = await InvoiceStatusLog.find({
      invoiceId: { $in: invoiceIds },
      amount: {
        $exists: true,
        $nin: ["", " ", "0", 0, null],
      },
    }).sort({ createdAt: -1 });

    const mappedData = invoices.map((invoice) => {
      const selectedDocument = invoice.documents?.filter(
        (doc) => doc.select === true
      );

      const invoiceLogs = logs.filter(
        (log) => log.invoiceId.toString() === invoice._id.toString()
      );

      const totalPaymentAmount = invoiceLogs.reduce(
        (total, log) => total + Number(log.amount || 0),
        0
      );

      const balance = (
        Number(invoice.total_amount || 0) - totalPaymentAmount
      ).toFixed(2);

      return {
        invoiceId: invoice._id,
        clientName: invoice.clientId?.client_name || null,
        projectName: invoice.project?.name || null,
        total_amount: invoice.total_amount,
        paid_date: invoice.paid_date,
        document: selectedDocument || null,
        status: invoice.status,
        due: invoice.due_date,
        invoiceNumber: invoice.invoice_number,
        invoiceDate: invoice.invoice_date,
        totalPaymentAmount,
        balance,
        invoiceLogs,
      };
    });

    res.status(200).json({
      success: true,
      data: mappedData,
    });
  } catch (error) {
    console.error("Client Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const clientInvoiceByProjectWise = async (req, res) => {
  const { id } = req.query;

  try {
    const invoice = await Invoice.findById(id)
      .populate("clientId", "client_name")
      .populate("project", "name");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const invoiceLogs = await InvoiceStatusLog.find({
      invoiceId: invoice._id,
    }).sort({ createdAt: -1 });

    const mappedData = {
      invoiceId: invoice._id,
      clientName: invoice.clientId?.client_name || null,
      projectName: invoice.project?.name || null,
      amount: invoice.amount,
      paid_date: invoice.paid_date,
      status: invoice.status,
      logs: invoiceLogs,
    };

    res.status(200).json({
      success: true,
      data: mappedData,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteInvoiceDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Invoice.findByIdAndUpdate(
      id,
      { is_deleted: "1" },
      { new: true }
    );

    res
      .status(200)
      .json({ success: true, message: "uploaded successfully client details" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const addNotesInvoice = async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const updated = await Invoice.findByIdAndUpdate(
    id,
    { $push: { notes: { note: note, time: new Date() } } },
    { new: true }
  );
  res.status(200).json({ success: true, data: updated });
};

//get the all name column from Project Model
const getProjectName = async (req, res) => {
  try {
    const projects = await ProjectModel.find({}).select(
      "name clientName budget"
    );
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getProjectNameWithClient = async (req, res) => {
  const { project } = req.query;
  console.log("projectid:", project);
  try {
    const projects = await ProjectModel.find({ clientName: project }).select(
      "name clientName budget gst gst_amount"
    );
    console.log("projects:", projects);
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getProjectDetails = async (req, res) => {
  const type = req.params.type;
  console.log("type:", type);

  try {
    const project = await Invoice.findOne({ name: type });
    console.log("project:", project);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const invoiceDetails = await Invoice.find({ project: project.name });

    res.status(200).json({ success: true, data: invoiceDetails });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export {
  addNotesInvoice,
  createInvoice,
  getInvoiceDetails,
  editInvoiceDetails,
  deleteInvoiceDetails,
  getProjectName,
  getProjectDetails,
  getProjectNameWithClient,
  uploadClientInvoice,
  clientInvoiceById,
  clientDashboard,
  selectInvoiceDocument,
  clientInvoiceByProjectWise,
  editInvoiceLogDetails,
  deleteInvoiceLogDetails,
};
