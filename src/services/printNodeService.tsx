import printNode from '../config/printNodeApi';

// Get printers
export const getNodePrinters = async () => {
  try {
    const response = await printNode.get('/printers');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch printers:', error);
    throw new Error('Failed to fetch printers');
  }
};

// Send print job
export const sendPrintJob = async (printJob: any) => {
  try {
    const response = await printNode.post('/printjobs', printJob);
    return response.data;
  } catch (error) {
    console.error('Failed to send print job:', error);
    throw new Error('Failed to send print job');
  }
};
