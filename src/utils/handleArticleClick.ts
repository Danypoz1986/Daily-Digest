// utils/trackArticleRead.ts
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { toast } from 'sonner';

type Article = {
    article_id: string
    title: string;
    pubDate: string;
    image_url?: string;
    description?: string;
    link?: string;
    language?: string
    category?: string
    };

export const handleArticleClick = async (article: Article) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  try {
    const db = getFirestore();
    const userReadsRef = collection(db, 'users', user.uid, 'reads');

    // Efficiently check if article already exists
    const q = query(userReadsRef, where('article_id', '==', article.article_id));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await addDoc(userReadsRef, {
        article_id: article.article_id,
        title: article.title,
        category: article.category || 'Unknown',
        timestamp: new Date().toISOString()
      });
    }

    // ✅ Open the link
    window.open(article.link, '_blank');
  } catch (err) {
    toast.error("Failed to track article read.");
    console.error(err);
  }
};
