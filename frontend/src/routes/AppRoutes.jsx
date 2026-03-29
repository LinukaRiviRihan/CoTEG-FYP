import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import Home from '../pages/Home';
import Features from '../pages/Features';
import Author from '../pages/Author';

export default function AppRoutes() {
  return (
    <Routes>
      {/* MainLayout acts as the parent wrapper for all these routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/author" element={<Author />} />
      </Route>
    </Routes>
  );
}