const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../../app/models/User");
require("dotenv").config({ path: "../.env" });

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Tìm hoặc tạo user mới dựa trên Google ID hoặc email
        let user = await User.findOne({ $or: [
          { googleId: profile.id },
          { email: profile.emails[0].value }
        ] });
        if (user) {
          // Cập nhật thông tin nếu người dùng đã tồn tại
          user.googleId = user.googleId || profile.id;
          user.name = user.name || profile.displayName;
          user.profile = user.profile || {};
          user.profile.avatar = user.profile.avatar || (profile.photos && profile.photos[0] && profile.photos[0].value) || undefined;
          await user.save();
        } else {
          // Tạo người dùng mới
          user = new User({
            email: profile.emails[0].value,
            googleId: profile.id,
            name: profile.displayName || "Người dùng mới",
            profile: {
              avatar: (profile.photos && profile.photos[0] && profile.photos[0].value) || undefined
            },
            password: "google-oauth-" + profile.id, // Password giả để thỏa mãn schema
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize và deserialize user
passport.serializeUser((user, done) => {
  done(null, user._id); // Lưu _id của user vào session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
