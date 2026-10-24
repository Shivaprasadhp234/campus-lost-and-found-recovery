package com.lostfound.repo;

import com.lostfound.domain.claim.Claim;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
}
