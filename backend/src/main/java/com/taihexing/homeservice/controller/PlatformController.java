package com.taihexing.homeservice.controller;

import com.taihexing.homeservice.dto.*;
import com.taihexing.homeservice.service.PlatformService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/admin")
public class PlatformController {
    private final PlatformService service; public PlatformController(PlatformService s){service=s;}
    @GetMapping("/dashboard") public Map<String,Object> dashboard(){return service.dashboard();}
    @GetMapping("/services") public Object services(){return service.services();}
    @GetMapping("/providers") public Object providers(){return service.providers();}
    @GetMapping("/orders") public Object orders(@RequestParam(required=false) String status){return service.orders(status);}
    @PatchMapping("/orders/{id}/status") public ResponseEntity<?> status(@PathVariable Long id,@Valid @RequestBody StatusRequest r){try{return ResponseEntity.ok(service.updateStatus(id,r.status()));}catch(Exception e){return ResponseEntity.notFound().build();}}
    @PostMapping("/orders/{id}/accept") public ResponseEntity<?> accept(@PathVariable Long id,@RequestParam(defaultValue="1") Long providerId){try{return ResponseEntity.ok(service.accept(id,providerId));}catch(Exception e){return ResponseEntity.notFound().build();}}
}
