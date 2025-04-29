import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonMenuButton, IonPage, IonRow, IonTitle, IonToolbar, useIonLoading, useIonViewWillEnter } from '@ionic/react';
import { getAuth, User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { handleArticleClick } from '../utils/handleArticleClick'
import { Article } from '../types/article'
import { toast } from 'sonner';
import { heartOutline } from 'ionicons/icons';
import { X } from 'lucide-react';
import './Favorites.css'


const Favorites: React.FC = () => {

    const [favorites, setFavorites] = useState<Article[]>([]);
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

    const deleteFromFavorites = async(user: User | null, article_id: string) => {
      const firestore = getFirestore();
      if(!user) return;

      try{
        const docRef = doc(firestore, 'users', user.uid, 'favorites', article_id )
        await deleteDoc(docRef)
        toast.success('Article successfully deleted', {
          position: 'top-center',
          duration: 4000
        })
      }catch(e){
        if(e instanceof Error){
          toast.error(e.message, {
            position: 'top-center',
            duration: 4000
          })
        }else{
          toast.error('An unknown error has happened', {
            position: 'top-center',
            duration: 4000
          })
        }
    }
  }
    useIonViewWillEnter(() => {
        const fetchFavorites = async () => {
            const auth = getAuth();
            const user = auth.currentUser

            if(!user) return;

            try{
               const db = getFirestore();
               const favsRef = collection(db, 'users', user.uid, 'favorites');
               const snapshot = await getDocs(favsRef);
               const fetched: Article[] = snapshot.docs.map(doc => ({
                ...doc.data(),
                article_id: doc.id
              })) as Article[]

              setFavorites(fetched);
            }catch(error){
                console.error("Error fetching favorites", error);
                toast.error("Failed to load favorites");
            }
        }

        fetchFavorites();

    })

    const deleteAllFavorites = async () => {

      const userResponse = confirm("Are you sure to delete all favorites?");
      if(!userResponse) return;

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
    
      try {
        const db = getFirestore();
        const favsRef = collection(db, 'users', user.uid, 'favorites');
        const snapshot = await getDocs(favsRef);

        if (snapshot.empty) {
          toast.info("No favorites to delete", {
            position: 'top-center',
            duration: 4000,
          });
          return; // stop execution if there’s nothing to delete
        } else {
          await present("Deleting all favorites...");
        }
        
    
        const batchDeletes = snapshot.docs.map(docSnap => 
          deleteDoc(doc(db, 'users', user.uid, 'favorites', docSnap.id))
        );

    
        await Promise.all(batchDeletes);
        setFavorites([]); // Clear UI
        dismiss()
        toast.success("All favorites deleted successfully", {
          position: 'top-center',
          duration: 4000,
        });
      } catch (error) {
        if(error instanceof Error){
        toast.error(error.message, {
          position: 'top-center',
          duration: 4000,
        });
        dismiss();
      }else{
        toast.error("Failed to delete favorites", {
          position: 'top-center',
          duration: 4000,
        });
        dismiss();
      }
      }
    };
    
    return (
        <IonPage>
            <IonHeader style={{marginBottom:"30px"}}>
                <IonToolbar style={{"--background":"#0057B8", "--color":"white"}}>
                    <IonButtons slot="start">
                        <IonMenuButton style={{color:"white"}} />
                    </IonButtons>
                    <IonTitle><IonIcon icon={heartOutline} style={{ verticalAlign: "-3px" }} /> Favorites</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <IonGrid fixed>
                <IonRow class='ion-justify-content-center'>
                  <IonCol size='12' sizeMd='10' sizeLg='10' sizeXl='8'>
                    { favorites.length > 0 ? (
                          favorites.map((article, idx) => (
                              <IonCard key={idx} className={`${dark ? 'favorites-card-dark ion-card-title' : 'favorites-card-light' }`}>
                                <IonCardHeader style={{position:"relative"}}>
                                  <IonCardTitle className={dark ? 'favorites-title-dark' : 'favorites-title-light'}>
                                      {article.title}
                                  </IonCardTitle>
                                  <span
                                      style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        color: 'red',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                      }}
                                      onClick={async () => {
                                        const auth = getAuth();
                                        const user = auth.currentUser;
                                        await deleteFromFavorites(user, article.article_id);
                                        setFavorites(prev => prev.filter(f => f.article_id !== article.article_id));
                                      }}
                                    >
                                      <X style={{fontWeight:"bold"}}/>
                                    </span>
                                </IonCardHeader>
                                <IonCardContent>
                                  <p title={article.description}>
                                    {article.description && article.description.length > 100?
                                    article.description.slice(0, 100) + '...' : article.description 
                                    || 'No description available'}
                                  </p>
                                  <p>{article.pubDate}</p>
                                  <IonButton 
                                      href={article.link} 
                                      target="_blank" 
                                      size='small'
                                      onClick={(e) => {
                                        e.preventDefault(); // prevent default first
                                        handleArticleClick(article); // then handle tracking + open
                                      }}       
                                      >
                                    Read More
                                  </IonButton>
                                </IonCardContent>
                              </IonCard>
                            ))
                          ) : (
                            <p style={{ textAlign: "center", marginTop: "2rem" }}>No favorites saved yet.</p>

                    )}
                    <IonButton 
                    expand='block' 
                    color={'danger'} 
                    onClick={deleteAllFavorites}
                    style={{marginTop:"50px"}}
                    >
                      delete all favorites
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default Favorites;