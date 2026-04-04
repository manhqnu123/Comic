import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // import instance

import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (form.username.trim().length < 3)
      return "Username phải có ít nhất 3 ký tự.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Email không hợp lệ.";
    if (form.password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      await api.post("http://localhost:3000/api/auth/register", {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      alert("Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      // Axios tự throw lỗi khi status != 2xx
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
          <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              placeholder="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
            <Input
              placeholder="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              placeholder="Mật khẩu (ít nhất 6 ký tự)"
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
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>

          <p className="text-sm text-center mt-4">
            Đã có tài khoản?{" "}
            <span
              className="text-primary cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Đăng nhập
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
