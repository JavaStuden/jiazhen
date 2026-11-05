package com.taihexing.homeservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.taihexing.homeservice.service.MiniProgramAuthService;
import com.taihexing.homeservice.model.UserSession;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final MiniProgramAuthService miniProgramAuth;

    public WebConfig(MiniProgramAuthService miniProgramAuth) { this.miniProgramAuth = miniProgramAuth; }

    @Override public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override public boolean preHandle(HttpServletRequest req,HttpServletResponse res,Object handler) throws Exception {
                if(Boolean.TRUE.equals(req.getSession(false)==null?null:req.getSession(false).getAttribute("adminAuthenticated")))return true;
                res.setStatus(401);res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"message\":\"请先登录管理端\"}");return false;
            }
        }).addPathPatterns("/api/admin/**");
        registry.addInterceptor(new HandlerInterceptor() {
            @Override public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
                String path = req.getRequestURI();
                if (path.matches("/api/public/(services|providers)(/[^/]+)?") || path.equals("/api/public/health")
                        || path.equals("/api/public/auth/wechat")) return true;
                String header = req.getHeader("Authorization");
                String token = header != null && header.startsWith("Bearer ") ? header.substring(7) : null;
                UserSession user = miniProgramAuth.requireToken(token);
                req.setAttribute("miniProgramUser", user);
                return true;
            }
        }).addPathPatterns("/api/public/**");
    }
    @Override public void addCorsMappings(CorsRegistry r) {
        r.addMapping("/api/**").allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS").allowedHeaders("*");
    }
}
