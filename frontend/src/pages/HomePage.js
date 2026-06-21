import React, { useEffect, useState } from "react";
import { getLatestReviews } from "../api/api";
import { mockPlots } from "../mock/farmPlatformData";
import { getDemoReviews } from "../utils/demoState";

const homeImages = [
  "/images/farm-assets/Camera_XHS_17819448317211040g008319h6jbcd6u005nnb.jpg",
  "/images/farm-assets/Camera_1040g0k031joppvluig1g5pch89coiqnt35oh0g0.jpg",
  "/images/farm-assets/Camera_XHS_17819447720491040g00831rn6cljiig0g5o6h.jpg",
];

const defaultReviews = [
  {
    id: "default-1",
    rating: 5,
    content: "蔬菜真的比市场买的新鲜，而且知道种植过程，放心多了。",
    userName: "李先生",
    farmName: "青禾家庭农场",
    crop: "番茄",
  },
  {
    id: "default-2",
    rating: 5,
    content: "AI 助手和农场主沟通都挺方便，周末带家人下地体验很有意思。",
    userName: "张女士",
    farmName: "四季田园",
    crop: "生菜",
  },
  {
    id: "default-3",
    rating: 5,
    content: "能看到浇水、施肥、检测和物流，比普通网购买菜更踏实。",
    userName: "赵先生",
    farmName: "南山果园",
    crop: "葡萄",
  },
];

function HomePage({ user, onNavigate }) {
  const [backendReviews, setBackendReviews] = useState([]);
  const reviews = [...backendReviews, ...getDemoReviews(), ...defaultReviews]
    .filter((review, index, list) =>
      index === list.findIndex((item) => String(item.id || item.reviewId) === String(review.id || review.reviewId)),
    )
    .slice(0, 6);

  useEffect(() => {
    getLatestReviews()
      .then((response) => {
        if (response.code === 200 && Array.isArray(response.data)) {
          setBackendReviews(response.data);
        }
      })
      .catch(() => {
        setBackendReviews([]);
      });
  }, []);
  const recommendedPlots = mockPlots
    .filter((plot) => plot.status === "available")
    .slice(0, 3)
    .map((plot, index) => ({
      ...plot,
      image: homeImages[index % homeImages.length],
      title: plot.title?.includes("�") ? `推荐地块 ${plot.plotNum}` : plot.title,
      description: plot.description?.includes("�") ? "适合家庭认养体验，农场主会持续同步农事记录和现场照片。" : plot.description,
    }));

  return (
    <div>
      <section className="section-panel home-hero">
        <img src="/images/farm-assets/Camera_1040g3k031uchle162s005pm7vh27e0r0fj155io.jpg" alt="共享菜地入口" />
        <div>
          <span className="status-pill">农场认养平台</span>
          <h3>把一块真实土地认养到自己的生活里</h3>
          <p className="muted">
            平台连接城市用户和周边农场。用户可以浏览地块、下单认养、查看农事记录、
            与农场主沟通，并在采收后查看物流和溯源报告。
          </p>
          <div className="action-row">
            <button className="primary-btn" type="button" onClick={() => onNavigate?.("plots")}>浏览可认养地块</button>
            <button className="secondary-btn" type="button" onClick={() => onNavigate?.("adoptions")}>查看我的认养</button>
          </div>
        </div>
      </section>

      <section className="section-panel">
        <div className="analytics-header">
          <div>
            <h3>推荐地块</h3>
            <p className="muted">先用演示数据展示地块卖点，后续可直接替换为后端推荐接口。</p>
          </div>
          <span className="status-pill">欢迎，{user?.realName || user?.username || "认养用户"}</span>
        </div>
        <div className="grid-3">
          {recommendedPlots.map((plot) => (
            <article className="business-card" key={plot.plotId}>
              <img src={plot.image} alt={plot.title} />
              <div className="card-body">
                <span className="status-pill">{plot.location}</span>
                <h3>{plot.title}</h3>
                <p className="muted">{plot.description}</p>
                <div className="meta-list">
                  <span><strong>农场</strong>{plot.farmName}</span>
                  <span><strong>作物</strong>{plot.crop}</span>
                  <span><strong>价格</strong>¥{plot.price} / {plot.cycle}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-panel">
        <h3>核心功能入口</h3>
        <div className="grid-4">
          {[
            ["浏览地块", "查看可认养地块、价格、周期和农户介绍。", "plots"],
            ["我的认养", "查看生长数据、浇水提醒、付款和物流入口。", "adoptions"],
            ["溯源查询", "查看农事记录、实拍图片、检测报告和物流信息。", "traceability"],
            ["AI 助手", "用 mock 问答体验种植建议和农事提醒。", "ai"],
          ].map(([title, text, page]) => (
            <div className="info-card" key={title}>
              <h3>{title}</h3>
              <p className="muted">{text}</p>
              <button className="ghost-btn" type="button" onClick={() => onNavigate?.(page)}>进入</button>
            </div>
          ))}
        </div>
      </section>

      <section className="section-panel">
        <div className="analytics-header">
          <div>
            <h3>用户评价</h3>
            <p className="muted">用户完成认养并查看溯源报告后，可以发布评价。最新评论会优先显示在这里。</p>
          </div>
          <button className="ghost-btn" type="button" onClick={() => onNavigate?.("traceability")}>去写评价</button>
        </div>
        <div className="review-grid">
          {reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-stars">{"★".repeat(review.rating || 5)}</div>
              <p>“{review.content}”</p>
              <span>
                {review.userName || "认养用户"} · {review.farmName || "认养农场"} · {review.crop || review.plotNum || "认养作物"}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
