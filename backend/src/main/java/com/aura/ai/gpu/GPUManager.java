package com.aura.ai.gpu;

import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.lang.management.ManagementFactory;
import com.sun.management.OperatingSystemMXBean;

@Service
@Slf4j
public class GPUManager {

    @Data
    @Builder
    public static class GpuStatus {
        private String gpuName;
        private long totalVramMb;
        private long freeVramMb;
        private double utilizationPercent;
        private double temperatureCelsius;
        private boolean cudaAvailable;
    }

    public GpuStatus getGpuStatus() {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                "nvidia-smi",
                "--query-gpu=name,memory.total,memory.free,utilization.gpu,temperature.gpu",
                "--format=csv,noheader,nounits"
            );
            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line = reader.readLine();
            process.waitFor();

            if (line != null && !line.trim().isEmpty()) {
                String[] parts = line.split(",");
                if (parts.length >= 5) {
                    String gpuName = parts[0].trim();
                    long totalVram = Long.parseLong(parts[1].trim());
                    long freeVram = Long.parseLong(parts[2].trim());
                    double util = Double.parseDouble(parts[3].trim());
                    double temp = Double.parseDouble(parts[4].trim());

                    return GpuStatus.builder()
                        .gpuName(gpuName)
                        .totalVramMb(totalVram)
                        .freeVramMb(freeVram)
                        .utilizationPercent(util)
                        .temperatureCelsius(temp)
                        .cudaAvailable(true)
                        .build();
                }
            }
        } catch (Exception e) {
            log.debug("nvidia-smi execution skipped or GPU unavailable: {}", e.getMessage());
        }

        // Real CPU / OS System Hardware Fallback
        long totalRamMb = 8192L;
        long freeRamMb = 4096L;
        try {
            OperatingSystemMXBean osBean = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
            totalRamMb = osBean.getTotalMemorySize() / (1024 * 1024);
            freeRamMb = osBean.getFreeMemorySize() / (1024 * 1024);
        } catch (Exception ignored) {}

        return GpuStatus.builder()
            .gpuName("System CPU Engine (No NVIDIA GPU Detected)")
            .totalVramMb(totalRamMb)
            .freeVramMb(freeRamMb)
            .utilizationPercent(0.0)
            .temperatureCelsius(35.0)
            .cudaAvailable(false)
            .build();
    }

    public boolean canFitModel(long requiredVramMb) {
        GpuStatus status = getGpuStatus();
        return status.getFreeVramMb() >= requiredVramMb;
    }
}
