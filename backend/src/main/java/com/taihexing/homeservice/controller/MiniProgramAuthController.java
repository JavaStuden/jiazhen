package com.taihexing.homeservice.controller;

import com.taihexing.homeservice.model.UserSession;
import com.taihexing.homeservice.service.MiniProgramAuthService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/public/auth")
public class MiniProgramAuthController {
    private final MiniProgramAuthService auth;
    private final ObjectMapper mapper;

    public MiniProgramAuthController(MiniProgramAuthService auth, ObjectMapper mapper) { this.auth = auth; this.mapper = mapper; }

    @PostMapping("/wechat")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        if (code == null || code.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "缺少微信登录凭证");
        return auth.login(code, body.getOrDefault("role", "customer"));
    }

    @PostMapping("/phone")
    public Map<String, Object> verifyPhone(@RequestBody Map<String, String> body, HttpServletRequest request) {
        UserSession user = currentUser(request);
        String code = body.get("code");
        if (code == null || code.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请授权手机号");
        String phone = auth.verifyPhone(code).get("phone");
        return auth.updateProfile(user, phone, null);
    }

    @GetMapping("/me")
    public Map<String, Object> me(HttpServletRequest request) {
        UserSession user = currentUser(request);
        return Map.of("role", user.getRole(), "phone", user.getPhone() == null ? "" : user.getPhone(),
                "displayName", user.getDisplayName() == null ? "" : user.getDisplayName());
    }

    @GetMapping("/account")
    public Map<String, Object> account(HttpServletRequest request) {
        UserSession user = currentUser(request);
        if (user.getAccountData() == null || user.getAccountData().isBlank()) return Map.of("addresses", java.util.List.of(), "favorites", java.util.List.of(), "reminders", Map.of());
        try { return mapper.readValue(user.getAccountData(), new TypeReference<>() {}); }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "账户数据读取失败"); }
    }

    @PutMapping("/account")
    public Map<String, Object> updateAccount(@RequestBody Map<String, Object> patch, HttpServletRequest request) {
        UserSession user = currentUser(request);
        Map<String, Object> account = new java.util.HashMap<>(account(request));
        for (String key : java.util.List.of("addresses", "favorites", "reminders")) {
            if (patch.containsKey(key)) account.put(key, patch.get(key));
        }
        try {
            String serialized = mapper.writeValueAsString(account);
            if (serialized.length() > 12000) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "账户资料超出限制");
            user.setAccountData(serialized);
        }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "账户数据格式错误"); }
        auth.save(user);
        return account;
    }

    @PostMapping("/worker-application")
    public Map<String, String> workerApplication(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UserSession user = currentUser(request);
        Object skillsValue = body.get("skills");
        java.util.List<String> skills = skillsValue instanceof java.util.List<?> list
                ? list.stream().filter(String.class::isInstance).map(String.class::cast).toList()
                : java.util.List.of();
        String name = String.valueOf(body.getOrDefault("name", ""));
        auth.submitWorkerApplication(user, name, skills);
        auth.updateProfile(user, null, name);
        return Map.of("status", "待审核");
    }

    public static UserSession currentUser(HttpServletRequest request) {
        Object user = request.getAttribute("miniProgramUser");
        if (!(user instanceof UserSession session)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "请先使用微信登录");
        return session;
    }
}
