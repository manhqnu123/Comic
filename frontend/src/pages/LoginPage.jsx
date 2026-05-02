import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useAuth } from "@/context/authContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Email không hợp lệ.";
    if (form.password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      // login() từ AuthContext xử lý token + lưu user, trả về user
      const user = await login(form.email.trim().toLowerCase(), form.password);

      // Redirect theo role
      navigate(user.role.name === "admin" ? "/admin" : "/");
    } catch (err) {
      const message =
        err.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              placeholder="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              placeholder="Mật khẩu"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <p className="text-sm text-center mt-4">
            Chưa có tài khoản?{" "}
            <span
              className="text-primary cursor-pointer hover:underline"
              onClick={() => navigate("/signup")}
            >
              Đăng ký ngay
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
