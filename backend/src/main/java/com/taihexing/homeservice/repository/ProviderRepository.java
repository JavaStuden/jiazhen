package com.taihexing.homeservice.repository;
import com.taihexing.homeservice.model.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface ProviderRepository extends JpaRepository<Provider,Long> {
    Optional<Provider> findByWechatOpenId(String wechatOpenId);
}
