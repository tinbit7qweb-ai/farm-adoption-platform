package com.farm.repository;

import com.farm.entity.TraceabilityRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TraceabilityRecordRepository extends JpaRepository<TraceabilityRecord, Integer> {
    // 1️⃣ 通过订单ID查找溯源记录（按时间排序）
    @Query(value = "SELECT * FROM traceability_record WHERE order_id = ?1 ORDER BY record_time ASC", nativeQuery = true)
    List<TraceabilityRecord> findByOrderIdOrderByRecordTimeAsc(Integer orderId);

    // 2️⃣ 通过订单ID查找最新的溯源记录
    @Query(value = "SELECT * FROM traceability_record WHERE order_id = ?1 ORDER BY record_time DESC LIMIT 1", nativeQuery = true)
    TraceabilityRecord findLatestRecordByOrderId(Integer orderId);

    // 3️⃣ 查找特定农事动作
    List<TraceabilityRecord> findByActionName(String actionName);
}