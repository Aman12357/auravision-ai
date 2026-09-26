package com.aura.auth.oauth2;

import com.aura.user.entity.AuthProvider;
import com.aura.user.entity.Role;
import com.aura.user.entity.RoleName;
import com.aura.user.entity.User;
import com.aura.user.repository.RoleRepository;
import com.aura.user.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;

@Service
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public OAuth2UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String providerName = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider authProvider = AuthProvider.valueOf(providerName.toUpperCase());

        Map<String, Object> attributes = oAuth2User.getAttributes();
        String providerId = String.valueOf(attributes.get("id"));
        if (providerId.equals("null") && attributes.containsKey("sub")) {
            providerId = String.valueOf(attributes.get("sub")); // Google uses sub
        }
        
        String rawEmail = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String avatarUrl = (String) attributes.get("avatar_url"); // GitHub
        if (avatarUrl == null) {
            avatarUrl = (String) attributes.get("picture"); // Google
        }
        
        final String email = (rawEmail != null) ? rawEmail : (providerId + "@" + providerName.toLowerCase() + ".local");

        User user = userRepository.findByProviderIdAndAuthProvider(providerId, authProvider)
                .orElseGet(() -> userRepository.findByEmail(email).orElse(new User()));

        if (user.getId() == null) {
            user.setEmail(email);
            // Default username logic
            user.setUsername(email.split("@")[0] + "_" + providerId.substring(0, Math.min(5, providerId.length())));
            user.setFullName(name);
            user.setAvatarUrl(avatarUrl);
            user.setAuthProvider(authProvider);
            user.setProviderId(providerId);
            user.setEmailVerified(true);
            
            Role userRole = roleRepository.findByName(RoleName.USER).orElseThrow();
            user.getRoles().add(userRole);
        } else {
            user.setFullName(name);
            user.setAvatarUrl(avatarUrl);
            if (user.getAuthProvider() == AuthProvider.LOCAL) {
                user.setAuthProvider(authProvider);
                user.setProviderId(providerId);
            }
        }

        user = userRepository.save(user);
        return new AuraOAuth2User(user, attributes);
    }
    
    public static class AuraOAuth2User implements OAuth2User {
        private final User user;
        private final Map<String, Object> attributes;

        public AuraOAuth2User(User user, Map<String, Object> attributes) {
            this.user = user;
            this.attributes = attributes;
        }

        @Override
        public Map<String, Object> getAttributes() {
            return attributes;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return user.getAuthorities();
        }

        @Override
        public String getName() {
            return user.getId().toString();
        }

        public User getUser() {
            return user;
        }
    }
}
