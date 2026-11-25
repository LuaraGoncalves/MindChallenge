package com.mindchallenge.api.controller;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.mindchallenge.infrastructure.storage.CharacterImageStorage;

@RestController
public class CharacterImageController {
	private final CharacterImageStorage storage;
	public CharacterImageController(CharacterImageStorage storage) { this.storage = storage; }
	@PostMapping(value = "/api/admin/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public Map<String, String> upload(@RequestParam MultipartFile file) throws IOException {
		return Map.of("url", storage.store(file.getBytes()));
	}
	@GetMapping("/api/media/{id}.png")
	public ResponseEntity<Resource> image(@PathVariable String id) {
		return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG)
				.cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable()).body(storage.load(id));
	}
}
