package com.aura.user.repository;

import com.aura.user.entity.AuthProvider;
import com.aura.user.entity.RoleName;
import com.aura.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmailOrUsername(String email, String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByUsername(String username);
    
    Optional<User> findByProviderIdAndAuthProvider(String providerId, AuthProvider provider);
    
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(@Param("roleName") RoleName roleName);
    
    Page<User> findAllByAccountLocked(boolean accountLocked, Pageable pageable);
}
