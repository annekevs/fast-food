import * as FileSystem from "expo-file-system";
import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[]; // list of customization names
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
  const list = await databases.listDocuments(
    appwriteConfig.databaseId,
    collectionId
  );

  await Promise.all(
    list.documents.map((doc) =>
      databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
    )
  );
}

async function clearStorage(): Promise<void> {
  const list = await storage.listFiles(appwriteConfig.bucketId);

  await Promise.all(
    list.files.map((file: any) =>
      storage.deleteFile(appwriteConfig.bucketId, file.$id)
    )
  );
}

// console.log(
//       imageUrl,
//       "imageurl response: ",
//       JSON.stringify(response, null, 2),
//       "\n\n",
//       JSON.stringify(blob, null, 2)
//     );

function getMimeType(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

async function uploadImageToStorage(imageUrl: string) {
  try {
    const fileName = imageUrl.split("/").pop() || `file-${Date.now()}.jpg`;
    const localUri = FileSystem.cacheDirectory + fileName;
    await FileSystem.downloadAsync(imageUrl, localUri);

    const mimeType = getMimeType(fileName);
    const fileInfo = (await FileSystem.getInfoAsync(localUri, {
      size: true,
    })) as any;

    const file = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      {
        uri: localUri,
        name: fileName,
        type: mimeType,
        size: fileInfo.size, // <-- Add the size here
      }
    );
    return storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
  } catch (error) {
    console.log("Upload image failed", error);
    throw error;
  }
}

async function seed(): Promise<void> {
  console.log("start seeding");
  // 1. Clear all
  await clearAll(appwriteConfig.categoryCollectionId);
  await clearAll(appwriteConfig.customizationCollectionId);
  await clearAll(appwriteConfig.menuCollectionId);
  await clearAll(appwriteConfig.menuCustomizationCollectionId);
  await clearStorage();
  console.log("clear completed");

  // 2. Create Categories
  const categoryMap: Record<string, string> = {};
  for (const cat of data.categories) {
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoryCollectionId,
      ID.unique(),
      cat
    );
    categoryMap[cat.name] = doc.$id;
  }
  console.log("categories completed: ", JSON.stringify(categoryMap, null, 2));

  // 3. Create Customizations
  const customizationMap: Record<string, string> = {};
  for (const cus of data.customizations) {
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.customizationCollectionId,
      ID.unique(),
      {
        name: cus.name,
        price: cus.price,
        type: cus.type,
      }
    );
    customizationMap[cus.name] = doc.$id;
  }
  console.log("customizations completed");

  // 4. Create Menu Items
  const menuMap: Record<string, string> = {};
  for (const item of data.menu) {
    console.log("start uploading ", item.price);
    const uploadedImage = await uploadImageToStorage(item.image_url);
    console.log("image uploaded ", item.price);
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      ID.unique(),
      {
        name: item.name,
        description: item.description,
        image_url: uploadedImage,
        price: item.price,
        rating: item.rating,
        calories: item.calories,
        protein: item.protein,
        categories: categoryMap[item.category_name],
      }
    );
    console.log("doc created ", item.price);

    menuMap[item.name] = doc.$id;
    console.log("menus completed");

    // 5. Create menu_customizations
    for (const cusName of item.customizations) {
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.menuCustomizationCollectionId,
        ID.unique(),
        {
          menu: doc.$id,
          customizations: customizationMap[cusName],
        }
      );
    }
  }
  console.log("menuCustomizations completed");

  console.log("✅ Seeding complete.");
}

export default seed;
