import { body, validationResult } from 'express-validator';

class ValidationService {
    validateCreateUser() {
        return [
            body('username').isString().notEmpty().withMessage('Username is required'),
            body('email').isEmail().withMessage('Email is not valid'),
            body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        ];
    }

    validateCreateSale() {
        return [
            body('amount').isNumeric().withMessage('Amount must be a number'),
            body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
            body('userId').isString().notEmpty().withMessage('User ID is required'),
        ];
    }

    validate(req: any) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new Error(JSON.stringify(errors.array()));
        }
    }
}

export default new ValidationService();