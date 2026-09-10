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

import java.math.BigDecimal;

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

    // =========================================================
    // CREATE PAYMENT
    // =========================================================

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {

        User user = getAuthenticatedUser();

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        // Check order ownership
        if (!order.getCustomerEmail()
                .equalsIgnoreCase(user.getEmail())) {

            throw new RuntimeException(
                    "You are not allowed to make payment for this order");
        }

        // Only placed orders can be paid
        if (order.getStatus() != OrderStatus.PLACED) {

            throw new RuntimeException(
                    "Payment can only be created for a placed order");
        }

        if (request.getGateway() == null ||
                request.getGateway().isBlank()) {

            throw new RuntimeException(
                    "Payment gateway is required");
        }

        String gateway =
                request.getGateway().trim().toUpperCase();

        // =====================================================
        // MOCK PAYMENT
        // =====================================================

        if (!gateway.equals("MOCK")) {

            throw new RuntimeException(
                    "Only MOCK payment gateway is enabled");
        }

        // Check existing payment
        Payment existingPayment =
                paymentRepository
                        .findByOrderId(order.getId())
                        .orElse(null);

        if (existingPayment != null) {

            if (existingPayment.getStatus()
                    == PaymentStatus.SUCCESS) {

                throw new RuntimeException(
                        "Payment already completed for this order");
            }

            if (existingPayment.getStatus()
                    == PaymentStatus.PENDING) {

                return mapToResponse(existingPayment);
            }

            // FAILED payment can be retried
            paymentRepository.delete(existingPayment);
            paymentRepository.flush();
        }

        // Create payment
        Payment payment = new Payment();

        payment.setOrderId(order.getId());

        payment.setAmount(
                BigDecimal.valueOf(
                        order.getTotalAmount()));

        payment.setCurrency("INR");

        payment.setStatus(
                PaymentStatus.PENDING);

        payment.setGateway("MOCK");

        /*
         * Simulates the payment gateway's order ID.
         */
        payment.setGatewayOrderId(
                "MOCK_ORDER_" + order.getId());

        Payment savedPayment =
                paymentRepository.save(payment);

        return mapToResponse(savedPayment);
    }

    // =========================================================
    // GET PAYMENT BY ORDER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {

        User user = getAuthenticatedUser();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        if (!order.getCustomerEmail()
                .equalsIgnoreCase(user.getEmail())) {

            throw new RuntimeException(
                    "You are not allowed to access this payment");
        }

        Payment payment =
                paymentRepository
                        .findByOrderId(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found for this order"));

        return mapToResponse(payment);
    }

    // =========================================================
    // VERIFY MOCK PAYMENT
    // =========================================================

    @Override
    @Transactional(
            noRollbackFor = PaymentVerificationFailedException.class
    )
    public PaymentResponse verifyPayment(
            Long paymentId,
            String paymentOrderId,
            String paymentReference,
            String signature) {

        User user = getAuthenticatedUser();

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found"));

        Order order =
                orderRepository.findById(
                        payment.getOrderId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"));

        // Security check
        if (!order.getCustomerEmail()
                .equalsIgnoreCase(user.getEmail())) {

            throw new RuntimeException(
                    "You are not allowed to verify this payment");
        }

        // Already successful
        if (payment.getStatus()
                == PaymentStatus.SUCCESS) {

            return mapToResponse(payment);
        }

        // =====================================================
        // REQUIRED VALIDATION
        // =====================================================

        if (paymentOrderId == null ||
                paymentOrderId.isBlank()) {

            failPayment(
                    payment,
                    "Payment order ID is required");
        }

        if (paymentReference == null ||
                paymentReference.isBlank()) {

            failPayment(
                    payment,
                    "Payment reference is required");
        }

        if (signature == null ||
                signature.isBlank()) {

            failPayment(
                    payment,
                    "Payment signature is required");
        }

        // =====================================================
        // MOCK VALIDATION
        // =====================================================

        String expectedOrderId =
                payment.getGatewayOrderId();

        String expectedPaymentId =
                "MOCK_PAYMENT_" + payment.getId();

        String expectedSignature =
                "MOCK_SIGNATURE_" + payment.getId();

        // Validate payment order ID
        if (!expectedOrderId.equals(paymentOrderId)) {

            failPayment(
                    payment,
                    "Invalid payment order ID");
        }

        // Validate payment reference
        if (!expectedPaymentId.equals(paymentReference)) {

            failPayment(
                    payment,
                    "Invalid payment reference");
        }

        // Validate signature
        if (!expectedSignature.equals(signature)) {

            failPayment(
                    payment,
                    "Payment verification failed");
        }

        // =====================================================
        // PAYMENT SUCCESS
        // =====================================================

        payment.setGatewayPaymentId(
                paymentReference);

        payment.setGatewaySignature(
                signature);

        payment.setStatus(
                PaymentStatus.SUCCESS);

        Payment savedPayment =
                paymentRepository.save(payment);

        // =====================================================
        // CONFIRM ORDER
        // =====================================================

        if (order.getStatus() == OrderStatus.PLACED) {

            order.setStatus(
                    OrderStatus.CONFIRMED);

            orderRepository.save(order);
        }

        return mapToResponse(savedPayment);
    }

    // =========================================================
    // MARK PAYMENT AS FAILED
    // =========================================================

    private void failPayment(
            Payment payment,
            String message) {

        payment.setStatus(PaymentStatus.FAILED);

        paymentRepository.saveAndFlush(payment);

        throw new PaymentVerificationFailedException(message);
    }

    // =========================================================
    // ADMIN PAYMENT STATUS
    // =========================================================

    @Override
    @Transactional
    public PaymentResponse updatePaymentStatus(
            Long paymentId,
            String status) {

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found"));

        if (status == null ||
                status.isBlank()) {

            throw new RuntimeException(
                    "Payment status is required");
        }

        PaymentStatus newStatus;

        try {

            newStatus =
                    PaymentStatus.valueOf(
                            status.toUpperCase());

        } catch (IllegalArgumentException exception) {

            throw new RuntimeException(
                    "Invalid payment status: " + status);
        }

        // SUCCESS must come through verification
        if (newStatus == PaymentStatus.SUCCESS) {

            throw new RuntimeException(
                    "Payment SUCCESS can only be set after payment verification");
        }

        // Refunded payment cannot be changed
        if (payment.getStatus()
                == PaymentStatus.REFUNDED) {

            throw new RuntimeException(
                    "Refunded payment cannot be updated");
        }

        Order order =
                orderRepository.findById(
                        payment.getOrderId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Order not found for payment"));

        // =====================================================
        // REFUND
        // =====================================================

        if (newStatus == PaymentStatus.REFUNDED) {

            if (order.getStatus()
                    != OrderStatus.RETURNED) {

                throw new RuntimeException(
                        "Payment can only be refunded after the order is returned");
            }

            order.setStatus(
                    OrderStatus.REFUNDED);

            orderRepository.save(order);
        }

        payment.setStatus(newStatus);

        Payment updatedPayment =
                paymentRepository.save(payment);

        return mapToResponse(updatedPayment);
    }

    // =========================================================
    // AUTHENTICATED USER
    // =========================================================

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null) {

            throw new RuntimeException(
                    "User is not authenticated");
        }

        String email =
                authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));
    }

    // =========================================================
    // RESPONSE MAPPER
    // =========================================================

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

    // =========================================================
    // PAYMENT VERIFICATION EXCEPTION
    // =========================================================

    private static class PaymentVerificationFailedException
            extends RuntimeException {

        public PaymentVerificationFailedException(
                String message) {

            super(message);
        }
    }
}