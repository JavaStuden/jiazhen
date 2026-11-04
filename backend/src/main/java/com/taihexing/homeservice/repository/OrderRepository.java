package com.taihexing.homeservice.repository;
import com.taihexing.homeservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OrderRepository extends JpaRepository<Order,Long> {
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByStatusOrderByCreatedAtDesc(String status);
    long countByStatusIn(List<String> statuses);
    long countByStatus(String status);
    List<Order> findByStatus(String status);
}
