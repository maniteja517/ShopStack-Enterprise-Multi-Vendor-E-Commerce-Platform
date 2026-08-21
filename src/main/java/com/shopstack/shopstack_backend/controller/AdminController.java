package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.VendorResponse;
import com.shopstack.shopstack_backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/vendors/{vendorId}/approve")
    public ResponseEntity<ApiResponse<VendorResponse>> approveVendor(
            @PathVariable Long vendorId) {

        VendorResponse response =
                adminService.approveVendor(vendorId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Vendor Approved Successfully",
                        response
                )
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/vendors/{vendorId}/reject")
    public ResponseEntity<ApiResponse<VendorResponse>> rejectVendor(
            @PathVariable Long vendorId) {

        VendorResponse response =
                adminService.rejectVendor(vendorId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Vendor Rejected Successfully",
                        response
                )
        );
    }
}