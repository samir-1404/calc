import { useState, useEffect } from 'react';
import { login } from '../../api/authApi';
import { addPump } from '../../api/adminApi';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pumpData, setPumpData] = useState({ name: '', brand: '', flow_rate: '', head: '', power: '', price: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      console.log('Attempting login with:', { username, password });
      const token = await login({ username, password });
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      alert('ورود با موفقیت انجام شد!');
    } catch (error) {
      console.error('Login failed:', error.message);
      alert('خطا در ورود: ' + error.message);
    }
  };

  const handleAddPump = async () => {
    try {
      const { name, brand, flow_rate, head, power, price } = pumpData;
      await addPump({ name, brand, flow_rate: parseFloat(flow_rate), head: parseFloat(head), power, price: parseInt(price) });
      alert('پمپ با موفقیت اضافه شد!');
      setPumpData({ name: '', brand: '', flow_rate: '', head: '', power: '', price: '' });
    } catch (error) {
      alert('خطا در افزودن پمپ: ' + error.message);
    }
  };

  const handleChange = (e) => {
    setPumpData({ ...pumpData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>پنل ادمین</h1>
      {!isAuthenticated ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
          <label>
            نام کاربری
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="نام کاربری (admin)"
              style={{ width: '100%', padding: '5px' }}
            />
          </label>
          <label>
            رمز عبور
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور (admin123)"
              style={{ width: '100%', padding: '5px' }}
            />
          </label>
          <button onClick={handleLogin} style={{ padding: '10px', background: 'green', color: 'white', border: 'none' }}>
            ورود به عنوان ادمین
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
          <h2>افزودن پمپ جدید</h2>
          <input name="name" value={pumpData.name} onChange={handleChange} placeholder="نام پمپ" style={{ padding: '5px' }} />
          <input name="brand" value={pumpData.brand} onChange={handleChange} placeholder="برند" style={{ padding: '5px' }} />
          <input name="flow_rate" value={pumpData.flow_rate} onChange={handleChange} type="number" placeholder="دبی (لیتر بر ساعت)" style={{ padding: '5px' }} />
          <input name="head" value={pumpData.head} onChange={handleChange} type="number" placeholder="هد (متر)" style={{ padding: '5px' }} />
          <select name="power" value={pumpData.power} onChange={handleChange} style={{ padding: '5px' }}>
            <option value="">انتخاب کنید</option>
            <option value="electric">برقی</option>
            <option value="diesel">دیزلی</option>
          </select>
          <input name="price" value={pumpData.price} onChange={handleChange} type="number" placeholder="قیمت (ریال)" style={{ padding: '5px' }} />
          <button onClick={handleAddPump} style={{ padding: '10px', background: 'blue', color: 'white', border: 'none' }}>
            افزودن پمپ
          </button>
        </div>
      )}
    </div>
  );
}