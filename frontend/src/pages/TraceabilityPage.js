import React, { useEffect, useMemo, useState } from "react";
import { submitReview } from "../api/api";
import { mockAdoptions } from "../mock/farmPlatformData";
import { addDemoReview, getDemoAdoptions, getDemoReviews, getDemoTraceRecords } from "../utils/demoState";

const orderProfiles = {
  "A-01": {
    crop: "番茄",
    title: "阳光番茄认养田",
    farmName: "青禾家庭农场",
    farmerName: "王大农",
    cover: "/images/farm-assets/Camera_XHS_17819447720491040g00831rn6cljiig0g5o6h.jpg",
    gallery: [
      "/images/farm-assets/Camera_XHS_17819447720491040g00831rn6cljiig0g5o6h.jpg",
      "/images/farm-assets/Camera_1040g0k031joppvluig1g5pch89coiqnt35oh0g0.jpg",
      "/images/farm-assets/Camera_1040g3k031j5eb13g2u6g5nk9ms7g8j40d2re9a8.jpg",
      "/images/farm-assets/Camera_XHS_17819447868081040g00831j4sdmiu1g1g5p18.jpg",
    ],
    plan: ["认养下单", "移栽定植", "浇水", "支架固定", "授粉巡检", "采收打包"],
  },
  "B-06": {
    crop: "生菜",
    title: "有机生菜小菜园",
    farmName: "四季田园",
    farmerName: "李师傅",
    cover: "/images/farm-assets/Camera_1040g3k831j5eihf2j0e05nk9ms7g8j40kj637og.jpg",
    gallery: [
      "/images/farm-assets/Camera_1040g3k831j5eihf2j0e05nk9ms7g8j40kj637og.jpg",
      "/images/farm-assets/Camera_1040g3k831ne64s2s4sc05n7eah9kfnvr7sjel8o.jpg",
      "/images/farm-assets/Camera_XHS_17819622092431040g0083172rgdtc3m005oen.jpg",
      "/images/farm-assets/Camera_XHS_17819622139731040g0083172rgdtc3m205oen.jpg",
    ],
    plan: ["认养下单", "播种育苗", "浇水", "有机施肥", "虫害巡检", "冷链打包"],
  },
  "C-12": {
    crop: "葡萄",
    title: "葡萄藤共养区",
    farmName: "南山果园",
    farmerName: "陈园长",
    cover: "/images/farm-assets/Camera_XHS_17819448317211040g008319h6jbcd6u005nnb.jpg",
    gallery: [
      "/images/farm-assets/Camera_XHS_17819448317211040g008319h6jbcd6u005nnb.jpg",
      "/images/farm-assets/Camera_1040g3k831uchle751m005pm7vh27e0r08s3s72o.jpg",
      "/images/farm-assets/Camera_XHS_17819447791141040g00831rn6cljiig405o6h.jpg",
      "/images/farm-assets/Camera_1040g3r031nl8g7c9065g5nh200708ooe2td0km0.jpg",
    ],
    plan: ["认养下单", "修枝", "疏果", "套袋", "糖度检测", "采摘装箱"],
  },
  default: {
    crop: "应季蔬菜",
    title: "共享认养地块",
    farmName: "社区共享农场",
    farmerName: "农场主",
    cover: "/images/farm-assets/Camera_1040g3k831uchle751m005pm7vh27e0r08s3s72o.jpg",
    gallery: [
      "/images/farm-assets/Camera_1040g3k831uchle751m005pm7vh27e0r08s3s72o.jpg",
      "/images/farm-assets/Camera_XHS_17819622116301040g0083172rgdtc3m105oen.jpg",
      "/images/farm-assets/Camera_1040g3k031j5eb13g2u5g5nk9ms7g8j409cps3bo.jpg",
      "/images/farm-assets/Camera_1040g3k031j5eb13g2u305nk9ms7g8j4098rc90g.jpg",
    ],
    plan: ["认养下单", "整地", "浇水", "施肥", "检测", "采收配送"],
  },
};

function profileFor(plotNum) {
  return orderProfiles[plotNum] || orderProfiles.default;
}

function cleanDate(value, fallback = "2026-06-20") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function normalizeOrder(order) {
  const plotNum = order.plotNum || `P${order.plotId || order.orderId}`;
  const profile = profileFor(plotNum);
  const startDate = cleanDate(order.startDate || order.createTime, "2026-06-20");
  const codePlot = String(plotNum).replace(/[^A-Za-z0-9]/g, "");
  const codeDate = startDate.replace(/-/g, "");
  const progressValue = Number(order.progress);
  const normalizedProgress = Number.isFinite(progressValue) ? progressValue : 8;

  return {
    orderId: order.orderId || `DEMO-${plotNum}`,
    plotId: order.plotId,
    plotNum,
    traceCode: order.traceCode || `TRACE-${codePlot}-${codeDate}`,
    batchNo: order.batchNo || `BATCH-${codeDate}-${codePlot}`,
    title: order.title || profile.title,
    farmName: order.farmName || profile.farmName,
    farmerName: order.farmerName || profile.farmerName,
    crop: order.crop || profile.crop,
    startDate,
    endDate: cleanDate(order.endDate, "2026-09-20"),
    status: order.status || "生长中",
    progress: normalizedProgress,
    paymentStatus: order.paymentStatus || "待支付",
    logisticsStatus: order.logisticsStatus || "采收后生成物流",
    growthRecords: order.growthRecords || [],
    profile,
  };
}

function dedupeOrders(orders) {
  const seen = new Set();
  return orders.filter((order) => {
    const key = String(order.orderId || order.traceCode || order.plotNum);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function matchUploadedRecords(order, records) {
  const exact = records.filter((record) => String(record.orderId) === String(order.orderId));
  if (exact.length > 0) return exact;
  return records.filter((record) => !record.orderId && String(record.plotNum) === String(order.plotNum));
}

function buildTimeline(order, uploadedRecords) {
  const completedIndex = Math.min(order.profile.plan.length - 1, Math.floor(Number(order.progress || 0) / 18));

  return order.profile.plan.map((action, index) => {
    const uploaded = uploadedRecords.find((record) => {
      const name = String(record.actionName || record.action || "");
      return name.includes(action) || action.includes(name.slice(0, 2));
    });
    const image = uploaded?.imageUrl || uploaded?.image || order.profile.gallery[index % order.profile.gallery.length];

    return {
      id: uploaded?.id || `${order.orderId}-${action}`,
      action: uploaded?.actionName || uploaded?.action || action,
      date: uploaded?.date || (index === 0 ? order.startDate : `第 ${index} 阶段`),
      status: uploaded ? "已同步" : index <= completedIndex ? "已完成" : "待上传",
      operator: uploaded?.operator || order.farmerName,
      image,
      detail:
        uploaded?.actionDetail ||
        uploaded?.detail ||
        buildStageDetail(order, action, index),
    };
  });
}

function buildStageDetail(order, action, index) {
  const details = {
    0: `用户完成 ${order.plotNum} 的认养下单，农场主 ${order.farmerName} 接收托管任务。`,
    1: `${order.crop} 进入种植准备阶段，农场主需要同步现场照片和操作说明。`,
    2: `完成 ${action} 后应记录用水量、土壤湿度和现场照片。`,
    3: `${action} 记录用于证明日常养护过程，用户可在溯源页查看。`,
    4: `${action} 用于判断作物健康和采收风险，异常情况会提醒用户。`,
    5: `${order.crop} 成熟后进入采收、分拣、打包和配送流程。`,
  };
  return details[index] || `${action} 记录等待农场主补充。`;
}

function buildLogistics(order) {
  const paid = String(order.paymentStatus).includes("已支付") || String(order.paymentStatus).includes("paid");
  const harvested = Number(order.progress || 0) >= 75;
  const packed = Number(order.progress || 0) >= 85;

  return [
    { label: "认养订单创建", detail: `${order.traceCode} 已生成，绑定地块 ${order.plotNum}。`, done: true },
    { label: "费用确认", detail: paid ? "认养费用已确认，订单进入正式履约。" : "等待付款确认。", done: paid },
    { label: "农场采收", detail: harvested ? "农场已进入采收准备。" : "作物仍在生长期，采收前会补充现场照片。", done: harvested },
    { label: "分拣打包", detail: packed ? "按订单分拣、称重、贴溯源码。" : "采收后生成分拣和打包记录。", done: packed },
    { label: "同城配送", detail: "发货后显示快递/配送节点和预计送达时间。", done: false },
    { label: "签收评价", detail: "签收后用户可对本次认养和农产品进行评价。", done: false },
  ];
}

function TraceabilityPage({ user, initialTarget }) {
  const orders = useMemo(() => {
    const demoOrders = getDemoAdoptions().map(normalizeOrder);
    const fallbackOrders = mockAdoptions.map(normalizeOrder);
    return dedupeOrders([...demoOrders, ...fallbackOrders]);
  }, []);

  const findInitialOrderId = () => {
    const matched = orders.find((order) =>
      String(order.orderId) === String(initialTarget?.orderId) ||
      String(order.plotNum) === String(initialTarget?.plotNum) ||
      String(order.plotId) === String(initialTarget?.plotId),
    );
    return matched?.orderId || orders[0]?.orderId;
  };

  const [activeOrderId, setActiveOrderId] = useState(findInitialOrderId);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  const activeOrder = orders.find((order) => String(order.orderId) === String(activeOrderId)) || orders[0];
  const uploadedRecords = activeOrder ? matchUploadedRecords(activeOrder, getDemoTraceRecords()) : [];
  const timeline = activeOrder ? buildTimeline(activeOrder, uploadedRecords) : [];
  const logistics = activeOrder ? buildLogistics(activeOrder) : [];
  const completedCount = timeline.filter((item) => item.status !== "待上传").length;
  const coverRecord = timeline.find((item) => item.status === "已同步") || timeline[0];
  const demoReviews = getDemoReviews();
  const currentUserKey = String(user?.userId || user?.realName || user?.username || "当前用户");
  const existingReview = activeOrder
    ? demoReviews.find((item) => {
        const reviewUserKey = String(item.userId || item.userName);
        return reviewUserKey === currentUserKey && String(item.traceCode) === String(activeOrder.traceCode);
      })
    : null;

  useEffect(() => {
    if (!initialTarget || orders.length === 0) return;
    const matched = orders.find((order) =>
      String(order.orderId) === String(initialTarget.orderId) ||
      String(order.plotNum) === String(initialTarget.plotNum) ||
      String(order.plotId) === String(initialTarget.plotId),
    );
    if (matched) {
      setActiveOrderId(matched.orderId);
      setQuery(matched.traceCode);
    }
  }, [initialTarget, orders]);

  const handleSearch = (event) => {
    event.preventDefault();
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      setNotice("请输入溯源码、订单号或地块编号。");
      return;
    }

    const matched = orders.find((order) =>
      String(order.traceCode).toLowerCase().includes(keyword) ||
      String(order.orderId).toLowerCase() === keyword ||
      String(order.plotNum).toLowerCase().includes(keyword) ||
      String(order.batchNo).toLowerCase().includes(keyword),
    );

    if (!matched) {
      setNotice("没有查到对应溯源记录。可以从左侧订单列表选择，或输入当前页面展示的溯源码。");
      return;
    }

    setActiveOrderId(matched.orderId);
    setQuery(matched.traceCode);
    setNotice(`已切换到 ${matched.plotNum} 的溯源报告。`);
  };

  const handleTraceAction = (type) => {
    const messages = {
      reminder: `已提醒 ${activeOrder.farmerName} 补充 ${activeOrder.plotNum} 的照片、农事说明和检测材料。`,
      diary: `${activeOrder.plotNum} 的订单日记已按当前农事节点生成；农场主上传新素材后会优先显示。`,
      logistics: `${activeOrder.plotNum} 的物流提醒已开启，采收、分拣、打包、发货节点会在这里追加。`,
    };
    setNotice(messages[type]);
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    const content = reviewText.trim();
    if (!content) {
      setNotice("请先填写评论内容。");
      return;
    }

    const reviewPayload = {
      userId: user?.userId,
      userName: user?.realName || user?.username || "当前用户",
      orderId: String(activeOrder.orderId),
      rating,
      content,
      plotNum: activeOrder.plotNum,
      crop: activeOrder.crop,
      farmName: activeOrder.farmName,
      traceCode: activeOrder.traceCode,
    };

    try {
      const response = await submitReview(reviewPayload);
      if (response.code !== 200) {
        throw new Error(response.message || "评论接口保存失败");
      }
      setNotice(existingReview ? "评论已更新，并已同步到后端和首页评价区。" : "评论已发布，并已同步到后端和首页评价区。");
    } catch {
      setNotice(existingReview ? "评论已更新到本地演示数据，首页评价区可见。" : "评论已保存到本地演示数据，首页评价区可见。");
    }

    addDemoReview(reviewPayload);
    setReviewText("");
    setRating(5);
  };

  if (!activeOrder) {
    return (
      <section className="section-panel empty-state">
        <h3>暂无可查询的认养订单</h3>
        <p className="muted">完成认养后，这里会按订单展示浇水、施肥、检测、采收和物流记录。</p>
      </section>
    );
  }

  return (
    <div className="trace-page">
      <section className="section-panel page-toolbar">
        <div>
          <h3>农产品溯源查询</h3>
          <p className="muted">这不是普通详情页，而是订单级验货报告：证明这批农产品来自哪块地、谁种的、做过哪些农事、现在物流到哪一步。</p>
        </div>
        <span className="status-pill">{activeOrder.plotNum} · {activeOrder.crop}</span>
      </section>

      <section className="section-panel trace-search-panel">
        <form className="trace-search-form" onSubmit={handleSearch}>
          <label>
            溯源码 / 订单号 / 地块编号
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={activeOrder.traceCode}
            />
          </label>
          <button className="primary-btn" type="submit">查询溯源</button>
        </form>
        <div className="trace-code-samples">
          <span>当前报告</span>
          <button type="button" onClick={() => setQuery(activeOrder.traceCode)}>{activeOrder.traceCode}</button>
          <button type="button" onClick={() => setQuery(String(activeOrder.orderId))}>订单 {activeOrder.orderId}</button>
          <button type="button" onClick={() => setQuery(activeOrder.plotNum)}>{activeOrder.plotNum}</button>
        </div>
      </section>

      <div className="trace-layout">
        <aside className="section-panel trace-order-list">
          <h3>认养订单</h3>
          <div className="trace-source-card">
            <strong>报告组成</strong>
            <span>订单身份信息</span>
            <span>农场主上传记录</span>
            <span>农事日记和物流轨迹</span>
          </div>
          {orders.map((order) => (
            <button
              className={`trace-order-item ${String(order.orderId) === String(activeOrder.orderId) ? "active" : ""}`}
              key={order.orderId}
              type="button"
              onClick={() => {
                setActiveOrderId(order.orderId);
                setQuery(order.traceCode);
                setNotice("");
              }}
            >
              <strong>{order.plotNum} · {order.crop}</strong>
              <span>{order.farmName}</span>
              <small>{order.startDate} 至 {order.endDate}</small>
            </button>
          ))}
        </aside>

        <main className="trace-main">
          <section className="section-panel">
            <div className="trace-visual-summary">
              <div className="trace-cover">
                <img src={coverRecord?.image || activeOrder.profile.cover} alt={activeOrder.title} />
                <div className="trace-cover-caption">
                  <span className="status-pill">{activeOrder.status}</span>
                  <h3>{activeOrder.title}</h3>
                  <p>{activeOrder.farmName} · {activeOrder.farmerName}</p>
                </div>
              </div>

              <div className="trace-side-panel">
                <div className="product-passport">
                  <strong>农产品身份证</strong>
                  <span><b>溯源码</b>{activeOrder.traceCode}</span>
                  <span><b>批次号</b>{activeOrder.batchNo}</span>
                  <span><b>订单号</b>{activeOrder.orderId}</span>
                  <span><b>地块</b>{activeOrder.plotNum}</span>
                  <span><b>农场</b>{activeOrder.farmName}</span>
                  <span><b>农场主</b>{activeOrder.farmerName}</span>
                  <span><b>认养周期</b>{activeOrder.startDate} 至 {activeOrder.endDate}</span>
                </div>

                <div className="progress-ring">
                  <strong>{activeOrder.progress}%</strong>
                  <span>生长进度</span>
                </div>

                <div className="trace-current-step">
                  <strong>当前关键记录</strong>
                  <p>{coverRecord?.action}</p>
                  <span>{coverRecord?.detail}</span>
                </div>

                <div className="trace-action-box">
                  <button className="secondary-btn" type="button" onClick={() => handleTraceAction("reminder")}>
                    提醒上传素材
                  </button>
                  <button className="ghost-btn" type="button" onClick={() => handleTraceAction("diary")}>
                    生成溯源日记
                  </button>
                  <button className="ghost-btn" type="button" onClick={() => handleTraceAction("logistics")}>
                    开启物流提醒
                  </button>
                </div>
              </div>
            </div>

            {notice && <div className="inline-notice">{notice}</div>}

            <div className="trace-photo-strip">
              {timeline.slice(0, 4).map((item) => (
                <article key={item.id}>
                  <img src={item.image} alt={item.action} />
                  <div>
                    <strong>{item.action}</strong>
                    <span>{item.status}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="grid-4">
              <div className="stat-card"><strong>农事记录</strong><p>{completedCount}/{timeline.length}</p></div>
              <div className="stat-card"><strong>实拍图片</strong><p>{timeline.filter((item) => item.image).length}</p></div>
              <div className="stat-card"><strong>上传素材</strong><p>{uploadedRecords.length} 条</p></div>
              <div className="stat-card"><strong>物流状态</strong><p>{activeOrder.logisticsStatus}</p></div>
            </div>
          </section>

          <section className="section-panel">
            <h3>订单溯源日记</h3>
            <div className="trace-timeline">
              {timeline.map((item) => (
                <article className={`trace-record ${item.status === "待上传" ? "pending" : ""}`} key={item.id}>
                  <img src={item.image} alt={item.action} />
                  <div>
                    <div className="trace-record-head">
                      <span className="status-pill">{item.status}</span>
                      <strong>{item.action}</strong>
                    </div>
                    <p className="muted">{item.detail}</p>
                    <div className="meta-list compact-meta">
                      <span><strong>时间</strong>{item.date}</span>
                      <span><strong>操作人</strong>{item.operator}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="section-panel">
            <h3>淘宝式物流轨迹</h3>
            <div className="logistics-panel">
              <img src="/images/farm-assets/Camera_XHS_17819447868081040g00831j4sdmiu1g1g5p18.jpg" alt="采收装箱" />
              <div className="logistics-steps">
                {logistics.map((step) => (
                  <div className={`logistics-step ${step.done ? "done" : ""}`} key={step.label}>
                    <b>{step.label}</b>
                    <span>{step.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section-panel trace-review-panel">
            <div>
              <div className="analytics-header">
                <div>
                  <h3>认养体验评论</h3>
                  <p className="muted">只有查到有效溯源报告后才允许评价。评论会展示到首页用户评价区。</p>
                </div>
                <span className="status-pill">{existingReview ? "已评价，可更新" : "已获得评价资格"}</span>
              </div>
              {existingReview && (
                <div className="existing-review">
                  <strong>你已发布的评价</strong>
                  <p>"{existingReview.content}"</p>
                  <span>{"★".repeat(existingReview.rating || 5)} · {existingReview.date}</span>
                </div>
              )}
            </div>
            <form className="trace-review-form" onSubmit={handleSubmitReview}>
              <label>
                评分
                <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option value={value} key={value}>{value} 星</option>
                  ))}
                </select>
              </label>
              <label>
                评论内容
                <textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder={`说说 ${activeOrder.farmName} 的 ${activeOrder.crop} 认养体验`}
                />
              </label>
              <button className="primary-btn" type="submit">发布评论</button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default TraceabilityPage;
