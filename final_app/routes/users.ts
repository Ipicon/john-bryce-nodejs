import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';

const router = express.Router();

router.get('/welcome', (req, res) => {
  res.render('welcome');
});

router.get('/dashboard', async (req, res) => {
  const symbols = await prisma.users_symbols.findMany({
    where: { user_id: 1 }
  });

  res.render('dashboard', {
    symbols
  });
});

router.post(
  '/add-currency',
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
        user_id: 1,
        symbol: req.body.symbol
      }
    });
    res.redirect('/users/dashboard');
  }
);

export default router;
