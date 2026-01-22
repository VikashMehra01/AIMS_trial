const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('./models/User');

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || 'place_holder_id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'place_holder_secret',
        callbackURL: "/auth/google/callback"
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                if (!email.endsWith('@iitrpr.ac.in')) {
                    return done(null, false, { message: 'Only @iitrpr.ac.in emails are allowed' });
                }

                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                } else {
                    // Determine Role
                    let role = 'student';
                    if (email === 'facultyadvisor@iitrpr.ac.in') {
                        role = 'faculty_advisor';
                    } else if (/^[a-zA-Z]/.test(email)) {
                        role = 'instructor';
                    }

                    const newUser = {
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        pfp: profile.photos[0].value,
                        rollNumber: profile.emails[0].value.split('@')[0],
                        department: 'Unknown',
                        degree: 'B.Tech',
                        yearOfEntry: new Date().getFullYear().toString(),
                        role
                    };
                    user = await User.create(newUser);
                    return done(null, user);
                }
            } catch (err) {
                console.error(err);
                return done(err, null);
            }
        }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};
