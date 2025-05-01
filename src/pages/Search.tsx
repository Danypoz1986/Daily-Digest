import { IonButton, 
         IonButtons, 
         IonCol, 
         IonContent, 
         IonGrid, 
         IonHeader, 
         IonIcon, 
         IonInput, 
         IonItem, 
         IonLabel, 
         IonMenuButton, 
         IonPage, 
         IonRadio, 
         IonRadioGroup, 
         IonRow, 
         IonTitle, 
         IonToolbar } from '@ionic/react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { searchOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { handleArticleClick } from '../utils/handleArticleClick'
import { Article } from '../types/article'
import { toast } from 'sonner'
import './Search.css'



const Search: React.FC = () => {

    const [search, setSearch] = useState('');
    const [results, setResults] = useState<Article[]>([]);
    const [selectedCriteria, setSelectedCriteria] = useState<string>('title')
    const searchRef = useRef<string>("");
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

    const getPlaceholder = (criteria:string) => {
        switch (criteria) {
          case 'title':
            return 'Search by article title';
          case 'language':
            return 'Search by language (e.g. en, fi, it)';
          case 'category':
            return 'Search by category (e.g. politics, tech)';
          case 'pubDate':
            return 'Search by date (DD-MM-YYYY)';
          default:
            return 'Search the article';
        }
      };

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
      

    const isValidEuropeanDate = (input: string): boolean => {
        const parts = input.split('-');
      
        if (parts.length !== 3) return false;
      
        const [day, month, year] = parts.map(p => parseInt(p, 10));
        
        // Basic checks
        if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1000) return false;
      
        // Try creating a Date object and compare values
        const date = new Date(year, month - 1, day);
        return (
          date.getDate() === day &&
          date.getMonth() === month - 1 &&
          date.getFullYear() === year
        );
      };

      const convertToISODate = (dateStr: string): string => {
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month}-${day}`;
      };
      

      const doSearch = async (e: React.FormEvent) => {
        e.preventDefault();
      
        let query = searchRef.current?.toLowerCase() || "";
        if (!query) {
          toast.info("Search field cannot be empty", {
            position: 'top-center',
            duration: 4000,
          });
          return;
        }
      
        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser;
      
        if (!user) {
          console.log("User not authenticated");
          return;
        }
      
        const words = query.split(/[\s,.;!?]+/);
        if (
          words.length === 1 &&
          ['title', 'keywords', 'category'].includes(selectedCriteria) &&
          words[0].length < 4
        ) {
          toast.info("The search term must be at least 4 characters long when using only one word.", {
            position: 'top-center',
            duration: 4000,
          });
          setResults([]);
          return;
        }
      
        if (selectedCriteria === 'pubDate') {
          if (isValidEuropeanDate(query)) {
            query = convertToISODate(query);
          } else {
            toast.info("Please enter a valid date in DD-MM-YYYY format", {
              position: 'top-center',
              duration: 4000,
            });
            return;
          }
        }
      
        try {
          const articlesRef = collection(db, 'users', user.uid, 'articles');
          const snapshot = await getDocs(articlesRef);
          const allArticles: Article[] = snapshot.docs.map(doc => doc.data() as Article);
      
          const seen: string[] = [];
          const matchingArticles = allArticles.filter(article => {
            let field = article[selectedCriteria as keyof Article];
      
            if (selectedCriteria === 'pubDate') {
              // Compare only YYYY-MM-DD portion
              field = (field as string)?.slice(0, 10);
            }
      
            if (seen.includes(article.title.trim())) return false;
      
            if (Array.isArray(field)) {
              field = field.join(' ');
            }
      
            const isMatch =
              typeof field === 'string' &&
              query.split(' ').every(word => field!.toLowerCase().includes(word));
      
            if (isMatch) {
              seen.push(article.title);
              return true;
            }
      
            return false;
          });
      
          setResults(matchingArticles);

          if (matchingArticles.length === 0) {
            toast.info("No matching articles found.", {
              position: 'top-center',
              duration: 4000,
            });
          }
        } catch (error) {
          toast.error("Failed to search articles", {
            position: 'top-center',
          });
          console.error(error);
        }
      };
      
    

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar style={{"--background":"#0057B8", "--color":"white"}}>
                    <IonButtons slot="start">
                        <IonMenuButton style={{color:"white"}} />
                    </IonButtons>
                    <IonTitle><IonIcon icon={searchOutline} style={{ verticalAlign: "-3px" }} />Search</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonGrid fixed>
                    <IonRow class='ion-justify-content-center'>
                        <IonCol size='12' sizeMd='8' sizeLg='6' sizeXl='4'>

                                <form onSubmit={doSearch} noValidate>
                                                <IonInput fill='outline' 
                                                labelPlacement='floating' 
                                                label='Search' 
                                                type='text' 
                                                placeholder={getPlaceholder(selectedCriteria)} 
                                                onIonChange={(e) => {
                                                searchRef.current = e.detail.value!.trim();
                                                setSearch(searchRef.current);
                                                }}
                                                style={{marginTop:"30px"}}
                                                />
                                <IonRadioGroup
                                    value={selectedCriteria}
                                    onIonChange={(e) => setSelectedCriteria(e.detail.value)}
                                    >
                                    <IonItem>
                                        <IonLabel>Title</IonLabel>
                                        <IonRadio slot="start" value="title" />
                                    </IonItem>
                                    <IonItem>
                                        <IonLabel>Language</IonLabel>
                                        <IonRadio slot="start" value="language" />
                                    </IonItem>
                                    <IonItem>
                                        <IonLabel>Keywords</IonLabel>
                                        <IonRadio slot="start" value="keywords" />
                                    </IonItem>
                                    <IonItem>
                                        <IonLabel>Category</IonLabel>
                                        <IonRadio slot="start" value="category" />
                                    </IonItem>
                                    <IonItem>
                                        <IonLabel>Date</IonLabel>
                                        <IonRadio slot="start" value="pubDate" />
                                    </IonItem>
                                    </IonRadioGroup>                
                                  <IonButton color={'secondary'} className= 'ion-margin-bottom' type='submit' expand='block'>Search &nbsp;
                                    <IonIcon icon={searchOutline} />
                                  </IonButton>
                                </form>
                                                
                                {results.length > 0 && (
                                  
                                    <div className='ion-margin-top'>
                                        {results.map((article, idx) => (
                                        <div key={idx} className={`${dark ? 'search-card-dark' : 'search-card-light'}`}>
                                          <a
                                              onClick={(e) => {
                                                e.preventDefault(); 
                                                handleArticleClick(article);
                                              }}
                                              href={article.link}
                                              style={{ textDecoration: "none", color: "inherit" }}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                          >
                                            <h3>{article.title}</h3>
                                            <h6>{Array.isArray(article.keywords) ? "Kewords: " + article.keywords.join(', ') : article.keywords}</h6>
                                            <p>{new Date(article.pubDate).toLocaleString('fi-FI', {
                                              timeZone: 'Europe/Helsinki',  
                                              day: 'numeric',
                                              month: 'numeric',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              hour12: false})}</p>
                                            <p title={article.description}>{article.description  && article.description.length > 100 ?
                                                article.description.slice(0,100) + '...' :
                                                article.description || "No description available"}</p>
                                            <p>
                                                {article.link}
                                            </p>
                                          </a>
                                            <p style={{textAlign:"right"}}> <IonButton onClick={() => saveToFavorites(article)} style={{marginBottom:"-20px", marginTop:"20px"}} size='small'>Save to favorites</IonButton></p>
                                            <hr />
                                        </div>
                                        ))}
                                    </div>
                                    )}

                                {results.length === 0 && search.length >= 4 && (
                                <p style={{ marginTop: "1rem", textAlign:"center" }}>No results found.</p>
                                )}
                        </IonCol>
                    </IonRow>
                </IonGrid>       
            </IonContent>
        </IonPage>
    );
};

export default Search;