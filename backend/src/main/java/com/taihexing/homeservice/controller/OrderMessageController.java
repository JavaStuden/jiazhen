package com.taihexing.homeservice.controller;

import com.taihexing.homeservice.model.Order;
import com.taihexing.homeservice.model.OrderMessage;
import com.taihexing.homeservice.model.Provider;
import com.taihexing.homeservice.model.UserSession;
import com.taihexing.homeservice.repository.OrderMessageRepository;
import com.taihexing.homeservice.repository.ProviderRepository;
import com.taihexing.homeservice.service.PlatformService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/orders/{orderId}/messages")
public class OrderMessageController {
    private final PlatformService platform;
    private final ProviderRepository providers;
    private final OrderMessageRepository messages;

    public OrderMessageController(PlatformService platform, ProviderRepository providers, OrderMessageRepository messages) {
        this.platform = platform;
        this.providers = providers;
        this.messages = messages;
    }

    @GetMapping
    public List<OrderMessage> list(@PathVariable Long orderId, HttpServletRequest request) {
        participant(platform.getOrder(orderId), MiniProgramAuthController.currentUser(request));
        return messages.findByOrderIdOrderByCreatedAtAsc(orderId);
    }

    @PostMapping
    public OrderMessage send(@PathVariable Long orderId, @RequestBody Map<String, String> body, HttpServletRequest request) {
        UserSession user = MiniProgramAuthController.currentUser(request);
        Order order = platform.getOrder(orderId);
        participant(order, user);
        String content = body.getOrDefault("content", "").trim();
        if (content.isBlank() || content.length() > 2000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "消息长度须为1至2000字");
        String name = user.getDisplayName() == null || user.getDisplayName().isBlank()
                ? ("worker".equals(user.getRole()) ? order.getProviderName() : order.getCustomerName())
                : user.getDisplayName();
        return messages.save(new OrderMessage(orderId, user.getRole(), name, content));
    }

    private void participant(Order order, UserSession user) {
        boolean allowed = "customer".equals(user.getRole())
                ? user.getOpenId().equals(order.getCustomerOpenId())
                : providers.findByWechatOpenId(user.getOpenId()).map(Provider::getId).filter(id -> id.equals(order.getProviderId())).isPresent();
        if (!allowed) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
}
