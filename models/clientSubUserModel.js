import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { type } from "os";

const clientSubUserSchema = new mongoose.Schema({
  name:{
    type: String,
    validate:{
      validator: function (value) {
        if (!value) return true;
        return value.length <= 40;
      },
      message:"Name must not exceed 40 characters"
    }
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
    unique: true
  },
  password: { type: String, required: [true, "Please provide a password"] },
  // projectId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Project",
  //   required: [true, "Please provide a project"]
  // },
  projectId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: [true, "Please provide a project"]
  }],
  status: {
    type: String,
    // enum: ["active", "inactive", "pending"],
    required: [true, "Please select a valid status"]
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClientDetails",
    required: [true, "Please provide a clientId"]
  },
  is_deleted: { type: Boolean, default: false },
  type: { type: String },
  subType: { type: String },
  subuser:{type:String,default:"subuser"}
}, { timestamps: true });

// Hash password before saving
clientSubUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Hash password before updating (if changed)
clientSubUserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
    this.setUpdate(update);
  }
  next();
});

// Exclude password from JSON
clientSubUserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Index for quick filtering
clientSubUserSchema.index({ is_deleted: 1 });

const ClientSubUser = mongoose.model("ClientSubUser", clientSubUserSchema);
export default ClientSubUser;
