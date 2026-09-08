package com.gestorgastos.harness;

import com.gestorgastos.model.User;
import com.gestorgastos.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TestAuthHelper {

    private final JwtService jwtService;

    public String generateToken(User user) {
        return jwtService.generateToken(user);
    }

    public HttpHeaders createAuthHeaders(User user) {
        String token = generateToken(user);
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        return headers;
    }

    public String getBearerHeaderValue(User user) {
        return "Bearer " + generateToken(user);
    }
}
