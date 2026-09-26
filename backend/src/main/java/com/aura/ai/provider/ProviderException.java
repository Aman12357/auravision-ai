package com.aura.ai.provider;

import lombok.Getter;

@Getter
public class ProviderException extends RuntimeException {
    private final String providerName;
    private final String errorCode;
    private final boolean retryable;

    public ProviderException(String providerName, String errorCode, String message, boolean retryable) {
        super(message);
        this.providerName = providerName;
        this.errorCode = errorCode;
        this.retryable = retryable;
    }

    public ProviderException(String providerName, String errorCode, String message, boolean retryable, Throwable cause) {
        super(message, cause);
        this.providerName = providerName;
        this.errorCode = errorCode;
        this.retryable = retryable;
    }
}
