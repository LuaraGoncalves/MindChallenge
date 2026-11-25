package com.mindchallenge.infrastructure.storage;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import com.mindchallenge.shared.exception.ResourceNotFoundException;

@Service
public class CharacterImageStorage {
	private final Path root;
	public CharacterImageStorage(@Value("${app.images.directory}") String directory) throws IOException {
		root = Path.of(directory).toAbsolutePath().normalize();
		Files.createDirectories(root);
	}
	public String store(byte[] content) throws IOException {
		if (content.length == 0 || content.length > 2 * 1024 * 1024) throw new IllegalArgumentException("Envie uma imagem de ate 2 MB.");
		try (var input = ImageIO.createImageInputStream(new ByteArrayInputStream(content))) {
			var readers = ImageIO.getImageReaders(input);
			if (!readers.hasNext()) throw new IllegalArgumentException("Envie uma imagem PNG ou JPEG valida.");
			var reader = readers.next();
			try {
				reader.setInput(input);
				String format = reader.getFormatName().toLowerCase(Locale.ROOT);
				if (!format.equals("png") && !format.equals("jpeg")) throw new IllegalArgumentException("Apenas PNG e JPEG sao permitidos.");
				if ((long) reader.getWidth(0) * reader.getHeight(0) > 4_000_000) throw new IllegalArgumentException("A imagem deve ter ate 4 milhoes de pixels.");
				var image = reader.read(0);
				String name = UUID.randomUUID() + ".png";
				// Re-encode the decoded image instead of publishing arbitrary uploaded bytes.
				ImageIO.write(image, "png", root.resolve(name).toFile());
				return "/api/media/" + name;
			} finally { reader.dispose(); }
		} catch (javax.imageio.IIOException exception) {
			throw new IllegalArgumentException("Nao foi possivel ler a imagem.");
		}
	}
	public Resource load(String id) {
		String name;
		try { name = UUID.fromString(id).toString() + ".png"; }
		catch (IllegalArgumentException exception) { throw new ResourceNotFoundException("Imagem nao encontrada"); }
		var resource = new FileSystemResource(root.resolve(name));
		if (!resource.exists() || !resource.isReadable()) throw new ResourceNotFoundException("Imagem nao encontrada");
		return resource;
	}
}
