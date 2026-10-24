package com.lostfound.web;

import com.lostfound.domain.user.User;
import com.lostfound.repo.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody RegisterReq req) {
        if (userRepository.existsByEmail(req.email)) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setName(req.name);
        user.setEmail(req.email);
        user.setPasswordHash(passwordEncoder.encode(req.password));
        user.setRole(User.Role.USER);
        userRepository.save(user);
        return Map.of("id", user.getId(), "email", user.getEmail(), "role", user.getRole().name());
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginReq req, HttpServletRequest request) {
        User user = userRepository.findByEmail(req.email).orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(req.password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user.getEmail(), null, List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        request.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
        return Map.of("email", user.getEmail(), "name", user.getName(), "role", user.getRole().name());
    }

    @GetMapping("/me")
    public Map<String, Object> me(java.security.Principal principal) {
        if (principal == null) throw new RuntimeException("Not authenticated");
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return Map.of("email", user.getEmail(), "name", user.getName(), "role", user.getRole().name());
    }

    public static class RegisterReq {
        public String name;
        public String email;
        public String password;
    }

    public static class LoginReq {
        public String email;
        public String password;
    }
}
