// src/services/imageService.ts
import * as ImagePicker from "expo-image-picker";

export async function takePhoto(): Promise<string | null> {
  console.log("📷 takePhoto ВЫЗВАНА");

  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    console.log("📷 Статус разрешения:", status);

    if (status !== "granted") {
      console.log("❌ Нет разрешения на камеру");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    console.log(
      "📷 Результат:",
      result.canceled ? "отменено" : "фото получено",
    );

    if (!result.canceled && result.assets && result.assets[0]) {
      console.log("✅ URI:", result.assets[0].uri);
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error("❌ Ошибка:", error);
    return null;
  }
}

export async function pickImage(): Promise<string | null> {
  console.log("🖼️ pickImage ВЫЗВАНА");

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    console.log("🖼️ Результат:", result.canceled ? "отменено" : "фото выбрано");

    if (!result.canceled && result.assets && result.assets[0]) {
      console.log("✅ URI:", result.assets[0].uri);
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error("❌ Ошибка:", error);
    return null;
  }
}

export async function uploadImageToFirebase(
  workoutId: string,
  localUri: string,
): Promise<string | null> {
  console.log("📤 uploadImageToFirebase:", workoutId);
  console.log("📤 localUri:", localUri);
  // Пока возвращаем локальный URI, потом добавим реальную загрузку
  return localUri;
}
