package com.aura.video.repository;

import com.aura.video.entity.VideoJob;
import com.aura.video.entity.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface VideoJobRepository extends JpaRepository<VideoJob, UUID> {
    Page<VideoJob> findByWorkspaceId(UUID workspaceId, Pageable pageable);
    Page<VideoJob> findByUserId(UUID userId, Pageable pageable);
    Page<VideoJob> findByWorkspaceIdAndStatus(UUID workspaceId, JobStatus status, Pageable pageable);
    List<VideoJob> findByStatusInAndRetryCountLessThan(List<JobStatus> statuses, int maxRetries);
    long countByWorkspaceIdAndStatus(UUID workspaceId, JobStatus status);
    
    @Query("SELECT SUM(j.actualCostCredits) FROM VideoJob j WHERE j.workspace.id = :wid AND j.status = 'COMPLETED' AND j.completedAt > :since")
    Long sumCreditsByWorkspaceSince(@Param("wid") UUID wid, @Param("since") ZonedDateTime since);
}
