import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import Home from '@/pages/Home';
import MaterialGuide from '@/pages/MaterialGuide';
import Application from '@/pages/Application';
import Progress from '@/pages/Progress';
import Messages from '@/pages/Messages';
import Dashboard from '@/pages/Dashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/material-guide" element={<MaterialGuide />} />
          <Route path="/application" element={<Application />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
