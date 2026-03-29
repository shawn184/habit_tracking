import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { HabitsProvider } from './store/HabitContext';
import { CheckSquare, Calendar, TrendingUp, Award, Settings } from 'lucide-react';
import DailyPage from './pages/Daily';
import MonthlyPage from './pages/Monthly';
import WeeklyPage from './pages/Weekly';
import YearlyPage from './pages/Yearly';
import ManagePage from './pages/Manage';

function Navigation() {
  return (
    <nav className="bottom-nav glass">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <CheckSquare />
        <span>Daily</span>
      </NavLink>
      <NavLink to="/weekly" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <TrendingUp />
        <span>Weekly</span>
      </NavLink>
      <NavLink to="/monthly" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Calendar />
        <span>Monthly</span>
      </NavLink>
      <NavLink to="/yearly" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Award />
        <span>Yearly</span>
      </NavLink>
      <NavLink to="/manage" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Settings />
        <span>Manage</span>
      </NavLink>
    </nav>
  );
}

function App() {
  return (
    <HabitsProvider>
      <BrowserRouter>
        <div className="container">
          <Routes>
            <Route path="/" element={<DailyPage />} />
            <Route path="/weekly" element={<WeeklyPage />} />
            <Route path="/monthly" element={<MonthlyPage />} />
            <Route path="/yearly" element={<YearlyPage />} />
            <Route path="/manage" element={<ManagePage />} />
          </Routes>
        </div>
        <Navigation />
      </BrowserRouter>
    </HabitsProvider>
  );
}

export default App;
