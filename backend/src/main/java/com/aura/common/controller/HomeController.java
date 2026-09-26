package com.aura.common.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
            "name", "Aura Video AI Backend Services API",
            "status", "UP",
            "version", "1.0.0",
            "swaggerUi", "/swagger-ui/index.html",
            "healthCheck", "/actuator/health",
            "frontendApp", "http://localhost:3000"
        );
    }
}
