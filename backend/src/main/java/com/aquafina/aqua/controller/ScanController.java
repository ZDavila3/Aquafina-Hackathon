package com.aquafina.aqua.controller;

import com.aquafina.aqua.model.ScanResult;
import com.aquafina.aqua.service.ScanService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class ScanController {

    private final ScanService scanService;

    public ScanController(ScanService scanService) {
        this.scanService = scanService;
    }

    @PostMapping("/api/scan")
    public ScanResult scan(@RequestParam("image") MultipartFile image)
            throws Exception {

        return scanService.scanImage(image);
    }
}