import React, { useMemo, useState } from "react";
import "./App.css";
import HomePage from "./pages/HomePage";
import PlotPage from "./pages/PlotPage";
import AiPage from "./pages/AiPage";
import AdoptionPage from "./pages/AdoptionPage";
import TraceabilityPage from "./pages/TraceabilityPage";
import FarmerDashboard from "./pages/FarmerDashboard";
import UserChatPage from "./pages/UserChatPage";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";

const userMenu = [
  { key: "home", label: "首页" },
  { key: "plots", label: "浏览可认养地块" },
  { key: "adoptions", label: "我的认养" },
  { key: "traceability", label: "溯源查询" },
  { key: "user-chat", label: "与农户交流" },
  { key: "ai", label: "AI 助手" },
];

const farmerMenu = [
  { key: "farmer-dashboard", label: "农场主首页仪表盘" },
  { key: "farmer-plots", label: "地块管理" },
  { key: "farmer-orders", label: "认养订单管理" },
  { key: "farmer-chat", label: "用户沟通中心" },
  { key: "farmer-tasks", label: "农事任务提醒" },
  { key: "farmer-trace", label: "溯源素材上传" },
  { key: "farmer-analytics", label: "数据收益分析" },
  { key: "farmer-ai", label: "AI 农事助手" },
];

function getInitialUser() {
  const savedUser = localStorage.getItem("user");
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

function getInitialPage(user) {
  return user?.role === "farmer" ? "farmer-dashboard" : "home";
}

function App() {
  const [currentUser, setCurrentUser] = useState(getInitialUser);
  const [currentPage, setCurrentPage] = useState(() => getInitialPage(getInitialUser()));
  const [authPage, setAuthPage] = useState("welcome");
  const [chatTarget, setChatTarget] = useState(null);
  const [traceTarget, setTraceTarget] = useState(null);

  const isFarmer = currentUser?.role === "farmer";
  const menuItems = isFarmer ? farmerMenu : userMenu;

  const pageTitle = useMemo(() => {
    return menuItems.find((item) => item.key === currentPage)?.label || "首页";
  }, [currentPage, menuItems]);

  const handleLogin = (user) => {
    const nextUser = user || {
      userId: 0,
      realName: "演示用户",
      username: "demo",
      role: "user",
    };

    const normalizedUser = {
      ...nextUser,
      role: nextUser.role === "farmer" ? "farmer" : "user",
    };

    setCurrentUser(normalizedUser);
    setCurrentPage(getInitialPage(normalizedUser));
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("userName", normalizedUser.realName || normalizedUser.username || "用户");
    localStorage.setItem("userType", normalizedUser.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage("home");
    setAuthPage("welcome");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("userType");
  };

  const handleNavigate = (pageKey) => {
    setCurrentPage(pageKey);
    if (pageKey !== "traceability") {
      setTraceTarget(null);
    }
    if (pageKey !== "user-chat") {
      setChatTarget(null);
    }
  };

  const renderPage = () => {
    if (!currentUser) return null;

    if (isFarmer) {
      if (currentPage === "farmer-ai") {
        return <AiPage user={currentUser} role="farmer" />;
      }

      return (
        <FarmerDashboard
          user={currentUser}
          activeSection={currentPage}
          onSectionChange={setCurrentPage}
        />
      );
    }

    if (currentPage === "home") return <HomePage user={currentUser} role="user" onNavigate={handleNavigate} />;
    if (currentPage === "plots") {
      return (
        <PlotPage
          user={currentUser}
          role="user"
          onNavigate={handleNavigate}
          onOpenChat={(farmerName, plotNum, plotId) => {
            setChatTarget({ farmerName, plotNum, plotId });
            setCurrentPage("user-chat");
          }}
        />
      );
    }
    if (currentPage === "adoptions") {
      return (
        <AdoptionPage
          user={currentUser}
          onOpenChat={(target) => {
            setChatTarget(target);
            setCurrentPage("user-chat");
          }}
          onOpenTrace={(target) => {
            setTraceTarget(target);
            setCurrentPage("traceability");
          }}
        />
      );
    }
    if (currentPage === "traceability") return <TraceabilityPage user={currentUser} initialTarget={traceTarget} />;
    if (currentPage === "user-chat") return <UserChatPage user={currentUser} initialTarget={chatTarget} />;
    if (currentPage === "ai") return <AiPage user={currentUser} role="user" />;

    return <HomePage user={currentUser} role="user" />;
  };

  if (!currentUser) {
    if (authPage === "login") {
      return <LoginPage onLogin={handleLogin} />;
    }

    return (
      <WelcomePage
        onLoginClick={() => setAuthPage("login")}
        onRegisterClick={() => setAuthPage("login")}
        onAboutClick={() => window.alert("社区共享农场认养平台：连接用户、农场主、溯源和农事服务。")}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <p className="eyebrow">Farm Adoption Platform</p>
            <h1>社区共享农场认养平台</h1>
          </div>

          <div className="header-actions">
            <div className="identity-chip">
              <span>当前登录身份</span>
              <strong>{isFarmer ? "农场主" : "普通用户"}</strong>
            </div>
            <div className="user-chip">
              <strong>{currentUser.realName || currentUser.username}</strong>
              <span>{isFarmer ? currentUser.farmName || "农场主后台" : "认养用户端"}</span>
              <button className="ghost-btn" type="button" onClick={handleLogout}>
                退出
              </button>
            </div>
          </div>
        </div>

        <nav className="nav-menu" aria-label="主导航">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={currentPage === item.key ? "active" : ""}
              onClick={() => handleNavigate(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <div className="page-heading">
          <span>{isFarmer ? "农场主后台" : "普通用户端"}</span>
          <h2>{pageTitle}</h2>
        </div>
        {renderPage()}
      </main>

      <footer className="app-footer">
        <p>农场认养平台演示版：登录角色决定导航权限，后续继续接入真实接口和数据库能力。</p>
      </footer>
    </div>
  );
}

export default App;
