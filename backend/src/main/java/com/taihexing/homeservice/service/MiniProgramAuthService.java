package com.taihexing.homeservice.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.taihexing.homeservice.model.Provider;
import com.taihexing.homeservice.model.UserSession;
import com.taihexing.homeservice.repository.ProviderRepository;
import com.taihexing.homeservice.repository.UserSessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;

@Service
public class MiniProgramAuthService {
    private final UserSessionRepository sessions;
    private final ProviderRepository providers;
    private final RestClient http = RestClient.create();
    private final SecureRandom random = new SecureRandom();

    @Value("${wechat.mini-program.app-id:}") private String appId;
    @Value("${wechat.mini-program.app-secret:}") private String appSecret;

    public MiniProgramAuthService(UserSessionRepository sessions, ProviderRepository providers) {
        this.sessions = sessions;
        this.providers = providers;
    }

    public Map<String, Object> login(String code, String role) {
        if (appId.isBlank() || appSecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "小程序登录尚未配置微信 AppID 和 AppSecret");
        }
        if (!"customer".equals(role) && !"worker".equals(role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "无效的登录角色");
        }
        String url = UriComponentsBuilder.fromHttpUrl("https://api.weixin.qq.com/sns/jscode2session")
                .queryParam("appid", appId).queryParam("secret", appSecret)
                .queryParam("js_code", code).queryParam("grant_type", "authorization_code")
                .build().encode().toUriString();
        WechatSession response;
        try {
            response = http.get().uri(url).retrieve().body(WechatSession.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "微信登录服务暂不可用");
        }
        if (response == null || response.openId == null || response.errCode != null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "微信身份校验失败");
        }
        Provider provider = null;
        if ("worker".equals(role)) {
            provider = providers.findByWechatOpenId(response.openId).orElseGet(() -> {
                Provider application = new Provider(null, "待认证服务人员", "", 60, "待审核", java.util.List.of(), 0,
                        0.0, "0%", 0, 0, "", false, "");
                application.setWechatOpenId(response.openId);
                return providers.save(application);
            });
        }
        UserSession user = sessions.findByOpenId(response.openId).orElseGet(() -> new UserSession(response.openId, token(), role));
        user.setRole(role);
        user.setAccessToken(token());
        sessions.save(user);
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("accessToken", user.getAccessToken());
        result.put("role", role);
        if (provider != null) result.put("accountStatus", provider.getStatus());
        result.put("displayName", user.getDisplayName() == null ? "" : user.getDisplayName());
        result.put("phone", user.getPhone() == null ? "" : user.getPhone());
        return result;
    }

    public UserSession requireToken(String token) {
        if (token == null || token.isBlank()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "请先登录");
        return sessions.findByAccessToken(token).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "登录已失效，请重新登录"));
    }

    public Map<String, Object> updateProfile(UserSession user, String phone, String displayName) {
        if (phone != null && !phone.isBlank()) user.setPhone(phone);
        if (displayName != null && !displayName.isBlank()) user.setDisplayName(displayName);
        sessions.save(user);
        return Map.of("phone", user.getPhone() == null ? "" : user.getPhone(), "displayName", user.getDisplayName() == null ? "" : user.getDisplayName());
    }

    public void save(UserSession user) { sessions.save(user); }

    public Map<String, String> verifyPhone(String phoneCode) {
        if (appId.isBlank() || appSecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "小程序手机号校验尚未配置微信凭证");
        }
        try {
            WechatAccessToken token = http.get().uri(UriComponentsBuilder.fromHttpUrl("https://api.weixin.qq.com/cgi-bin/token")
                    .queryParam("grant_type", "client_credential").queryParam("appid", appId)
                    .queryParam("secret", appSecret).build().encode().toUriString())
                    .retrieve().body(WechatAccessToken.class);
            if (token == null || token.accessToken == null) throw new IllegalStateException();
            WechatPhoneResult result = http.post().uri("https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=" + token.accessToken)
                    .body(Map.of("code", phoneCode)).retrieve().body(WechatPhoneResult.class);
            if (result == null || result.phoneInfo == null || result.phoneInfo.phoneNumber == null) throw new IllegalStateException();
            return Map.of("phone", result.phoneInfo.phoneNumber);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "微信手机号校验失败");
        }
    }

    public void submitWorkerApplication(UserSession user, String name, java.util.List<String> skills) {
        if (!"worker".equals(user.getRole())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "当前账号不是服务人员");
        if (name == null || name.isBlank() || skills == null || skills.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请填写姓名并至少选择一项服务技能");
        }
        Provider provider = providers.findByWechatOpenId(user.getOpenId()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "服务人员申请记录不存在"));
        if (!"待审核".equals(provider.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "账号状态不允许重复提交申请");
        provider.updateFrom(name, null, "待审核", skills, null, null, null, null, null, null, null, null);
        providers.save(provider);
    }

    private String token() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static class WechatSession {
        @JsonProperty("openid") public String openId;
        @JsonProperty("errcode") public Integer errCode;
    }

    private static class WechatAccessToken {
        @JsonProperty("access_token") public String accessToken;
    }

    private static class WechatPhoneResult {
        @JsonProperty("phone_info") public PhoneInfo phoneInfo;
    }

    private static class PhoneInfo {
        @JsonProperty("phoneNumber") public String phoneNumber;
    }
}
