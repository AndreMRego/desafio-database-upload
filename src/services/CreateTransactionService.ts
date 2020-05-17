// import AppError from '../errors/AppError';
import { getCustomRepository, getRepository, Like } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    category,
    type,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('This transaction exceeds the amount available');
    }

    if (type !== 'outcome' && type !== 'income') {
      throw new AppError('This type of transaction is incorrect');
    }

    let checkCategoryExists = await categoryRepository.findOne({
      where: {
        title: Like(category),
      },
    });

    if (!checkCategoryExists) {
      checkCategoryExists = categoryRepository.create({ title: category });
      await categoryRepository.save(checkCategoryExists);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      category: checkCategoryExists,
      type,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
