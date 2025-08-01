import { Routes, Route } from "react-router-dom";
import Welcome from "../pages/Welcome";
import TasteInput from "../pages/TasteInput";
import PlanTrip from "../pages/PlanTrip";
import Results from "../pages/Results";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/taste" element={<TasteInput />} />
      <Route path="/plan" element={<PlanTrip />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  );
}
