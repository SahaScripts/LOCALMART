package com.localmarketplace.controller;

import com.localmarketplace.entity.ServiceArea;
import com.localmarketplace.repository.ServiceAreaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/service-areas")
public class ServiceAreaController {

    private final ServiceAreaRepository serviceAreaRepository;

    public ServiceAreaController(ServiceAreaRepository serviceAreaRepository) {
        this.serviceAreaRepository = serviceAreaRepository;
    }

    @GetMapping
    public List<ServiceArea> getActiveServiceAreas(@RequestParam(required = false, defaultValue = "false") boolean all) {
        if (all) {
            return serviceAreaRepository.findAll();
        }
        return serviceAreaRepository.findByStatus(ServiceArea.Status.ACTIVE);
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validatePincode(@RequestParam String pincode) {
        String cleanPin = pincode != null ? pincode.trim() : "";
        List<ServiceArea> areas = serviceAreaRepository.findByPincode(cleanPin);
        boolean isCovered = areas.stream().anyMatch(a -> a.getStatus() == ServiceArea.Status.ACTIVE);

        Map<String, Object> result = new HashMap<>();
        result.put("pincode", cleanPin);
        result.put("isCovered", isCovered);
        result.put("serviceAreas", areas);

        return ResponseEntity.ok(result);
    }
}
