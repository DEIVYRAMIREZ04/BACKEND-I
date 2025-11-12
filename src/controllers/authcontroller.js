const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/User.model");

const initPassport = () => {
  // ======= Estrategia de LOGIN =======
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // Buscar usuario por email
          const user = await User.findOne({ email }).lean();
          if (!user) {
            return done(null, false, { message: "Usuario no encontrado" });
          }

          // Comparar contraseña hasheada
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Contraseña incorrecta" });
          }

          // Si todo va bien, devuelve el usuario
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // ======= Estrategia de REGISTRO =======
  passport.use(
    "register",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name, age } = req.body;

          // Validar campos obligatorios según el nuevo modelo
          if (!first_name || !email || !password) {
            return done(null, false, { message: "Faltan campos obligatorios (nombre, correo o contraseña)" });
          }

          // Verificar si ya existe un usuario con ese correo
          const userExist = await User.findOne({ email }).lean();
          if (userExist) {
            return done(null, false, { message: "El usuario ya existe" });
          }

          // Hashear contraseña
          const hashedPassword = await bcrypt.hash(password, 10);

          // Crear nuevo usuario (solo los campos válidos del modelo)
          const newUser = await User.create({
            first_name,
            last_name, // opcional
            email,
            age,       // opcional
            password: hashedPassword,
            role: "user", // default en el modelo, pero lo dejamos explícito
          });

          return done(null, newUser);
        } catch (err) {
          console.error("Error en registro:", err);
          return done(err);
        }
      }
    )
  );

  // ======= Serialización =======
  passport.serializeUser((user, done) => done(null, user._id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).lean();
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

module.exports = { passport, initPassport };
