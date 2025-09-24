// import request from 'supertest';
// import { app } from '../app'; // Assuming app is exported from app.ts
// import { SalesController } from '../controllers/salesController';

// describe('SalesController', () => {
//     let salesController: SalesController;

//     beforeAll(() => {
//         salesController = new SalesController();
//     });

//     describe('POST /sales', () => {
//         it('should create a sale and return the sale object', async () => {
//             const saleData = {
//                 userId: 1,
//                 amount: 100,
//                 date: '2023-01-01',
//             };

//             const response = await request(app)
//                 .post('/sales')
//                 .send(saleData)
//                 .expect(201);

//             expect(response.body).toHaveProperty('id');
//             expect(response.body.userId).toBe(saleData.userId);
//             expect(response.body.amount).toBe(saleData.amount);
//             expect(response.body.date).toBe(saleData.date);
//         });
//     });

//     describe('POST /sales/bulk-import', () => {
//         it('should bulk import sales and return the count of imported sales', async () => {
//             const salesData = [
//                 { userId: 1, amount: 100, date: '2023-01-01' },
//                 { userId: 2, amount: 200, date: '2023-01-02' },
//             ];

//             const response = await request(app)
//                 .post('/sales/bulk-import')
//                 .send(salesData)
//                 .expect(200);

//             expect(response.body).toHaveProperty('importedCount');
//             expect(response.body.importedCount).toBe(salesData.length);
//         });
//     });

//     describe('GET /sales/commission', () => {
//         it('should calculate and return the commission for a user', async () => {
//             const response = await request(app)
//                 .get('/sales/commission?userId=1')
//                 .expect(200);

//             expect(response.body).toHaveProperty('commission');
//             expect(typeof response.body.commission).toBe('number');
//         });
//     });
// });