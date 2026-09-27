package com.aquafina.aqua.client;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.responses.Response;
import com.openai.models.responses.ResponseCreateParams;
import com.openai.models.responses.ResponseInputImage;
import com.openai.models.responses.ResponseInputItem;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;

@Component
public class VisionApiClient {

    private final OpenAIClient client;

    public VisionApiClient() {
        this.client = OpenAIOkHttpClient.fromEnv();
    }

    public String analyzeImage(MultipartFile image) throws Exception {

        // Convert the uploaded image into Base64
        String base64Image = Base64.getEncoder()
                .encodeToString(image.getBytes());

        // Create the image data URL
        String imageDataUrl =
                "data:image/jpeg;base64," + base64Image;

        // Give the AI both instructions and the image
        ResponseInputItem imageInput =
                ResponseInputItem.ofMessage(
                        ResponseInputItem.Message.builder()
                                .role(ResponseInputItem.Message.Role.USER)

                                .addInputTextContent(
                                        """
                                        You are Aqua AI, an environmental
                                        waste-identification assistant.

                                        Analyze the image and identify the
                                        primary object or piece of waste.

                                        Return ONLY valid JSON using exactly
                                        these four fields:

                                        {
                                          "item": "the specific object",
                                          "material": "the likely material",
                                          "category": "the broad waste category",
                                          "confidence": 0.0
                                        }

                                        Rules:

                                        - "item" should be specific.
                                        - "material" should be as specific as
                                          the image allows. Examples include
                                          PET #1 plastic, HDPE #2 plastic,
                                          aluminum, glass, paper/cardboard,
                                          steel, or organic material.
                                        - "category" should be one of:
                                          recyclable,
                                          compostable,
                                          trash,
                                          or unknown.
                                        - "confidence" must be a number between
                                          0.0 and 1.0.
                                        - Do not provide disposal instructions.
                                        - Do not include markdown.
                                        - Do not include explanations outside
                                          the JSON.
                                        """
                                )

                                .addContent(
                                        ResponseInputImage.builder()
                                                .detail(ResponseInputImage.Detail.AUTO)
                                                .imageUrl(imageDataUrl)
                                                .build()
                                )

                                .build()
                );

        ResponseCreateParams params =
                ResponseCreateParams.builder()
                        .model("gpt-5.4-mini")
                        .inputOfResponse(List.of(imageInput))
                        .build();

        Response response =
                client.responses().create(params);

        return response.output().stream()
                .flatMap(item -> item.message().stream())
                .flatMap(message -> message.content().stream())
                .flatMap(content -> content.outputText().stream())
                .map(outputText -> outputText.text())
                .findFirst()
                .orElse(
                        """
                        {
                          "item": "Unknown item",
                          "material": "Unknown",
                          "category": "unknown",
                          "confidence": 0.0
                        }
                        """
                );
    }
}