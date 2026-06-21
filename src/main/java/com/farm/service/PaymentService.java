package com.farm.service;

import com.farm.entity.AdoptionOrder;
import com.farm.entity.PaymentRecord;
import com.farm.repository.AdoptionOrderRepository;
import com.farm.repository.PaymentRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {
    @Autowired
    private PaymentRecordRepository paymentRecordRepository;

    @Autowired
    private AdoptionOrderRepository adoptionOrderRepository;

    public PaymentRecord payOrder(Integer orderId, Integer userId, BigDecimal amount, String paymentMethod) {
        AdoptionOrder order = adoptionOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("只能支付自己的认养订单");
        }

        PaymentRecord record = new PaymentRecord();
        record.setOrderId(orderId);
        record.setUserId(userId);
        record.setAmount(amount != null ? amount : BigDecimal.ZERO);
        record.setPaymentMethod(paymentMethod != null ? paymentMethod : "demo");
        record.setStatus("paid");
        record.setPaidAt(LocalDateTime.now());
        PaymentRecord saved = paymentRecordRepository.save(record);
        order.setPaymentStatus("paid");
        adoptionOrderRepository.save(order);
        return saved;
    }

    public PaymentRecord getLatestPayment(Integer orderId) {
        return paymentRecordRepository.findFirstByOrderIdOrderByPaidAtDesc(orderId).orElse(null);
    }

    public List<PaymentRecord> getUserPayments(Integer userId) {
        return paymentRecordRepository.findByUserIdOrderByPaidAtDesc(userId);
    }
}
