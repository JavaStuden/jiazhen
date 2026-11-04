package com.taihexing.homeservice.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    @Value("${ADMIN_USERNAME:admin}") private String username;
    @Value("${ADMIN_PASSWORD:}") private String password;
    @PostMapping("/login") public ResponseEntity<?> login(@RequestBody Map<String,String> body,HttpServletRequest request,HttpSession session){
        if(password.isBlank()||!username.equals(body.get("username"))||!password.equals(body.get("password")))return ResponseEntity.status(401).body(Map.of("message","账号或密码错误"));
        request.changeSessionId();session.setAttribute("adminAuthenticated",true);return ResponseEntity.ok(Map.of("authenticated",true));
    }
    @GetMapping("/me") public Map<String,Boolean> me(HttpSession session){return Map.of("authenticated",Boolean.TRUE.equals(session.getAttribute("adminAuthenticated")));}
    @PostMapping("/logout") public Map<String,Boolean> logout(HttpSession session){session.invalidate();return Map.of("authenticated",false);}
}
