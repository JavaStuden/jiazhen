package com.taihexing.homeservice.repository;

import com.taihexing.homeservice.model.OrderMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderMessageRepository extends JpaRepository<OrderMessage, Long> {
    List<OrderMessage> findByOrderIdOrderByCreatedAtAsc(Long orderId);
}
