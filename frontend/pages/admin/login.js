import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Box, Input, Button, Text, VStack } from '@chakra-ui/react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3099/api/admin/login', {
        username,
        password,
      });
      const token = response.data.token;
      console.log('Token received on login:', token); // لاگ برای دیباگ
      localStorage.setItem('token', token);
      router.push('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'خطا در ورود');
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={10} p={5} borderWidth={1} borderRadius="md">
      <VStack spacing={4}>
        <Text fontSize="2xl">ورود ادمین</Text>
        <Input
          placeholder="نام کاربری"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleLogin}>
          ورود
        </Button>
        {error && <Text color="red.500">{error}</Text>}
      </VStack>
    </Box>
  );
}