import mongoose from "mongoose";

const crimeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  criminals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Criminal", // Reference to the Criminal model
    },
  ],
  severity: {
    type: String,
    required: true,
    enum: ["Low", "Medium", "High"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the `updatedAt` field before saving
crimeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Crime = mongoose.model("Crime", crimeSchema);

export default Crime;