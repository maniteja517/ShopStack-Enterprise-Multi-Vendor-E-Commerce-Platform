package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.constant.OrderStatus;
import com.shopstack.shopstack_backend.dto.request.RefundRequest;
import com.shopstack.shopstack_backend.dto.response.RefundResponse;
import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.Refund;
import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.repository.RefundRepository;
import com.shopstack.shopstack_backend.service.RefundService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RefundServiceImpl
        implements RefundService {

    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;

    public RefundServiceImpl(
            RefundRepository refundRepository,
            OrderRepository orderRepository) {

        this.refundRepository = refundRepository;
        this.orderRepository = orderRepository;
    }

    // =========================
    // PROCESS REFUND
    // =========================

    @Override
    @Transactional
    public RefundResponse processRefund(
            Long orderId,
            RefundRequest request) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                )
                        );

        // =========================
        // CHECK ORDER STATUS
        // =========================

        if (order.getStatus() != OrderStatus.RETURNED) {

            throw new RuntimeException(
                    "Only returned orders can be refunded"
            );
        }

        // =========================
        // CHECK EXISTING REFUND
        // =========================

        if (refundRepository.existsByOrder(order)) {

            throw new RuntimeException(
                    "Refund already exists for this order"
            );
        }

        // =========================
        // CREATE REFUND
        // =========================

        Refund refund =
                new Refund();

        refund.setOrder(order);

        refund.setRefundAmount(
                order.getTotalAmount()
        );

        refund.setReason(
                request.getReason()
        );

        refund.setStatus(
                "REFUNDED"
        );

        refund.setRefundedAt(
                LocalDateTime.now()
        );

        Refund savedRefund =
                refundRepository.save(refund);

        // =========================
        // UPDATE ORDER STATUS
        // =========================

        order.setStatus(
                OrderStatus.REFUNDED
        );

        orderRepository.save(order);

        return convertToResponse(
                savedRefund
        );
    }

    // =========================
    // GET REFUND BY ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public RefundResponse getRefundById(
            Long id) {

        Refund refund =
                refundRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Refund not found"
                                )
                        );

        return convertToResponse(refund);
    }

    // =========================
    // GET REFUND BY ORDER ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public RefundResponse getRefundByOrderId(
            Long orderId) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                )
                        );

        Refund refund =
                refundRepository.findByOrder(order)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Refund not found for this order"
                                )
                        );

        return convertToResponse(refund);
    }

    // =========================
    // GET ALL REFUNDS
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<RefundResponse> getAllRefunds() {

        return refundRepository
                .findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================
    // CONVERT TO RESPONSE
    // =========================

    private RefundResponse convertToResponse(
            Refund refund) {

        return new RefundResponse(
                refund.getId(),
                refund.getOrder().getId(),
                refund.getRefundAmount(),
                refund.getReason(),
                refund.getStatus(),
                refund.getRefundedAt()
        );
    }
}