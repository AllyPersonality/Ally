import { Routes, Route } from "react-router-dom";
import BotPage from "./BotPage.jsx";
import DashboardPage from "./DashboardPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BotPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}
