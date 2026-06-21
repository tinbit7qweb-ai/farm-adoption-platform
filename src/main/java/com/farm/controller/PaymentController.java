package com.farm.controller;

import com.farm.dto.ApiResponse;
import com.farm.dto.PaymentRequest;
import com.farm.entity.PaymentRecord;
import com.farm.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/payment")
@CrossOrigin(origins = "*")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @PostMapping("/pay")
    public ApiResponse<PaymentRecord> payOrder(@RequestBody PaymentRequest request) {
        try {
            PaymentRecord record = paymentService.payOrder(
                    request.getOrderId(),
                    request.getUserId(),
                    request.getAmount(),
                    request.getPaymentMethod()
            );
            return ApiResponse.success("付款成功", record);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<PaymentRecord> getLatestPayment(@PathVariable Integer orderId) {
        try {
            return ApiResponse.success(paymentService.getLatestPayment(orderId));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<PaymentRecord>> getUserPayments(@PathVariable Integer userId) {
        try {
            return ApiResponse.success(paymentService.getUserPayments(userId));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
