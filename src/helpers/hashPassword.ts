import bcrypt from 'bcryptjs'

export default class HashPassword {

    static async hash (password: string, salt: string | number): Promise<string> {
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    }

    static async validate (password: string, hashedPassword: string): Promise<boolean> {
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);
        return isPasswordValid;
    }
}