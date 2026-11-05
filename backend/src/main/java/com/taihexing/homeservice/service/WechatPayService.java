package com.taihexing.homeservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taihexing.homeservice.model.Order;
import com.taihexing.homeservice.model.UserSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class WechatPayService {
    private static final String HOST = "https://api.mch.weixin.qq.com";
    private final RestClient http = RestClient.create();
    private final ObjectMapper json = new ObjectMapper();
    private final PlatformService platform;

    @Value("${wechat.mini-program.app-id:}") private String appId;
    @Value("${wechat.pay.merchant-id:}") private String merchantId;
    @Value("${wechat.pay.certificate-serial:}") private String certificateSerial;
    @Value("${wechat.pay.private-key-path:}") private String privateKeyPath;
    @Value("${wechat.pay.notify-url:}") private String notifyUrl;

    public WechatPayService(PlatformService platform) { this.platform = platform; }

    public Map<String, String> createMiniProgramPayment(Order order, UserSession user) {
        requireConfigured();
        if (!"待支付".equals(order.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "订单当前状态不可支付");
        String nonce = UUID.randomUUID().toString().replace("-", "");
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("appid", appId);
        body.put("mchid", merchantId);
        body.put("description", order.getServiceName());
        body.put("out_trade_no", order.getOrderNo());
        body.put("notify_url", notifyUrl);
        body.put("amount", Map.of("total", (int)Math.round(order.getPayableAmount() * 100), "currency", "CNY"));
        body.put("payer", Map.of("openid", user.getOpenId()));
        try {
            String bodyJson = json.writeValueAsString(body);
            String authorization = authorization("POST", "/v3/pay/transactions/jsapi", bodyJson);
            Map<?, ?> result = http.post().uri(HOST + "/v3/pay/transactions/jsapi")
                    .header("Authorization", authorization).header("Accept", "application/json")
                    .header("Content-Type", "application/json").body(bodyJson).retrieve().body(Map.class);
            Object prepayId = result == null ? null : result.get("prepay_id");
            if (prepayId == null) throw new IllegalStateException("WeChat Pay did not return prepay_id");
            String timeStamp = String.valueOf(Instant.now().getEpochSecond());
            String pkg = "prepay_id=" + prepayId;
            String paySign = sign(appId + "\n" + timeStamp + "\n" + nonce + "\n" + pkg + "\n");
            return Map.of("timeStamp", timeStamp, "nonceStr", nonce, "package", pkg, "signType", "RSA", "paySign", paySign);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "微信支付下单失败");
        }
    }

    public Order confirmPayment(Order order, UserSession user) {
        requireConfigured();
        if (!user.getOpenId().equals(order.getCustomerOpenId())) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        try {
            String path = "/v3/pay/transactions/out-trade-no/" + order.getOrderNo() + "?mchid=" + merchantId;
            Map<?, ?> result = http.get().uri(HOST + path).header("Authorization", authorization("GET", path, ""))
                    .header("Accept", "application/json").retrieve().body(Map.class);
            if (result == null || !"SUCCESS".equals(result.get("trade_state"))) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "微信尚未确认支付成功");
            }
            return platform.markPaid(order.getId());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "暂时无法确认支付状态");
        }
    }

    private void requireConfigured() {
        if (appId.isBlank() || merchantId.isBlank() || certificateSerial.isBlank() || privateKeyPath.isBlank() || notifyUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "微信支付尚未配置商户号、证书和支付回调地址");
        }
    }

    private String authorization(String method, String path, String body) throws Exception {
        String timestamp = String.valueOf(Instant.now().getEpochSecond());
        String nonce = UUID.randomUUID().toString().replace("-", "");
        String message = method + "\n" + path + "\n" + timestamp + "\n" + nonce + "\n" + body + "\n";
        String signature = sign(message);
        return "WECHATPAY2-SHA256-RSA2048 mchid=\"" + merchantId + "\",nonce_str=\"" + nonce
                + "\",timestamp=\"" + timestamp + "\",serial_no=\"" + certificateSerial + "\",signature=\"" + signature + "\"";
    }

    private String sign(String message) throws Exception {
        String pem = Files.readString(Path.of(privateKeyPath)).replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "").replaceAll("\\s", "");
        PrivateKey key = KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(pem)));
        Signature signer = Signature.getInstance("SHA256withRSA");
        signer.initSign(key);
        signer.update(message.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(signer.sign());
    }
}
