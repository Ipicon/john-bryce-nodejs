import mongoose, { Schema } from 'mongoose';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const symbolSchema = new Schema({
  symbol: String,
  value: Number,
  scrapedAt: Date
});

const Symbol = mongoose.model('Symbol', symbolSchema);

const workerScraper = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/mymongo');
  console.log('connected to mongo');

  const prisma = new PrismaClient();
  const symbols = await prisma.users_symbols.findMany({
    distinct: 'symbol'
  });

  for (const { symbol } of symbols) {
    const res = (
      await axios.get(`https://www.google.com/finance/quote/${symbol}-USD`)
    ).data;

    const $ = cheerio.load(res);
    const value = $("[jsname='LXPcOd'] [jsname='ip75Cb']")
      .text()
      .replace(',', '');

    const newSymbol = new Symbol({
      symbol: 'BTC',
      value: parseFloat(value),
      scrapedAt: new Date()
    });

    const response = await newSymbol.save();
    console.log(`saving value for ${symbol}`, response);
  }
};

void workerScraper();
