const { body, param, validationResult } = require("express-validator");

/**
 * Middleware que maneja errores de validación
 * Responde con 400 si hay errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Errores de validación",
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// ====== VALIDADORES PARA USUARIOS ======

const validateRegister = [
  body("first_name")
    .trim()
    .notEmpty().withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 50 }).withMessage("El nombre debe tener entre 2 y 50 caracteres"),
  body("last_name")
    .trim()
    .optional()
    .isLength({ max: 50 }).withMessage("El apellido no puede exceder 50 caracteres"),
  body("email")
    .trim()
    .isEmail().withMessage("Email inválido")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener mínimo 6 caracteres"),
  body("age")
    .optional()
    .isInt({ min: 18, max: 120 }).withMessage("La edad debe estar entre 18 y 120 años"),
  handleValidationErrors,
];

const validateLogin = [
  body("email")
    .trim()
    .isEmail().withMessage("Email inválido")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("La contraseña es obligatoria"),
  handleValidationErrors,
];

// ====== VALIDADORES PARA PRODUCTOS ======

const validateCreateProduct = [
  body("title")
    .trim()
    .notEmpty().withMessage("El título es obligatorio")
    .isLength({ min: 3, max: 100 }).withMessage("El título debe tener entre 3 y 100 caracteres"),
  body("description")
    .trim()
    .notEmpty().withMessage("La descripción es obligatoria")
    .isLength({ min: 10 }).withMessage("La descripción debe tener mínimo 10 caracteres"),
  body("code")
    .trim()
    .notEmpty().withMessage("El código es obligatorio")
    .isLength({ min: 2, max: 50 }).withMessage("El código debe tener entre 2 y 50 caracteres"),
  body("price")
    .notEmpty().withMessage("El precio es obligatorio")
    .isFloat({ min: 0.01 }).withMessage("El precio debe ser un número mayor a 0"),
  body("stock")
    .notEmpty().withMessage("El stock es obligatorio")
    .isInt({ min: 0 }).withMessage("El stock debe ser un número no negativo"),
  body("category")
    .trim()
    .notEmpty().withMessage("La categoría es obligatoria")
    .isLength({ min: 2 }).withMessage("La categoría debe tener mínimo 2 caracteres"),
  body("status")
    .optional()
    .isBoolean().withMessage("El status debe ser true o false"),
  handleValidationErrors,
];

const validateUpdateProduct = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("El título debe tener entre 3 y 100 caracteres"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage("La descripción debe tener mínimo 10 caracteres"),
  body("price")
    .optional()
    .isFloat({ min: 0.01 }).withMessage("El precio debe ser un número mayor a 0"),
  body("stock")
    .optional()
    .isInt({ min: 0 }).withMessage("El stock debe ser un número no negativo"),
  body("status")
    .optional()
    .isBoolean().withMessage("El status debe ser true o false"),
  handleValidationErrors,
];

const validateProductId = [
  param("id")
    .matches(/^[0-9a-fA-F]{24}$/).withMessage("ID de producto inválido"),
  handleValidationErrors,
];

// ====== VALIDADORES PARA CARRITOS ======

const validateAddToCart = [
  body("quantity")
    .optional()
    .isInt({ min: 1 }).withMessage("La cantidad debe ser un número mayor a 0"),
  handleValidationErrors,
];

const validateCartId = [
  param("cid")
    .matches(/^[0-9a-fA-F]{24}$/).withMessage("ID de carrito inválido"),
  handleValidationErrors,
];

const validateProductIdInCart = [
  param("pid")
    .matches(/^[0-9a-fA-F]{24}$/).withMessage("ID de producto inválido"),
  handleValidationErrors,
];

const validateUpdateQuantity = [
  body("quantity")
    .notEmpty().withMessage("La cantidad es obligatoria")
    .isInt({ min: 0 }).withMessage("La cantidad debe ser un número no negativo"),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
  validateAddToCart,
  validateCartId,
  validateProductIdInCart,
  validateUpdateQuantity,
};
