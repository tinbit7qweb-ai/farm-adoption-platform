import React, { useEffect, useMemo, useState } from "react";
import { getPlotChatMessages, getRecommendedPlots, markFarmChatRead, sendFarmChatMessage } from "../api/api";
import { mockConversations, mockPlots } from "../mock/farmPlatformData";
import {
  appendDemoMessage,
  ensureDemoConversation,
  getDemoConversations,
  markDemoConversationRead,
  saveDemoConversations,
} from "../utils/demoState";

const unknownFarmer = {
  farmerId: null,
  farmerName: "待确认农户",
  farmerPhone: "待补充",
  farmName: "认养农场",
};

const chatFarmImages = [
  "/images/farm-assets/Camera_1040g3k831uchle751m005pm7vh27e0r08s3s72o.jpg",
  "/images/farm-assets/Camera_1040g0k031joppvluig1g5pch89coiqnt35oh0g0.jpg",
  "/images/farm-assets/Camera_XHS_17819447720491040g00831rn6cljiig0g5o6h.jpg",
  "/images/farm-assets/Camera_XHS_17819448317211040g008319h6jbcd6u005nnb.jpg",
];

function getChatImage(conversation) {
  const raw = Number(conversation.plotId || String(conversation.plotNum || "").replace(/\D/g, "") || 1);
  return chatFarmImages[Math.abs(raw - 1) % chatFarmImages.length];
}

function isGenericFarmerName(name) {
  return !name || name === "农场主" || name === "农户" || name === "未知农户";
}

function seedConversations() {
  return mockConversations.map((conversation) => ({
    ...conversation,
    ...getPlotIdentity(conversation),
    unreadForUser: conversation.unread || 0,
    unreadForFarmer: 0,
  }));
}

function getPlotIdentity(conversation) {
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

function hydrateConversations(conversations) {
  return conversations.map((conversation) => ({
    ...conversation,
    ...getPlotIdentity(conversation),
    name: getPlotIdentity(conversation).farmerName || conversation.name,
  }));
}

function UserChatPage({ user, initialTarget }) {
  const initialConversations = hydrateConversations(getDemoConversations(seedConversations()));
  saveDemoConversations(initialConversations);
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0]?.id);
  const [draft, setDraft] = useState("");

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
    if (!initialTarget?.plotNum) return;

    const conversation = ensureDemoConversation(initialTarget);
    setConversations(markDemoConversationRead(conversation.id, "user"));
    setActiveId(conversation.id);
  }, [initialTarget]);

  useEffect(() => {
    if (!activeId) return;
    setConversations(markDemoConversationRead(activeId, "user"));
  }, [activeId]);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeId) || conversations[0],
    [activeId, conversations],
  );

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
        markFarmChatRead(Number(activeConversation.plotId), "user").catch(() => {});
      })
      .catch(() => {});
  }, [activeConversation?.id, activeConversation?.plotId]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !activeConversation) return;

    if (Number.isInteger(Number(activeConversation.plotId)) && Number.isInteger(Number(activeConversation.farmerId))) {
      try {
        await sendFarmChatMessage({
          plotId: Number(activeConversation.plotId),
          orderId: Number.isInteger(Number(activeConversation.orderId)) ? Number(activeConversation.orderId) : null,
          userId: user?.userId || 1,
          farmerId: Number(activeConversation.farmerId),
          senderRole: "user",
          content: text,
        });
      } catch {
        // 后端人工聊天不可用时，继续使用本地共享会话。
      }
    }

    setConversations(appendDemoMessage(activeConversation.id, { from: "user", text, time: "刚刚" }, "user"));
    setDraft("");
  };

  return (
    <div className="chat-layout">
      <aside className="conversation-list">
        {conversations.map((conversation) => (
          <button
            type="button"
            key={conversation.id}
            className={`conversation-item ${activeId === conversation.id ? "active" : ""}`}
            onClick={() => setActiveId(conversation.id)}
          >
            <div className="conversation-card-head">
              <img src={getChatImage(conversation)} alt={conversation.farmName || "认养农场"} />
              <div>
                <strong>{conversation.farmerName || conversation.name}</strong>
                <p className="muted">{conversation.farmName || "认养农场"} · 地块 {conversation.plotNum}</p>
              </div>
            </div>
            <p className="muted">联系电话：{conversation.farmerPhone || "待补充"}</p>
            <p className="conversation-last">{conversation.lastMessage}</p>
            {conversation.unreadForUser > 0 && <span className="status-pill">{conversation.unreadForUser} 条未读</span>}
          </button>
        ))}
      </aside>

      <section className="chat-window">
        <div className="chat-title">
          <div className="chat-farmer-card">
            <img src={getChatImage(activeConversation)} alt={activeConversation.farmName || "认养农场"} />
            <div>
              <span className="status-pill">正在沟通</span>
              <h3>{activeConversation.farmerName || activeConversation.name}</h3>
              <p className="muted">
                {activeConversation.farmName || "认养农场"} · 地块 {activeConversation.plotNum}
                {activeConversation.farmerPhone ? ` · ${activeConversation.farmerPhone}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="message-list">
          {activeConversation.messages.map((message, index) => (
            <div className={`message-bubble ${message.from}`} key={`${message.time}-${index}`}>
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
              if (event.key === "Enter") sendMessage();
            }}
            placeholder="输入消息发给农户..."
          />
          <button className="primary-btn" type="button" onClick={sendMessage}>
            发送
          </button>
        </div>
      </section>
    </div>
  );
}

export default UserChatPage;
