import React, { useState, useEffect } from 'react';
import {
  getFarmOverviewStats,
  getUserBehaviorAnalysis,
  getCropPopularityRanking,
  getUserRevenue,
  getAdoptionTrends
} from '../api/api';
import '../styles/analytics.css';

function AnalyticsPage({ user }) {
  const [farmStats, setFarmStats] = useState(null);
  const [userBehavior, setUserBehavior] = useState(null);
  const [cropRanking, setCropRanking] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // 加载农场概览
      const farmResponse = await fetch('http://localhost:8080/api/analytics/farm-overview');
      const farmData = await farmResponse.json();
      if (farmData.code === 200) setFarmStats(farmData.data);

      // 加载用户行为
      const behaviorResponse = await fetch(
        `http://localhost:8080/api/analytics/user-behavior/${user.userId}`
      );
      const behaviorData = await behaviorResponse.json();
      if (behaviorData.code === 200) setUserBehavior(behaviorData.data);

      // 加载作物排行
      const cropResponse = await fetch('http://localhost:8080/api/analytics/crop-popularity');
      const cropData = await cropResponse.json();
      if (cropData.code === 200) setCropRanking(cropData.data.slice(0, 5));

      // 加载收益预测
      const revenueResponse = await fetch(
        `http://localhost:8080/api/analytics/user-revenue/${user.userId}`
      );
      const revenueData = await revenueResponse.json();
      if (revenueData.code === 200) setRevenue(revenueData.data);

      setLoading(false);
    } catch (err) {
      console.error('加载分析数据失败:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container">加载数据中...</div>;
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>📊 数据分析仪表板</h2>
        <p>查看你的农场经营数据和统计分析</p>
      </div>

      {/* 第一行：农场概览 */}
      {farmStats && (
        <div className="stats-grid">
          <div className="stat-card large gradient-1">
            <div className="card-icon">🌾</div>
            <div className="card-info">
              <h3>总地块数</h3>
              <p className="card-value">{farmStats.totalPlots}</p>
              <p className="card-label">个地块</p>
            </div>
          </div>

          <div className="stat-card large gradient-2">
            <div className="card-icon">🌱</div>
            <div className="card-info">
              <h3>可认养地块</h3>
              <p className="card-value">{farmStats.availablePlots}</p>
              <p className="card-label">个地块</p>
            </div>
          </div>

          <div className="stat-card large gradient-3">
            <div className="card-icon">🚜</div>
            <div className="card-info">
              <h3>认养中地块</h3>
              <p className="card-value">{farmStats.activeAdoptions}</p>
              <p className="card-label">个地块</p>
            </div>
          </div>

          <div className="stat-card large gradient-4">
            <div className="card-icon">✅</div>
            <div className="card-info">
              <h3>认养率</h3>
              <p className="card-value">{farmStats.adoptionRate}%</p>
              <p className="card-label">完成度</p>
            </div>
          </div>
        </div>
      )}

      <div className="analytics-content">
        {/* 左侧：用户数据 */}
        <div className="analytics-column">
          {userBehavior && (
            <div className="analytics-card">
              <h3>👤 你的农场档案</h3>
              <div className="profile-stats">
                <div className="profile-item">
                  <span className="label">经验等级</span>
                  <span className={`badge ${userBehavior.experienceLevel}`}>
                    {userBehavior.experienceLevel}
                  </span>
                </div>
                <div className="profile-item">
                  <span className="label">总认养数</span>
                  <span className="value">{userBehavior.totalAdoptions}</span>
                </div>
                <div className="profile-item">
                  <span className="label">活跃认养</span>
                  <span className="value">{userBehavior.activeAdoptions}</span>
                </div>
                <div className="profile-item">
                  <span className="label">已完成</span>
                  <span className="value">{userBehavior.completedAdoptions}</span>
                </div>
                <div className="profile-item">
                  <span className="label">平均周期</span>
                  <span className="value">{userBehavior.averageAdoptionDays} 天</span>
                </div>
              </div>

              {/* 作物偏好 */}
              <div className="crop-preferences">
                <h4>🌾 作物偏好</h4>
                {Object.entries(userBehavior.cropPreferences).length > 0 ? (
                  <div className="preferences-list">
                    {Object.entries(userBehavior.cropPreferences).map(([crop, count]) => (
                      <div key={crop} className="preference-item">
                        <span className="crop-name">{crop}</span>
                        <div className="preference-bar">
                          <div
                            className="preference-fill"
                            style={{ width: `${(count / Math.max(...Object.values(userBehavior.cropPreferences))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="count">{count}次</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>暂无数据</p>
                )}
              </div>
            </div>
          )}

          {revenue && (
            <div className="analytics-card">
              <h3>💰 收益预测</h3>
              <div className="revenue-info">
                <div className="revenue-item">
                  <span className="label">预计总收益</span>
                  <span className="value">{revenue.estimatedRevenue}元</span>
                </div>
                <div className="revenue-item">
                  <span className="label">平均单位收益</span>
                  <span className="value">{revenue.averagePerAdoption}元/地块</span>
                </div>
                <div className="revenue-item">
                  <span className="label">下月预测</span>
                  <span className="value">{revenue.nextMonthPrediction}元</span>
                </div>
              </div>

              <div className="revenue-chart">
                <div className="chart-bar">
                  <div className="bar-label">预计收益</div>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{ width: `${Math.min((revenue.estimatedRevenue / 10000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="bar-value">{revenue.estimatedRevenue}元</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：排行数据 */}
        <div className="analytics-column">
          <div className="analytics-card">
            <h3>🏆 热门作物排行</h3>
            {cropRanking.length > 0 ? (
              <div className="ranking-list">
                {cropRanking.map((crop, idx) => (
                  <div key={idx} className="ranking-item">
                    <div className="rank-badge">#{idx + 1}</div>
                    <div className="rank-info">
                      <h4>{crop.cropName}</h4>
                      <p className="rank-category">
                        {crop.category} · {crop.growthDays}天
                      </p>
                    </div>
                    <div className="rank-bar">
                      <div
                        className="rank-fill"
                        style={{ width: `${(crop.adoptionCount / cropRanking[0]?.adoptionCount) * 100}%` }}
                      ></div>
                    </div>
                    <div className="rank-count">{crop.adoptionCount}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p>暂无数据</p>
            )}
          </div>

          <div className="analytics-card">
            <h3>📈 认养趋势</h3>
            <div className="chart-container">
              <div className="simple-chart">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="chart-bar-item">
                    <div className="bar" style={{ height: `${Math.random() * 100}%` }}></div>
                    <label>月{i}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 建议区域 */}
      <div className="recommendations-section">
        <h3>💡 数据洞察和建议</h3>
        <div className="recommendations-grid">
          <div className="recommendation-card">
            <div className="rec-icon">🎯</div>
            <h4>优化方向</h4>
            <p>根据你的认养数据，建议多尝试生长周期较短的作物，更快获得收益</p>
          </div>
          <div className="recommendation-card">
            <div className="rec-icon">📊</div>
            <h4>数据建议</h4>
            <p>你的活跃度很高，继续保持这样的频率可以获得更多积分和勋章</p>
          </div>
          <div className="recommendation-card">
            <div className="rec-icon">🌱</div>
            <h4>作物建议</h4>
            <p>尝试种植多样化作物可以降低风险，同时丰富你的种植经验</p>
          </div>
          <div className="recommendation-card">
            <div className="rec-icon">🚀</div>
            <h4>成长机会</h4>
            <p>升级到高级用户即可获得更多的地块选择权和优先认养权</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;