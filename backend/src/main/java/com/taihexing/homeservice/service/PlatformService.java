package com.taihexing.homeservice.service;

import com.taihexing.homeservice.dto.CreateOrderRequest;
import com.taihexing.homeservice.model.Order;
import com.taihexing.homeservice.model.Provider;
import com.taihexing.homeservice.model.ServiceItem;
import com.taihexing.homeservice.repository.OrderRepository;
import com.taihexing.homeservice.repository.ProviderRepository;
import com.taihexing.homeservice.repository.ServiceItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class PlatformService implements CommandLineRunner {
    private final ServiceItemRepository services;
    private final ProviderRepository providers;
    private final OrderRepository orders;
    public PlatformService(ServiceItemRepository services,ProviderRepository providers,OrderRepository orders){this.services=services;this.providers=providers;this.orders=orders;}

    @Override @Transactional public void run(String... args){
        if(services.count()==0){services.saveAll(List.of(
                new ServiceItem(null,"2小时基础保洁","家政保洁","客厅、卧室、厨房日常清洁",2,118,true),
                new ServiceItem(null,"3小时深度保洁","家政保洁","除尘、卧室整理、厨卫清洁",3,168,true),
                new ServiceItem(null,"居家养老照护","养老护理","陪伴沟通、协助用药、生活整理",4,220,true),
                new ServiceItem(null,"上门维修·水电检修","上门维修","上门排查并维修常见水电问题",2,220,true)));}
        if(providers.count()==0){providers.saveAll(List.of(
                new Provider(null,"李阿姨","",96,"在线",List.of("保洁员","养老护理员"),236),
                new Provider(null,"王师傅","",94,"在线",List.of("维修师傅","水电检修"),168),
                new Provider(null,"张阿姨","",92,"待机",List.of("月嫂","母婴护理"),142)));}
    }
    public List<ServiceItem> services(){return services.findByActiveTrue();}
    public List<Provider> providers(){return providers.findAll();}
    public List<Order> orders(String status){return status==null||status.isBlank()?orders.findAllByOrderByCreatedAtDesc():orders.findByStatusOrderByCreatedAtDesc(status);}
    @Transactional public Order create(CreateOrderRequest r){ServiceItem s=services.findById(r.serviceId()).orElseThrow(()->new IllegalArgumentException("服务不存在"));return orders.save(new Order(null,newOrderNo(),s.getId(),s.getName(),r.customerName(),r.phone(),r.address(),r.scheduledAt(),r.note(),s.getPrice(),"待匹配"));}
    @Transactional public Order updateStatus(Long id,String status){if(!List.of("待匹配","待接单","待上门","服务中","待结算","已完成","已取消").contains(status))throw new IllegalArgumentException("无效订单状态");Order o=orders.findById(id).orElseThrow(NoSuchElementException::new);o.updateStatus(status);return o;}
    @Transactional public Order accept(Long id,Long providerId){Order o=orders.findById(id).orElseThrow(NoSuchElementException::new);Provider p=providers.findById(providerId).orElseThrow(NoSuchElementException::new);o.assignProvider(p.getId(),p.getName());return o;}
    public Map<String,Object> dashboard(){long pending=orders.countByStatusIn(List.of("待匹配","待接单"));long serving=orders.countByStatus("服务中");int revenue=orders.findByStatus("已完成").stream().mapToInt(o->o.getAmount()==null?0:o.getAmount()).sum();return Map.of("totalOrders",orders.count(),"pendingOrders",pending,"servingOrders",serving,"revenue",revenue,"providerCount",providers.count());}
    private String newOrderNo(){return "TH"+System.currentTimeMillis()+UUID.randomUUID().toString().substring(0,4).toUpperCase();}
}
