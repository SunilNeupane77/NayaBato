import mongoose from 'mongoose';

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ],
    unique: true
  },
  subscribed: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);
