package com.farm.service;

import com.farm.dto.ReviewRequest;
import com.farm.entity.Review;
import com.farm.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    public Review submitReview(ReviewRequest request) {
        if (request.getUserId() == null) {
            throw new RuntimeException("用户不能为空");
        }
        if (request.getTraceCode() == null || request.getTraceCode().trim().isEmpty()) {
            throw new RuntimeException("溯源码不能为空");
        }
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new RuntimeException("评论内容不能为空");
        }

        Integer rating = request.getRating() == null ? 5 : request.getRating();
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("评分必须在 1 到 5 之间");
        }

        Review review = reviewRepository
                .findFirstByUserIdAndTraceCode(request.getUserId(), request.getTraceCode())
                .orElseGet(Review::new);

        review.setUserId(request.getUserId());
        review.setUserName(request.getUserName());
        review.setOrderId(request.getOrderId());
        review.setTraceCode(request.getTraceCode());
        review.setPlotNum(request.getPlotNum());
        review.setFarmName(request.getFarmName());
        review.setCrop(request.getCrop());
        review.setRating(rating);
        review.setContent(request.getContent().trim());
        review.setCreatedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    public List<Review> getLatestReviews() {
        return reviewRepository.findTop10ByOrderByCreatedAtDesc();
    }

    public List<Review> getReviewsByTraceCode(String traceCode) {
        return reviewRepository.findByTraceCodeOrderByCreatedAtDesc(traceCode);
    }
}
