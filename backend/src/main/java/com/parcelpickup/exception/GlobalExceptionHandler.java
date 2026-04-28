package com.parcelpickup.exception;

import com.parcelpickup.common.Result;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Result<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        Result<Map<String, String>> result = Result.error(400, "参数验证失败");
        result.setData(errors);
        return ResponseEntity.badRequest().body(result);
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Result<String>> handleBadCredentialsException(BadCredentialsException ex) {
        Result<String> result = Result.error(401, "用户名或密码错误");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Result<String>> handleAccessDeniedException(AccessDeniedException ex) {
        Result<String> result = Result.error(403, "没有权限访问");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<String>> handleGenericException(Exception ex) {
        ex.printStackTrace();
        Result<String> result = Result.error("服务器内部错误: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
    }
}
