import React, { useEffect, useState } from "react";
import { cancelAdoption, getUserActiveOrders, getUserHistoryOrders, payOrder } from "../api/api";
import { mockAdoptions } from "../mock/farmPlatformData";
import {
  addDemoPaymentNotice,
  addDemoCancelledOrderId,
  ensureDemoConversation,
  getDemoAdoptions,
  getDemoCancelledOrderIds,
  getDemoTraceRecords,
  markDemoAdoptionPaid,
  removeDemoAdoption,
} from "../utils/demoState";

function normalizeOrder(order) {
  const paymentStatusMap = {
    paid: "已支付",
    unpaid: "待支付",
  };
  const progressValue = Number(order.progress);
  const normalizedProgress = Number.isFinite(progressValue) ? progressValue : 8;

  return {
    orderId: order.orderId,
    plotId: order.plotId,
    plotNum: order.plotNum || order.plotId,
    title: order.title || `地块 ${order.plotNum || order.plotId}`,
    farmName: order.farmName || "认养农场",
    farmerId: order.farmerId,
    farmerName: order.farmerName || "农场主",
    farmerPhone: order.farmerPhone,
    crop: order.crop || order.cropId || "已选作物",
    startDate: order.startDate || order.createTime,
    endDate: order.endDate,
    status: order.status || "生长中",
    progress: normalizedProgress,
    nextWatering: order.nextWatering || "等待农场主同步",
    paymentStatus: paymentStatusMap[order.paymentStatus] || order.paymentStatus || "订单已创建",
    logisticsStatus: order.logisticsStatus || "采收后生成物流",
    growthRecords: order.growthRecords || ["订单已创建，等待农场主同步第一条农事记录。"],
  };
}

function getVisibleMockOrders() {
  const cancelledIds = getDemoCancelledOrderIds().map(String);
  return mockAdoptions
    .filter((order) => !cancelledIds.includes(String(order.orderId)))
    .map(normalizeOrder);
}

function getUserDemoOrders(userId) {
  return getDemoAdoptions()
    .filter((order) => String(order.userId) === String(userId))
    .map(normalizeOrder);
}

function dedupeOrders(orders) {
  const seen = new Set();
  return orders.filter((order) => {
    const key = order.orderId
      ? `order-${order.orderId}`
      : `plot-${order.plotId || order.plotNum}`;
    const plotKey = order.plotId || order.plotNum ? `plot-${order.plotId || order.plotNum}` : key;
    if (seen.has(key) || seen.has(plotKey)) return false;
    seen.add(key);
    seen.add(plotKey);
    return true;
  });
}

function getLogisticsSteps(order) {
  const harvested = Number(order.progress || 0) >= 75;
  const paid = order.paymentStatus === "已支付" || order.paymentStatus === "paid";
  return [
    { title: "订单创建", detail: `${order.plotNum} 已建立认养订单，等待农场主同步农事记录。`, done: true },
    { title: "付款确认", detail: paid ? "认养费用已确认，订单进入托管种植流程。" : "待完成付款后进入完整履约流程。", done: paid },
    { title: "农场采收", detail: harvested ? "农场主已确认成熟度，准备采收拍照。" : "作物仍在生长期，采收前会更新现场照片。", done: harvested },
    { title: "分拣称重", detail: "按订单分拣、称重、贴溯源码，照片会同步到溯源页。", done: false },
    { title: "冷链打包", detail: "打包完成后生成快递单号和预计送达时间。", done: false },
    { title: "派送签收", detail: "到达后可查看签收凭证和售后入口。", done: false },
  ];
}

const traceDiaryImages = [
  "/images/farm-assets/Camera_XHS_17819622116301040g0083172rgdtc3m105oen.jpg",
  "/images/farm-assets/Camera_1040g3k031j5eb13g2u5g5nk9ms7g8j409cps3bo.jpg",
  "/images/farm-assets/Camera_1040g3k031j5eb13g2u6g5nk9ms7g8j40d2re9a8.jpg",
  "/images/farm-assets/Camera_XHS_17819622092431040g0083172rgdtc3m005oen.jpg",
  "/images/farm-assets/Camera_XHS_17819622139731040g0083172rgdtc3m205oen.jpg",
  "/images/farm-assets/Camera_1040g3k831ne64s2s4sc05n7eah9kfnvr7sjel8o.jpg",
  "/images/farm-assets/Camera_1040g3k831j5eihf2j0e05nk9ms7g8j40kj637og.jpg",
];

function formatDateLabel(value, fallback) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function getTraceDiary(order) {
  const progress = Number(order.progress || 0);
  const paid = order.paymentStatus === "已支付" || order.paymentStatus === "paid";
  const orderDate = formatDateLabel(order.startDate, "下单当天");

  return [
    {
      title: "认养下单",
      date: orderDate,
      detail: `${order.title} 已创建认养订单，农场主 ${order.farmerName} 接收地块托管。`,
      done: true,
      image: traceDiaryImages[0],
    },
    {
      title: "付款确认",
      date: paid ? orderDate : "待付款",
      detail: paid ? "认养费用已确认，订单进入正式农事履约。" : "付款后会解锁完整养护和采收配送流程。",
      done: paid,
      image: traceDiaryImages[1],
    },
    {
      title: "浇水记录",
      date: "第 1 周",
      detail: order.growthRecords?.[0] || "农场主完成浇水后，同步水量、土壤湿度和现场照片。",
      done: progress >= 15,
      image: traceDiaryImages[2],
    },
    {
      title: "施肥 / 除虫",
      date: "第 2-3 周",
      detail: "根据作物长势安排有机肥和虫害巡检，上传用量、操作说明和照片。",
      done: progress >= 35,
      image: traceDiaryImages[3],
    },
    {
      title: "生长巡检",
      date: "第 4 周",
      detail: "记录株高、叶色、开花结果情况，异常时同步提醒用户。",
      done: progress >= 50,
      image: traceDiaryImages[4],
    },
    {
      title: "检测报告",
      date: "采收前",
      detail: "采收前补充农残/土壤检测报告，用户端可在溯源页查看。",
      done: progress >= 70,
      image: traceDiaryImages[5],
    },
    {
      title: "采收与配送",
      date: "成熟后",
      detail: `${order.logisticsStatus}。采收、分拣、打包、发货会继续追加到这份日记。`,
      done: progress >= 80,
      image: traceDiaryImages[6],
    },
  ];
}

function getOrderDiary(order) {
  const traceRecords = getDemoTraceRecords();
  const exactOrderRecords = traceRecords.filter((record) => String(record.orderId) === String(order.orderId));
  const fallbackPlotRecords = traceRecords.filter((record) => !record.orderId && String(record.plotNum) === String(order.plotNum));
  const uploadedRecords = (exactOrderRecords.length > 0 ? exactOrderRecords : fallbackPlotRecords)
    .map((record) => ({
      title: record.actionName || record.action || "农事记录",
      date: record.date || "刚刚",
      detail: record.actionDetail || record.detail || "农场主已同步新的农事记录。",
      done: true,
      image: record.imageUrl || record.image || traceDiaryImages[0],
    }));

  return [...uploadedRecords, ...getTraceDiary(order)].slice(0, 4);
}

function AdoptionPage({ user, onOpenChat, onOpenTrace }) {
  const [orders, setOrders] = useState(() => {
    const demoOrders = getUserDemoOrders(user?.userId);
    return demoOrders.length > 0 ? demoOrders : getVisibleMockOrders();
  });
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user?.userId) return;

    const demoOrders = getUserDemoOrders(user.userId);

    Promise.all([getUserActiveOrders(user.userId), getUserHistoryOrders(user.userId)])
      .then(([activeResponse, historyResponse]) => {
        const active = activeResponse.code === 200 && Array.isArray(activeResponse.data)
          ? activeResponse.data
          : [];
        const history = historyResponse.code === 200 && Array.isArray(historyResponse.data)
          ? historyResponse.data
          : [];
        const merged = [...active, ...history];
        if (merged.length > 0) {
          const backendOrders = merged.map(normalizeOrder);
          setOrders(dedupeOrders([...backendOrders, ...demoOrders]));
        } else {
          setOrders(demoOrders.length > 0 ? dedupeOrders(demoOrders) : getVisibleMockOrders());
        }
      })
      .catch(() => {
        setOrders(demoOrders.length > 0 ? dedupeOrders(demoOrders) : getVisibleMockOrders());
        setMessage(demoOrders.length > 0
          ? "后端订单接口暂时不可用，当前展示你的本地演示认养数据。"
          : "后端订单接口暂时不可用，当前展示 mock 认养数据。");
      });
  }, [user?.userId]);

  const handleCancel = async (order) => {
    if (cancelling) return;
    setCancelling(true);
    let resultMessage = `演示取消成功：${order.title}。`;

    try {
      const response = await cancelAdoption(order.orderId);
      if (response.code === 200) {
        resultMessage = `已取消认养：${order.title}`;
      } else {
        resultMessage = `${response.message || "后端取消失败"}；已先完成前端演示取消。`;
      }
    } catch (error) {
      resultMessage = `演示取消成功：${order.title}。后端取消接口暂时不可用。`;
    }

    removeDemoAdoption(order.orderId);
    addDemoCancelledOrderId(order.orderId);
    setOrders((current) => current.filter((item) => item.orderId !== order.orderId));
    setCancelTarget(null);
    setCancelling(false);
    setMessage(resultMessage);
    setModal({
      title: "认养已取消",
      body: `${order.title} 已从“我的认养”移除。演示地块会重新回到可认养列表；真实后端地块由取消接口释放。`,
    });
  };

  const handlePay = async (order) => {
    const numericOrderId = Number(order.orderId);
    let payMessage = `${order.title} 已标记为已支付。`;

    if (Number.isInteger(numericOrderId)) {
      try {
        const response = await payOrder(numericOrderId, user?.userId, 399, "demo");
        if (response.code === 200) {
          payMessage = `${order.title} 付款成功，支付记录已写入后端。`;
        } else {
          payMessage = `${response.message || "后端付款失败"}；已先完成前端演示付款。`;
        }
      } catch (error) {
        payMessage = `${order.title} 已完成演示付款，后端付款接口暂时不可用。`;
      }
    }

    markDemoAdoptionPaid(order.orderId);
    addDemoPaymentNotice(order, 399);
    setOrders((current) =>
      current.map((item) =>
        item.orderId === order.orderId
          ? { ...item, paymentStatus: "已支付" }
          : item,
      ),
    );
    setModal({
      title: "付款成功",
      body: payMessage,
    });
  };

  const openModal = (type, order) => {
    const contentMap = {
      ai: {
        title: "AI 种植助手",
        body: `将带着地块 ${order.plotNum} 和作物 ${order.crop} 的上下文进入 AI 问答。`,
      },
      pay: {
        title: "微信扫码付款",
        body: `${order.title} 当前状态：${order.paymentStatus}。请使用微信扫描下方收款码，完成后点击“我已扫码付款”。`,
        payment: {
          qrCode: "/images/demo-payment-qr.svg",
          amount: 399,
          order,
        },
        actionText: "我已扫码付款",
        onConfirm: () => handlePay(order),
      },
      logistics: {
        title: "物流进度",
        body: `${order.logisticsStatus}。采收、分拣、打包、转运和签收都会按节点展示。`,
        image: "/images/farm-assets/Camera_XHS_17819447868081040g00831j4sdmiu1g1g5p18.jpg",
        steps: getLogisticsSteps(order),
      },
      trace: {
        title: "溯源报告",
        body: `${order.plotNum} 的溯源报告按订单生成，数据来自认养订单、农场主上传的农事素材和当前演示记录。`,
        reportOrder: order,
        diary: getTraceDiary(order),
        actionText: "关闭报告",
      },
    };

    setModal(contentMap[type]);
  };

  const openFarmerChat = (order) => {
    const target = {
      farmerName: order.farmerName,
      farmerId: order.farmerId,
      farmerPhone: order.farmerPhone,
      farmName: order.farmName,
      plotNum: order.plotNum,
      plotId: order.plotId,
      orderId: order.orderId,
      userName: user?.realName || user?.username || "认养用户",
    };
    ensureDemoConversation(target);
    onOpenChat?.(target);
  };

  return (
    <div>
      <section className="section-panel page-toolbar">
        <div>
          <h3>我的认养</h3>
          <p className="muted">管理已认养地块、生长数据、浇水提醒、付款、物流和溯源报告。</p>
        </div>
        {message && <span className="status-pill">{message}</span>}
      </section>

      <div className="adoption-list">
        {orders.map((order) => (
          <article className="adoption-card" key={order.orderId}>
            <div className="adoption-card-header">
              <div>
                <div className="action-row">
                  <span className="status-pill">{order.status}</span>
                  <span className="status-pill">{order.paymentStatus}</span>
                </div>
                <h3>{order.title}</h3>
                <p className="muted">{order.farmName} · {order.farmerName} · {order.crop}</p>
              </div>
              <button className="ghost-btn danger-btn" type="button" onClick={() => setCancelTarget(order)}>
                取消认养
              </button>
            </div>

            <div className="plot-facts">
              <span><b>订单号</b>{order.orderId}</span>
              <span><b>认养周期</b>{order.startDate} 至 {order.endDate}</span>
              <span><b>浇水提醒</b>{order.nextWatering}</span>
              <span><b>物流进度</b>{order.logisticsStatus}</span>
            </div>

            <div className="growth-block">
              <strong>生长进度 {order.progress}%</strong>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${order.progress}%` }} />
              </div>
            </div>

            <div className="timeline">
              {order.growthRecords.map((record) => (
                <div className="timeline-item" key={record}>{record}</div>
              ))}
            </div>

            <div className="adoption-diary-preview">
              <div className="analytics-header">
                <div>
                  <h3>溯源记录日记</h3>
                  <p className="muted">农场主上传的浇水、施肥、检测、采收记录会优先显示在这里。</p>
                </div>
                <button className="ghost-btn" type="button" onClick={() => onOpenTrace?.(order)}>
                  查看完整报告
                </button>
              </div>
              <div className="adoption-diary-grid">
                {getOrderDiary(order).map((item) => (
                  <article className={`adoption-diary-item ${item.done ? "done" : ""}`} key={`${item.title}-${item.date}`}>
                    <img src={item.image} alt={item.title} />
                    <div>
                      <span className="status-pill">{item.done ? "已同步" : "待同步"}</span>
                      <strong>{item.title}</strong>
                      <small>{item.date}</small>
                      <p>{item.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="action-row">
              <button className="primary-btn" type="button" onClick={() => openModal("ai", order)}>
                AI 种植助手
              </button>
              <button
                className="secondary-btn"
                type="button"
                onClick={() => openModal("pay", order)}
                disabled={order.paymentStatus === "已支付"}
              >
                付款入口
              </button>
              <button className="ghost-btn" type="button" onClick={() => openModal("logistics", order)}>
                物流进度
              </button>
              <button className="ghost-btn" type="button" onClick={() => onOpenTrace?.(order)}>
                溯源报告
              </button>
              <button className="ghost-btn" type="button" onClick={() => openFarmerChat(order)}>
                联系农户
              </button>
            </div>
          </article>
        ))}
      </div>

      {orders.length === 0 && (
        <section className="section-panel empty-state">
          <h3>暂无认养中的地块</h3>
          <p className="muted">去“浏览可认养地块”选择一块土地开始认养。</p>
        </section>
      )}

      {modal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" type="button" onClick={() => setModal(null)}>×</button>
            <h2>{modal.title}</h2>
            <p className="muted">{modal.body}</p>
            {modal.payment && (
              <div className="payment-qr-panel">
                <div className="payment-qr-card">
                  <img src={modal.payment.qrCode} alt="微信付款二维码" />
                </div>
                <div className="payment-order-summary">
                  <span className="status-pill">微信支付</span>
                  <h3>认养付款 ¥{modal.payment.amount}</h3>
                  <div className="meta-list compact-meta">
                    <span><strong>订单</strong>{modal.payment.order.orderId}</span>
                    <span><strong>地块</strong>{modal.payment.order.plotNum}</span>
                    <span><strong>农场</strong>{modal.payment.order.farmName}</span>
                    <span><strong>农场主</strong>{modal.payment.order.farmerName}</span>
                  </div>
                  <p className="muted">扫码后平台当前先按演示流程标记为已支付；后续接入真实支付回调后，应由后端确认支付状态。</p>
                </div>
              </div>
            )}
            {modal.image && <img className="modal-hero-image" src={modal.image} alt={modal.title} />}
            {modal.steps && (
              <div className="logistics-steps modal-steps">
                {modal.steps.map((step) => (
                  <div className={`logistics-step ${step.done ? "done" : ""}`} key={step.title}>
                    <b>{step.title}</b>
                    <span>{step.detail}</span>
                  </div>
                ))}
              </div>
            )}
            {modal.diary && (
              <div className="trace-diary-modal">
                <div className="trace-diary-summary">
                  <img src={modal.diary[0]?.image} alt={modal.reportOrder?.title || "溯源报告"} />
                  <div>
                    <span className="status-pill">{modal.reportOrder?.plotNum}</span>
                    <h3>{modal.reportOrder?.title}</h3>
                    <p className="muted">
                      {modal.reportOrder?.farmName} · {modal.reportOrder?.farmerName} · {modal.reportOrder?.crop}
                    </p>
                    <div className="trace-diary-metrics">
                      <span><b>{modal.diary.filter((item) => item.done).length}/{modal.diary.length}</b>已完成节点</span>
                      <span><b>{modal.reportOrder?.progress}%</b>生长进度</span>
                      <span><b>{modal.reportOrder?.paymentStatus}</b>付款状态</span>
                    </div>
                  </div>
                </div>
                <div className="trace-diary-list">
                  {modal.diary.map((item) => (
                    <article className={`trace-diary-item ${item.done ? "done" : ""}`} key={item.title}>
                      <img src={item.image} alt={item.title} />
                      <div>
                        <div className="trace-record-head">
                          <span className="status-pill">{item.done ? "已同步" : "待同步"}</span>
                          <strong>{item.title}</strong>
                        </div>
                        <small>{item.date}</small>
                        <p>{item.detail}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
            <div className="action-row">
              <button
                className="primary-btn"
                type="button"
                onClick={async () => {
                  if (modal.onConfirm) {
                    await modal.onConfirm();
                  } else {
                    setModal(null);
                  }
                }}
              >
                {modal.actionText || "没问题"}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" type="button" onClick={() => setCancelTarget(null)}>×</button>
            <h2>确认取消认养？</h2>
            <p className="muted">
              取消后，{cancelTarget.title} 会从我的认养中移除；如果是演示地块，会重新回到可认养列表。
            </p>
            <div className="meta-list">
              <span><strong>订单号</strong>{cancelTarget.orderId}</span>
              <span><strong>地块</strong>{cancelTarget.plotNum}</span>
              <span><strong>农场主</strong>{cancelTarget.farmerName}</span>
            </div>
            <div className="action-row">
              <button
                className="primary-btn danger-solid-btn"
                type="button"
                onClick={() => handleCancel(cancelTarget)}
                disabled={cancelling}
              >
                {cancelling ? "取消中..." : "确认取消"}
              </button>
              <button className="ghost-btn" type="button" onClick={() => setCancelTarget(null)}>
                暂不取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdoptionPage;
