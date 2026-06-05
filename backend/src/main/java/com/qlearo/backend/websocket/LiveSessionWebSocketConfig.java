package com.qlearo.backend.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class LiveSessionWebSocketConfig implements WebSocketConfigurer {

    private final LiveSessionWebSocketHandler liveSessionWebSocketHandler;

    public LiveSessionWebSocketConfig(LiveSessionWebSocketHandler liveSessionWebSocketHandler) {
        this.liveSessionWebSocketHandler = liveSessionWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(liveSessionWebSocketHandler, "/ws/live-session")
            .setAllowedOrigins("*");
    }
}
