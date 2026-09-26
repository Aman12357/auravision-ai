package com.aura.video.repository;

import com.aura.video.entity.Character;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CharacterRepository extends JpaRepository<Character, UUID> {
    Page<Character> findByWorkspaceId(UUID workspaceId, Pageable pageable);
}
