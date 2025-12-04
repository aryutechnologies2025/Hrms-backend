import mongoose from "mongoose";


const announcementSchema = new mongoose.Schema({

    date: { 
    type: Date,
    // type:String,
     default: Date.now, 
    required: [true, "Please provide a date"] 
  }, 
  expiryDate: { 
    // type: Date,
    type:String,
     default: Date.now, 
    required: [true, "Please provide a date"] 
  }, 
  message: {
    type: String,
    required: [true, "Please provide a message"],
  },
  displayStatus: {
    type: String,
    required: [true, "Please provide a status"],
  },

},
 {
  timestamps: true // adds createdAt and updatedAt fields
}
);


const Announcements = mongoose.model("Announcements", announcementSchema);
export default Announcements;




