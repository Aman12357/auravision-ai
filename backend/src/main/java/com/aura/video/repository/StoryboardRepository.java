package com.aura.video.repository;

import com.aura.video.entity.Storyboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StoryboardRepository extends JpaRepository<Storyboard, UUID> {
    List<Storyboard> findByProjectId(UUID projectId);
}
