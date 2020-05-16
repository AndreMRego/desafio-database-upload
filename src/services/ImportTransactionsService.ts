import path from 'path';
import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import { loadCSV } from '../utils';
import AppError from '../errors/AppError';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}
class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const csvFilePath = path.resolve(uploadConfig.directory, filename);

    const data = await loadCSV({ filePath: csvFilePath });

    if (data.length === 0) {
      throw new AppError('File Empty.', 400);
    }

    const transactions: Transaction[] = await Promise.all(
      data.map(async obj => {
        const transaction = await createTransaction.execute({
          title: obj[0],
          type: obj[1] as 'income' | 'outcome',
          value: Number(obj[2]),
          category: obj[3],
        });
        return transaction;
      }),
    );

    return transactions;
  }
}

export default ImportTransactionsService;
