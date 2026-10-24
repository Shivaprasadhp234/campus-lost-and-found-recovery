package com.lostfound.web;

import com.lostfound.domain.report.ItemReport;
import com.lostfound.domain.user.User;
import com.lostfound.repo.ItemReportRepository;
import com.lostfound.repo.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ItemReportRepository reportRepository;
    private final UserRepository userRepository;

    public ReportController(ItemReportRepository reportRepository, UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public Page<ItemReport> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return reportRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public ItemReport get(@PathVariable Long id) {
        return reportRepository.findById(id).orElseThrow();
    }

    @PostMapping
    public ItemReport create(@RequestBody CreateReq req, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        ItemReport report = new ItemReport();
        report.setReportType(ItemReport.ReportType.valueOf(req.reportType));
        report.setTitle(req.title);
        report.setDescription(req.description);
        report.setGeneralLocation(req.generalLocation);
        if (req.eventDate != null && !req.eventDate.isBlank()) {
            report.setEventDate(LocalDate.parse(req.eventDate));
        }
        report.setStatus(ItemReport.Status.OPEN);
        report.setCreatedBy(user);
        return reportRepository.save(report);
    }

    public static class CreateReq {
        public String reportType;
        public String title;
        public String description;
        public String generalLocation;
        public String eventDate;
    }
}
