const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Issue', 'Request', 'Other'],
    default: 'Issue'
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Closed'],
    default: 'Open'
  },
  adminResponse: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
