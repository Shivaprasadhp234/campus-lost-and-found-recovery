package com.lostfound.web;

import com.lostfound.domain.claim.Claim;
import com.lostfound.domain.report.ItemReport;
import com.lostfound.domain.user.User;
import com.lostfound.repo.ClaimRepository;
import com.lostfound.repo.ItemReportRepository;
import com.lostfound.repo.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
public class ClaimController {
    private final ClaimRepository claimRepository;
    private final ItemReportRepository reportRepository;
    private final UserRepository userRepository;

    public ClaimController(ClaimRepository claimRepository, ItemReportRepository reportRepository, UserRepository userRepository) {
        this.claimRepository = claimRepository;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/reports/{id}/claims")
    public Claim createClaim(@PathVariable Long id, @RequestBody ClaimReq req, Authentication auth) {
        ItemReport report = reportRepository.findById(id).orElseThrow();
        User claimant = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (report.getCreatedBy().getId().equals(claimant.getId())) {
            throw new RuntimeException("Cannot claim own item");
        }
        Claim claim = new Claim();
        claim.setItemReport(report);
        claim.setClaimant(claimant);
        claim.setPrivateClaimDetails(req.privateClaimDetails);
        claim.setStatus(Claim.Status.PENDING);
        return claimRepository.save(claim);
    }

    @GetMapping("/admin/claims")
    @PreAuthorize("hasRole('ADMIN')")
    public java.util.List<Claim> listAll() {
        return claimRepository.findAll();
    }

    @PatchMapping("/admin/claims/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Claim review(@PathVariable Long id, @RequestBody ReviewReq req, Authentication auth) {
        Claim claim = claimRepository.findById(id).orElseThrow();
        User reviewer = userRepository.findByEmail(auth.getName()).orElseThrow();
        claim.setStatus(Claim.Status.valueOf(req.status));
        claim.setReviewedBy(reviewer);
        claim.setReviewNote(req.reviewNote);
        claim.setReviewedAt(LocalDateTime.now());
        if (claim.getStatus() == Claim.Status.APPROVED) {
            ItemReport report = claim.getItemReport();
            report.setStatus(ItemReport.Status.RETURNED);
            reportRepository.save(report);
        }
        return claimRepository.save(claim);
    }

    public static class ClaimReq {
        public String privateClaimDetails;
    }

    public static class ReviewReq {
        public String status;
        public String reviewNote;
    }
}
