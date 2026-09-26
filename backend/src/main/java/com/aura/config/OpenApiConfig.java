package com.aura.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI auraOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Aura Video AI API")
                        .description("Enterprise AI Text-to-Video Platform API")
                        .version("1.0.0")
                        .contact(new Contact().name("Aura Support").email("support@auravideo.ai")))
                .servers(List.of(
                        new Server().url("/").description("Current environment server"),
                        new Server().url("https://api.dev.auravideo.ai").description("Development Server"),
                        new Server().url("https://api.auravideo.ai").description("Production Server")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder().group("auth").pathsToMatch("/api/v1/auth/**").build();
    }

    @Bean
    public GroupedOpenApi usersApi() {
        return GroupedOpenApi.builder().group("users").pathsToMatch("/api/v1/users/**").build();
    }

    @Bean
    public GroupedOpenApi videosApi() {
        return GroupedOpenApi.builder().group("videos").pathsToMatch("/api/v1/videos/**").build();
    }

    @Bean
    public GroupedOpenApi paymentsApi() {
        return GroupedOpenApi.builder().group("payments").pathsToMatch("/api/v1/payments/**").build();
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder().group("admin").pathsToMatch("/api/v1/admin/**").build();
    }
}
