import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { Symbol } from '../models/symbol.schema';
import { isAuthenticated } from '../middlewares/isAuth';
import { user } from '@prisma/client';

const router = express.Router();

router.get('/welcome', (req, res) => {
  res.render('welcome');
});

router.get('/dashboard', isAuthenticated, async (req, res) => {
  const currUser = req.user as user;
  const symbols = await prisma.users_symbols.findMany({
    where: { user_id: currUser.id },
    distinct: ['symbol']
  });

  const symbolsWithValues = (
    await Promise.all(
      symbols.map(({ symbol }) => {
        try {
          return Symbol.findOne({ symbol }).sort({ scrapedAt: -1 });
        } catch (e) {
          return null;
        }
      })
    )
  ).filter((sym) => sym !== null);

  res.render('dashboard', {
    symbols: symbolsWithValues,
    user: currUser
  });
});

router.post(
  '/add-currency',
  isAuthenticated,
  body('symbol')
    .isString()
    .isAlphanumeric()
    .isLength({ min: 3, max: 3 })
    .toUpperCase(),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await prisma.users_symbols.create({
      data: {
        user_id: (req.user as user).id,
        symbol: req.body.symbol
      }
    });
    res.redirect('/users/dashboard');
  }
);

export default router;
