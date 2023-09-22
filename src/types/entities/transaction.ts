import { ObjectId } from 'bson';
import { Request } from 'express';
import { Document } from 'mongoose';
import { ModelSanitize } from '../sanitize';

export const KnownTransactionTypes = ['income', 'expense'] as const;
export const KnownTransactionCategories = ['main', 'house', 'children', 'development', 'food', 'basic', 'products', 'car', 'health', 'child care', 'household', 'education', 'leisure', 'other', 'salary'] as const;
export const KnownMonths = ['all', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'sebptember', 'october', 'november', 'december'] as const;

export type TransactionType = typeof KnownTransactionTypes[number]
export type TransactionCategory = typeof KnownTransactionCategories[number]

export interface IFilterParams {
    month?: string | number;
    year?: string | number;
}
export interface ITransactionDate {
    day: number,
    month: number,
    year: number
}

export interface IOwner {
    name?: string;
    email: string;
}

export interface ITransaction {
    date: ITransactionDate,
    type: TransactionType,
    category: TransactionCategory,
    comment?: string,
    sum: number,
}

export interface ITransactionDetails extends ITransaction {
    id: ObjectId;
    owner: IOwner;
}

export interface IExpense {
    categoryType: TransactionCategory,
    total: number 
}
export interface IIncome {
    total: number
} 

export interface IStatisticCategories {
    expense: IExpense[],
    income: IIncome
}

export interface IFilterQueryResult {
    expense: Array<Omit<IExpense, 'categoryType'> & { _id: TransactionCategory}>,
    income: IIncome & {_id: 'incomeSum'}
}
export type IStatisticUserRequest = Request<Record<string, never>, Record<string, never>, Record<string, never>, IFilterParams>

export type IAddTransactionUserRequest = Request<Record<string, never>, Record<string, never>, ITransaction>

export type IDeleteTransactionUserRequest = Request<{ id: string }, Record<string, never>, ITransaction>

export interface TransactionModel extends Document<ObjectId>, Omit<ITransactionDetails, 'id'>, ModelSanitize<ITransactionDetails> { }
