import React, { useEffect, useMemo, useState } from "react";
import { chatWithAi, getChatHistory } from "../api/api";

const userQuickQuestions = [
  "我的番茄地今天需要浇水吗？",
  "新手适合认养哪类作物？",
  "怎么判断生菜快要采收？",
  "认养地块采收后多久发货？",
];

const farmerQuickQuestions = [
  "给 A-01 地块生成一周农事计划",
  "番茄叶片发黄怎么处理？",
  "批量安排今天的浇水任务",
  "生成一条可同步到溯源页的施肥记录",
];

const userPanels = [
  ["养护建议", "结合地块、天气和作物阶段，解释浇水、施肥、采收注意事项。"],
  ["订单协助", "说明付款、物流、溯源报告和联系农场主的下一步操作。"],
  ["种植问答", "用用户能理解的方式回答作物生长问题。"],
];

const farmerPanels = [
  ["任务编排", "把浇水、施肥、除虫、检测拆成可执行任务。"],
  ["病虫害建议", "给出排查顺序、处理方式和上传素材建议。"],
  ["溯源文案", "生成可同步给用户看的农事记录说明。"],
];

function buildMockReply(question, isFarmer) {
  if (isFarmer) {
    return `农场主建议：针对“${question}”，先检查土壤湿度、作物阶段和天气预报，再安排浇水、施肥、除虫和拍照上传任务。建议同步一张现场照片到溯源页。`;
  }

  return `认养用户建议：关于“${question}”，建议先查看最新农事记录，再联系农户确认当天浇水、施肥、采收或配送安排。当前演示会优先请求后端 AI，失败时使用本地 mock 回复。`;
}

function buildQuestion(content, isFarmer) {
  if (!isFarmer) return content;
  return `你现在以农场主农事助手身份回答。请围绕农场认养平台、地块管理、浇水施肥、病虫害处理、溯源素材上传给出建议。问题：${content}`;
}

function AiPage({ user, role = "user" }) {
  const isFarmer = role === "farmer";
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("后端 AI 优先");
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: isFarmer
        ? "我是农场主 AI 农事助手。可以生成任务计划、病虫害处理建议和可同步到溯源页的记录文案。"
        : "我是认养用户 AI 助手。可以回答地块养护、采收、物流和溯源相关问题。",
    },
  ]);

  const quickQuestions = isFarmer ? farmerQuickQuestions : userQuickQuestions;
  const panels = isFarmer ? farmerPanels : userPanels;
  const lastAiMessage = useMemo(
    () => [...messages].reverse().find((message) => message.from === "ai")?.text,
    [messages],
  );

  useEffect(() => {
    if (!user?.userId) return;

    getChatHistory(user.userId)
      .then((response) => {
        if (response.code !== 200 || !Array.isArray(response.data) || response.data.length === 0) return;

        const history = response.data
          .slice(0, 5)
          .reverse()
          .flatMap((item) => [
            { from: "user", text: item.messageText },
            { from: "ai", text: item.aiResponse },
          ])
          .filter((item) => item.text);

        setMessages((current) => [...current, ...history]);
      })
      .catch(() => {
        setSource("本地 mock 兜底");
      });
  }, [user?.userId]);

  const sendQuestion = async (text = question) => {
    const content = text.trim();
    if (!content || loading) return;

    setMessages((current) => [...current, { from: "user", text: content }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await chatWithAi(user.userId, buildQuestion(content, isFarmer));
      const aiText = response?.data?.aiResponse || response?.message || buildMockReply(content, isFarmer);
      setSource(response?.data?.aiResponse ? "后端 AI 返回" : "接口返回兜底文本");
      setMessages((current) => [...current, { from: "ai", text: aiText }]);
    } catch (error) {
      setSource("本地 mock 兜底");
      setMessages((current) => [...current, { from: "ai", text: buildMockReply(content, isFarmer) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-workspace">
      <section className="ai-hero">
        <div>
          <span className="status-pill">{isFarmer ? "农场主专用" : "普通用户专用"} · {source}</span>
          <h3>{isFarmer ? "AI 农事助手" : "AI 种植问答"}</h3>
          <p>
            {isFarmer
              ? "用于把农事经验转成可执行任务，并生成可给用户查看的溯源说明。"
              : "用于解释认养地块的生长、养护、采收、物流和溯源问题。"}
          </p>
        </div>
        <div className="ai-answer-preview">
          <strong>最近回复</strong>
          <p>{lastAiMessage}</p>
        </div>
      </section>

      <section className="ai-panel-grid">
        {panels.map(([title, text]) => (
          <article className="ai-capability-card" key={title}>
            <strong>{title}</strong>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="ai-chat-shell">
        <aside className="ai-quick-panel">
          <h3>快捷问题</h3>
          {quickQuestions.map((item) => (
            <button className="secondary-btn" type="button" key={item} onClick={() => sendQuestion(item)}>
              {item}
            </button>
          ))}
        </aside>

        <div className="ai-chat-panel">
          <div className="message-list">
            {messages.map((message, index) => (
              <div className={`message-bubble ${message.from}`} key={`${message.from}-${index}`}>
                {message.text}
              </div>
            ))}
            {loading && <div className="message-bubble ai">正在请求 AI 助手...</div>}
          </div>
          <div className="chat-input">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={isFarmer ? "输入农事管理问题..." : "输入种植或认养问题..."}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendQuestion();
                }
              }}
            />
            <button className="primary-btn" type="button" onClick={() => sendQuestion()} disabled={loading}>
              提问
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AiPage;
