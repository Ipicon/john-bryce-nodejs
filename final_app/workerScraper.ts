import mongoose from 'mongoose';
import axios from 'axios';
import * as cheerio from 'cheerio';
import {PrismaClient} from '@prisma/client';
import {Symbol} from './models/symbol.schema';
import {io, Socket} from 'socket.io-client';

// please note that the types are reversed
const socket: Socket = io('http://localhost:3000');
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
    const { id, symbol } = symbols[responseIndex];

    try {
      const newSymbol = new Symbol({
        symbol: symbol,
        value: parseFloat(value),
        scrapedAt: new Date()
      });

      const response = await newSymbol.save();
      console.log(`saving value for ${symbol}`, response);

      socket.emit('new-value', response);
    } catch (e) {
      console.log(`${symbol} is a bad currency. removing...`);

      await prisma.users_symbols.delete({ where: { id } });
    }
  }

  setTimeout(() => void workerScraper(), 1000 * 60);
};

void init();
