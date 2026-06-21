import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  addTraceabilityRecord,
  completeFarmTask,
  createPlot,
  getFarmerTasks,
  getFarmOverviewStats,
  getPlotChatMessages,
  getPlotsByFarm,
  getRecommendedPlots,
  markFarmChatRead,
  sendFarmChatMessage,
} from "../api/api";
import {
  mockConversations,
  mockFarmTasks,
  mockFarmerOrders,
  mockPlots,
  mockRevenue,
} from "../mock/farmPlatformData";
import {
  addDemoTraceRecord,
  appendDemoMessage,
  getDemoAdoptions,
  getDemoConversations,
  getDemoFarmTasks,
  getDemoPaymentNotices,
  getDemoTraceRecords,
  markDemoConversationRead,
  saveDemoConversations,
  upsertDemoFarmTask,
} from "../utils/demoState";

const unknownFarmer = {
  farmerId: null,
  farmerName: "待确认农户",
  farmerPhone: "待补充",
  farmName: "认养农场",
};

const farmAssetImages = [
  "/images/farm-assets/Camera_1040g3k831uchle751m005pm7vh27e0r08s3s72o.jpg",
  "/images/farm-assets/Camera_1040g0k031joppvluig1g5pch89coiqnt35oh0g0.jpg",
  "/images/farm-assets/Camera_XHS_17819447720491040g00831rn6cljiig0g5o6h.jpg",
  "/images/farm-assets/Camera_1040g0k031joppvluig005pch89coiqntkr5abd8.jpg",
  "/images/farm-assets/Camera_XHS_17819447868081040g00831j4sdmiu1g1g5p18.jpg",
  "/images/farm-assets/Camera_XHS_17819448317211040g008319h6jbcd6u005nnb.jpg",
];

const traceActionTemplates = [
  { action: "浇水", detail: "补水 12L，土壤湿度保持在适宜范围。", image: farmAssetImages[0] },
  { action: "施肥", detail: "追加有机肥，记录用量和施肥区域。", image: farmAssetImages[3] },
  { action: "除虫巡检", detail: "完成叶面巡检，采用物理防治方式。", image: farmAssetImages[2] },
  { action: "检测", detail: "土壤酸碱度、农残和水质检测合格。", image: farmAssetImages[1] },
  { action: "采收", detail: "按订单采收并拍照，准备分拣称重。", image: farmAssetImages[4] },
  { action: "打包发货", detail: "完成分拣、称重、贴码和冷链打包。", image: farmAssetImages[5] },
];

function isGenericFarmerName(name) {
  return !name || name === "农场主" || name === "农户" || name === "未知农户";
}

function normalizePlot(plot) {
  return {
    plotId: plot.plotId,
    plotNum: plot.plotNum,
    title: plot.title || `地块 ${plot.plotNum}`,
    crop: plot.crop || "待配置作物",
    area: plot.area,
    status: plot.status === 0 || plot.status === "available" ? "available" : "adopted",
    adopterName: plot.adopterName,
    adopterPhone: plot.adopterPhone,
    soilType: plot.soilType,
    sunlightHours: plot.sunlightHours,
  };
}

function DashboardHome({ plots, stats, onSectionChange }) {
  const totalPlots = stats?.totalPlots ?? plots.length;
  const availablePlots = stats?.availablePlots ?? plots.filter((plot) => plot.status === "available").length;
  const adoptedPlots = stats?.activeAdoptions ?? plots.filter((plot) => plot.status === "adopted").length;
  const todayTasks = mockFarmTasks.filter((task) => task.status === "待完成").length;
  const unreadMessages = mockConversations.reduce((total, item) => total + item.unread, 0);
  const activeOrders = mockFarmerOrders.filter((order) => order.status !== "已完成").length;

  return (
    <div>
      <div className="dashboard-hero">
        <section className="section-panel">
          <h3>今日经营概览</h3>
          <p className="muted">
            这里优先展示真实统计接口返回的数据。后端未启动或暂无数据时，页面会使用 mock 数据兜底，
            但功能入口和页面结构已经按真实后台继续扩展。
          </p>
          <div className="action-row">
            <button className="primary-btn" type="button" onClick={() => onSectionChange?.("farmer-plots")}>
              新增地块
            </button>
            <button className="secondary-btn" type="button" onClick={() => onSectionChange?.("farmer-tasks")}>
              处理待办
            </button>
            <button className="ghost-btn" type="button" onClick={() => onSectionChange?.("farmer-chat")}>
              查看消息
            </button>
          </div>
        </section>

        <section className="section-panel">
          <h3>待办优先级</h3>
          <div className="compact-list">
            <div className="compact-item">
              <div>
                <strong>A-01 今日需浇水</strong>
                <span>建议 18:00 前完成并上传照片</span>
              </div>
              <span className="status-pill">高</span>
            </div>
            <div className="compact-item">
              <div>
                <strong>张女士有 2 条未读消息</strong>
                <span>咨询番茄地生长状态</span>
              </div>
              <span className="status-pill">待回复</span>
            </div>
          </div>
        </section>
      </div>

      <div className="dashboard-stats">
        {[
          ["总地块数", totalPlots],
          ["待认养地块", availablePlots],
          ["已认养地块", adoptedPlots],
          ["今日待办任务", todayTasks],
          ["进行中订单", activeOrders],
          ["待回复消息", unreadMessages],
        ].map(([label, value]) => (
          <div className="stat-card" key={label}>
            <strong>{label}</strong>
            <p>{value}</p>
          </div>
        ))}
      </div>

      <section className="section-panel">
        <h3>今日农事任务</h3>
        <div className="compact-list">
          {mockFarmTasks.slice(0, 3).map((task) => (
            <div className="compact-item" key={task.id}>
              <div>
                <strong>{task.plotNum} · {task.type}</strong>
                <span>{task.dueDate} · {task.syncTarget}</span>
              </div>
              <span className="status-pill">{task.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PlotManagement({ farmId, plots, onCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    plotNum: "",
    area: "",
    soilType: "黑土",
    sunlightHours: 8,
  });

  const submitPlot = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await createPlot(
        farmId,
        formData.plotNum,
        Number(formData.area),
        formData.soilType,
        Number(formData.sunlightHours),
      );

      if (response.code === 200) {
        setMessage("地块已创建，已刷新列表。");
        setFormData({ plotNum: "", area: "", soilType: "黑土", sunlightHours: 8 });
        setShowForm(false);
        onCreated?.();
      } else {
        setMessage(response.message || "创建失败，请检查农场 ID 是否存在。");
      }
    } catch (error) {
      setMessage(`后端创建接口暂时不可用：${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-panel">
      <div className="action-row">
        <button className="primary-btn" type="button" onClick={() => setShowForm((value) => !value)}>
          {showForm ? "收起新增地块" : "新增地块"}
        </button>
        <button
          className="secondary-btn"
          type="button"
          onClick={() => setMessage("批量导入入口已打开：下一步可接 Excel/CSV 上传接口，当前先保留单条新增。")}
        >
          批量导入
        </button>
      </div>

      {message && <p className="status-pill">{message}</p>}

      {showForm && (
        <form className="section-panel" onSubmit={submitPlot}>
          <h3>新增自有地块</h3>
          <div className="grid-4">
            <label className="form-group">
              地块编号
              <input
                value={formData.plotNum}
                onChange={(event) => setFormData({ ...formData, plotNum: event.target.value })}
                placeholder="例如 A-08"
                required
              />
            </label>
            <label className="form-group">
              面积
              <input
                type="number"
                min="1"
                value={formData.area}
                onChange={(event) => setFormData({ ...formData, area: event.target.value })}
                placeholder="平方米"
                required
              />
            </label>
            <label className="form-group">
              土壤类型
              <select
                value={formData.soilType}
                onChange={(event) => setFormData({ ...formData, soilType: event.target.value })}
              >
                <option value="黑土">黑土</option>
                <option value="壤土">壤土</option>
                <option value="红土">红土</option>
                <option value="沙土">沙土</option>
              </select>
            </label>
            <label className="form-group">
              日照小时
              <input
                type="number"
                min="0"
                max="24"
                value={formData.sunlightHours}
                onChange={(event) => setFormData({ ...formData, sunlightHours: event.target.value })}
                required
              />
            </label>
          </div>
          <button className="primary-btn" type="submit" disabled={saving}>
            {saving ? "创建中..." : "提交创建"}
          </button>
        </form>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>地块</th>
              <th>作物</th>
              <th>面积</th>
              <th>状态</th>
              <th>认养人</th>
              <th>联系方式</th>
              <th>认养周期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {plots.map((plot) => (
              <tr key={plot.plotId}>
                <td>{plot.plotNum} · {plot.title}</td>
                <td>{plot.crop}</td>
                <td>{plot.area} 平方米</td>
                <td>{plot.status === "available" ? "待认养" : "已认养"}</td>
                <td>{plot.adopterName || "-"}</td>
                <td>{plot.adopterPhone || "-"}</td>
                <td>{plot.status === "available" ? "-" : "2026-06-01 至 2026-09-01"}</td>
                <td>
                  <div className="action-row">
                    <button className="ghost-btn" type="button" onClick={() => setMessage(`已进入 ${plot.plotNum} 的编辑预留流程。`)}>
                      编辑
                    </button>
                    <button className="ghost-btn danger-btn" type="button" onClick={() => setMessage(`${plot.plotNum} 删除入口已预留，接入后端前不会真实删除数据。`)}>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OrderManagement() {
  const paymentNotices = getDemoPaymentNotices();
  const demoOrders = getDemoAdoptions().map((order) => ({
    orderId: order.orderId,
    plotNum: order.plotNum,
    userName: order.userName || "演示用户",
    phone: order.userPhone || "-",
    crop: order.crop,
    startDate: order.startDate,
    endDate: order.endDate,
    status: order.paymentStatus === "已支付" ? "进行中" : "待付款",
    alert: "演示订单",
  }));
  const orders = [...demoOrders, ...mockFarmerOrders];

  return (
    <section className="section-panel">
      <h3>被认养地块订单</h3>
      {paymentNotices.length > 0 && (
        <div className="payment-alert-list">
          {paymentNotices.map((notice) => (
            <article className="payment-alert-card" key={notice.id}>
              <span className="status-pill">新付款待确认</span>
              <strong>{notice.plotNum} · ¥{notice.amount}</strong>
              <p>{notice.userName} 已扫码付款，订单 {notice.orderId}，请核对收款后安排农事履约。</p>
              <small>{new Date(notice.paidAt).toLocaleString()}</small>
            </article>
          ))}
        </div>
      )}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>订单</th>
              <th>地块</th>
              <th>认养用户</th>
              <th>电话</th>
              <th>作物</th>
              <th>起止时间</th>
              <th>状态</th>
              <th>到期提醒</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{order.plotNum}</td>
                <td>{order.userName}</td>
                <td>{order.phone}</td>
                <td>{order.crop}</td>
                <td>{order.startDate} 至 {order.endDate}</td>
                <td><span className="status-pill">{order.status}</span></td>
                <td>{order.alert}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FarmerChatCenter() {
  const seed = mockConversations.map((conversation) => ({
    ...conversation,
    ...getConversationIdentity(conversation),
    unreadForUser: conversation.unread || 0,
    unreadForFarmer: 0,
  }));
  const initialConversations = hydrateFarmerConversations(getDemoConversations(seed));
  saveDemoConversations(initialConversations);
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0]?.id);
  const [draft, setDraft] = useState("");
  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeId) || conversations[0],
    [activeId, conversations],
  );

  useEffect(() => {
    getRecommendedPlots()
      .then((response) => {
        if (response.code !== 200 || !Array.isArray(response.data)) return;
        setConversations((current) => {
          const next = applyBackendPlotIdentity(current, response.data);
          saveDemoConversations(next);
          return next;
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeConversation?.plotId || !Number.isInteger(Number(activeConversation.plotId))) return;

    getPlotChatMessages(Number(activeConversation.plotId))
      .then((response) => {
        if (response.code !== 200 || !Array.isArray(response.data) || response.data.length === 0) return;

        const backendMessages = response.data.map((message) => ({
          from: message.senderRole === "farmer" ? "farmer" : "user",
          text: message.content,
          time: message.createdAt ? String(message.createdAt).replace("T", " ").slice(5, 16) : "刚刚",
        }));

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === activeConversation.id
              ? {
                ...conversation,
                messages: backendMessages,
                lastMessage: backendMessages[backendMessages.length - 1]?.text || conversation.lastMessage,
              }
              : conversation,
          ),
        );
        markFarmChatRead(Number(activeConversation.plotId), "farmer").catch(() => {});
      })
      .catch(() => {});
  }, [activeConversation?.id, activeConversation?.plotId]);

  const sendReply = async () => {
    const text = draft.trim();
    if (!text) return;

    if (
      Number.isInteger(Number(activeConversation?.plotId)) &&
      Number.isInteger(Number(activeConversation?.farmerId))
    ) {
      try {
        await sendFarmChatMessage({
          plotId: Number(activeConversation.plotId),
          orderId: Number.isInteger(Number(activeConversation.orderId)) ? Number(activeConversation.orderId) : null,
          userId: 1,
          farmerId: Number(activeConversation.farmerId),
          senderRole: "farmer",
          content: text,
        });
      } catch {
        // 后端人工聊天不可用时，继续使用本地共享会话。
      }
    }

    setConversations(appendDemoMessage(activeId, { from: "farmer", text, time: "刚刚" }, "farmer"));
    setDraft("");
  };

  const openConversation = (conversationId) => {
    setActiveId(conversationId);
    setConversations(markDemoConversationRead(conversationId, "farmer"));
  };

  return (
    <div className="chat-layout">
      <aside className="conversation-list">
        {conversations.map((conversation) => (
          <button
            type="button"
            className={`conversation-item ${activeId === conversation.id ? "active" : ""}`}
            key={conversation.id}
            onClick={() => openConversation(conversation.id)}
          >
            <strong>{conversation.userName || "认养用户"}</strong>
            <p className="muted">{conversation.farmName || "认养农场"} · 地块 {conversation.plotNum}</p>
            <p>{conversation.lastMessage}</p>
            {conversation.unreadForFarmer > 0 && <span className="status-pill">{conversation.unreadForFarmer} 条未读</span>}
          </button>
        ))}
      </aside>
      <section className="chat-window">
        <div className="chat-title">
          <h3>{activeConversation.userName || "认养用户"}</h3>
          <p className="muted">
            {activeConversation.farmName || "认养农场"} · 地块 {activeConversation.plotNum}
            {activeConversation.farmerName ? ` · 负责农场主：${activeConversation.farmerName}` : ""}
          </p>
        </div>
        <div className="message-list">
          {activeConversation.messages.map((message, index) => (
            <div
              className={`message-bubble farmer ${message.from === "farmer" ? "self" : ""}`}
              key={`${message.time}-${index}`}
            >
              {message.text}
              <span className="message-time">{message.time}</span>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") sendReply();
            }}
            placeholder="回复认养用户..."
          />
          <button className="primary-btn" type="button" onClick={sendReply}>发送</button>
        </div>
      </section>
    </div>
  );
}

function getConversationIdentity(conversation) {
  const plot = mockPlots.find((item) => item.plotNum === conversation.plotNum);
  const storedFarmerName = isGenericFarmerName(conversation.farmerName)
    ? null
    : conversation.farmerName;
  const storedName = isGenericFarmerName(conversation.name) ? null : conversation.name;

  return {
    plotId: conversation.plotId || plot?.plotId,
    farmerId: conversation.farmerId || plot?.farmerId || unknownFarmer.farmerId,
    farmerName: storedFarmerName || plot?.farmerName || storedName || unknownFarmer.farmerName,
    farmerPhone: conversation.farmerPhone || plot?.farmerPhone || unknownFarmer.farmerPhone,
    farmName: conversation.farmName || plot?.farmName || unknownFarmer.farmName,
    userName: conversation.userName || "认养用户",
  };
}

function applyBackendPlotIdentity(conversations, backendPlots) {
  return conversations.map((conversation) => {
    const plot = backendPlots.find(
      (item) =>
        String(item.plotNum) === String(conversation.plotNum) ||
        String(item.plotId) === String(conversation.plotId),
    );

    if (!plot) return conversation;

    return {
      ...conversation,
      name: plot.farmerName || conversation.name,
      plotId: plot.plotId || conversation.plotId,
      farmerId: plot.farmerId || conversation.farmerId,
      farmerName: plot.farmerName || conversation.farmerName,
      farmerPhone: plot.farmerPhone || conversation.farmerPhone,
      farmName: plot.farmName || conversation.farmName,
    };
  });
}

function hydrateFarmerConversations(conversations) {
  return conversations.map((conversation) => ({
    ...conversation,
    ...getConversationIdentity(conversation),
  }));
}

function normalizeTask(task, demoOnly = false) {
  return {
    id: task.id || task.taskId,
    taskId: task.taskId || task.id,
    plotId: task.plotId,
    orderId: task.orderId,
    plotNum: task.plotNum || `地块 ${task.plotId || "-"}`,
    type: task.type || task.taskType,
    dueDate: task.dueDate,
    status: task.status === "completed" ? "已完成" : task.status === "pending" ? "待完成" : task.status,
    syncTarget: task.syncTarget || task.note || "完成后同步到用户端溯源页面",
    photoUrl: task.photoUrl,
    demoOnly,
  };
}

function mergeSavedTasks(tasks) {
  const savedTasks = getDemoFarmTasks();
  return tasks.map((task) => {
    const saved = savedTasks.find((item) => String(item.id || item.taskId) === String(task.id || task.taskId));
    return saved ? { ...task, ...saved } : task;
  });
}

function findOrderForTask(task) {
  const orders = [...getDemoAdoptions(), ...mockFarmerOrders];
  return orders.find((order) => String(order.orderId) === String(task.orderId)) ||
    orders.find((order) => String(order.plotNum) === String(task.plotNum));
}

function FarmTasks({ farmerId = 1 }) {
  const [tasks, setTasks] = useState(() => mergeSavedTasks(mockFarmTasks.map((task) => normalizeTask(task, true))));
  const [message, setMessage] = useState("");
  const [uploadingTaskId, setUploadingTaskId] = useState(null);

  useEffect(() => {
    getFarmerTasks(farmerId)
      .then((response) => {
        if (response.code === 200 && Array.isArray(response.data) && response.data.length > 0) {
          setTasks(mergeSavedTasks(response.data.map(normalizeTask)));
          setMessage("已读取后端农事任务。");
        }
      })
      .catch(() => {
        setMessage("后端农事任务接口暂时不可用，当前使用 mock 任务。");
      });
  }, [farmerId]);

  const completeTask = async (task, photoUrl = task.photoUrl || "/images/page_2.jpg") => {
    if (!task.demoOnly && Number.isInteger(Number(task.taskId || task.id)) && !String(task.id).startsWith("mock")) {
      try {
        await completeFarmTask(task.taskId || task.id, photoUrl, `${task.type || task.taskType}任务已完成。`);
      } catch {
        // 后端任务接口不可用时保留本地演示完成状态。
      }
    }

    const completedTask = {
      ...task,
      status: "已完成",
      syncTarget: "已同步到用户端溯源页面",
      photoUrl,
    };
    upsertDemoFarmTask(completedTask);
    setTasks((current) =>
      current.map((item) =>
        String(item.id) === String(task.id)
          ? completedTask
          : item,
      ),
    );
    const relatedOrder = findOrderForTask(task);
    const traceOrderId = relatedOrder?.orderId || task.orderId || `TASK-${task.id}`;
    const tracePlotNum = relatedOrder?.plotNum || task.plotNum;
    addDemoTraceRecord({
      orderId: traceOrderId,
      plotNum: tracePlotNum,
      actionName: task.type,
      actionDetail: `${task.type}任务已完成，农场主已同步到用户端溯源。`,
      imageUrl: photoUrl,
      operator: "农场主",
    });
    try {
      await addTraceabilityRecord(`TASK-${task.id}`, task.type, `${task.type}任务已完成。`, photoUrl);
    } catch {
      // 后端接口不可用时保留本地溯源记录。
    }
    setMessage("任务已完成，农事记录会同步到用户端溯源页面。");
  };

  const uploadTaskPhoto = (task, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const photoUrl = reader.result;
      const nextTask = {
        ...task,
        photoUrl,
        syncTarget: "照片已选择，可完成任务并同步到用户端溯源页面",
      };
      upsertDemoFarmTask(nextTask);
      setTasks((current) =>
        current.map((item) => (String(item.id) === String(task.id) ? nextTask : item)),
      );
      setUploadingTaskId(task.id);
      setMessage(`${task.plotNum} 的任务照片已上传到演示缓存，点击“完成任务”即可同步。`);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="section-panel">
      <h3>农事任务清单</h3>
      {message && <p className="status-pill">{message}</p>}
      <div className="grid-3">
        {tasks.map((task) => (
          <article className="info-card" key={task.id}>
            <span className="status-pill">{task.status}</span>
            <h3>{task.plotNum} · {task.type}</h3>
            {task.photoUrl && <img className="task-photo-preview" src={task.photoUrl} alt={`${task.plotNum} ${task.type}`} />}
            <p className="muted">计划日期：{task.dueDate}</p>
            <p className="muted">{task.syncTarget}</p>
            <div className="action-row">
              <button
                className="primary-btn"
                type="button"
                onClick={() => completeTask(task)}
                disabled={task.status === "已完成"}
              >
                完成任务
              </button>
              <label className="secondary-btn file-upload-button">
                上传照片
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => uploadTaskPhoto(task, event.target.files?.[0])}
                />
              </label>
            </div>
            {uploadingTaskId === task.id && <p className="muted">照片已选择，会随任务完成同步。</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function TraceUpload() {
  const adoptionOrders = getDemoAdoptions();
  const orderOptions = adoptionOrders.length > 0 ? adoptionOrders : mockFarmerOrders;
  const [selectedOrderId, setSelectedOrderId] = useState(orderOptions[0]?.orderId || "");
  const [selectedAction, setSelectedAction] = useState(traceActionTemplates[0].action);
  const [selectedImage, setSelectedImage] = useState(traceActionTemplates[0].image);
  const [detail, setDetail] = useState(traceActionTemplates[0].detail);
  const [message, setMessage] = useState("");
  const [records, setRecords] = useState(() => {
    const uploadedRecords = getDemoTraceRecords().map((record) => ({
      recordId: record.id || record.recordId,
      plotNum: record.plotNum,
      orderId: record.orderId,
      action: record.actionName || record.action,
      detail: record.actionDetail || record.detail,
      image: record.imageUrl || record.image,
      status: "已同步用户端",
    }));

    return [
      ...uploadedRecords,
      ...traceActionTemplates.map((item, index) => ({
      recordId: `seed-${index}`,
      plotNum: orderOptions[index % Math.max(orderOptions.length, 1)]?.plotNum || "A-01",
      orderId: orderOptions[index % Math.max(orderOptions.length, 1)]?.orderId || `MOCK-${index}`,
      action: item.action,
      detail: item.detail,
      image: item.image,
      status: index < 2 ? "已同步用户端" : "待上传",
      })),
    ];
  });
  const selectedOrder = orderOptions.find((order) => String(order.orderId) === String(selectedOrderId)) || orderOptions[0];

  const syncMaterial = async () => {
    if (!selectedOrder) return;
    const actionTemplate = traceActionTemplates.find((item) => item.action === selectedAction);
    const newRecord = {
      recordId: `local-${Date.now()}`,
      orderId: selectedOrder.orderId,
      plotNum: selectedOrder.plotNum,
      action: selectedAction,
      detail: detail || actionTemplate?.detail || "农事素材已上传。",
      image: selectedImage,
      status: "已同步用户端",
    };

    addDemoTraceRecord({
      orderId: selectedOrder.orderId,
      plotNum: selectedOrder.plotNum,
      actionName: selectedAction,
      actionDetail: newRecord.detail,
      imageUrl: selectedImage,
      operator: "农场主",
    });

    const numericOrderId = Number(selectedOrder.orderId);
    if (Number.isInteger(numericOrderId)) {
      try {
        await addTraceabilityRecord(numericOrderId, selectedAction, newRecord.detail, selectedImage);
      } catch {
        // 后端溯源接口失败时保留本地演示记录。
      }
    }

    setRecords((current) => [newRecord, ...current]);
    setMessage(`${selectedOrder.plotNum} · ${selectedAction} 已保存，会同步到用户端溯源查询。`);
  };

  const chooseTemplate = (action) => {
    const template = traceActionTemplates.find((item) => item.action === action);
    setSelectedAction(action);
    setDetail(template?.detail || "");
    setSelectedImage(template?.image || farmAssetImages[0]);
  };

  const uploadMaterialFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setMessage(`已选择文件：${file.name}。点击“保存并同步用户端”后会进入用户端溯源日记。`);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <section className="section-panel upload-workbench">
        <div>
          <h3>溯源素材上传</h3>
          <p className="muted">按订单上传浇水、施肥、除虫、检测、采收和打包照片，用户端溯源页面会按订单展示。</p>
        </div>
        {message && <p className="status-pill">{message}</p>}

        <div className="upload-form-grid">
          <label className="form-group">
            认养订单
            <select value={selectedOrderId} onChange={(event) => setSelectedOrderId(event.target.value)}>
              {orderOptions.map((order) => (
                <option key={order.orderId} value={order.orderId}>
                  {order.plotNum} · {order.crop || "认养作物"} · {order.userName || order.title || "认养用户"}
                </option>
              ))}
            </select>
          </label>
          <label className="form-group">
            农事类型
            <select value={selectedAction} onChange={(event) => chooseTemplate(event.target.value)}>
              {traceActionTemplates.map((item) => (
                <option key={item.action} value={item.action}>{item.action}</option>
              ))}
            </select>
          </label>
          <label className="form-group wide">
            操作说明
            <textarea value={detail} onChange={(event) => setDetail(event.target.value)} rows="3" />
          </label>
        </div>

        <div className="asset-picker">
          {farmAssetImages.map((image) => (
            <button
              className={`asset-thumb ${image === selectedImage ? "active" : ""}`}
              key={image}
              type="button"
              onClick={() => setSelectedImage(image)}
            >
              <img src={image} alt="农场素材" />
            </button>
          ))}
        </div>

        <label className="file-drop-zone">
          <strong>上传本地图片文件</strong>
          <span>支持手机/电脑本地照片，保存后会作为溯源实拍图展示给用户。</span>
          <input type="file" accept="image/*" onChange={(event) => uploadMaterialFile(event.target.files?.[0])} />
        </label>

        <div className="upload-preview">
          <img src={selectedImage} alt="当前选择素材" />
          <div>
            <span className="status-pill">{selectedOrder?.plotNum || "待选择"} · {selectedAction}</span>
            <h3>{selectedOrder?.crop || "认养作物"}农事记录</h3>
            <p className="muted">{detail}</p>
            <button className="primary-btn" type="button" onClick={syncMaterial}>保存并同步用户端</button>
          </div>
        </div>
      </section>

      <section className="section-panel">
        <h3>已同步素材</h3>
        <div className="grid-3">
          {records.map((record) => (
            <article className="business-card trace-upload-card" key={record.recordId}>
              <img src={record.image || farmAssetImages[0]} alt={record.action} />
              <div className="card-body">
                <span className="status-pill">{record.status}</span>
                <h3>{record.plotNum} · {record.action}</h3>
                <p className="muted">{record.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function RevenueAnalytics() {
  const maxValue = Math.max(...mockRevenue.monthly.map((item) => item.value));
  const demoOrders = getDemoAdoptions();
  const paymentNotices = getDemoPaymentNotices();
  const newPaymentRevenue = paymentNotices.reduce((total, notice) => total + Number(notice.amount || 0), 0);
  const orders = demoOrders.length > 0 ? demoOrders : mockFarmerOrders;
  const paidOrders = orders.filter((order) => order.paymentStatus === "已支付" || order.paymentStatus === "paid");
  const pendingOrders = orders.length - paidOrders.length;
  const totalRevenue = mockRevenue.monthRevenue + paidOrders.length * 399 + newPaymentRevenue;
  const plotRanking = orders.map((order, index) => ({
    plotNum: order.plotNum,
    crop: order.crop || "认养作物",
    revenue: 399 + index * 80,
    occupancy: Math.min(96, mockRevenue.rentedRate + index * 6),
    status: order.status || "进行中",
  }));

  return (
    <div>
      <section className="grid-4 revenue-grid">
        <div className="stat-card"><strong>累计认养收入</strong><p>¥{totalRevenue}</p></div>
        <div className="stat-card"><strong>新增扫码收入</strong><p>¥{newPaymentRevenue}</p></div>
        <div className="stat-card"><strong>新付款提醒</strong><p>{paymentNotices.length}</p></div>
        <div className="stat-card"><strong>待付款/待处理</strong><p>{pendingOrders + mockRevenue.pendingOrders}</p></div>
      </section>

      {paymentNotices.length > 0 && (
        <section className="section-panel">
          <div className="analytics-header">
            <div>
              <h3>付款到账提醒</h3>
              <p className="muted">用户扫码付款后会在这里形成农场主待确认提醒。当前为演示数据，后续应接真实支付回调。</p>
            </div>
            <span className="status-pill">{paymentNotices.length} 笔新付款</span>
          </div>
          <div className="payment-alert-list">
            {paymentNotices.map((notice) => (
              <article className="payment-alert-card" key={`revenue-${notice.id}`}>
                <span className="status-pill">{notice.status}</span>
                <strong>{notice.plotNum} · ¥{notice.amount}</strong>
                <p>{notice.title || notice.crop} 已付款，订单 {notice.orderId}</p>
                <small>{new Date(notice.paidAt).toLocaleString()}</small>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="section-panel">
        <div className="analytics-header">
          <div>
            <h3>月度营收趋势</h3>
            <p className="muted">第一阶段用 mock 收益曲线，后续接真实支付流水和订单统计。</p>
          </div>
          <span className="status-pill">出租率 {mockRevenue.rentedRate}%</span>
        </div>
        <div className="analytics-layout">
          <div className="chart-row">
            {mockRevenue.monthly.map((item) => (
              <div className="chart-bar" key={item.month}>
                <span style={{ height: `${Math.max((item.value / maxValue) * 180, 28)}px` }} />
                <strong>{item.month}</strong>
                <small>¥{item.value}</small>
              </div>
            ))}
          </div>
          <div className="analysis-side">
            <div>
              <strong>地块出租率</strong>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${mockRevenue.rentedRate}%` }} /></div>
              <p className="muted">已认养地块占全部可经营地块的比例。</p>
            </div>
            <div>
              <strong>付款转化率</strong>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.round((paidOrders.length / Math.max(orders.length, 1)) * 100)}%` }} />
              </div>
              <p className="muted">付款接口已接入演示，后续接真实支付回调。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-panel">
        <h3>地块收益排行</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>地块</th>
                <th>作物</th>
                <th>状态</th>
                <th>出租率</th>
                <th>预计收入</th>
              </tr>
            </thead>
            <tbody>
              {plotRanking.map((item) => (
                <tr key={item.plotNum}>
                  <td>{item.plotNum}</td>
                  <td>{item.crop}</td>
                  <td>{item.status}</td>
                  <td>{item.occupancy}%</td>
                  <td>¥{item.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function RevenueAnalyticsV2() {
  const demoOrders = getDemoAdoptions();
  const paymentNotices = getDemoPaymentNotices();
  const orders = demoOrders.length > 0 ? demoOrders : mockFarmerOrders;
  const paidOrderIds = new Set(paymentNotices.map((notice) => String(notice.orderId)));
  const paidOrders = orders.filter((order) =>
    paidOrderIds.has(String(order.orderId)) ||
    order.paymentStatus === "已支付" ||
    order.paymentStatus === "paid",
  );
  const pendingOrders = Math.max(orders.length - paidOrders.length, 0);
  const noticeRevenue = paymentNotices.reduce((total, notice) => total + Number(notice.amount || 0), 0);
  const confirmedRevenue = paidOrders.reduce((total, order) => {
    const notice = paymentNotices.find((item) => String(item.orderId) === String(order.orderId));
    return total + Number(notice?.amount || order.paymentAmount || 399);
  }, 0);
  const totalRevenue = mockRevenue.monthRevenue + confirmedRevenue + noticeRevenue;
  const conversionRate = Math.round((paidOrders.length / Math.max(orders.length, 1)) * 100);
  const rentedRate = Math.min(100, mockRevenue.rentedRate + Math.round((orders.length / 10) * 8));
  const monthlyRevenue = mockRevenue.monthly.map((item, index, list) => ({
    ...item,
    value: index === list.length - 1 ? item.value + noticeRevenue : item.value,
  }));
  const maxValue = Math.max(...monthlyRevenue.map((item) => item.value));
  const revenueSources = [
    { label: "基础认养费", value: mockRevenue.monthRevenue },
    { label: "扫码付款", value: noticeRevenue },
    { label: "已确认订单", value: confirmedRevenue },
  ];
  const plotRanking = orders.map((order, index) => {
    const notice = paymentNotices.find((item) => String(item.orderId) === String(order.orderId));
    const paid = Boolean(notice) || order.paymentStatus === "已支付" || order.paymentStatus === "paid";
    return {
      plotNum: order.plotNum,
      orderId: order.orderId,
      crop: order.crop || "认养作物",
      status: paid ? "已付款履约中" : "待付款",
      occupancy: Math.min(96, mockRevenue.rentedRate + index * 6),
      revenue: paid ? Number(notice?.amount || order.paymentAmount || 399) : 0,
    };
  });

  return (
    <div className="revenue-dashboard">
      <section className="grid-4 revenue-grid">
        <div className="stat-card"><strong>累计认养收入</strong><p>¥{totalRevenue}</p></div>
        <div className="stat-card"><strong>本月新增到账</strong><p>¥{noticeRevenue}</p></div>
        <div className="stat-card"><strong>付款转化率</strong><p>{conversionRate}%</p></div>
        <div className="stat-card"><strong>待处理订单</strong><p>{pendingOrders + mockRevenue.pendingOrders}</p></div>
      </section>

      <section className="section-panel revenue-command-panel">
        <div className="analytics-header">
          <div>
            <h3>经营数据看板</h3>
            <p className="muted">当前用本地订单、扫码付款提醒和 mock 基础营收合成报表。后续接真实支付流水后，应直接读取后端统计接口。</p>
          </div>
          <span className="status-pill">地块出租率 {rentedRate}%</span>
        </div>
        <div className="revenue-command-grid">
          <div className="revenue-breakdown">
            <h3>收入构成</h3>
            {revenueSources.map((source) => (
              <div className="revenue-source-row" key={source.label}>
                <span>{source.label}</span>
                <strong>¥{source.value}</strong>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, Math.round((source.value / Math.max(totalRevenue, 1)) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="order-funnel">
            <h3>订单转化</h3>
            <div className="funnel-step"><strong>{orders.length}</strong><span>认养订单</span></div>
            <div className="funnel-step"><strong>{paidOrders.length}</strong><span>已付款</span></div>
            <div className="funnel-step"><strong>{pendingOrders}</strong><span>待付款</span></div>
          </div>
          <div className="revenue-next-api">
            <h3>后续真实接口</h3>
            <p>支付流水、退款记录、订单状态、地块出租率、月度营收聚合。</p>
          </div>
        </div>
      </section>

      {paymentNotices.length > 0 && (
        <section className="section-panel">
          <div className="analytics-header">
            <div>
              <h3>付款到账提醒</h3>
              <p className="muted">用户扫码付款后生成待确认提醒。真实项目里应由支付回调自动更新，不应依赖用户点击确认。</p>
            </div>
            <span className="status-pill">{paymentNotices.length} 笔新付款</span>
          </div>
          <div className="payment-alert-list">
            {paymentNotices.map((notice) => (
              <article className="payment-alert-card" key={`revenue-${notice.id}`}>
                <span className="status-pill">{notice.status}</span>
                <strong>{notice.plotNum} · ¥{notice.amount}</strong>
                <p>{notice.title || notice.crop} 已付款，订单 {notice.orderId}</p>
                <small>{new Date(notice.paidAt).toLocaleString()}</small>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="section-panel">
        <div className="analytics-header">
          <div>
            <h3>月度营收趋势</h3>
            <p className="muted">最后一个月份会叠加当前演示扫码收入，用于展示付款对营收曲线的影响。</p>
          </div>
          <span className="status-pill">模拟经营数据</span>
        </div>
        <div className="analytics-layout">
          <div className="chart-row">
            {monthlyRevenue.map((item) => (
              <div className="chart-bar" key={item.month}>
                <span style={{ height: `${Math.max((item.value / maxValue) * 180, 28)}px` }} />
                <strong>{item.month}</strong>
                <small>¥{item.value}</small>
              </div>
            ))}
          </div>
          <div className="analysis-side">
            <div>
              <strong>地块出租率</strong>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${rentedRate}%` }} /></div>
              <p className="muted">按当前认养订单数量和 mock 基础出租率估算。</p>
            </div>
            <div>
              <strong>付款转化率</strong>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${conversionRate}%` }} /></div>
              <p className="muted">已付款订单 / 当前认养订单。真实版本应由后端订单统计给出。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-panel">
        <h3>地块收益排行</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>地块</th>
                <th>订单</th>
                <th>作物</th>
                <th>状态</th>
                <th>出租率</th>
                <th>已确认收入</th>
              </tr>
            </thead>
            <tbody>
              {plotRanking.map((item) => (
                <tr key={`${item.plotNum}-${item.orderId}`}>
                  <td>{item.plotNum}</td>
                  <td>{item.orderId}</td>
                  <td>{item.crop}</td>
                  <td>{item.status}</td>
                  <td>{item.occupancy}%</td>
                  <td>¥{item.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FarmerDashboard({ user, activeSection = "farmer-dashboard", onSectionChange }) {
  const farmId = user?.farmId || 1;
  const [plots, setPlots] = useState(mockPlots.map(normalizePlot));
  const [stats, setStats] = useState(null);
  const [sourceMessage, setSourceMessage] = useState("");

  const loadDashboardData = useCallback(() => {
    Promise.allSettled([getFarmOverviewStats(), getPlotsByFarm(farmId)]).then(([statsResult, plotsResult]) => {
      if (statsResult.status === "fulfilled" && statsResult.value.code === 200) {
        setStats(statsResult.value.data);
      }

      if (
        plotsResult.status === "fulfilled" &&
        plotsResult.value.code === 200 &&
        Array.isArray(plotsResult.value.data) &&
        plotsResult.value.data.length > 0
      ) {
        setPlots(plotsResult.value.data.map(normalizePlot));
        setSourceMessage("地块和统计数据已优先从后端接口读取。");
      } else {
        setSourceMessage("后端地块数据为空或不可用，当前使用 mock 数据兜底展示。");
      }
    });
  }, [farmId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const renderSection = () => {
    if (activeSection === "farmer-dashboard") {
      return <DashboardHome plots={plots} stats={stats} onSectionChange={onSectionChange} />;
    }
    if (activeSection === "farmer-plots") {
      return <PlotManagement farmId={farmId} plots={plots} onCreated={loadDashboardData} />;
    }
    if (activeSection === "farmer-orders") return <OrderManagement />;
    if (activeSection === "farmer-chat") return <FarmerChatCenter />;
    if (activeSection === "farmer-tasks") return <FarmTasks farmerId={user?.userId || 1} />;
    if (activeSection === "farmer-trace") return <TraceUpload />;
    if (activeSection === "farmer-analytics") return <RevenueAnalyticsV2 />;
    return <DashboardHome plots={plots} stats={stats} onSectionChange={onSectionChange} />;
  };

  return (
    <div>
      {sourceMessage && <p className="status-pill">{sourceMessage}</p>}
      {renderSection()}
    </div>
  );
}

export default FarmerDashboard;
