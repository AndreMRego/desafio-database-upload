/* eslint-disable import/prefer-default-export */
import csvParse from 'csv-parse';
import fs from 'fs';

export const loadCSV = async function convert({
  filePath,
}: {
  filePath: string;
}): Promise<string[]> {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: string[] = [];

  parseCSV.on('data', line => {
    lines.push(line);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
};
