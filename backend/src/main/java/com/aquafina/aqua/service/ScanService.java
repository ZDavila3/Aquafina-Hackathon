package com.aquafina.aqua.service;

import com.aquafina.aqua.client.VisionApiClient;
import com.aquafina.aqua.model.ScanResult;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ScanService {

    private final VisionApiClient visionApiClient;
    private final ObjectMapper objectMapper;

    public ScanService(VisionApiClient visionApiClient) {
        this.visionApiClient = visionApiClient;
        this.objectMapper = new ObjectMapper();
    }

    public ScanResult scanImage(MultipartFile image) throws Exception {

        // Ask Aqua AI to analyze the image
        String aiResult = visionApiClient.analyzeImage(image);

        // Convert the AI's JSON response into usable fields
        JsonNode json = objectMapper.readTree(aiResult);

        String item = json.path("item").asText("Unknown item");
        String material = json.path("material").asText("Unknown");
        String category = json.path("category").asText("unknown");
        double confidence = json.path("confidence").asDouble(0.0);

        // Return the structured result to the frontend
        return new ScanResult(
                item,
                material,
                category,
                confidence
        );
    }
}