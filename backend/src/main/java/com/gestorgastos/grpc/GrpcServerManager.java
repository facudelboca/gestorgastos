package com.gestorgastos.grpc;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "grpc.server.enabled", havingValue = "true", matchIfMissing = true)
public class GrpcServerManager {

    private final TransactionGrpcServiceImpl transactionGrpcService;

    @Value("${grpc.server.port:9090}")
    private int port;

    private Server server;

    @PostConstruct
    public void start() throws IOException {
        server = ServerBuilder.forPort(port)
                .addService(transactionGrpcService)
                .build()
                .start();
        log.info("gRPC Server started, listening on port {}", server.getPort());
    }

    @PreDestroy
    public void stop() {
        if (server != null) {
            log.info("Shutting down gRPC Server on port {}...", server.getPort());
            server.shutdown();
        }
    }

    public int getPort() {
        return server != null ? server.getPort() : port;
    }
}
