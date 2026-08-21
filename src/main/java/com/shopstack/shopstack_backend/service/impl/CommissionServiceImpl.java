package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.dto.response.CommissionResponse;
import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.OrderItem;
import com.shopstack.shopstack_backend.entity.Product;
import com.shopstack.shopstack_backend.entity.Vendor;
import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.repository.ProductRepository;
import com.shopstack.shopstack_backend.repository.VendorRepository;
import com.shopstack.shopstack_backend.service.CommissionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class CommissionServiceImpl
        implements CommissionService {

    // Marketplace commission percentage
    private static final BigDecimal COMMISSION_RATE =
            new BigDecimal("0.10");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;

    public CommissionServiceImpl(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            VendorRepository vendorRepository) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.vendorRepository = vendorRepository;
    }

    // =========================
    // GET COMMISSION REPORT
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<CommissionResponse> getCommissionReport() {

        List<Order> orders =
                orderRepository.findAll();

        Map<Long, BigDecimal> vendorSales =
                new HashMap<>();

        // =========================
        // PROCESS ORDERS
        // =========================

        for (Order order : orders) {

            // Cancelled, returned and refunded
            // orders are not counted as sales.
            if (order.getStatus() == null ||
                    order.getStatus().name().equals("CANCELLED") ||
                    order.getStatus().name().equals("RETURNED") ||
                    order.getStatus().name().equals("REFUNDED")) {

                continue;
            }

            for (OrderItem item :
                    order.getItems()) {

                Product product =
                        productRepository
                                .findById(
                                        item.getProductId()
                                )
                                .orElse(null);

                if (product == null ||
                        product.getVendor() == null) {

                    continue;
                }

                Vendor vendor =
                        product.getVendor();

                BigDecimal itemSales =
                        BigDecimal.valueOf(
                                item.getSubtotal()
                        );

                vendorSales.merge(
                        vendor.getId(),
                        itemSales,
                        BigDecimal::add
                );
            }
        }

        // =========================
        // BUILD RESPONSE
        // =========================

        List<CommissionResponse> response =
                new ArrayList<>();

        for (Map.Entry<Long, BigDecimal> entry :
                vendorSales.entrySet()) {

            Long vendorId =
                    entry.getKey();

            BigDecimal totalSales =
                    entry.getValue();

            Vendor vendor =
                    vendorRepository
                            .findById(vendorId)
                            .orElse(null);

            if (vendor == null) {
                continue;
            }

            BigDecimal commission =
                    totalSales.multiply(
                            COMMISSION_RATE
                    );

            BigDecimal vendorEarnings =
                    totalSales.subtract(
                            commission
                    );

            response.add(
                    new CommissionResponse(
                            vendor.getId(),
                            vendor.getBusinessName(),
                            totalSales,
                            commission,
                            vendorEarnings
                    )
            );
        }

        return response;
    }
}