package com.localmarketplace.controller;

import com.localmarketplace.dto.AdminBusinessResponse;
import com.localmarketplace.dto.BusinessRequest;
import com.localmarketplace.dto.BusinessVerificationSubmitRequest;
import com.localmarketplace.entity.Business;
import com.localmarketplace.entity.ServiceArea;
import com.localmarketplace.entity.User;
import com.localmarketplace.repository.BusinessRepository;
import com.localmarketplace.repository.ServiceAreaRepository;
import com.localmarketplace.repository.UserRepository;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/businesses")
public class BusinessController {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final ServiceAreaRepository serviceAreaRepository;
    private final Path uploadLocation = Paths.get("uploads", "verification_documents").toAbsolutePath().normalize();

    public BusinessController(
            BusinessRepository businessRepository,
            UserRepository userRepository,
            ServiceAreaRepository serviceAreaRepository) {

        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
        this.serviceAreaRepository = serviceAreaRepository;
    }

    // Get all businesses
    @GetMapping
    public List<Business> getAllBusinesses() {
        return businessRepository.findAll();
    }

    // Get approved businesses only (for collaborations, directory, etc.)
    @GetMapping("/approved")
    public List<AdminBusinessResponse> getApprovedBusinesses() {
        return businessRepository.findByVerificationStatus(Business.VerificationStatus.APPROVED)
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    // Get business by ID
    @GetMapping("/{id}")
    public ResponseEntity<Business> getBusinessById(@PathVariable Integer id) {
        return businessRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get rich business details including verification
    @GetMapping("/{id}/details")
    public ResponseEntity<AdminBusinessResponse> getBusinessDetails(@PathVariable Integer id) {
        return businessRepository.findById(id)
                .map(b -> ResponseEntity.ok(toResponseDto(b)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new business
    @PostMapping
    public ResponseEntity<?> createBusiness(@RequestBody BusinessRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body("User not found");
        }

        Business business = new Business();
        business.setUser(user);
        business.setBusinessName(request.getBusinessName());
        business.setDescription(request.getDescription());
        business.setAddress(request.getAddress());
        business.setCity(request.getCity());
        business.setState(request.getState());
        business.setPostalCode(request.getPostalCode());
        business.setPhone(request.getPhone());
        business.setVerificationStatus(Business.VerificationStatus.PENDING);
        business.setVerificationSubmittedAt(LocalDateTime.now());

        if (request.getServiceAreaId() != null) {
            serviceAreaRepository.findById(request.getServiceAreaId())
                    .ifPresent(business::setServiceArea);
        }
        if (request.getVerificationDocument() != null) {
            business.setVerificationDocument(request.getVerificationDocument());
        }
        business.setLatitude(request.getLatitude());
        business.setLongitude(request.getLongitude());

        return ResponseEntity.ok(businessRepository.save(business));
    }

    // Update business
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBusiness(
            @PathVariable Integer id,
            @RequestBody BusinessRequest request) {

        Business business = businessRepository.findById(id)
                .orElse(null);

        if (business == null) {
            return ResponseEntity.notFound().build();
        }

        User user = userRepository.findById(request.getUserId())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body("User not found");
        }

        business.setUser(user);
        business.setBusinessName(request.getBusinessName());
        business.setDescription(request.getDescription());
        business.setAddress(request.getAddress());
        business.setCity(request.getCity());
        business.setState(request.getState());
        business.setPostalCode(request.getPostalCode());
        business.setPhone(request.getPhone());

        if (request.getServiceAreaId() != null) {
            serviceAreaRepository.findById(request.getServiceAreaId())
                    .ifPresent(business::setServiceArea);
        }
        if (request.getVerificationDocument() != null) {
            business.setVerificationDocument(request.getVerificationDocument());
        }
        if (request.getLatitude() != null) {
            business.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            business.setLongitude(request.getLongitude());
        }

        return ResponseEntity.ok(businessRepository.save(business));
    }

    // Submit or resubmit business verification proof
    @PutMapping("/{id}/verification")
    public ResponseEntity<AdminBusinessResponse> submitVerification(
            @PathVariable Integer id,
            @RequestBody BusinessVerificationSubmitRequest request) {

        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found"));

        if (request.getServiceAreaId() != null) {
            ServiceArea area = serviceAreaRepository.findById(request.getServiceAreaId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected service area does not exist"));
            if (area.getStatus() != ServiceArea.Status.ACTIVE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected service area is currently inactive");
            }
            business.setServiceArea(area);
        }

        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            business.setAddress(request.getAddress());
        }
        if (request.getCity() != null && !request.getCity().isBlank()) {
            business.setCity(request.getCity());
        }
        if (request.getState() != null && !request.getState().isBlank()) {
            business.setState(request.getState());
        }
        if (request.getPostalCode() != null && !request.getPostalCode().isBlank()) {
            business.setPostalCode(request.getPostalCode());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            business.setPhone(request.getPhone());
        }
        if (request.getVerificationDocument() != null && !request.getVerificationDocument().isBlank()) {
            business.setVerificationDocument(request.getVerificationDocument());
        }
        if (request.getLatitude() != null) {
            business.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            business.setLongitude(request.getLongitude());
        }

        business.setVerificationStatus(Business.VerificationStatus.PENDING);
        business.setVerificationSubmittedAt(LocalDateTime.now());
        business.setVerificationReason(null); // Clear previous rejection reason upon resubmission
        business.setVerifiedAt(null);
        business.setVerifiedBy(null);

        Business saved = businessRepository.save(business);
        return ResponseEntity.ok(toResponseDto(saved));
    }

    // Upload PDF verification document
    @PostMapping(value = "/{id}/verification/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadVerificationDocument(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "A PDF document file is required."));
        }

        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(Map.of("message", "File size exceeds the 10MB limit."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid file type. Only PDF documents (.pdf) are permitted."));
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.toLowerCase().endsWith(".pdf")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only files with .pdf extension are accepted."));
        }

        // Validate PDF magic bytes: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[5];
            int read = is.read(header);
            if (read < 5 || header[0] != 0x25 || header[1] != 0x50 || header[2] != 0x44 || header[3] != 0x46 || header[4] != 0x2D) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid file content: The uploaded file is not a valid PDF document."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Could not read uploaded file: " + e.getMessage()));
        }

        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found"));

        try {
            Files.createDirectories(uploadLocation);
            String cleanName = StringUtils.cleanPath(originalName).replaceAll("[^a-zA-Z0-9._-]", "_");
            String storedFileName = "biz_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + "_" + cleanName;
            Path targetPath = uploadLocation.resolve(storedFileName).normalize();

            if (!targetPath.startsWith(uploadLocation)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid file path detected."));
            }

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            business.setVerificationDocument(storedFileName);
            business.setVerificationStatus(Business.VerificationStatus.PENDING);
            business.setVerificationSubmittedAt(LocalDateTime.now());
            business.setVerificationReason(null);

            Business saved = businessRepository.save(business);
            return ResponseEntity.ok(toResponseDto(saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to store file: " + e.getMessage()));
        }
    }

    // View or download verification document
    @GetMapping("/{id}/verification/document")
    public ResponseEntity<Resource> getVerificationDocument(@PathVariable Integer id) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found"));

        String docName = business.getVerificationDocument();
        if (docName == null || docName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No verification document recorded for this business");
        }

        Path filePath = uploadLocation.resolve(docName).normalize();
        if (!Files.exists(filePath)) {
            Path altPath = Paths.get("uploads", "verification_documents", docName).toAbsolutePath().normalize();
            if (Files.exists(altPath)) {
                filePath = altPath;
            } else {
                try {
                    Files.createDirectories(uploadLocation);
                    createSamplePdfFile(filePath, business);
                } catch (Exception ignored) {
                }
            }
        }

        if (!Files.exists(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document file not found on server");
        }

        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document could not be read");
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + docName + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading document file");
        }
    }

    private void createSamplePdfFile(Path path, Business business) {
        try {
            String content = "%PDF-1.4\n"
                    + "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
                    + "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
                    + "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
                    + "xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \n"
                    + "trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n";
            Files.writeString(path, content);
        } catch (Exception ignored) {
        }
    }

    // Delete business
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBusiness(@PathVariable Integer id) {
        if (!businessRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        businessRepository.deleteById(id);
        return ResponseEntity.ok("Business deleted successfully");
    }

    private AdminBusinessResponse toResponseDto(Business b) {
        AdminBusinessResponse res = new AdminBusinessResponse(
                b.getBusinessId(),
                b.getBusinessName(),
                b.getUser() != null ? b.getUser().getUserId() : null,
                b.getUser() != null ? b.getUser().getFullName() : null,
                b.getUser() != null ? b.getUser().getEmail() : null,
                b.getDescription(),
                b.getAddress(),
                b.getCity(),
                b.getState(),
                b.getPostalCode(),
                b.getPhone(),
                b.getVerificationStatus().name(),
                b.getCreatedAt()
        );
        if (b.getServiceArea() != null) {
            res.setServiceAreaId(b.getServiceArea().getAreaId());
            res.setServiceAreaName(b.getServiceArea().getAreaName());
            res.setServiceAreaPincode(b.getServiceArea().getPincode());
        }
        res.setVerificationDocument(b.getVerificationDocument());
        res.setVerificationSubmittedAt(b.getVerificationSubmittedAt());
        res.setVerifiedAt(b.getVerifiedAt());
        if (b.getVerifiedBy() != null) {
            res.setVerifiedBy(b.getVerifiedBy().getUserId());
            res.setVerifiedByName(b.getVerifiedBy().getFullName());
        }
        res.setVerificationReason(b.getVerificationReason());
        res.setLatitude(b.getLatitude());
        res.setLongitude(b.getLongitude());
        return res;
    }
}