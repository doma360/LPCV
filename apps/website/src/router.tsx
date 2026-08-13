import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import SearchResults from "@/pages/SearchResults";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recherche" element={<SearchResults />} />
      </Routes>
    </BrowserRouter>
  );
}
