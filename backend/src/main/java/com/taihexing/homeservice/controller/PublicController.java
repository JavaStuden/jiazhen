package com.taihexing.homeservice.controller;

import com.taihexing.homeservice.service.PlatformService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/public")
public class PublicController {
    private final PlatformService service;
    public PublicController(PlatformService service){this.service=service;}
    @GetMapping("/health") public Map<String,String> health(){return Map.of("status","ok","service","taihexing-home-service");}
    @GetMapping("/services") public Object services(){return service.services();}
}
