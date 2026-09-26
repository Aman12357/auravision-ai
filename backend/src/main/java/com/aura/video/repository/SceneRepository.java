package com.aura.video.repository;

import com.aura.video.entity.Scene;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SceneRepository extends JpaRepository<Scene, UUID> {
    List<Scene> findByStoryboardIdOrderBySceneIndexAsc(UUID storyboardId);
}
