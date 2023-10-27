const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  emailAddress: {
    type: String,
    required: true
  },
  frequency: {
    type: Number,
    required: true,
    default: 7 // Weekly
  },
  upcomingDays: {
    type: Number,
    required: true,
    default: 7 // Looking 1 week ahead
  },
  lastSent: { // Not Passed When Creating
    type: Date,
    required: true,
    default: Date.now
  },
  subscribed: {
    type: Boolean,
    required: true,
    default: true
  }
});

module.exports = mongoose.model("Email", emailSchema);