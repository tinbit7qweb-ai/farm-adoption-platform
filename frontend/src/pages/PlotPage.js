import React, { useEffect, useMemo, useState } from "react";
import { adoptPlot, getAllCrops, getRecommendedPlots } from "../api/api";
import { mockPlots } from "../mock/farmPlatformData";
import { addDemoAdoption, ensureDemoConversation, getDemoAdoptedPlotIds } from "../utils/demoState";

const plotImages = [
  "/images/farm-assets/Camera_1040g3k831uchle751m005pm7vh27e0r08s3s72o.jpg",
  "/images/farm-assets/Camera_1040g0k031joppvluig1g5pch89coiqnt35oh0g0.jpg",
  "/images/farm-assets/Camera_XHS_17819447720491040g00831rn6cljiig0g5o6h.jpg",
  "/images/farm-assets/Camera_1040g0k031joppvluig005pch89coiqntkr5abd8.jpg",
  "/images/farm-assets/Camera_XHS_17819448317211040g008319h6jbcd6u005nnb.jpg",
];

function imageForPlot(plot) {
  const index = Math.abs(Number(plot.plotId || plot.plotNum?.replace(/\D/g, "") || 1) - 1) % plotImages.length;
  return plot.image && !plot.image.includes("page_") ? plot.image : plotImages[index];
}

function buildOrderPreview(plot, user, options = {}) {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + Number(options.durationMonths || 3));

  return {
    orderId: options.orderId || `ORDER-${Date.now()}`,
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
    userId: user?.userId,
  };
}

function normalizePlot(plot) {
  return {
    plotId: plot.plotId,
    plotNum: plot.plotNum,
    title: plot.title || `地块 ${plot.plotNum}`,
    farmName: plot.farmName || `农场 #${plot.farmId || 1}`,
    farmerId: plot.farmerId || plot.ownerId || plot.farmOwnerId || plot.farmId || 1,
    farmerName: plot.farmerName || "农场主",
    farmerPhone: plot.farmerPhone || "待联系",
    location: plot.location || "近郊农场",
    area: Number(plot.area || 0),
    crop: plot.crop || "可选作物",
    price: plot.price || 399,
    cycle: plot.cycle || "3个月",
    soilType: plot.soilType || "黑土",
    sunlightHours: Number(plot.sunlightHours || 0),
    image: imageForPlot(plot),
    description: plot.description || plot.recommendationReason || "适合认养体验的优质地块。",
  };
}

function PlotPage({ user, role = "user", onOpenChat, onNavigate }) {
  const [plots, setPlots] = useState(mockPlots.filter((plot) => plot.status === "available").map(normalizePlot));
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [confirmPlot, setConfirmPlot] = useState(null);
  const [resultModal, setResultModal] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [durationMonths, setDurationMonths] = useState(3);
  const [adopting, setAdopting] = useState(false);
  const [soilFilter, setSoilFilter] = useState("all");
  const [sunlightFilter, setSunlightFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recommend");
  const isFarmer = role === "farmer";

  useEffect(() => {
    Promise.all([getRecommendedPlots(), getAllCrops()])
      .then(([plotResponse, cropResponse]) => {
        if (plotResponse.code === 200 && Array.isArray(plotResponse.data)) {
          const adoptedIds = getDemoAdoptedPlotIds().map(String);
          setPlots(
            plotResponse.data
              .map(normalizePlot)
              .filter((plot) => !adoptedIds.includes(String(plot.plotId))),
          );
        }
        if (cropResponse.code === 200 && Array.isArray(cropResponse.data)) {
          setCrops(cropResponse.data);
          setSelectedCrop(cropResponse.data[0]?.cropId || "");
        }
      })
      .catch(() => {
        const adoptedIds = getDemoAdoptedPlotIds().map(String);
        setPlots(
          mockPlots
            .filter((plot) => plot.status === "available")
            .map(normalizePlot)
            .filter((plot) => !adoptedIds.includes(String(plot.plotId))),
        );
        setToast("后端暂时不可用，当前展示 mock 地块数据。");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPlots = useMemo(() => {
    let result = [...plots];

    if (soilFilter !== "all") {
      result = result.filter((plot) => plot.soilType === soilFilter);
    }

    if (sunlightFilter === "high") {
      result = result.filter((plot) => plot.sunlightHours >= 8);
    }
    if (sunlightFilter === "medium") {
      result = result.filter((plot) => plot.sunlightHours >= 6 && plot.sunlightHours < 8);
    }
    if (sunlightFilter === "low") {
      result = result.filter((plot) => plot.sunlightHours < 6);
    }

    if (sortBy === "area") {
      result.sort((a, b) => b.area - a.area);
    }
    if (sortBy === "sunlight") {
      result.sort((a, b) => b.sunlightHours - a.sunlightHours);
    }
    if (sortBy === "price") {
      result.sort((a, b) => a.price - b.price);
    }

    return result;
  }, [plots, soilFilter, sunlightFilter, sortBy]);

  const openAdoptModal = (plot) => {
    setConfirmPlot(plot);
    setToast("");
  };

  const finishAdoption = (plot, order, sourceText) => {
    ensureDemoConversation({
      farmerName: plot.farmerName,
      farmerId: plot.farmerId,
      farmerPhone: plot.farmerPhone,
      farmName: plot.farmName,
      plotNum: plot.plotNum,
      plotId: plot.plotId,
      orderId: order.orderId,
      userName: user?.realName || user?.username || "认养用户",
    });
    setPlots((current) => current.filter((item) => String(item.plotId) !== String(plot.plotId)));
    setResultModal({
      plot,
      order,
      title: "认养成功",
      body: `${plot.title} 已进入“我的认养”。${sourceText}`,
    });
    setConfirmPlot(null);
  };

  const handleAdopt = async () => {
    if (!confirmPlot || !user?.userId) return;

    setAdopting(true);
    const cropId = selectedCrop || crops[0]?.cropId || 1;

    const cropName =
      crops.find((crop) => String(crop.cropId) === String(selectedCrop))?.cropName ||
      confirmPlot.crop;

    try {
      const response = await adoptPlot(user.userId, confirmPlot.plotId, cropId, durationMonths);
      if (response.code !== 200) {
        setToast(response.message || "后端返回认养失败，已保留当前地块。");
        setAdopting(false);
        return;
      }
      const order = buildOrderPreview(confirmPlot, user, {
        durationMonths,
        cropName,
        orderId: response.data?.orderId,
      });
      finishAdoption(confirmPlot, order, "订单已提交到后端。");
    } catch (error) {
      const order = addDemoAdoption(confirmPlot, user, { durationMonths, cropName });
      finishAdoption(confirmPlot, order, "当前后端接口暂时不可用，已使用演示订单继续流程。");
    }

    setAdopting(false);
  };

  return (
    <div>
      <section className="section-panel page-toolbar">
        <div>
          <h3>浏览可认养地块</h3>
          <p className="muted">筛选土壤、光照和排序后，选择合适地块下单认养。</p>
        </div>
        <div className="toolbar-filters">
          <label>
            土壤
            <select value={soilFilter} onChange={(event) => setSoilFilter(event.target.value)}>
              <option value="all">全部</option>
              <option value="黑土">黑土</option>
              <option value="壤土">壤土</option>
              <option value="红土">红土</option>
              <option value="沙土">沙土</option>
            </select>
          </label>
          <label>
            光照
            <select value={sunlightFilter} onChange={(event) => setSunlightFilter(event.target.value)}>
              <option value="all">全部</option>
              <option value="high">充足 8h+</option>
              <option value="medium">中等 6-8h</option>
              <option value="low">偏弱 6h 以下</option>
            </select>
          </label>
          <label>
            排序
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="recommend">推荐优先</option>
              <option value="area">面积从大到小</option>
              <option value="sunlight">光照从高到低</option>
              <option value="price">价格从低到高</option>
            </select>
          </label>
        </div>
      </section>

      <section className="result-strip">
        <span>共 {filteredPlots.length} 块可认养地块</span>
        {loading && <span>正在加载后端地块...</span>}
        {toast && <strong>{toast}</strong>}
      </section>

      <div className="plot-list">
        {filteredPlots.map((plot) => (
          <article className="plot-row-card" key={plot.plotId}>
            <img src={plot.image} alt={plot.title} />
            <div className="plot-row-main">
              <div className="plot-row-head">
                <div>
                  <span className="status-pill">待认养</span>
                  <h3>{plot.title}</h3>
                  <p className="muted">{plot.description}</p>
                </div>
                <div className="price-box">
                  <strong>¥{plot.price}</strong>
                  <span>{plot.cycle}</span>
                </div>
              </div>

              <div className="plot-facts">
                <span><b>农场</b>{plot.farmName}</span>
                <span><b>农户</b>{plot.farmerName}</span>
                <span><b>位置</b>{plot.location}</span>
                <span><b>面积</b>{plot.area} 平方米</span>
                <span><b>作物</b>{plot.crop}</span>
                <span><b>土壤 / 日照</b>{plot.soilType} / {plot.sunlightHours}h</span>
              </div>

              <div className="action-row">
                {isFarmer ? (
                  <button className="secondary-btn" type="button">管理地块</button>
                ) : (
                  <button className="primary-btn" type="button" onClick={() => openAdoptModal(plot)}>
                    立即认养
                  </button>
                )}
                <button
                  className="ghost-btn"
                  type="button"
                  onClick={() => {
                    ensureDemoConversation({
                      farmerName: plot.farmerName,
                      farmerId: plot.farmerId,
                      farmerPhone: plot.farmerPhone,
                      farmName: plot.farmName,
                      plotNum: plot.plotNum,
                      plotId: plot.plotId,
                      userName: user?.realName || user?.username || "认养用户",
                    });
                    onOpenChat?.(plot.farmerName, plot.plotNum, plot.plotId);
                  }}
                >
                  联系农户
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredPlots.length === 0 && (
        <section className="section-panel empty-state">
          <h3>没有符合条件的地块</h3>
          <p className="muted">可以调整土壤、光照筛选条件，或等待农场主发布新地块。</p>
        </section>
      )}

      {confirmPlot && (
        <div className="modal-overlay">
          <div className="modal-content adopt-modal">
            <button className="modal-close" type="button" onClick={() => setConfirmPlot(null)}>×</button>
            <h2>确认认养 {confirmPlot.title}</h2>
            <p className="muted">认养后该地块会从可认养列表中移除，并进入“我的认养”。</p>
            <div className="meta-list">
              <span><strong>地块</strong>{confirmPlot.plotNum}</span>
              <span><strong>农场主</strong>{confirmPlot.farmerName}</span>
              <span><strong>面积</strong>{confirmPlot.area} 平方米</span>
              <span><strong>价格</strong>¥{confirmPlot.price} / {confirmPlot.cycle}</span>
            </div>
            <div className="grid-2">
              <label className="form-group">
                选择作物
                <select value={selectedCrop} onChange={(event) => setSelectedCrop(event.target.value)}>
                  {crops.length === 0 && <option value="1">默认作物</option>}
                  {crops.map((crop) => (
                    <option key={crop.cropId} value={crop.cropId}>
                      {crop.cropName} · {crop.category || "作物"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-group">
                认养周期
                <select value={durationMonths} onChange={(event) => setDurationMonths(Number(event.target.value))}>
                  <option value={1}>1 个月</option>
                  <option value={3}>3 个月</option>
                  <option value={6}>6 个月</option>
                  <option value={12}>12 个月</option>
                </select>
              </label>
            </div>
            <div className="action-row">
              <button className="primary-btn" type="button" onClick={handleAdopt} disabled={adopting}>
                {adopting ? "正在认养..." : "确认认养"}
              </button>
              <button className="ghost-btn" type="button" onClick={() => setConfirmPlot(null)}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {resultModal && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <button className="modal-close" type="button" onClick={() => setResultModal(null)}>×</button>
            <span className="status-pill">订单已创建</span>
            <h2>{resultModal.title}</h2>
            <p className="muted">{resultModal.body}</p>
            <div className="meta-list">
              <span><strong>地块</strong>{resultModal.plot.plotNum}</span>
              <span><strong>农场主</strong>{resultModal.plot.farmerName}</span>
              <span><strong>认养周期</strong>{durationMonths} 个月</span>
              <span><strong>订单号</strong>{resultModal.order.orderId}</span>
            </div>
            <div className="action-row">
              <button
                className="primary-btn"
                type="button"
                onClick={() => {
                  setResultModal(null);
                  onNavigate?.("adoptions");
                }}
              >
                查看我的认养
              </button>
              <button
                className="secondary-btn"
                type="button"
                onClick={() => {
                  onOpenChat?.(resultModal.plot.farmerName, resultModal.plot.plotNum, resultModal.plot.plotId);
                  setResultModal(null);
                }}
              >
                联系农户
              </button>
              <button className="ghost-btn" type="button" onClick={() => setResultModal(null)}>
                继续浏览
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlotPage;
