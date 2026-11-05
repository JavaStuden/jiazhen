package com.taihexing.homeservice.controller;

import com.taihexing.homeservice.dto.CreateOrderRequest;
import com.taihexing.homeservice.dto.OrderActionRequest;
import com.taihexing.homeservice.dto.StatusRequest;
import com.taihexing.homeservice.model.Order;
import com.taihexing.homeservice.model.Provider;
import com.taihexing.homeservice.model.UserSession;
import com.taihexing.homeservice.repository.ProviderRepository;
import com.taihexing.homeservice.service.WechatPayService;
import com.taihexing.homeservice.service.PlatformService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {
    private final PlatformService service;
    private final ProviderRepository providers;
    private final WechatPayService payments;

    public PublicController(PlatformService service, ProviderRepository providers, WechatPayService payments) {
        this.service = service;
        this.providers = providers;
        this.payments = payments;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "taihexing-home-service");
    }

    @GetMapping("/services")
    public Object services() {
        return service.services();
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<?> serviceDetail(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getService(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/providers")
    public Object providers() {
        return service.publicProviders();
    }

    @GetMapping("/providers/{id}")
    public ResponseEntity<?> providerDetail(@PathVariable Long id) {
        try {
            Provider provider = service.getProvider(id);
            if (!provider.isWechatBound() || !"在线".equals(provider.getStatus()) && !"待机".equals(provider.getStatus())) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(provider);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/orders")
    public Object orders(@RequestParam(required = false) String status, HttpServletRequest request) {
        return service.ordersForUser(user(request), status);
    }

    @GetMapping("/orders/available")
    public Object availableOrders(HttpServletRequest request) {
        requireRole(request, "worker");
        return service.availableOrders().stream().map(order -> Map.of(
                "id", order.getId(), "orderNo", order.getOrderNo(), "serviceName", order.getServiceName(),
                "category", order.getCategory(), "amount", order.getAmount(), "scheduledAt", order.getScheduledAt(),
                "area", order.getArea(), "durationLabel", order.getDurationLabel(),
                "status", order.getStatus(), "addressLabel", order.getMaskedAddress())) .toList();
    }

    @GetMapping("/orders/available/{id}")
    public Map<String, Object> availableOrderDetail(@PathVariable Long id, HttpServletRequest request) {
        requireRole(request, "worker");
        Order order = service.getOrder(id);
        if (order.getProviderId() != null || !List.of("待接单", "待匹配").contains(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return Map.of("id", order.getId(), "orderNo", order.getOrderNo(), "serviceId", order.getServiceId(),
                "serviceName", order.getServiceName(), "category", order.getCategory(), "area", order.getArea(),
                "durationLabel", order.getDurationLabel(), "scheduledAt", order.getScheduledAt(),
                "amount", order.getAmount(), "status", order.getStatus());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> orderDetail(@PathVariable Long id, HttpServletRequest request) {
        try {
            return ResponseEntity.ok(service.getOrderForUser(id, user(request)));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest req, HttpServletRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, requireRole(request, "customer")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/payment-params")
    public Object paymentParams(@PathVariable Long id, HttpServletRequest request) {
        UserSession user = requireRole(request, "customer");
        Order order = service.getOrderForUser(id, user);
        return payments.createMiniProgramPayment(order, user);
    }

    @PostMapping("/orders/{id}/confirm-payment")
    public Object confirmPayment(@PathVariable Long id, HttpServletRequest request) {
        UserSession user = requireRole(request, "customer");
        Order order = service.getOrderForUser(id, user);
        return payments.confirmPayment(order, user);
    }

    @PostMapping("/orders/{id}/grab")
    public ResponseEntity<?> grabOrder(@PathVariable Long id, @RequestBody(required = false) OrderActionRequest req, HttpServletRequest request) {
        try {
            UserSession user = requireRole(request, "worker");
            Long providerId = providers.findByWechatOpenId(user.getOpenId()).map(Provider::getId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "服务人员账号未绑定"));
            return ResponseEntity.ok(service.accept(id, providerId));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/orders/{id}/checkin")
    public ResponseEntity<?> checkinOrder(@PathVariable Long id, @RequestBody(required = false) OrderActionRequest req, HttpServletRequest request) {
        try {
            ensureAssigned(service.getOrder(id), requireRole(request, "worker"));
            return ResponseEntity.ok(service.checkin(id, req));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/orders/{id}/anomaly")
    public ResponseEntity<?> reportAnomaly(@PathVariable Long id, @RequestBody OrderActionRequest req, HttpServletRequest request) {
        try {
            ensureAssigned(service.getOrder(id), requireRole(request, "worker"));
            return ResponseEntity.ok(service.reportAnomaly(id, req));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/orders/{id}/anomaly-confirm")
    public ResponseEntity<?> confirmAnomaly(@PathVariable Long id, @RequestBody OrderActionRequest req, HttpServletRequest request) {
        try {
            ensureCustomerOrder(service.getOrder(id), requireRole(request, "customer"));
            return ResponseEntity.ok(service.confirmAnomaly(id, req));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/orders/{id}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Long id, HttpServletRequest request) {
        try {
            ensureAssigned(service.getOrder(id), requireRole(request, "worker"));
            return ResponseEntity.ok(service.completeService(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest req, HttpServletRequest request) {
        Order order = service.getOrder(id);
        ensureCustomerOrder(order, requireRole(request, "customer"));
        if (!"已取消".equals(req.status())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "此接口只支持取消订单");
        if (!"待支付".equals(order.getStatus()) && !"待接单".equals(order.getStatus()) && !"待匹配".equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "当前订单状态不允许取消");
        }
        return ResponseEntity.ok(service.updateStatus(id, "已取消"));
    }

    @PostMapping("/orders/{id}/review")
    public ResponseEntity<?> reviewOrder(@PathVariable Long id, @RequestBody OrderActionRequest req, HttpServletRequest request) {
        try {
            ensureCustomerOrder(service.getOrder(id), requireRole(request, "customer"));
            return ResponseEntity.ok(service.submitReview(id, req));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/orders/{id}/after-sales")
    public ResponseEntity<?> afterSalesOrder(@PathVariable Long id, @RequestBody OrderActionRequest req, HttpServletRequest request) {
        try {
            ensureCustomerOrder(service.getOrder(id), requireRole(request, "customer"));
            return ResponseEntity.ok(service.submitAfterSales(id, req));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/orders/{id}/after-sales")
    public ResponseEntity<?> cancelAfterSales(@PathVariable Long id, HttpServletRequest request) {
        ensureCustomerOrder(service.getOrder(id), requireRole(request, "customer"));
        return ResponseEntity.ok(service.cancelAfterSales(id));
    }

    private UserSession user(HttpServletRequest request) { return MiniProgramAuthController.currentUser(request); }
    private UserSession requireRole(HttpServletRequest request, String role) {
        UserSession user = user(request);
        if (!role.equals(user.getRole())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "当前账号无权执行此操作");
        if ("worker".equals(role)) {
            Provider provider = providers.findByWechatOpenId(user.getOpenId()).orElseThrow(() ->
                    new ResponseStatusException(HttpStatus.FORBIDDEN, "服务人员账号尚未建立"));
            if (!"在线".equals(provider.getStatus()) && !"待机".equals(provider.getStatus())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "服务人员资料尚未审核通过");
            }
        }
        return user;
    }
    private void ensureCustomerOrder(Order order, UserSession user) {
        if (!user.getOpenId().equals(order.getCustomerOpenId())) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    private void ensureAssigned(Order order, UserSession user) {
        Long id = providers.findByWechatOpenId(user.getOpenId()).map(Provider::getId).orElse(null);
        if (id == null || !id.equals(order.getProviderId())) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
}
