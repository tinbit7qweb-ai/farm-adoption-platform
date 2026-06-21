import React, { useState } from "react";
import { login, register } from "../api/api";
import "../styles/login.css";

const demoAccounts = [
  {
    label: "普通用户",
    username: "user1",
    password: "123456",
    note: "浏览地块、认养、聊天、查溯源",
  },
  {
    label: "农场主",
    username: "farmer1",
    password: "123456",
    note: "进入农场主后台管理地块和订单",
  },
  {
    label: "管理员",
    username: "admin",
    password: "123456",
    note: "保留管理角色演示账号",
  },
];

function formatNetworkError(error) {
  if (String(error?.message || "").includes("Failed to fetch")) {
    return "登录失败：后端服务未启动或 8080 端口不可访问。请先启动 Spring Boot 后端。";
  }
  return `登录失败：${error.message}`;
}

function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("user1");
  const [password, setPassword] = useState("");
  const [realName, setRealName] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fillDemoAccount = (account) => {
    setUsername(account.username);
    setPassword(account.password);
    setError("");
    setSuccess("已填入演示账号，可直接登录。");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await login(username, password);
      if (response.code === 200) {
        localStorage.setItem("userName", response.data.realName || response.data.username);
        localStorage.setItem("userType", response.data.role);
        onLogin(response.data);
      } else {
        setError(response.message || "用户名或密码错误。");
      }
    } catch (err) {
      setError(formatNetworkError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await register(username, password, realName, role);
      if (response.code === 200) {
        setSuccess("注册成功，请返回登录。");
        setIsLogin(true);
      } else {
        setError(response.message || "注册失败，请检查用户名是否已存在。");
      }
    } catch (err) {
      setError(formatNetworkError(err).replace("登录失败", "注册失败"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <section className="login-visual">
        <img
          src="/images/farm-assets/Camera_XHS_17819448317211040g008319h6jbcd6u005nnb.jpg"
          alt="共享农场"
        />
        <div className="login-visual-copy">
          <span>Farm Adoption Platform</span>
          <h1>社区共享农场认养平台</h1>
          <p>
            连接城市用户和真实农场，完成地块认养、农事同步、农户沟通、物流追踪和农产品溯源。
          </p>
          <div className="login-feature-row">
            <strong>地块认养</strong>
            <strong>农事溯源</strong>
            <strong>农场主后台</strong>
          </div>
        </div>
      </section>

      <section className="login-box">
        <div className="login-heading">
          <span>{isLogin ? "账号登录" : "账号注册"}</span>
          <h2>{isLogin ? "进入平台" : "创建账号"}</h2>
          <p>
            {isLogin
              ? "选择演示账号或输入已有账号登录。演示密码会自动填入，但不会在页面展示。"
              : "注册后可按角色进入对应页面。"}
          </p>
        </div>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        {isLogin && (
          <div className="demo-account-grid">
            {demoAccounts.map((account) => (
              <button
                type="button"
                key={account.username}
                className="demo-account"
                onClick={() => fillDemoAccount(account)}
              >
                <strong>{account.label}</strong>
                <span>{account.username}</span>
                <small>{account.note}</small>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="输入用户名"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>真实姓名</label>
                <input
                  type="text"
                  value={realName}
                  onChange={(event) => setRealName(event.target.value)}
                  placeholder="输入真实姓名"
                  required
                />
              </div>

              <div className="form-group">
                <label>用户角色</label>
                <select value={role} onChange={(event) => setRole(event.target.value)}>
                  <option value="user">普通认养用户</option>
                  <option value="farmer">农场主</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isLogin ? "选择演示账号或输入密码" : "设置密码"}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (isLogin ? "登录中..." : "注册中...") : isLogin ? "登录" : "注册"}
          </button>
        </form>

        <p className="toggle-form">
          {isLogin ? "还没有账号？" : "已有账号？"}
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setIsLogin((value) => !value);
              setPassword("");
              setError("");
              setSuccess("");
            }}
          >
            {isLogin ? "立即注册" : "返回登录"}
          </button>
        </p>
      </section>
    </div>
  );
}

export default LoginPage;
