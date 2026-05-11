// src/services/imageService.ts
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

// !!! ЗАМЕНИ НА СВОИ КЛЮЧИ ИЗ IMAGEKIT !!!
const IMAGEKIT_PRIVATE_KEY = "private_nGLnKTSmsqGBsfKR8tlN80p2GuU=";
const IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/ozfxy95et";

// Проверка при загрузке
console.log(
  "🔧 ImageKit загружен, ключ:",
  IMAGEKIT_PRIVATE_KEY ? "✅ есть" : "❌ нет",
);

// Сделать фото
export async function takePhoto(): Promise<string | null> {
  console.log("📷 takePhoto вызвана");

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    console.log("❌ Нет разрешения на камеру");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]?.uri) {
    console.log("✅ Фото сделано:", result.assets[0].uri);
    return result.assets[0].uri;
  }
  return null;
}

// Выбрать фото из галереи
export async function pickImage(): Promise<string | null> {
  console.log("🖼️ pickImage вызвана");

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]?.uri) {
    console.log("✅ Фото выбрано:", result.assets[0].uri);
    return result.assets[0].uri;
  }
  return null;
}

// Загрузить фото в ImageKit (версия с новым File API)
export async function uploadImageToFirebase(
  workoutId: string,
  localUri: string,
): Promise<string | null> {
  console.log("📤 uploadImageToFirebase (ImageKit) вызвана");
  console.log("📤 workoutId:", workoutId);
  console.log("📤 localUri:", localUri);

  if (!IMAGEKIT_PRIVATE_KEY) {
    console.error("❌ ImageKit НЕ НАСТРОЕН!");
    return null;
  }

  try {
    // Создаем объект File из локального URI
    const photoFile = new File(localUri);
    console.log("📤 Файл создан, существует?", photoFile.exists);

    // Получаем base64 из файла (новый метод)
    const base64 = await photoFile.base64();
    console.log("📤 Размер base64:", base64.length, "символов");

    // Определяем тип файла
    const mimeType = localUri.endsWith(".png") ? "image/png" : "image/jpeg";
    const fileName = `workout_${workoutId}_${Date.now()}.jpg`;

    console.log("📤 Загрузка в ImageKit...");

    // Формируем FormData
    const formData = new FormData();
    formData.append("file", `data:${mimeType};base64,${base64}`);
    formData.append("fileName", fileName);
    formData.append("useUniqueFileName", "true");
    formData.append("folder", "/workout_photos");

    // Отправляем запрос
    const auth = btoa(IMAGEKIT_PRIVATE_KEY + ":");

    const response = await fetch(
      "https://upload.imagekit.io/api/v1/files/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
        },
        body: formData,
      },
    );

    const data = await response.json();

    if (response.ok && data.url) {
      console.log("✅ Фото загружено в ImageKit:", data.url);
      return data.url;
    } else {
      console.error("❌ Ошибка ImageKit:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Ошибка загрузки в ImageKit:", error);
    return null;
  }
}
