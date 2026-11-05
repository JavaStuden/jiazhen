package com.taihexing.homeservice.service;

import com.taihexing.homeservice.dto.CreateOrderRequest;
import com.taihexing.homeservice.dto.OrderActionRequest;
import com.taihexing.homeservice.dto.ProviderRequest;
import com.taihexing.homeservice.dto.ServiceItemRequest;
import com.taihexing.homeservice.model.Order;
import com.taihexing.homeservice.model.Provider;
import com.taihexing.homeservice.model.ServiceItem;
import com.taihexing.homeservice.model.UserSession;
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

    public PlatformService(ServiceItemRepository services, ProviderRepository providers, OrderRepository orders) {
        this.services = services;
        this.providers = providers;
        this.orders = orders;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (services.count() == 0) {
            services.saveAll(defaultServices());
        } else {
            List<ServiceItem> existing = services.findAll();
            List<ServiceItem> defaults = defaultServices();
            for (ServiceItem def : defaults) {
                ServiceItem match = existing.stream()
                        .filter(item -> def.getName().equals(item.getName()) || item.getName().startsWith(def.getName().split("·")[0]))
                        .findFirst()
                        .orElse(null);
                if (match == null) {
                    services.save(def);
                } else if (match.getArea() == null || match.getIncludedItems() == null || match.getIncludedItems().isEmpty()) {
                    match.updateFrom(
                            def.getName(),
                            def.getCategory(),
                            def.getDescription(),
                            def.getArea(),
                            def.getDurationHours(),
                            def.getDurationLabel(),
                            def.getTypeTag(),
                            def.getPrice(),
                            def.getTechnicalFee(),
                            def.isActive(),
                            def.getTags(),
                            def.getServiceSections().stream().map(m -> m.get("area") + "|" + m.get("detail")).toList(),
                            def.getIncludedItems(),
                            def.getDisclaimer()
                    );
                    services.save(match);
                }
            }
        }

        // Orders and provider profiles are created through authenticated workflows, not seeded demo records.
    }

    private List<ServiceItem> defaultServices() {
        return List.of(
                new ServiceItem(
                        null, "2小时基础保洁", "家政保洁", "客厅、卧室、厨房日常清洁", "50㎡以内", 2, "2小时", "日常清洁", 118, 9.9, true,
                        List.of("≤50㎡", "日常清洁", "平台标准", "可开发票"),
                        List.of(
                                "客厅与卧室|地面清扫拖洗、家具日常表面浮尘擦拭",
                                "厨房|台面、水槽表面擦拭及地面基础清洁",
                                "卫生间|洁具、台盆表面清洁及毛发归集",
                                "收尾整理|生活垃圾归集打包、物品随手归位"
                        ),
                        List.of(
                                "客厅、卧室地面日常清扫与拖洗",
                                "家具与常用台面表面除尘",
                                "厨房台面与水槽表面清理",
                                "卫生间台盆与洁具表面除污",
                                "厨房、卫生间地面基础清洁",
                                "生活垃圾归集与简单归位"
                        ),
                        "不包含：高空玻璃、重度除垢、家电拆洗；超出套餐范围须先与雇主确认。"
                ),
                new ServiceItem(
                        null, "3小时深度保洁", "家政保洁", "除尘、卧室整理、厨卫清洁", "50-80㎡", 3, "3小时", "深度清洁", 168, 9.9, true,
                        List.of("≤80㎡", "客厅/卧室/厨卫", "平台标准", "可开发票"),
                        List.of(
                                "客厅与卧室|地面清扫拖洗、家具表面除尘",
                                "厨房|台面、水槽、灶台表面及地面清洁",
                                "卫生间|洁具、镜面、台盆及地面清洁",
                                "收尾整理|垃圾归集、物品简单归位"
                        ),
                        List.of(
                                "客厅、卧室地面清扫拖洗",
                                "家具及常用台面表面除尘",
                                "厨房台面、水槽、灶台表面清洁",
                                "卫生间洁具、镜面、台盆清洁",
                                "厨房、卫生间地面清洁",
                                "垃圾归集与物品简单归位"
                        ),
                        "不包含：高空玻璃、重度除垢、家电拆洗；超出套餐范围须先与雇主确认。"
                ),
                new ServiceItem(
                        null, "4小时全屋保洁", "家政保洁", "全屋精细除尘、厨卫深层去污与收纳归位", "80-120㎡", 4, "4小时", "全屋清洁", 228, 9.9, true,
                        List.of("≤120㎡", "全屋服务", "深度去污", "可开发票"),
                        List.of(
                                "客厅与卧室|全屋精细除尘、门窗框内侧擦拭、踢脚线清洁",
                                "厨房|油烟机外壳油污擦拭、灶台水槽深层去污",
                                "卫生间|淋浴房水垢擦洗、马桶深层消毒除臭",
                                "收尾整理|全屋废弃物分类清运、杂物规整摆放"
                        ),
                        List.of(
                                "全屋门窗框内侧及踢脚线精细除尘",
                                "客厅、主次卧地面深度清扫拖洗",
                                "厨房台面、水槽、油烟机表面去油污",
                                "卫生间洁具、淋浴隔断镜面深层清洁",
                                "全屋地面深层拖拭与消毒",
                                "垃圾分类归集清运与物品收纳归位"
                        ),
                        "不包含：高空玻璃、重度除垢、家电拆洗；超出套餐范围须先与雇主确认。"
                ),
                new ServiceItem(
                        null, "居家养老照护·4小时", "养老护理", "陪伴沟通、协助用药、生活整理", "全屋照护", 4, "4小时", "生活照料", 220, 11.0, true,
                        List.of("4小时", "陪伴/助餐/整理", "实名认证", "履约保障"),
                        List.of(
                                "日常生活协助|协助老人穿脱衣物、个人口腔面部清洁",
                                "健康关怀|日常血压体温监测、遵医嘱定时提醒服药",
                                "居室轻度整理|老人卧房床单整理、通风换气及简单清洁",
                                "心理陪伴|读书读报倾听交流、室内轻度慢走活动协助"
                        ),
                        List.of(
                                "协助老人起居日常洗漱清洁",
                                "遵医嘱定时提醒服药与体征监测",
                                "老人卧房床铺整理与通风换气",
                                "营养餐食辅助加热与餐具清洁",
                                "日常血压/体温基础测量记录",
                                "心理沟通倾听与室内适度慢走照护"
                        ),
                        "注：本服务为非医疗生活照护，不含侵入性医疗处置及特级护理。"
                ),
                new ServiceItem(
                        null, "上门维修·水电检修", "上门维修", "上门排查并维修常见水电问题", "全屋排查", 2, "2小时", "专业师傅", 220, 9.9, true,
                        List.of("排查漏水", "电路安全", "自带工具", "明码标价"),
                        List.of(
                                "漏水排查|水龙头、角阀、下水管道滴漏水检测维修",
                                "电路检修|开关插座打火松动检修、短路跳闸排查",
                                "洁具五金|花洒软管更换、角阀更换及五金紧固",
                                "现场安全测试|完工水流通畅试验与通电通断安全测试"
                        ),
                        List.of(
                                "上门水电路系统基础检测诊断",
                                "水龙头/角阀/软管更换安装调试",
                                "开关插座松动打火排查与更换",
                                "下水管道堵塞疏通与防臭检查",
                                "厨卫五金挂件紧固与密封胶修补",
                                "现场安全通水通电测试与完工清洁"
                        ),
                        "维修配件材料费用按平台透明材料标准另计，施工前先报价后作业。"
                ),
                new ServiceItem(
                        null, "三甲医院尊享陪诊·4小时", "陪医陪诊", "诊前规划、院内全程陪同取号缴费取药与医嘱整理", "院内陪同", 4, "4小时", "就医陪护", 399, 15.0, true,
                        List.of("4小时", "三甲医院", "全程导诊", "医嘱同步"),
                        List.of(
                                "诊前协助|就诊科室规划、路线规划及提前取号",
                                "院内陪同|全程排队挂号、护送检查科室、轮椅租借",
                                "取药与医嘱|协助缴费排队、取送化验报告及拿药",
                                "就诊总结|详细记录医生医嘱、整理随诊单推送家属"
                        ),
                        List.of(
                                "诊前沟通确认科室、证件与注意事项",
                                "院内全程一对一陪同导诊与轮椅协助",
                                "协助排队挂号、候诊提醒与科室引导",
                                "协助缴费、打印化验单与取送检查报告",
                                "药房排队取药并核对用药剂量说明",
                                "医嘱复述整理并同步发送至家属微信"
                        ),
                        "不代垫医药费，陪诊人员不代作任何医疗决定。"
                )
        );
    }

    public List<ServiceItem> services() { return services.findByActiveTrue(); }
    public List<ServiceItem> allServices() { return services.findAll(); }
    public ServiceItem getService(Long id) { return services.findById(id).orElseThrow(NoSuchElementException::new); }

    @Transactional
    public ServiceItem createService(ServiceItemRequest req) {
        ServiceItem item = new ServiceItem(
                null,
                req.name(),
                req.category() != null ? req.category() : "家政保洁",
                req.description() != null ? req.description() : "",
                req.area() != null ? req.area() : "50-80㎡",
                req.durationHours() != null ? req.durationHours() : 3,
                req.durationLabel() != null ? req.durationLabel() : ((req.durationHours() != null ? req.durationHours() : 3) + "小时"),
                req.typeTag() != null ? req.typeTag() : "平台标准",
                req.price() != null ? req.price() : 168,
                req.technicalFee() != null ? req.technicalFee() : 9.9,
                req.active() == null || req.active(),
                req.tags(),
                req.sectionEntries(),
                req.includedItems(),
                req.disclaimer() != null ? req.disclaimer() : "不包含：高空玻璃、重度除垢、家电拆洗；超出套餐范围须先与雇主确认。"
        );
        return services.save(item);
    }

    @Transactional
    public ServiceItem updateService(Long id, ServiceItemRequest req) {
        ServiceItem item = services.findById(id).orElseThrow(NoSuchElementException::new);
        item.updateFrom(
                req.name(),
                req.category(),
                req.description(),
                req.area(),
                req.durationHours(),
                req.durationLabel(),
                req.typeTag(),
                req.price(),
                req.technicalFee(),
                req.active(),
                req.tags(),
                req.sectionEntries(),
                req.includedItems(),
                req.disclaimer()
        );
        return services.save(item);
    }

    @Transactional
    public void deleteService(Long id) {
        services.deleteById(id);
    }

    public List<Provider> providers() { return providers.findAll(); }
    public List<Provider> publicProviders() {
        return providers.findAll().stream()
                .filter(Provider::isWechatBound)
                .filter(p -> "在线".equals(p.getStatus()) || "待机".equals(p.getStatus()))
                .toList();
    }
    public Provider getProvider(Long id) { return providers.findById(id).orElseThrow(NoSuchElementException::new); }

    @Transactional
    public Provider createProvider(ProviderRequest req) {
        Provider p = new Provider(
                null,
                req.name(),
                "",
                req.creditScore() != null ? req.creditScore() : 95,
                req.status() != null ? req.status() : "在线",
                req.skills(),
                req.completedOrders() != null ? req.completedOrders() : 0,
                req.rating() != null ? req.rating() : 4.9,
                req.goodRate() != null ? req.goodRate() : "99%",
                req.experienceYears() != null ? req.experienceYears() : 3,
                req.hourlyPrice() != null ? req.hourlyPrice() : 45,
                req.distance() != null ? req.distance() : "1.5km",
                req.healthCertValid() != null ? req.healthCertValid() : true,
                req.skillCertValidUntil() != null ? req.skillCertValidUntil() : "2028-12-31"
        );
        return providers.save(p);
    }

    @Transactional
    public Provider updateProvider(Long id, ProviderRequest req) {
        Provider p = providers.findById(id).orElseThrow(NoSuchElementException::new);
        p.updateFrom(
                req.name(),
                req.creditScore(),
                req.status(),
                req.skills(),
                req.completedOrders(),
                req.rating(),
                req.goodRate(),
                req.experienceYears(),
                req.hourlyPrice(),
                req.distance(),
                req.healthCertValid(),
                req.skillCertValidUntil()
        );
        return providers.save(p);
    }

    public List<Order> orders(String status) {
        return status == null || status.isBlank()
                ? orders.findAllByOrderByCreatedAtDesc()
                : orders.findByStatusOrderByCreatedAtDesc(status);
    }

    public List<Order> ordersForUser(UserSession user, String status) {
        List<Order> visible;
        if ("customer".equals(user.getRole())) {
            visible = orders.findByCustomerOpenIdOrderByCreatedAtDesc(user.getOpenId());
        } else {
            Provider provider = providers.findByWechatOpenId(user.getOpenId()).orElseThrow(NoSuchElementException::new);
            visible = orders.findByProviderIdOrderByCreatedAtDesc(provider.getId());
        }
        return status == null || status.isBlank() ? visible : visible.stream().filter(o -> status.equals(o.getStatus())).toList();
    }

    public List<Order> availableOrders() {
        return orders.findByStatusOrderByCreatedAtDesc("待接单");
    }

    public Order getOrderForUser(Long id, UserSession user) {
        Order order = getOrder(id);
        boolean allowed = "customer".equals(user.getRole())
                ? user.getOpenId().equals(order.getCustomerOpenId())
                : providers.findByWechatOpenId(user.getOpenId()).map(p -> p.getId().equals(order.getProviderId())).orElse(false);
        if (!allowed) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND);
        return order;
    }

    @Transactional
    public Order markPaid(Long id) {
        Order order = orders.findById(id).orElseThrow(NoSuchElementException::new);
        if (!"待支付".equals(order.getStatus())) throw new IllegalStateException("订单当前状态不可支付");
        order.updateStatus("待接单");
        return order;
    }

    public Order getOrder(Long id) {
        return orders.findById(id).orElseThrow(NoSuchElementException::new);
    }

    @Transactional
    public Order create(CreateOrderRequest r, UserSession user) {
        if (!"customer".equals(user.getRole())) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "服务人员不能发布雇主订单");
        if (user.getPhone() == null || user.getPhone().isBlank()) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.PRECONDITION_REQUIRED, "请先授权并验证手机号");
        ServiceItem s = services.findById(r.serviceId()).orElseGet(() -> services.findAll().stream().findFirst().orElse(null));
        if (s == null || !s.isActive()) throw new IllegalArgumentException("该服务项目当前不可用");
        String sName = r.serviceName() != null && !r.serviceName().isBlank()
                ? r.serviceName()
                : (s != null ? s.getName() : "3小时深度保洁");
        String cat = r.category() != null && !r.category().isBlank()
                ? r.category()
                : (s != null ? s.getCategory() : "家政保洁");
        String area = r.area() != null && !r.area().isBlank()
                ? r.area()
                : (s != null ? s.getArea() : "50-80㎡");
        String dur = r.durationLabel() != null && !r.durationLabel().isBlank()
                ? r.durationLabel()
                : (s != null ? s.getDurationLabel() : "3小时");
        Integer amount = s.getPrice();
        Double techFee = s.getTechnicalFee();
        Integer discount = 0;
        Double urgent = r.urgentFee() != null && r.urgentFee() > 0 ? 19.9 : 0.0;
        Double payable = Math.max(0, amount - discount) + techFee + urgent;

        Order order = new Order(
                null,
                newOrderNo(),
                s != null ? s.getId() : r.serviceId(),
                sName,
                cat,
                area,
                dur,
                user.getDisplayName() == null || user.getDisplayName().isBlank() ? "微信用户" : user.getDisplayName(),
                user.getPhone(),
                r.address(),
                r.scheduledAt(),
                r.note(),
                amount,
                techFee,
                discount,
                urgent,
                payable,
                r.paymentMethod(),
                "待支付"
        );
        order.setCustomerOpenId(user.getOpenId());
        return orders.save(order);
    }

    @Transactional
    public Order updateStatus(Long id, String status) {
        if (!List.of("待支付", "待匹配", "待接单", "待上门", "服务中", "待结算", "待评价", "已完成", "售后中", "已取消").contains(status)) {
            throw new IllegalArgumentException("无效订单状态");
        }
        Order o = orders.findById(id).orElseThrow(NoSuchElementException::new);
        o.updateStatus(status);
        return o;
    }

    @Transactional
    public Order accept(Long id, Long providerId) {
        Order o = orders.findById(id).orElseThrow(NoSuchElementException::new);
        if (!List.of("待接单", "待匹配").contains(o.getStatus()) || o.getProviderId() != null) {
            throw new IllegalStateException("订单已被接单或当前状态不可接单");
        }
        Provider p = providers.findById(providerId).orElseThrow(NoSuchElementException::new);
        o.assignProvider(p.getId(), p.getName());
        return o;
    }

    @Transactional
    public Provider bindProviderWechat(Long id, String openId) {
        Provider provider = providers.findById(id).orElseThrow(NoSuchElementException::new);
        if (openId == null || openId.isBlank()) throw new IllegalArgumentException("微信 openid 不能为空");
        provider.setWechatOpenId(openId);
        return providers.save(provider);
    }

    @Transactional
    public Order checkin(Long id, OrderActionRequest req) {
        Order o = orders.findById(id).orElseThrow(NoSuchElementException::new);
        if (!"待上门".equals(o.getStatus())) throw new IllegalStateException("订单当前状态不可打卡");
        o.recordCheckin(req != null ? req.checkinAddress() : null);
        return o;
    }

    @Transactional
    public Order reportAnomaly(Long id, OrderActionRequest req) {
        Order o = orders.findById(id).orElseThrow(NoSuchElementException::new);
        if (req == null) throw new IllegalArgumentException("缺少异常说明");
        if (!"服务中".equals(o.getStatus())) throw new IllegalStateException("仅服务中的订单可以上报异常");
        o.reportAnomaly(
                req.anomalyReason(),
                req.anomalyTargetDuration(),
                req.anomalyTargetAmount()
        );
        return o;
    }

    @Transactional
    public Order confirmAnomaly(Long id, OrderActionRequest req) {
        if (req == null || req.agreed() == null) throw new IllegalArgumentException("请选择同意或拒绝");
        Order o = orders.findById(id).orElseThrow(NoSuchElementException::new);
        o.confirmAnomaly(req.agreed());
        return o;
    }

    @Transactional
    public Order submitReview(Long id, OrderActionRequest req) {
        Order o = orders.findById(id).orElseThrow(NoSuchElementException::new);
        o.submitReview(req != null ? req.reviewScore() : 5, req != null ? req.reviewContent() : "服务认真细致，沟通很耐心");
        return o;
    }

    @Transactional
    public Order submitAfterSales(Long id, OrderActionRequest req) {
        Order o = orders.findById(id).orElseThrow(NoSuchElementException::new);
        o.submitAfterSales(req != null ? req.afterSalesReason() : "服务时长调整核验");
        return o;
    }

    @Transactional
    public Order completeService(Long id) {
        Order order = orders.findById(id).orElseThrow(NoSuchElementException::new);
        if (!"服务中".equals(order.getStatus())) throw new IllegalStateException("仅服务中的订单可以提交完工");
        if ("待确认".equals(order.getAnomalyStatus())) throw new IllegalStateException("请先处理待确认的服务时长调整");
        order.updateStatus("待评价");
        return order;
    }

    @Transactional
    public Order cancelAfterSales(Long id) {
        Order order = orders.findById(id).orElseThrow(NoSuchElementException::new);
        order.cancelAfterSales();
        return order;
    }

    public Map<String, Object> dashboard() {
        long pending = orders.countByStatusIn(List.of("待匹配", "待接单"));
        long serving = orders.countByStatusIn(List.of("待上门", "服务中"));
        int revenue = orders.findByStatus("已完成").stream().mapToInt(o -> o.getAmount() == null ? 0 : o.getAmount()).sum();
        return Map.of(
                "totalOrders", orders.count(),
                "pendingOrders", pending,
                "servingOrders", serving,
                "revenue", revenue,
                "providerCount", providers.count(),
                "serviceCount", services.count()
        );
    }

    private String newOrderNo() {
        return "TH" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }
}
