package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.constant.OrderStatus;
import com.shopstack.shopstack_backend.constant.PaymentStatus;
import com.shopstack.shopstack_backend.dto.request.PaymentRequest;
import com.shopstack.shopstack_backend.dto.response.PaymentResponse;
import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.Payment;
import com.shopstack.shopstack_backend.entity.User;
import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.repository.PaymentRepository;
import com.shopstack.shopstack_backend.repository.UserRepository;
import com.shopstack.shopstack_backend.service.PaymentService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            UserRepository userRepository) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // CREATE PAYMENT
    // =========================

    @Override
    @Transactional
    public PaymentResponse createPayment(
            PaymentRequest request) {

        User user = getAuthenticatedUser();

        Order order = orderRepository
                .findById(request.getOrderId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        ));

        // Make sure the order belongs
        // to the logged-in customer.
        if (!order.getCustomerEmail()
                .equals(user.getEmail())) {

            throw new RuntimeException(
                    "You are not allowed to make payment for this order"
            );
        }

        // Cancelled orders cannot be paid.
        if (order.getStatus() ==
                OrderStatus.CANCELLED) {

            throw new RuntimeException(
                    "Payment cannot be created for a cancelled order"
            );
        }

        // Prevent duplicate payment.
        if (paymentRepository
                .findByOrderId(order.getId())
                .isPresent()) {

            throw new RuntimeException(
                    "Payment already exists for this order"
            );
        }

        String gateway =
                request.getGateway();

        if (gateway == null ||
                gateway.isBlank()) {

            throw new RuntimeException(
                    "Payment gateway is required"
            );
        }

        Payment payment = new Payment();

        payment.setOrderId(
                order.getId()
        );

        /*
         * Amount comes directly
         * from the order.
         */
        payment.setAmount(
                java.math.BigDecimal.valueOf(
                        order.getTotalAmount()
                )
        );

        payment.setCurrency("INR");

        payment.setStatus(
                PaymentStatus.PENDING
        );

        payment.setGateway(
                gateway.toUpperCase()
        );

        Payment savedPayment =
                paymentRepository.save(payment);

        return mapToResponse(savedPayment);
    }

    // =========================
    // GET PAYMENT BY ORDER ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(
            Long orderId) {

        User user = getAuthenticatedUser();

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        ));

        // Customer can only see
        // their own payment.
        if (!order.getCustomerEmail()
                .equals(user.getEmail())) {

            throw new RuntimeException(
                    "You are not allowed to access this payment"
            );
        }

        Payment payment = paymentRepository
                .findByOrderId(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found for this order"
                        ));

        return mapToResponse(payment);
    }

    // =========================
    // UPDATE PAYMENT STATUS
    // =========================

    @Override
    @Transactional
    public PaymentResponse updatePaymentStatus(
            Long paymentId,
            String status) {

        Payment payment = paymentRepository
                .findById(paymentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found"
                        ));

        if (status == null ||
                status.isBlank()) {

            throw new RuntimeException(
                    "Payment status is required"
            );
        }

        PaymentStatus newStatus;

        try {

            newStatus =
                    PaymentStatus.valueOf(
                            status.toUpperCase()
                    );

        } catch (IllegalArgumentException exception) {

            throw new RuntimeException(
                    "Invalid payment status: "
                            + status
            );
        }

        // Refunded payment cannot be changed.
        if (payment.getStatus() ==
                PaymentStatus.REFUNDED) {

            throw new RuntimeException(
                    "Refunded payment cannot be updated"
            );
        }

        Order order = orderRepository
                .findById(payment.getOrderId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found for payment"
                        ));

        // =========================
        // PAYMENT SUCCESS
        // =========================

        if (newStatus ==
                PaymentStatus.SUCCESS) {

            /*
             * Payment SUCCESS
             *        ↓
             * Order CONFIRMED
             */

            if (order.getStatus() ==
                    OrderStatus.PLACED) {

                order.setStatus(
                        OrderStatus.CONFIRMED
                );

                orderRepository.save(order);
            }
        }

        // =========================
        // PAYMENT REFUNDED
        // =========================

        else if (newStatus ==
                PaymentStatus.REFUNDED) {

            /*
             * Refund is allowed only
             * after the order has been
             * returned.
             *
             * RETURNED
             *    ↓
             * REFUNDED
             */

            if (order.getStatus() !=
                    OrderStatus.RETURNED) {

                throw new RuntimeException(
                        "Payment can only be refunded "
                                + "after the order is returned"
                );
            }

            order.setStatus(
                    OrderStatus.REFUNDED
            );

            orderRepository.save(order);
        }

        // =========================
        // OTHER PAYMENT STATUSES
        // =========================

        payment.setStatus(newStatus);

        Payment updatedPayment =
                paymentRepository.save(payment);

        return mapToResponse(updatedPayment);
    }

    // =========================
    // GET AUTHENTICATED USER
    // =========================

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));
    }

    // =========================
    // MAP PAYMENT TO RESPONSE
    // =========================

    private PaymentResponse mapToResponse(
            Payment payment) {

        return new PaymentResponse(
                payment.getId(),
                payment.getOrderId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getGateway(),
                payment.getGatewayOrderId(),
                payment.getGatewayPaymentId(),
                payment.getCreatedAt(),
                payment.getUpdatedAt()
        );
    }
}