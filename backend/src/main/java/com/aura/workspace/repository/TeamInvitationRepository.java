package com.aura.workspace.repository;

import com.aura.workspace.entity.TeamInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, UUID> {
    Optional<TeamInvitation> findByToken(String token);
    List<TeamInvitation> findByEmailAndStatus(String email, String status);
}
