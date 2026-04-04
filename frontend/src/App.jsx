import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./pages/admin/AdminPage";
import AdminComicsPage from "./pages/admin/AdminComics";
import AdminChaptersPage from "./pages/admin/AdminChapters";
import AdminUser from "./pages/admin/AdminUser";
import DetailComic from "./pages/DetailComic";
import ChapterPage from "./pages/ChapterPage";
import ProfilePage from "./pages/ProfilePage";


function App() {
  return (
    <BrowserRouter>
      {" "}
      <Toaster richColors position="top-right" />{" "}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/comics" replace />} />
          <Route path="comics" element={<AdminComicsPage />} />
          <Route path="chapters" element={<AdminChaptersPage />} />
          <Route path="users" element={<AdminUser />} />
        </Route>
        <Route path="/truyen/:slug" element={<DetailComic />} />
        <Route path="/chapter/:id" element={<ChapterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
