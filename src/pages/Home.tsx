import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonMenuButton, 
  IonSegment, 
  IonSegmentButton, 
  IonLabel, IonCard, 
  IonButton, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonIcon,
  useIonLoading} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { getFirestore, doc, setDoc, getDoc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { toast} from 'sonner'
import { heartOutline, homeOutline } from 'ionicons/icons'
import { handleArticleClick } from '../utils/handleArticleClick'
import { Article } from '../types/article'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import 'swiper/css';
import 'swiper/css/pagination' 
import './Home.css'
import { AlignCenter } from 'lucide-react';

const API_KEYS = [import.meta.env.VITE_NEWSDATA_API_KEY_1, import.meta.env.VITE_NEWSDATA_API_KEY_2, import.meta.env.VITE_NEWSDATA_API_KEY_3]



dayjs.extend(utc);
dayjs.extend(timezone); 

const Home: React.FC = () => {

  const [topSlides, setTopSlides] = useState<Article[]>([]);
  const [bottomSlides, setBottomSlides] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [present, dismiss] = useIonLoading();
  const [dark, setDark] = useState(false);
  

  useEffect(() => {
    const fetchDarkMode = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      const db = getFirestore();
  
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);
  
          if (userSnap.exists() && typeof userSnap.data().darkMode === "boolean") {
            setDark(userSnap.data().darkMode);
          } else {
            setDark(false); // If darkMode field doesn't exist, fallback to light mode
          }
        } catch (error) {
          console.error("Error fetching dark mode from Firestore:", error);
          setDark(false); // Fallback to light if error
        }
      } else {
        setDark(false); // No user logged in, fallback to light
      }
    };
  
    fetchDarkMode();
  }, []);
      

  const isValidImage = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;

    img.onload = () => {
      // Check dimensions – 400px wide and 200px tall minimum for your CSS
      resolve(img.naturalWidth >= 320 && img.naturalHeight >= 200);
    };

    img.onerror = () => resolve(false); // Invalid image
  });
  };
  


  useEffect(() => {
   setTimeout(() => {
    if (window.location.pathname !== "/app/home") {dismiss(); return;}
   }, 1000);
    
  
    
    const auth = getAuth();
    const db = getFirestore();
    
    const now = dayjs().tz("Europe/Helsinki");
    const fetchKey = now.format("YYYY-MM-DD-HH");
    localStorage.setItem("currentFetchKey", fetchKey);
  
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("📍 ~ onAuthStateChanged triggered:", user);
  
      if (!user) return;
  
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      const lastFetchKey = userSnap.data()?.lastFetchKey || null;
      const firstLogin = userSnap.data()?.firstLogin || false;
      const registering = userSnap.data()?.registering || false;
  
      const loadStoredArticles = async () => {
        const storedArticles: Article[] = userSnap.exists() && Array.isArray(userSnap.data().articles)
          ? userSnap.data().articles
          : [];
  
        const sortedStored = [...storedArticles].sort(
          (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        );
  
        setTopSlides(sortedStored.slice(0, 10));
        setBottomSlides(sortedStored.slice(10, 20));
      };
  
      await loadStoredArticles();
  
      if (lastFetchKey !== fetchKey || firstLogin) {
        if (registering) {
          console.log("🛑 User is still registering. Skipping fetch.");
          return;
        }
  
        const fetchArticles = async () => {
          console.log("📍 ~ fetchArticles called");
  
          const userArticlesRef = collection(db, "users", user.uid, "articles");
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
  
          const stored = userDocSnap.exists() ? userDocSnap.data().articles || [] : [];
          const existingArticles: Article[] = Array.isArray(stored) ? stored : [];
  
          const seenDescription = new Set(
            existingArticles.map(a =>
              a.description?.trim().toLowerCase().replace(/\s+/g, "") || ""
            )
          );
  
          const newArticles: Article[] = [];
          const validArticles: Article[] = [];
  
          let index = parseInt(localStorage.getItem("apiKeyIndex") || "0", 10);
          const apiKey = API_KEYS[index % API_KEYS.length];
          localStorage.setItem("apiKeyIndex", ((index + 1) % API_KEYS.length).toString());
  
          let nextPage: string | null = null;
          let requestsCount = 0;
          const maxRequests = 15;
  
          const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 60000): Promise<Response> => {
            return Promise.race([
              fetch(url, options),
              new Promise<Response>((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out after 1 minute")), timeout)
              )
            ]);
          };
  
         
          
            await dismiss();
            
           
          
          if (!user) {
            await dismiss();
            return;
          }
          
          
          if (window.location.pathname !== "/app/home") {
            await dismiss();
            return;
          }
          
          await present("Fetching articles...");

          while (validArticles.length < 20 && requestsCount < maxRequests) {
            const url = `https://newsdata.io/api/1/news?apikey=${apiKey}${nextPage ? `&page=${nextPage}` : ""}`;
  
            try {
              if(!user) return
              const response = await fetchWithTimeout(url);
              const data = await response.json();
  
              if (!response.ok) {
                if (response.status >= 400 && response.status < 500) {
                  toast.error(`Client error (${response.status}): Something went wrong with the request.`, {
                    id: 'client-error',
                    position: 'top-center',
                    duration: 4000,
                  });
                  return;
                }
  
                if (response.status >= 500) {
                  toast.error(`Server error (${response.status}): The service is currently unavailable.`, {
                    position: 'top-center',
                    duration: 4000,
                  });
                  return;
                }
              }
  
              if (!Array.isArray(data.results)) break;
  
              const filtered = await Promise.all(
                data.results.map(async (article: Article) => {
                  const desc = article.description?.trim().toLowerCase().replace(/\s+/g, "");
                  const isValidLang = ["english", "italian", "finnish"].includes(article.language || "");
                  const hasImage = !!article.image_url;
  
                  if (desc && !seenDescription.has(desc) && isValidLang && hasImage) {
                    const validSize = await isValidImage(article.image_url!);
                    if (validSize) {
                      seenDescription.add(desc);
                      return article;
                    }
                  }
  
                  return null;
                })
              );
  
              const filteredArticles = filtered.filter(Boolean) as Article[];
              newArticles.push(...filteredArticles);
              validArticles.push(...filteredArticles);
  
              nextPage = data.nextPage;
            } catch (error) {
              await dismiss()
              if (error instanceof Error) {
                const message = error.message.includes("timed out")
                  ? "⏳ Request took too long (over 1 minute)."
                  : `Unexpected error occurred: ${error.message}`;
                toast.error(message, {
                  position: 'top-center',
                  duration: 4000,
                });
              } else {
                toast.error("Oops! Something went wrong. Please try again later.", {
                  position: 'top-center',
                  duration: 4000,
                });
              }
  
              index++;
              nextPage = null;
            }finally{
              if(!user) dismiss()
            }
  
            requestsCount++;
          }
  
          const combinedArticles = [...existingArticles, ...newArticles];
  
          await setDoc(userDocRef, { articles: combinedArticles }, { merge: true });
          for (const article of newArticles) {
            await setDoc(doc(userArticlesRef, article.article_id), article);
          }
  
          const sorted = [...newArticles].sort(
            (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
          );
  
          setTopSlides(sorted.slice(0, 10));
          setBottomSlides(sorted.slice(10, 20));
  
          await dismiss();
        };
  
        await fetchArticles();
        await setDoc(userRef, { firstLogin: false, lastFetchKey: fetchKey }, { merge: true });
      } else {
        console.log("⏳ Skipping fetch: Already updated this hour.");
      }
    });
  
    return () => {
      console.log("🧹 Cleaning up onAuthStateChanged");
      unsubscribe();
    };
  }, [present, dismiss]);
  

  const saveToFavorites = async(article: Article) =>{
        const auth = getAuth();
        const user = auth.currentUser;
        if(!user) return;
        try{
          const db = getFirestore();
          const articleRef = doc(db, 'users', user.uid, 'favorites', article.article_id);
          const articleSnap = await getDoc(articleRef);

          if (articleSnap.exists()) {
            toast.info("This article is already in your favorites.", {
              position: 'top-center',
              duration: 4000
            });
            return;
          }
          await setDoc(articleRef, article);
          toast.success("Article saved to favorites!", {
          position: 'top-center',
          duration: 4000
        });
          }catch(error){
              toast.error("Failed to save article. Please try again.", {
                position: 'top-center',
                duration: 4000
              });
              console.log(error)
          }
        }


  return (
  <IonPage>
      <IonHeader>
          <IonToolbar style={{"--background":"#0057B8", "--color":"white"}}>
              <IonButtons slot="start">
                  <IonMenuButton style={{color:"white"}} />
              </IonButtons>
              <IonTitle><IonIcon icon={homeOutline} style={{ verticalAlign: "-3px" }} /> Home</IonTitle>
          </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className={`${dark ? 'swiper-wrapper-fullwidth-dark' : 'swiper-wrapper-fullwidth-light'}`}>
          <b className='swiper-title'>TRENDING NOW</b>
          <IonGrid fixed>
              <IonRow class='ion-justify-content-center'>
                  <IonCol size='12' sizeMd='12' sizeLg='12' sizeXl='12'>
                      <Swiper
                          spaceBetween={20}
                          pagination={{clickable: true}}
                          modules={[Pagination, Autoplay]}
                          autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true}}
                          breakpoints={{
                            320: {
                              slidesPerView: 1,
                            },
                            600: {
                              slidesPerView: 2,
                            },
                            1100: {
                              slidesPerView: 3,
                            },
                            1500: {
                              slidesPerView: 4, 
                            },
                          }}                     >
                          {topSlides.map((article, idx) => 
                          <SwiperSlide key={idx}>
                          <div className='slide-card' style={{ marginTop: "10px" }}>
                          <IonIcon onClick={() => {saveToFavorites(article)}}
                              icon={heartOutline}
                              title='Save to favorites'
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                fontSize: '24px',
                                color: 'red',
                                backgroundColor: 'rgba(0,0,0,0.4)',
                                padding: '5px',
                                borderRadius: '50%',
                                zIndex: 10,
                                cursor:"pointer"
                              }}
                            />
                              <span title={article.title || ''}>
                              <a
                                href={article.link}
                                onClick={(e) => {
                                  e.preventDefault(); // prevent default first
                                  handleArticleClick(article); // then handle tracking + open
                                }}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="slide-card"
                                title={article.title || ''}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                <div className="image-container">
                                  <img
                                    src={article.image_url || '../assets/images/no-image-icon-23500.jpg'}
                                    alt={article.description || 'no image available'}
                                  />
                                  <div className="slide-title">{article.title}</div>
                                </div>
                              </a>
                            </span>
                          </div>
                        </SwiperSlide>
                        
                        
                          )}
                      </Swiper>
                  </IonCol>
              </IonRow>
          </IonGrid>
        </div>
          <IonSegment scrollable class="ion-justify-content-center"
          value={selectedCategory}
          onIonChange={e => setSelectedCategory(e.detail.value as string)}
          >
              <IonSegmentButton value='all'>
                  <IonLabel>All</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="top">
                  <IonLabel>Top</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="tech">
                  <IonLabel>Tech</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="sport">
                  <IonLabel>Sport</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="politics">
                  <IonLabel>Politics</IonLabel>
              </IonSegmentButton>
          </IonSegment>
          <IonGrid fixed>
              <IonRow class='ion-justify-content-center'>
                <IonCol sizeLg='10' sizeXl='10'>
                  <div className='feed-cards-wrapper'>
                      {bottomSlides
                      .filter(article => {
                        if (selectedCategory === 'all') return true;
                        const rawCategory = article.category || '';
                        const category = Array.isArray(rawCategory)
                        ? rawCategory.join(', ').toLowerCase()
                        : rawCategory.toLowerCase();
                        return category.toLowerCase().includes(selectedCategory.toLowerCase());
                      })
                      .map((article, i) =>
                        <div key={i} className="feed-card">
                          <IonCard className={`ion-margin-top ${dark ? 'colored-card-dark' : 'colored-card-light'}`}>
                              <IonCardHeader>
                              <IonCardTitle
                                  className='ion-margin-bottom colored-title'
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}
                                >
                                  <span title={article.title}>
                                    {article.title.length > 30 ? article.title.slice(0, 30) + '...' : article.title}
                                  </span>
                                  <span onClick={() => {saveToFavorites(article)}}>
                                    <IonIcon
                                      icon={heartOutline}
                                      title='Save to favorites'
                                      style={{
                                        fontSize: '22px',
                                        color: 'red',
                                        marginLeft: '10px',
                                        cursor: 'pointer'
                                      }}
                                    />
                                  </span>
                                </IonCardTitle>

                                      <IonImg src={article.image_url ? article.image_url : "no images available"} style={{
                                              width: "300px",       // or a fixed value like "300px"
                                              height: "300px",      // force height
                                              objectFit: "cover",   // to crop and maintain aspect ratio
                                              display: 'block', 
                                              AlignCenter: '-3px' 
                                          }}
                                      />
                              </IonCardHeader>
                              <IonCardContent>
                                  🕒 {new Date(article.pubDate).toLocaleString('fi-FI', {
                                        timeZone:"Europe/Helsinki",
                                        day: 'numeric',
                                        month: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false})} <br />
                                  <span title={article.description || ''}>    
                                  📌 {article.description && article.description.length > 30?
                                      article.description.slice(0, 30) + '...' : article.description || 'No description available'}</span><br />
                                  🌐 Source: {article.link ? new URL(article.link).hostname : 'Unknown'} <br />
                                    <IonButton onClick={(e) => {
                                  e.preventDefault(); // prevent default first
                                  handleArticleClick(article); // then handle tracking + open
                                      }} 
                                      target="_blank" 
                                      className='ion-margin-top' 
                                      size='small'>
                                          View Full Article 🔍
                                      </IonButton>
                              </IonCardContent>
                          </IonCard>
                        </div>
                      )}
                    </div>
                  </IonCol>
              </IonRow>
          </IonGrid>
      
          
      </IonContent>
  </IonPage>
);
};

export default Home