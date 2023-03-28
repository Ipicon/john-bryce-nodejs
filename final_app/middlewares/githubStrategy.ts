import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { prisma } from '../index';
import { user } from '@prisma/client';

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      callbackURL: 'http://localhost:3000/auth/github/callback'
    },
    async function (
      accessToken: string,
      refreshToken: string,
      profile: { id: string; username: string },
      done: (
        err: null | Error,
        user?: false | user,
        message?: { mgs: string }
      ) => void
    ) {
      try {
        let user = await prisma.user.findFirst({
          where: {
            id: Number(profile.id)
          }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              id: Number(profile.id),
              username: profile.username
            }
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj: { id: string }, done) {
  done(null, obj);
});

export default passport;
