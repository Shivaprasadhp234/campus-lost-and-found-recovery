package com.lostfound.config;

import com.lostfound.domain.user.User;
import com.lostfound.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    public CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@lostfound.local");
                admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
                admin.setRole(User.Role.ADMIN);
                userRepository.save(admin);
            }
        };
    }
}
