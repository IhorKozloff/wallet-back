import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import { AppError } from './src/types/AppError';
import cors from 'cors';
import rootRouter from './src/routes';


const app = express();

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', rootRouter);

app.use((req: Request, res: Response) => {
    console.log('my server error', 'No Routes Matched');
    res.status(404).json({
        message: 'No Routes Matched'
    });
});



app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        const { code = 500, message = 'Eyeshield Server Error' } = err;

        //console.log('Зара буде помилка з обробника помилок:', message, code);
        res.status(code).json({ message });
    } else {
        // console.log('А ось помилка з обробника помилок, але не типу AppError:');
        // console.log(err);
        const { message } = err;
        res.status(500).json({ message });
    } 
});

export default app;
