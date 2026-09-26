package com.aura.video.dto;
import com.aura.video.entity.AssetType;
import com.aura.video.entity.VideoAsset;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public record VideoAssetDto(
    UUID id, AssetType assetType, String cdnUrl, String storageKey,
    Long fileSizeBytes, BigDecimal durationSeconds, String resolution,
    String format, Integer downloadCount, ZonedDateTime createdAt
) {
    public static VideoAssetDto fromAsset(VideoAsset asset) {
        return new VideoAssetDto(
            asset.getId(), asset.getAssetType(), asset.getCdnUrl(), asset.getStorageKey(),
            asset.getFileSizeBytes(), asset.getDurationSeconds(), asset.getResolution(),
            asset.getFormat(), asset.getDownloadCount(), asset.getCreatedAt()
        );
    }
}
