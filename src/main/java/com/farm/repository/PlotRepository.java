package com.farm.repository;

import com.farm.entity.Plot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlotRepository extends JpaRepository<Plot, Integer> {
    // 1️⃣ 查找所有待认养的地块（status = 0）
    List<Plot> findByStatus(Integer status);

    // 2️⃣ 通过农场ID查找地块
    List<Plot> findByFarmId(Integer farmId);

    // 3️⃣ 通过地块编号查找
    Optional<Plot> findByPlotNum(String plotNum);

    // 4️⃣ 通过农场ID和状态查找地块
    List<Plot> findByFarmIdAndStatus(Integer farmId, Integer status);

    // 5️⃣ 查找所有空闲地块（自定义 SQL 查询）
    @Query(value = "SELECT * FROM plot WHERE status = 0 ORDER BY sunlight_hours DESC", nativeQuery = true)
    List<Plot> findAllAvailablePlots();
}