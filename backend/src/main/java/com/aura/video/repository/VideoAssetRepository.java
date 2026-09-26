package com.aura.video.repository;

import com.aura.video.entity.VideoAsset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VideoAssetRepository extends JpaRepository<VideoAsset, UUID> {
    Page<VideoAsset> findByWorkspaceId(UUID workspaceId, Pageable pageable);
    List<VideoAsset> findByJobId(UUID jobId);
    
    @Query("SELECT SUM(a.fileSizeBytes) FROM VideoAsset a WHERE a.workspace.id = :workspaceId")
    Long sumFileSizeBytesByWorkspaceId(@Param("workspaceId") UUID workspaceId);
}
