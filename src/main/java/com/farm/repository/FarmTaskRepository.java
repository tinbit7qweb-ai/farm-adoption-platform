package com.farm.repository;

import com.farm.entity.FarmTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FarmTaskRepository extends JpaRepository<FarmTask, Integer> {
    List<FarmTask> findByFarmerIdOrderByDueDateAsc(Integer farmerId);

    List<FarmTask> findByPlotIdOrderByDueDateAsc(Integer plotId);

    List<FarmTask> findByOrderIdOrderByDueDateAsc(Integer orderId);
}
