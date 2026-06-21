import React, { useState, useEffect } from 'react';
import '../styles/welcome.css';

function WelcomePage({ onLoginClick, onRegisterClick, onAboutClick }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [slides] = useState([
    {
      id: 1,
      emoji: '🌱',
      title: '绿色生活',
      description: '从城市回归田园，享受种植的乐趣',
      image: '/images/page_1.jpg'
    },
    {
      id: 2,
      emoji: '🍅',
      title: '新鲜蔬菜',
      description: '每一份收获都是爱的结晶',
      image: '/images/page_2.jpg'
    },
    {
      id: 3,
      emoji: '👥',
      title: '社区分享',
      description: '在这里，每个人都是农民',
      image: '/images/page_3.jpg'
    },
    {
      id: 4,
      emoji: '📊',
      title: '生长记录',
      description: '见证生命的奇迹',
      image: '/images/page_4.jpg'
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="welcome-page">
      <nav className="welcome-nav">
        <div className="nav-left">
          <div className="logo">🌱 社区共享农场</div>
        </div>
        <div className="nav-right">
          <button className="nav-btn" onClick={onAboutClick}>📖 了解我们</button>
          <button className="nav-btn nav-login" onClick={onLoginClick}>🔐 登录</button>
          <button className="nav-btn nav-register" onClick={onRegisterClick}>📝 注册</button>
        </div>
      </nav>

      <section className="carousel-section">
        <div className="carousel-container">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`carousel-slide ${idx === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="slide-content">
                <div className="slide-emoji">{slide.emoji}</div>
                <h2 className="slide-title">{slide.title}</h2>
                <p className="slide-description">{slide.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="carousel-indicators">
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`indicator ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>

        <button
          className="carousel-prev"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        >
          ‹
        </button>

        <button
          className="carousel-next"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        >
          ›
        </button>
      </section>

      <section className="features-section">
        <h2>为什么选择我们？</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>地理位置</h3>
            <p>精选城市周边优质农场，距离近、新鲜快速送达</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>全程溯源</h3>
            <p>从播种到采收，完整记录，让你了解每一份食物的来源</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💚</div>
            <h3>生态友好</h3>
            <p>绿色种植，拒绝农药，守护你和家人的健康</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍🌾</div>
            <h3>社区互动</h3>
            <p>与农民和其他认养者交流，分享种植经验和收获喜悦</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>智能管理</h3>
            <p>AI助手帮助你科学种植，实时提供专业建议</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎁</div>
            <h3>趣味体验</h3>
            <p>给植物取名字、写生长日记，种植也可以很有趣</p>
          </div>
        </div>
      </section>

      {/* 替换后的 我们的成绩 区块 */}
      <section className="achievement-block">
        <div className="container">
          {/* 左侧标题区域 */}
          <div className="achievement-left">
            <h2>我们的成绩</h2>
            <p>深耕城市家庭农场认养，用真实数据证明实力</p>
          </div>
          {/* 右侧3个数据卡片 */}
          <div className="achievement-right">
            <div className="data-card">
              <div className="big-num">1300+</div>
              <div className="text">合作农户</div>
            </div>
            <div className="data-card">
              <div className="big-num">9200+</div>
              <div className="text">认养订单</div>
            </div>
            <div className="data-card full-width">
              <div className="big-num">36个</div>
              <div className="text">生态种植基地</div>
            </div>
          </div>
        </div>
      </section>

      {/* 滚动评价区块（已替换完整） */}
      <section className="testimonials-section">
        <h2>用户说什么</h2>
        <div className="scroll-wrap">
          <div className="scroll-list">
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"真的很有趣！孩子们看着自己种的番茄长大，开心得不得了"</p>
              <p className="author">— 王女士，上海</p>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"蔬菜真的比市场买的新鲜，而且知道种植过程，放心多了"</p>
              <p className="author">— 李先生，北京</p>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"AI助手的建议很专业，我这个种植小白也能成功收获"</p>
              <p className="author">— 张女士，深圳</p>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"周末带家人下地体验，远离城市喧嚣，体验感超棒"</p>
              <p className="author">— 赵先生，杭州</p>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"全程溯源看得见，给老人小孩吃完全安心，每年都会续认养"</p>
              <p className="author">— 刘女士，广州</p>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"农户很热心，有任何种植问题都能及时回复，服务到位"</p>
              <p className="author">— 陈先生，成都</p>
            </div>

            {/* 复制一份实现无缝滚动 */}
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"真的很有趣！孩子们看着自己种的番茄长大，开心得不得了"</p>
              <p className="author">— 王女士，上海</p>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"蔬菜真的比市场买的新鲜，而且知道种植过程，放心多了"</p>
              <p className="author">— 李先生，北京</p>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"AI助手的建议很专业，我这个种植小白也能成功收获"</p>
              <p className="author">— 张女士，深圳</p>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"周末带家人下地体验，远离城市喧嚣，体验感超棒"</p>
              <p className="author">— 赵先生，杭州</p>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"全程溯源看得见，给老人小孩吃完全安心，每年都会续认养"</p>
              <p className="author">— 刘女士，广州</p>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"农户很热心，有任何种植问题都能及时回复，服务到位"</p>
              <p className="author">— 陈先生，成都</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>立即开始你的农场之旅</h2>
        <p>加入我们，体验城市与田园的完美融合</p>
        <div className="cta-buttons">
          <button className="cta-btn primary" onClick={onRegisterClick}>🌱 立即注册</button>
          <button className="cta-btn secondary" onClick={onLoginClick}>🔐 已有账户，登录</button>
        </div>
      </section>

      <footer className="welcome-footer">
        <p>&copy; 2026 社区共享农场认养平台 | 让城市居民重新认识农业</p>
      </footer>
    </div>
  );
}

export default WelcomePage;