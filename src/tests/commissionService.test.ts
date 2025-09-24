// import { CommissionService } from '../services/commissionService';

// describe('CommissionService', () => {
//     let commissionService: CommissionService;

//     beforeEach(() => {
//         commissionService = new CommissionService();
//     });

//     describe('calculateCommission', () => {
//         it('should calculate commission correctly for a given sale', () => {
//             const sale = {
//                 amount: 1000,
//                 commissionRate: 0.1
//             };
//             const expectedCommission = 100;

//             const commission = commissionService.calculateCommission(sale.amount, sale.commissionRate);
//             expect(commission).toBe(expectedCommission);
//         });

//         it('should return 0 if the amount is 0', () => {
//             const sale = {
//                 amount: 0,
//                 commissionRate: 0.1
//             };
//             const expectedCommission = 0;

//             const commission = commissionService.calculateCommission(sale.amount, sale.commissionRate);
//             expect(commission).toBe(expectedCommission);
//         });

//         it('should handle negative amounts by returning 0', () => {
//             const sale = {
//                 amount: -500,
//                 commissionRate: 0.1
//             };
//             const expectedCommission = 0;

//             const commission = commissionService.calculateCommission(sale.amount, sale.commissionRate);
//             expect(commission).toBe(expectedCommission);
//         });
//     });
// });