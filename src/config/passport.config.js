const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { Strategy: JWTStrategy, ExtractJwt } = require("passport-jwt");
const bcrypt = require("bcrypt");
const User = require("../models/User.model");

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secreto";

function initializePassport() {
  // ====== Estrategia de REGISTRO ======
  passport.use(
    "register",
    new LocalStrategy(
      {
        usernameField: "email",
        passReqToCallback: true, // permite acceder a req.body
      },
      async (req, email, password, done) => {
        try {
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            return done(null, false, { message: "El usuario ya existe" });
          }

          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = await User.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email,
            password: hashedPassword,
            role: req.body.role || "user",
          });

          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // ====== Estrategia de LOGIN ======
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: "Usuario no encontrado" });
          }

          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword) {
            return done(null, false, { message: "Contraseña incorrecta" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // ====== Estrategia JWT ======
  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET,
      },
      async (jwt_payload, done) => {
        try {
          const user = await User.findById(jwt_payload.id);
          if (!user) return done(null, false, { message: "Token inválido o usuario no encontrado" });
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

module.exports = initializePassport;
