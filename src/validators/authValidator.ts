import { body } from "express-validator/lib/middlewares/validation-chain-builders";


export const loginValidation = [
  body('usernameOrEmail')
    .trim()
    .notEmpty().withMessage('Username or email is required')
    .isLength({ min: 3 }).withMessage('Username or email must be at least 3 characters'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  body('rememberMe')
    .optional()
    .isBoolean().withMessage('RememberMe must be a boolean'),
];

// Signup validation rules
export const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3 }).withMessage("Name must be at least 3 characters"),

  body('email')
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

  body('username')
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3, max: 20 }).withMessage("Username must be 3-20 characters long")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),

  body('password')
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

  body('bio')
    .optional()
    .isLength({ max: 150 }).withMessage("Bio cannot exceed 150 characters"),

  body('profileUrl')
    .optional()
    .isURL().withMessage("Profile URL must be a valid URL"),
];
