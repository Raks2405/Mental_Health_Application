import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app } from "../../../../../server/firebase";
import type { ArticleItem, BookItem, VideoItem } from "./resources";

export type ResourceCategory = {
  label: string;
  books: BookItem[];
  articles: ArticleItem[];
  videos: VideoItem[];
};

export type ResourceCategoryMap = Record<string, ResourceCategory>;

const RESOURCE_CATEGORIES = "resourceCategories";

let categoryCache: ResourceCategoryMap | null = null;

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

export async function getResourceCategoriesFromFirestore(): Promise<ResourceCategoryMap> {
  if (categoryCache) return categoryCache;

  const db = getFirestore(app);
  const snap = await getDocs(collection(db, RESOURCE_CATEGORIES));
  const categories: ResourceCategoryMap = {};

  snap.docs.forEach((docSnap) => {
    const raw = docSnap.data() as Partial<ResourceCategory>;

    categories[docSnap.id] = {
      label: typeof raw.label === "string" ? raw.label : docSnap.id,
      books: asArray<BookItem>(raw.books),
      articles: asArray<ArticleItem>(raw.articles),
      videos: asArray<VideoItem>(raw.videos),
    };
  });

  categoryCache = categories;
  return categories;
}
