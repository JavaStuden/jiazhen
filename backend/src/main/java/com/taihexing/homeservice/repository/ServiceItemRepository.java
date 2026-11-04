package com.taihexing.homeservice.repository;
import com.taihexing.homeservice.model.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ServiceItemRepository extends JpaRepository<ServiceItem,Long> { boolean existsByName(String name); List<ServiceItem> findByActiveTrue(); }
