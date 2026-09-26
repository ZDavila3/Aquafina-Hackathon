package com.aquafina.aqua.model;

public class ScanResult {

    private String item;
    private String material;
    private String category;
    private double confidence;

    public ScanResult(String item, String material, String category, double confidence) {
        this.item = item;
        this.material = material;
        this.category = category;
        this.confidence = confidence;
    }

    public String getItem() {
        return item;
    }

    public String getMaterial() {
        return material;
    }

    public String getCategory() {
        return category;
    }

    public double getConfidence() {
        return confidence;
    }
}