package com.aura.video.service;

import com.aura.video.dto.CreateSceneRequest;
import com.aura.video.dto.CreateStoryboardRequest;
import com.aura.video.dto.SceneDto;
import com.aura.video.dto.StoryboardDto;
import com.aura.video.entity.Scene;
import com.aura.video.entity.Storyboard;
import com.aura.video.repository.SceneRepository;
import com.aura.video.repository.StoryboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StoryboardService {
    private final StoryboardRepository storyboardRepository;
    private final SceneRepository sceneRepository;

    public StoryboardDto createStoryboard(CreateStoryboardRequest request, UUID userId) {
        Storyboard storyboard = Storyboard.builder()
                .title(request.title())
                .description(request.description())
                .status("DRAFT")
                .build();
        
        Storyboard saved = storyboardRepository.save(storyboard);
        
        if (request.scenes() != null) {
            var scenes = request.scenes().stream().map(s -> Scene.builder()
                    .storyboard(saved)
                    .sceneIndex(s.sceneIndex())
                    .title(s.title())
                    .prompt(s.prompt())
                    .negativePrompt(s.negativePrompt())
                    .duration(s.duration())
                    .fps(s.fps())
                    .resolution(s.resolution())
                    .aspectRatio(s.aspectRatio())
                    .cameraMotion(s.cameraMotion())
                    .lighting(s.lighting())
                    .style(s.style())
                    .mood(s.mood())
                    .environment(s.environment())
                    .weather(s.weather())
                    .seed(s.seed())
                    .status("PENDING")
                    .build()).collect(Collectors.toList());
            sceneRepository.saveAll(scenes);
            saved.setScenes(scenes);
        }
        return StoryboardDto.fromStoryboard(saved);
    }

    @Transactional(readOnly = true)
    public StoryboardDto getStoryboard(UUID storyboardId, UUID userId) {
        return StoryboardDto.fromStoryboard(storyboardRepository.findById(storyboardId).orElseThrow());
    }

    public SceneDto updateScene(UUID sceneId, CreateSceneRequest request, UUID userId) {
        Scene scene = sceneRepository.findById(sceneId).orElseThrow();
        scene.setPrompt(request.prompt());
        scene.setNegativePrompt(request.negativePrompt());
        if (request.duration() != null) scene.setDuration(request.duration());
        if (request.fps() != null) scene.setFps(request.fps());
        // more field updates as needed...
        return SceneDto.fromScene(sceneRepository.save(scene));
    }

    public StoryboardDto generateStoryboardFromPrompt(String prompt, UUID projectId, UUID userId) {
        // Mock OpenAI logic for breaking prompt into scenes
        Storyboard storyboard = Storyboard.builder()
                .title("Generated Storyboard")
                .description(prompt)
                .status("DRAFT")
                .build();
        Storyboard saved = storyboardRepository.save(storyboard);
        
        Scene scene = Scene.builder()
                .storyboard(saved)
                .sceneIndex(1)
                .title("Scene 1")
                .prompt(prompt)
                .duration(5)
                .fps(24)
                .status("PENDING")
                .build();
        sceneRepository.save(scene);
        saved.setScenes(List.of(scene));
        
        return StoryboardDto.fromStoryboard(saved);
    }
}
