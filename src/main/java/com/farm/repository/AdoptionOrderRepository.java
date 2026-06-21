package com.farm.repository;

import com.farm.entity.AdoptionOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdoptionOrderRepository extends JpaRepository<AdoptionOrder, Integer> {
    // 1️⃣ 通过用户ID查找认养订单
    List<AdoptionOrder> findByUserId(Integer userId);

    // 2️⃣ 通过地块ID查找订单
    Optional<AdoptionOrder> findByPlotId(Integer plotId);

    // 3️⃣ 通过状态查找订单
    List<AdoptionOrder> findByStatus(String status);

    // 4️⃣ 查找用户的活跃订单
    @Query(value = "SELECT * FROM adoption_order WHERE user_id = ?1 AND status = 'active'", nativeQuery = true)
    List<AdoptionOrder> findActiveOrdersByUserId(Integer userId);

    // 5️⃣ 查找用户的历史订单
    @Query(value = "SELECT * FROM adoption_order WHERE user_id = ?1 AND status IN ('completed', 'cancelled')", nativeQuery = true)
    List<AdoptionOrder> findHistoryOrdersByUserId(Integer userId);
}