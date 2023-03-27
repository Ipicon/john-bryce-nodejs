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
const prisma = new PrismaClient();
const init = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/mymongo');
  console.log('connected to mongo');

  void workerScraper();
};

const workerScraper = async () => {
  const symbols = await prisma.users_symbols.findMany({
    distinct: 'symbol'
  });

  const sitePromise = symbols.map(({ symbol }) =>
    axios.get(`https://www.google.com/finance/quote/${symbol}-USD`)
  );

  const responses = (await Promise.allSettled(sitePromise)).filter(
    (pr) => pr.status === 'fulfilled'
  );

  for (
    let responseIndex = 0;
    responseIndex < responses.length;
    responseIndex++
  ) {
    const newResponse = responses[responseIndex];

    if (newResponse.status !== 'fulfilled') return;

    const $ = cheerio.load(newResponse.value.data);
    const value = $("[jsname='LXPcOd'] [jsname='ip75Cb']")
      .text()
      .replace(',', '');
    const { symbol } = symbols[responseIndex];

    const newSymbol = new Symbol({
      symbol: symbol,
      value: parseFloat(value),
      scrapedAt: new Date()
    });

    const response = await newSymbol.save();
    console.log(`saving value for ${symbol}`, response);
  }

  setTimeout(() => void workerScraper(), 1000 * 60);
};

void init();
