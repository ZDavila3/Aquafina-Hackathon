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

                                        Look at this image and identify the
                                        primary object or piece of waste.

                                        Return ONLY a short description of:
                                        1. What the item is
                                        2. Its likely material
                                        3. A broad waste category

                                        Do not give disposal instructions yet.
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
                .orElse("I could not identify this item.");
    }
}