import express from 'express';
import passport from '../middlewares/githubStrategy';

const router = express.Router();

router.get('/github', passport.authenticate('github'));
router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/users/welcome',
    successRedirect: '/users/dashboard'
  })
);

router.get('/logout', function (req, res) {
  req.logout((err: string) => console.log(err));
  res.redirect('/users/welcome');
});

export default router;
