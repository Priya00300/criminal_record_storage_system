import mongoose from "mongoose";

const criminalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"],
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  crimes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crime", // Reference to the Crime model
    },
  ],
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
criminalSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Criminal = mongoose.model("Criminal", criminalSchema);

export default Criminal;