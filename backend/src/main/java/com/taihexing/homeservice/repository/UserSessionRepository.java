package com.taihexing.homeservice.repository;

import com.taihexing.homeservice.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByOpenId(String openId);
    Optional<UserSession> findByAccessToken(String accessToken);
}
