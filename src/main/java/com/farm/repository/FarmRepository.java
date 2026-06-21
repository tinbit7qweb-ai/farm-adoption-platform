package com.farm.repository;

import com.farm.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Integer> {
    // 1️⃣ 通过农场主ID查找农场
    List<Farm> findByOwnerId(Integer ownerId);

    // 2️⃣ 通过农场名称查找
    Optional<Farm> findByFarmName(String farmName);
}