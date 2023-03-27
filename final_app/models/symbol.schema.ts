import mongoose, { Schema } from 'mongoose';

const symbolSchema = new Schema({
  symbol: String,
  value: Number,
  scrapedAt: Date
});

export const Symbol = mongoose.model('Symbol', symbolSchema);
