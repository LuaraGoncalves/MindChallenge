package com.mindchallenge.shared.exception;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.mindchallenge.api.dto.ApiErrorResponse;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	public ApiErrorResponse handleNotFound(ResourceNotFoundException exception) {
		return new ApiErrorResponse(
				Instant.now(),
				HttpStatus.NOT_FOUND.value(),
				"Recurso nao encontrado",
				List.of(exception.getMessage())
		);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ApiErrorResponse handleValidation(MethodArgumentNotValidException exception) {
		List<String> details = exception.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(error -> error.getField() + ": " + error.getDefaultMessage())
				.toList();

		return new ApiErrorResponse(
				Instant.now(),
				HttpStatus.BAD_REQUEST.value(),
				"Dados invalidos",
				details
		);
	}
}
