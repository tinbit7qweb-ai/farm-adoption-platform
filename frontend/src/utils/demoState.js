const DEMO_ADOPTIONS_KEY = "farm_demo_adoptions";
const DEMO_ADOPTED_PLOTS_KEY = "farm_demo_adopted_plot_ids";
const DEMO_ADOPTED_PLOT_SNAPSHOTS_KEY = "farm_demo_adopted_plot_snapshots";
const DEMO_CONVERSATIONS_KEY = "farm_demo_conversations";
const DEMO_TRACE_RECORDS_KEY = "farm_demo_trace_records";
const DEMO_CANCELLED_ORDER_IDS_KEY = "farm_demo_cancelled_order_ids";
const DEMO_REVIEWS_KEY = "farm_demo_reviews";
const DEMO_FARM_TASKS_KEY = "farm_demo_farm_tasks";
const DEMO_PAYMENT_NOTICES_KEY = "farm_demo_payment_notices";

function safeParse(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

const unknownFarmer = {
  farmerId: null,
  farmerName: "待确认农户",
  farmerPhone: "待补充",
  farmName: "认养农场",
};

function isGenericFarmerName(name) {
  return !name || name === "农场主" || name === "农户" || name === "未知农户";
}

function enrichConversationTarget(target) {
  return {
    ...target,
    farmerId: target.farmerId || unknownFarmer.farmerId,
    farmerName: isGenericFarmerName(target.farmerName) ? unknownFarmer.farmerName : target.farmerName,
    farmerPhone: target.farmerPhone || unknownFarmer.farmerPhone,
    farmName: target.farmName || unknownFarmer.farmName,
  };
}

export function getDemoAdoptions() {
  return safeParse(localStorage.getItem(DEMO_ADOPTIONS_KEY), []);
}

export function saveDemoAdoptions(adoptions) {
  localStorage.setItem(DEMO_ADOPTIONS_KEY, JSON.stringify(adoptions));
}

export function getDemoAdoptedPlotIds() {
  return safeParse(localStorage.getItem(DEMO_ADOPTED_PLOTS_KEY), []);
}

export function saveDemoAdoptedPlotIds(plotIds) {
  localStorage.setItem(DEMO_ADOPTED_PLOTS_KEY, JSON.stringify(plotIds));
}

export function getDemoAdoptedPlotSnapshots() {
  return safeParse(localStorage.getItem(DEMO_ADOPTED_PLOT_SNAPSHOTS_KEY), {});
}

export function saveDemoAdoptedPlotSnapshots(snapshots) {
  localStorage.setItem(DEMO_ADOPTED_PLOT_SNAPSHOTS_KEY, JSON.stringify(snapshots));
}

function compactAdoptions(adoptions) {
  const seen = new Set();
  return adoptions.filter((item) => {
    const key = `${item.userId || "unknown"}-${item.plotId || item.plotNum || item.orderId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function addDemoAdoption(plot, user, options = {}) {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + Number(options.durationMonths || 3));

  const adoption = {
    orderId: `DEMO-${Date.now()}`,
    plotId: plot.plotId,
    plotNum: plot.plotNum,
    title: plot.title,
    farmName: plot.farmName,
    farmerId: plot.farmerId,
    farmerName: plot.farmerName,
    farmerPhone: plot.farmerPhone,
    crop: options.cropName || plot.crop || "认养作物",
    startDate: now.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
    status: "生长中",
    progress: 8,
    nextWatering: "等待农场主同步",
    paymentStatus: "待支付",
    logisticsStatus: "采收后生成物流",
    growthRecords: ["认养订单已创建，等待农场主同步第一条农事记录。"],
    userId: user?.userId,
  };

  const adoptions = compactAdoptions([
    adoption,
    ...getDemoAdoptions().filter(
      (item) =>
        !(
          String(item.userId) === String(user?.userId) &&
          String(item.plotId || item.plotNum) === String(plot.plotId || plot.plotNum)
        ),
    ),
  ]);
  saveDemoAdoptions(adoptions);

  const plotIds = Array.from(new Set([...getDemoAdoptedPlotIds(), plot.plotId]));
  saveDemoAdoptedPlotIds(plotIds);
  saveDemoAdoptedPlotSnapshots({
    ...getDemoAdoptedPlotSnapshots(),
    [plot.plotId]: plot,
  });

  return adoption;
}

export function removeDemoAdoption(orderId) {
  const adoptions = getDemoAdoptions();
  const removed = adoptions.find((item) => String(item.orderId) === String(orderId));
  saveDemoAdoptions(adoptions.filter((item) => String(item.orderId) !== String(orderId)));

  if (removed?.plotId) {
    saveDemoAdoptedPlotIds(
      getDemoAdoptedPlotIds().filter((plotId) => String(plotId) !== String(removed.plotId)),
    );
    const snapshots = getDemoAdoptedPlotSnapshots();
    delete snapshots[removed.plotId];
    saveDemoAdoptedPlotSnapshots(snapshots);
  }

  return removed;
}

export function markDemoAdoptionPaid(orderId) {
  const adoptions = getDemoAdoptions().map((item) =>
    String(item.orderId) === String(orderId)
      ? { ...item, paymentStatus: "已支付" }
      : item,
  );
  saveDemoAdoptions(adoptions);
  return adoptions;
}

export function getDemoCancelledOrderIds() {
  return safeParse(localStorage.getItem(DEMO_CANCELLED_ORDER_IDS_KEY), []);
}

export function addDemoCancelledOrderId(orderId) {
  const ids = Array.from(new Set([...getDemoCancelledOrderIds(), orderId]));
  localStorage.setItem(DEMO_CANCELLED_ORDER_IDS_KEY, JSON.stringify(ids));
  return ids;
}

export function getDemoConversations(fallback = []) {
  const saved = safeParse(localStorage.getItem(DEMO_CONVERSATIONS_KEY), null);
  if (saved) return saved;
  saveDemoConversations(fallback);
  return fallback;
}

export function saveDemoConversations(conversations) {
  localStorage.setItem(DEMO_CONVERSATIONS_KEY, JSON.stringify(conversations));
}

export function ensureDemoConversation(target) {
  const enrichedTarget = enrichConversationTarget(target);
  const conversations = getDemoConversations();
  const matched = conversations.find((item) => item.plotNum === enrichedTarget.plotNum);
  if (matched) {
    const enriched = {
      ...matched,
      name: enrichedTarget.farmerName || matched.name || "农场主",
      farmerId: enrichedTarget.farmerId || matched.farmerId,
      farmerName: enrichedTarget.farmerName || matched.farmerName || matched.name || "农场主",
      farmerPhone: enrichedTarget.farmerPhone || matched.farmerPhone,
      farmName: enrichedTarget.farmName || matched.farmName,
      plotId: enrichedTarget.plotId || matched.plotId,
      orderId: enrichedTarget.orderId || matched.orderId,
      userName: enrichedTarget.userName || matched.userName || "认养用户",
    };
    saveDemoConversations(conversations.map((item) => (item.id === matched.id ? enriched : item)));
    return enriched;
  }

  const conversation = {
    id: `plot-${enrichedTarget.plotNum}`,
    name: enrichedTarget.farmerName || "农场主",
    farmerId: enrichedTarget.farmerId,
    farmerName: enrichedTarget.farmerName || "农场主",
    farmerPhone: enrichedTarget.farmerPhone,
    farmName: enrichedTarget.farmName,
    userName: enrichedTarget.userName || "认养用户",
    plotId: enrichedTarget.plotId,
    orderId: enrichedTarget.orderId,
    plotNum: enrichedTarget.plotNum,
    unreadForUser: 0,
    unreadForFarmer: 1,
    lastMessage: "你好，我想咨询这块地的认养情况。",
    messages: [
      {
        from: "farmer",
        text: `你好，我是${enrichedTarget.farmerName}，负责${enrichedTarget.farmName}的地块 ${enrichedTarget.plotNum}，有问题可以直接问我。`,
        time: "刚刚",
      },
    ],
  };

  saveDemoConversations([conversation, ...conversations]);
  return conversation;
}

export function appendDemoMessage(conversationId, message, viewerRole) {
  const conversations = getDemoConversations().map((conversation) => {
    if (conversation.id !== conversationId) return conversation;

    return {
      ...conversation,
      lastMessage: message.text,
      unreadForUser: viewerRole === "farmer" ? (conversation.unreadForUser || 0) + 1 : 0,
      unreadForFarmer: viewerRole === "user" ? (conversation.unreadForFarmer || 0) + 1 : 0,
      messages: [...conversation.messages, message],
    };
  });
  saveDemoConversations(conversations);
  return conversations;
}

export function markDemoConversationRead(conversationId, viewerRole) {
  const conversations = getDemoConversations().map((conversation) => {
    if (conversation.id !== conversationId) return conversation;
    return {
      ...conversation,
      unreadForUser: viewerRole === "user" ? 0 : conversation.unreadForUser || 0,
      unreadForFarmer: viewerRole === "farmer" ? 0 : conversation.unreadForFarmer || 0,
    };
  });
  saveDemoConversations(conversations);
  return conversations;
}

export function getDemoTraceRecords() {
  return safeParse(localStorage.getItem(DEMO_TRACE_RECORDS_KEY), []);
}

export function addDemoTraceRecord(record) {
  const nextRecord = {
    id: `TRACE-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    ...record,
  };
  const records = [nextRecord, ...getDemoTraceRecords()];
  localStorage.setItem(DEMO_TRACE_RECORDS_KEY, JSON.stringify(records));
  return records;
}

export function getDemoFarmTasks() {
  return safeParse(localStorage.getItem(DEMO_FARM_TASKS_KEY), []);
}

export function saveDemoFarmTasks(tasks) {
  localStorage.setItem(DEMO_FARM_TASKS_KEY, JSON.stringify(tasks));
  return tasks;
}

export function upsertDemoFarmTask(task) {
  const tasks = getDemoFarmTasks();
  const nextTasks = [
    task,
    ...tasks.filter((item) => String(item.id || item.taskId) !== String(task.id || task.taskId)),
  ];
  return saveDemoFarmTasks(nextTasks);
}

export function getDemoPaymentNotices() {
  return safeParse(localStorage.getItem(DEMO_PAYMENT_NOTICES_KEY), []);
}

export function addDemoPaymentNotice(order, amount = 399) {
  const paidAt = new Date().toISOString();
  const notice = {
    id: `PAY-${order.orderId}-${Date.now()}`,
    orderId: order.orderId,
    plotNum: order.plotNum,
    title: order.title,
    crop: order.crop,
    farmName: order.farmName,
    farmerName: order.farmerName,
    userId: order.userId,
    userName: order.userName || "认养用户",
    amount,
    paidAt,
    status: "待农场主确认",
    unread: true,
  };
  const notices = [
    notice,
    ...getDemoPaymentNotices().filter((item) => String(item.orderId) !== String(order.orderId)),
  ];
  localStorage.setItem(DEMO_PAYMENT_NOTICES_KEY, JSON.stringify(notices));
  return notices;
}

export function getDemoReviews() {
  return safeParse(localStorage.getItem(DEMO_REVIEWS_KEY), []);
}

export function addDemoReview(review) {
  const nextReview = {
    id: `REVIEW-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    ...review,
  };
  const reviews = [
    nextReview,
    ...getDemoReviews().filter((item) => {
      const sameUser = String(item.userId || item.userName) === String(review.userId || review.userName);
      const sameTrace = String(item.traceCode || item.plotNum) === String(review.traceCode || review.plotNum);
      return !(sameUser && sameTrace);
    }),
  ];
  localStorage.setItem(DEMO_REVIEWS_KEY, JSON.stringify(reviews));
  return reviews;
}
