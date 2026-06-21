// api/api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// ========== 【认证 & 用户 API】==========

// 1️⃣ 用户登录
export const login = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    return response.json();
};

// 2️⃣ 用户注册
export const register = async (username, password, realName, role) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, realName, role })
    });
    return response.json();
};

// 3️⃣ 获取用户信息
export const getUserInfo = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`);
    return response.json();
};

// 4️⃣ 更新用户信息
export const updateUserInfo = async (userId, realName, phone, email) => {
    const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ realName, phone, email })
    });
    return response.json();
};


// ========== 【地块 API】==========

// 5️⃣ 获取所有待认养地块
export const getAvailablePlots = async () => {
    const response = await fetch(`${API_BASE_URL}/plot/available`);
    return response.json();
};

// 6️⃣ 获取推荐地块 (基础)
export const getRecommendedPlots = async () => {
    const response = await fetch(`${API_BASE_URL}/plot/recommended`);
    return response.json();
};

// 7️⃣ 获取地块详情
export const getPlotDetail = async (plotId) => {
    const response = await fetch(`${API_BASE_URL}/plot/${plotId}`);
    return response.json();
};

// 8️⃣ 创建地块（农场主功能）
export const createPlot = async (farmId, plotNum, area, soilType, sunlightHours) => {
    const params = new URLSearchParams({
        farmId,
        plotNum,
        area,
        soilType,
        sunlightHours
    });
    const response = await fetch(`${API_BASE_URL}/plot/create?${params.toString()}`, {
        method: 'POST',
    });
    return response.json();
};

// 9️⃣ 获取农场的地块列表
export const getPlotsByFarm = async (farmId) => {
    const response = await fetch(`${API_BASE_URL}/plot/farm/${farmId}`);
    return response.json();
};

// 🔟 获取农场的待认养地块
export const getAvailablePlotsByFarm = async (farmId) => {
    const response = await fetch(`${API_BASE_URL}/plot/farm/${farmId}/available`);
    return response.json();
};


// ========== 【作物 API】==========

// 1️⃣1️⃣ 获取所有作物
export const getAllCrops = async () => {
    const response = await fetch(`${API_BASE_URL}/crop/all`);
    return response.json();
};

// 1️⃣2️⃣ 按分类获取作物
export const getCropsByCategory = async (category) => {
    const response = await fetch(`${API_BASE_URL}/crop/category/${category}`);
    return response.json();
};

// 1️⃣3️⃣ 获取新手友好作物
export const getBeginnerFriendlyCrops = async () => {
    const response = await fetch(`${API_BASE_URL}/crop/beginner-friendly`);
    return response.json();
};


// ========== 【认养订单 API】==========

// 1️⃣4️⃣ 用户认养地块
export const adoptPlot = async (userId, plotId, cropId, durationMonths) => {
    const response = await fetch(`${API_BASE_URL}/adoption/adopt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plotId, cropId, durationMonths })
    });
    return response.json();
};

// 1️⃣5️⃣ 获取用户活跃订单
export const getUserActiveOrders = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/adoption/active/${userId}`);
    return response.json();
};

// 1️⃣6️⃣ 获取用户历史订单
export const getUserHistoryOrders = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/adoption/history/${userId}`);
    return response.json();
};

// 1️⃣7️⃣ 取消认养
export const cancelAdoption = async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/adoption/cancel/${orderId}`, {
        method: 'POST'
    });
    return response.json();
};

// 1️⃣8️⃣ 获取订单详情
export const getOrderDetail = async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/adoption/order/${orderId}`);
    return response.json();
};

// 1️⃣9️⃣ 完成认养
export const completeAdoption = async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/adoption/complete/${orderId}`, {
        method: 'POST'
    });
    return response.json();
};


// ========== 【高级个性化推荐 API】==========

// 2️⃣0️⃣ 获取推荐地块（个性化定制）
export const getPersonalizedRecommendation = async (userId, limit = 5, cropId = null) => {
    let url = `${API_BASE_URL}/recommendation/personalized/${userId}?limit=${limit}`;
    if (cropId) url += `&targetCropId=${cropId}`;
    const response = await fetch(url);
    return response.json();
};

// 2️⃣1️⃣ 按经验等级推荐地块
export const getRecommendationByLevel = async (level, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/recommendation/by-level/${level}?limit=${limit}`);
    return response.json();
};

// 2️⃣2️⃣ 获取热门趋势地块
export const getTrendingPlots = async (limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/recommendation/trending?limit=${limit}`);
    return response.json();
};


// ========== 【数据溯源 API】==========

// 2️⃣3️⃣ 获取订单溯源记录
export const getOrderTraceability = async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/traceability/order/${orderId}`);
    return response.json();
};

// 2️⃣4️⃣ 添加溯源记录
export const addTraceabilityRecord = async (orderId, actionName, actionDetail, imageUrl) => {
    const response = await fetch(`${API_BASE_URL}/traceability/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, actionName, actionDetail, imageUrl })
    });
    return response.json();
};


// ========== 【AI 智能交互 API】==========

// 2️⃣5️⃣ 获取种植建议
export const getPlantingAdvice = async (cropId, soilType, sunlightHours) => {
    const response = await fetch(`${API_BASE_URL}/ai/planting-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropId, soilType, sunlightHours })
    });
    return response.json();
};

// 2️⃣6️⃣ 获取生长预测
export const getGrowthPrediction = async (cropId, daysGrown) => {
    const response = await fetch(`${API_BASE_URL}/ai/growth-prediction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropId, daysGrown })
    });
    return response.json();
};

// 2️⃣7️⃣ 获取防病防虫建议
export const getPestPrevention = async (cropId, season) => {
    const response = await fetch(`${API_BASE_URL}/ai/pest-prevention`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropId, season })
    });
    return response.json();
};

// 2️⃣8️⃣ AI 实时聊天对话
export const chatWithAi = async (userId, message) => {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message })
    });
    return response.json();
};

// 2️⃣9️⃣ 获取综合分析建议
export const getComprehensiveRecommendation = async (cropId, soilType, sunlightHours, daysGrown, season) => {
    const response = await fetch(`${API_BASE_URL}/ai/recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropId, soilType, sunlightHours, daysGrown, season })
    });
    return response.json();
};

// 3️⃣0️⃣ 获取聊天历史记录
export const getChatHistory = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/ai/chat-history/${userId}`);
    return response.json();
};


// ========== 【大数据分析统计 API】==========

// 3️⃣1️⃣ 获取农场总体概览统计
export const getFarmOverviewStats = async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/farm-overview`);
    return response.json();
};

// 3️⃣2️⃣ 获取用户行为深度分析
export const getUserBehaviorAnalysis = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/analytics/user-behavior/${userId}`);
    return response.json();
};

// 3️⃣3️⃣ 获取作物流行度排行榜
export const getCropPopularityRanking = async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/crop-popularity`);
    return response.json();
};

// 3️⃣4️⃣ 获取用户历史收益预测
export const getUserRevenue = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/analytics/user-revenue/${userId}`);
    return response.json();
};

// 3️⃣5️⃣ 获取农场认养趋势数据
export const getAdoptionTrends = async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/adoption-trends`);
    return response.json();
};

// 3️⃣6️⃣ 获取农场土壤类型分布
export const getSoilDistribution = async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/soil-distribution`);
    return response.json();
};

// 3️⃣7️⃣ 获取农场日照条件分布
export const getSunlightDistribution = async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/sunlight-distribution`);
    return response.json();
};

// 3️⃣8️⃣ 获取全局溯源操作统计
export const getTraceabilityStats = async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/traceability-stats`);
    return response.json();
};

// 3️⃣9️⃣ 获取用户的个人月度农场报告
export const getMonthlyReport = async (userId, month, year) => {
    const response = await fetch(
        `${API_BASE_URL}/analytics/monthly-report/${userId}?month=${month}&year=${year}`
    );
    return response.json();
};


// ========== 【付款 API】==========

export const payOrder = async (orderId, userId, amount = 0, paymentMethod = 'demo') => {
    const response = await fetch(`${API_BASE_URL}/payment/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, userId, amount, paymentMethod })
    });
    return response.json();
};

export const getOrderPayment = async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/payment/order/${orderId}`);
    return response.json();
};


// ========== 【用户与农场主人工沟通 API】==========

export const sendFarmChatMessage = async ({ plotId, orderId, userId, farmerId, senderRole, content }) => {
    const response = await fetch(`${API_BASE_URL}/farm-chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plotId, orderId, userId, farmerId, senderRole, content })
    });
    return response.json();
};

export const getPlotChatMessages = async (plotId) => {
    const response = await fetch(`${API_BASE_URL}/farm-chat/plot/${plotId}`);
    return response.json();
};

export const markFarmChatRead = async (plotId, viewerRole) => {
    const response = await fetch(`${API_BASE_URL}/farm-chat/read/${plotId}?viewerRole=${viewerRole}`, {
        method: 'POST'
    });
    return response.json();
};


// ========== 【农事任务 API】==========

export const createFarmTask = async ({ plotId, orderId, farmerId, taskType, dueDate, note }) => {
    const response = await fetch(`${API_BASE_URL}/farm-task/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plotId, orderId, farmerId, taskType, dueDate, note })
    });
    return response.json();
};

export const getFarmerTasks = async (farmerId) => {
    const response = await fetch(`${API_BASE_URL}/farm-task/farmer/${farmerId}`);
    return response.json();
};

export const completeFarmTask = async (taskId, photoUrl = '', note = '') => {
    const params = new URLSearchParams({ photoUrl, note });
    const response = await fetch(`${API_BASE_URL}/farm-task/complete/${taskId}?${params.toString()}`, {
        method: 'POST'
    });
    return response.json();
};


// ========== 【用户评价 API】==========

export const submitReview = async ({ userId, userName, orderId, traceCode, plotNum, farmName, crop, rating, content }) => {
    const response = await fetch(`${API_BASE_URL}/review/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName, orderId, traceCode, plotNum, farmName, crop, rating, content })
    });
    return response.json();
};

export const getLatestReviews = async () => {
    const response = await fetch(`${API_BASE_URL}/review/latest`);
    return response.json();
};

export const getTraceReviews = async (traceCode) => {
    const response = await fetch(`${API_BASE_URL}/review/trace/${encodeURIComponent(traceCode)}`);
    return response.json();
};
