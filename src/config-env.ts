import { writeFile } from 'fs';
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'https://pfa.negotiations.com/';
const targetPath = `./src/app/config/config.ts`;
const configFile = `
  export const config = {
    BASE_URL: '${BASE_URL}'
  };
`;
writeFile(targetPath, configFile, function (err) {
  if (err) {
       console.log(err);
  }
});
