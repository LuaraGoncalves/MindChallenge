package com.mindchallenge.shared.exception;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.mindchallenge.api.dto.ApiErrorResponse;

@RestControllerAdvice
public class ApiExceptionHandler {
	@ExceptionHandler(IllegalArgumentException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ApiErrorResponse handleInvalidArgument(IllegalArgumentException exception) {
		return new ApiErrorResponse(Instant.now(), 400, "Dados invalidos", List.of(exception.getMessage()));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	@ResponseStatus(HttpStatus.CONFLICT)
	public ApiErrorResponse handleConflict(DataIntegrityViolationException exception) {
		return new ApiErrorResponse(Instant.now(), 409, "Cadastro em uso", List.of("Este cadastro possui referencias. Atualize a lista e tente novamente."));
	}

	@ExceptionHandler(MaxUploadSizeExceededException.class)
	@ResponseStatus(HttpStatus.PAYLOAD_TOO_LARGE)
	public ApiErrorResponse handleUploadLimit(MaxUploadSizeExceededException exception) {
		return new ApiErrorResponse(Instant.now(), 413, "Imagem muito grande", List.of("Envie uma imagem de ate 2 MB."));
	}

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
