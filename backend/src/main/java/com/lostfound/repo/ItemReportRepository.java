package com.lostfound.repo;

import com.lostfound.domain.report.ItemReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ItemReportRepository extends JpaRepository<ItemReport, Long> {
    Page<ItemReport> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
