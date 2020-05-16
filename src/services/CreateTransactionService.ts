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

    const checkTransactionAmountAvailable = await transactionRepository.getBalance();

    if (
      type === 'outcome' &&
      value > checkTransactionAmountAvailable.total &&
      checkTransactionAmountAvailable.total !== 0
    ) {
      throw new AppError('This transaction exceeds the amount available');
    }

    if (type !== 'outcome' && type !== 'income') {
      throw new AppError('This type of transaction is incorrect');
    }

    const checkCategoryExists = await categoryRepository.findOne({
      where: {
        title: Like(category),
      },
    });

    let category_id;

    if (!checkCategoryExists) {
      const newCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(newCategory);

      category_id = newCategory.id;
    } else {
      category_id = checkCategoryExists.id;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      category_id,
      type,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
