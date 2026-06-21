package com.farm.repository;

import com.farm.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    Optional<Review> findFirstByUserIdAndTraceCode(Integer userId, String traceCode);

    List<Review> findTop10ByOrderByCreatedAtDesc();

    List<Review> findByTraceCodeOrderByCreatedAtDesc(String traceCode);
}
