import jwt from 'jsonwebtoken';

const { SECRET_KEY } = process.env;

interface IPayloadAny {
    [key: string]: any
}

export default class Token {

    static generateById (payloadValue: string): string {
        return jwt.sign({id: payloadValue}, `${SECRET_KEY}`, {expiresIn: '24h'});
    }

    static generateAny (payload: IPayloadAny): string {
        return jwt.sign(payload, `${SECRET_KEY}`, {expiresIn: '24h'});
    }
}   