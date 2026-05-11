import { Typography } from "@/constants/typography";
import { pickImage, takePhoto } from "@/src/services/imageService";
import React, { useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface PhotoPickerProps {
  onPhotoTaken: (uri: string) => void;
  currentImageUri?: string;
}

export function PhotoPicker({
  onPhotoTaken,
  currentImageUri,
}: PhotoPickerProps) {
  const [imageUri, setImageUri] = useState<string | null>(
    currentImageUri || null,
  );

  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri) {
      setImageUri(uri);
      onPhotoTaken(uri);
    } else {
      Alert.alert("Ошибка", "Не удалось сделать фото");
    }
  };

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) {
      setImageUri(uri);
      onPhotoTaken(uri);
    }
  };

  return (
    <View style={styles.container}>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
          <Text style={styles.buttonText} allowFontScaling={false}>Сделать фото</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handlePickImage}>
          <Text style={styles.buttonText} allowFontScaling={false}>Выбрать из галереи</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 10,
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "white",
    fontSize: Typography.buttonFontSize,
    lineHeight: Typography.buttonFontSize + 4,
    fontWeight: "bold",
    flexShrink: 1,
  },
});
