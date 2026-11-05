package com.taihexing.homeservice.controller;

import com.taihexing.homeservice.dto.OrderActionRequest;
import com.taihexing.homeservice.dto.ProviderRequest;
import com.taihexing.homeservice.dto.ServiceItemRequest;
import com.taihexing.homeservice.dto.StatusRequest;
import com.taihexing.homeservice.service.PlatformService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class PlatformController {
    private final PlatformService service;

    public PlatformController(PlatformService s) {
        this.service = s;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        return service.dashboard();
    }

    @GetMapping("/services")
    public Object services() {
        return service.allServices();
    }

    @PostMapping("/services")
    public ResponseEntity<?> createService(@RequestBody ServiceItemRequest req) {
        return ResponseEntity.ok(service.createService(req));
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<?> updateService(@PathVariable Long id, @RequestBody ServiceItemRequest req) {
        try {
            return ResponseEntity.ok(service.updateService(id, req));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        service.deleteService(id);
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    @GetMapping("/providers")
    public Object providers() {
        return service.providers();
    }

    @PostMapping("/providers")
    public ResponseEntity<?> createProvider(@RequestBody ProviderRequest req) {
        return ResponseEntity.ok(service.createProvider(req));
    }

    @PutMapping("/providers/{id}")
    public ResponseEntity<?> updateProvider(@PathVariable Long id, @RequestBody ProviderRequest req) {
        try {
            return ResponseEntity.ok(service.updateProvider(id, req));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/providers/{id}/wechat-binding")
    public ResponseEntity<?> bindProviderWechat(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(service.bindProviderWechat(id, body.get("openId")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public Object orders(@RequestParam(required = false) String status) {
        return service.orders(status);
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> status(@PathVariable Long id, @Valid @RequestBody StatusRequest r) {
        try {
            return ResponseEntity.ok(service.updateStatus(id, r.status()));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/orders/{id}/accept")
    public ResponseEntity<?> accept(@PathVariable Long id, @RequestParam(defaultValue = "1") Long providerId) {
        try {
            return ResponseEntity.ok(service.accept(id, providerId));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/orders/{id}/anomaly-confirm")
    public ResponseEntity<?> confirmAnomaly(@PathVariable Long id, @RequestBody(required = false) OrderActionRequest req) {
        try {
            return ResponseEntity.ok(service.confirmAnomaly(id, req));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
