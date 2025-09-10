import { body } from "express-validator/lib/middlewares/validation-chain-builders";

// Signup validation rules
export const updateUserProfileValidation = [
    body('name')
      .trim()
      .notEmpty().withMessage("Name is required")
      .isLength({ min: 3 }).withMessage("Name must be at least 3 characters"),
  
    body('username')
      .trim()
      .notEmpty().withMessage("Username is required")
      .isLength({ min: 3, max: 20 }).withMessage("Username must be 3-20 characters long")
      .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),
      
    body('bio')
      .optional()
      .isLength({ max: 150 }).withMessage("Bio cannot exceed 150 characters"),
  
    body('profileUrl')
      .optional()
      .isURL().withMessage("Profile URL must be a valid URL"),
  ];