package com.aura.common.exception;

import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

@Getter
public class AuraException extends RuntimeException {

    private final ErrorCode errorCode;
    private final Map<String, Object> details;

    public AuraException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }

    public AuraException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }

    public AuraException(ErrorCode errorCode, String customMessage, Throwable cause) {
        super(customMessage, cause);
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }

    public AuraException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getDefaultMessage(), cause);
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }

    public AuraException withDetail(String key, Object value) {
        this.details.put(key, value);
        return this;
    }
}
