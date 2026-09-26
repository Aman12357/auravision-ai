package com.aura.video.repository;

import com.aura.video.entity.Project;
import com.aura.video.entity.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    Page<Project> findByWorkspaceIdAndStatus(UUID workspaceId, ProjectStatus status, Pageable pageable);
    Page<Project> findByWorkspaceId(UUID workspaceId, Pageable pageable);
    Page<Project> findByUserId(UUID userId, Pageable pageable);
    
    @Query("SELECT p FROM Project p WHERE p.workspace.id = :workspaceId AND p.name ILIKE %:name%")
    Page<Project> searchByName(@Param("workspaceId") UUID workspaceId, @Param("name") String name, Pageable pageable);
    
    long countByWorkspaceId(UUID workspaceId);
}
