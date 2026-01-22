import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

export default function MainLayout() {
  return (
    <div className="app-container">
      <Navbar />

      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
}
