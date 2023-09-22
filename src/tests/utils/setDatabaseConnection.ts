import mongoose from 'mongoose';
import { User } from '../../models/user';
import { Transaction } from '../../models/transaction';

// export const setDatabaseConnection = () => {
//     beforeAll(async () => {
//         await mongoose.connect('mongodb+srv://eyeshield21:112212qw@cluster0.6nmjspu.mongodb.net/db-wallet-tests?retryWrites=true&w=majority');
//     });
    
//     beforeEach(async () => {
//         await Promise.all(
//           Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany({})),
//         );
//         //это все равно что
//         //await users.deleteMany({})
//         //await transactions.deleteMany({})
//         //await dragonrevieweruserdatas.deleteMany({})
//     });
    
//     afterAll(async () => {
//         await mongoose.disconnect();
//     });
// }

export const setDatabaseConnection = () => {
    beforeAll(async () => {
        await mongoose.connect('mongodb+srv://eyeshield21:112212qw@cluster0.6nmjspu.mongodb.net/db-wallet-tests?retryWrites=true&w=majority');
    });

    beforeEach(async () => {
        await User.deleteMany();
        await Transaction.deleteMany();
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });
};