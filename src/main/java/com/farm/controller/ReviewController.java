package com.farm.controller;

import com.farm.dto.ApiResponse;
import com.farm.dto.ReviewRequest;
import com.farm.entity.Review;
import com.farm.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/review")
@CrossOrigin(origins = "*")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

    @PostMapping("/submit")
    public ApiResponse<Review> submitReview(@RequestBody ReviewRequest request) {
        try {
            return ApiResponse.success("评论已保存", reviewService.submitReview(request));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/latest")
    public ApiResponse<List<Review>> getLatestReviews() {
        try {
            return ApiResponse.success(reviewService.getLatestReviews());
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/trace/{traceCode}")
    public ApiResponse<List<Review>> getTraceReviews(@PathVariable String traceCode) {
        try {
            return ApiResponse.success(reviewService.getReviewsByTraceCode(traceCode));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
