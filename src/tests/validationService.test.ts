// import { ValidationService } from '../services/validationService';

// describe('ValidationService', () => {
//     let validationService: ValidationService;

//     beforeEach(() => {
//         validationService = new ValidationService();
//     });

//     describe('validateUser', () => {
//         it('should return true for valid user data', () => {
//             const userData = {
//                 username: 'testuser',
//                 password: 'Password123!',
//                 email: 'testuser@example.com'
//             };
//             const result = validationService.validateUser(userData);
//             expect(result).toBe(true);
//         });

//         it('should return false for invalid user data', () => {
//             const userData = {
//                 username: '',
//                 password: 'short',
//                 email: 'invalid-email'
//             };
//             const result = validationService.validateUser(userData);
//             expect(result).toBe(false);
//         });
//     });

//     describe('validateSale', () => {
//         it('should return true for valid sale data', () => {
//             const saleData = {
//                 amount: 100,
//                 date: '2023-10-01',
//                 userId: 'user123'
//             };
//             const result = validationService.validateSale(saleData);
//             expect(result).toBe(true);
//         });

//         it('should return false for invalid sale data', () => {
//             const saleData = {
//                 amount: -50,
//                 date: 'invalid-date',
//                 userId: ''
//             };
//             const result = validationService.validateSale(saleData);
//             expect(result).toBe(false);
//         });
//     });
// });