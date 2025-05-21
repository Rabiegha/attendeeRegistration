import axios from 'axios';
import { Buffer } from 'buffer';

// PrintNode API URL
const PRINT_NODE_URL = 'https://api.printnode.com';

// PrintNode API Key - Replace with your actual API key
const apiKey = 'PrDdPPH6bJJpWSYwONmfapRUCCkL-770o5ZTsWSyY7g';
const base64ApiKey = Buffer.from(`${apiKey}:`).toString('base64');

const printNodeApi = axios.create({
  baseURL: PRINT_NODE_URL,
  headers: {
    Authorization: `Basic ${base64ApiKey}`,
    'Content-Type': 'application/json',
  },
});

export default printNodeApi;
