import app from './app';
import mongoose from 'mongoose';
const { PORT = 3001, MONGO_URL } = process.env;

mongoose
    .connect(MONGO_URL)
    .then(() => app.listen(3001))
    .then(() => {
        console.log('Database connected');
        console.log(`Server run on port ${PORT}`);
    })
    .catch(() => () => {
        console.log('Не запустилось ничего, ошибка какая-то');
        // console.log(error)
        // process.exit(1)
    });
