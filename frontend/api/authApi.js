import axios from 'axios';

export const login = async ({ username, password }) => {
    try {
        console.log('Sending login request:', { username, password }); // اضافه کردن لاگ برای دیباگ
        const response = await axios.post('http://localhost:3099/api/auth/login', { username, password });
        return response.data.token;
    } catch (error) {
        console.error('Error in login request:', error.response?.data); // لاگ خطا
        throw new Error(error.response?.data?.error || 'خطا در ورود');
    }
};