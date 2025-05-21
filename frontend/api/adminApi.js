import axios from 'axios';

export const addPump = async ({ name, brand, flow_rate, head, power, price }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      'http://localhost:3099/api/admin/pumps',
      { name, brand, flow_rate, head, power, price },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding pump:', error.response?.data);
    throw new Error(error.response?.data?.error || 'خطا در افزودن پمپ');
  }
};