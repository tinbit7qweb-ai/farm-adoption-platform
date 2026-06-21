package com.farm.repository;

import com.farm.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Integer> {
    Optional<PaymentRecord> findFirstByOrderIdOrderByPaidAtDesc(Integer orderId);

    List<PaymentRecord> findByUserIdOrderByPaidAtDesc(Integer userId);
}
