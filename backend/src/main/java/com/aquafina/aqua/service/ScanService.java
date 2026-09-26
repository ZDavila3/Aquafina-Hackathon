package com.aquafina.aqua.service;

import com.aquafina.aqua.client.VisionApiClient;
import com.aquafina.aqua.model.ScanResult;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ScanService {

    private final VisionApiClient visionApiClient;

    public ScanService(VisionApiClient visionApiClient) {
        this.visionApiClient = visionApiClient;
    }

    public ScanResult scanImage(MultipartFile image) throws Exception {

        String aiResult = visionApiClient.analyzeImage(image);

        return new ScanResult(
                aiResult,
                "Unknown",
                "Needs classification",
                0.0
        );
    }
}