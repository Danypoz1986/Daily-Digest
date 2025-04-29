import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonList,
    IonIcon,
    IonCard,
    IonCardContent,
    IonButtons,
    IonMenuButton,
    IonGrid,
    IonRow,
    IonCol
  } from '@ionic/react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
  import { homeOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
  
  const About: React.FC = () => {
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
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar style={{"--background":"#0057B8", "--color":"white"}}>
            <IonButtons slot="start">
                <IonMenuButton style={{color:"white"}} />
            </IonButtons>
            <IonTitle><IonIcon icon={homeOutline} style={{ verticalAlign: "-3px" }} /> About</IonTitle>
          </IonToolbar>
        </IonHeader>
            <IonContent className="ion-padding" style={{ background: "#ffffff" }}>
            <IonGrid fixed>
                <IonRow class='ion-justify-content-center'>
                    <IonCol size='12' sizeMd='10' sizeLg='10' sizeXl='8'>
                        <p style={{ textAlign: "center", fontSize: "24px", color: "#0057B8", marginTop:"10px" }}>
                            🗞️ <strong>Welcome to Daily Digest</strong>
                        </p>
                        <p style={{ textAlign: "center", color:`${!dark? '#555':'#cccccc'}`, marginBottom: "20px" }}>
                            Stay informed with hand-picked news, curated every hour. 🌐
                        </p>
                
                        {/* Feature Cards */}
                        <IonList style={{ background: "transparent" }}>
                            {[
                            {
                                icon: '📰',
                                title: "Read News",
                                color: "#e6f0ff",
                                colorDark:"#212121",
                                subtitle: "Fresh headlines every hour to keep you up-to-date."
                            },
                            {
                                icon: '❤️',
                                title: "Save Favorites",
                                color: "#fff0f0",
                                colorDark:"#212121",
                                subtitle: "Bookmark articles you love for easy access later."
                            },
                            {
                                icon: '🔍',
                                title: "Search",
                                color: "#f0faff",
                                colorDark:"#212121",
                                subtitle: "Filter by title, language, category or publish date."
                            },
                            {
                                icon: '📊',
                                title: "Metrics",
                                color: "#f3faff",
                                colorDark:"#212121",
                                subtitle: "Track your reading stats and explore your habits."
                            },
                            {
                                icon: '⚙️',
                                title: "Settings",
                                color: "#f8f9ff",
                                colorDark:"#212121",
                                subtitle: "Toggle dark mode 🌙 and manage your account."
                            },
                            {
                                icon: '👤',
                                title: "Account",
                                color: "#f5f5f5",
                                colorDark:"#212121",
                                subtitle: "Login or register securely using Firebase."
                            },
                            {
                                icon: '🧭',
                                title: "404 Error Page",
                                color: "#e6fffa",
                                colorDark:"#212121",
                                subtitle: "User-friendly page for non-existent routes."
                            },
                            {
                                icon: '⏳',
                                title: "Auto Logout",
                                color: "#fff1e6",
                                colorDark:"#212121",
                                subtitle: "Logs users out after 10 minutes of inactivity for better security."
                            },
                            {
                                icon: '🔁',
                                title: "Shared News Cache",
                                color: "#f3e8ff",
                                colorDark:"#212121",
                                subtitle: "News articles are fetched once per hour and shared across users — reducing load and ensuring consistency."
                            },
                            {
                                icon: '📌',
                                title: "Favorites System",
                                color: "#fffce0",
                                colorDark:"#212121",
                                subtitle: "Articles are saved per user in Firestore for easy access later."
                            }        
                            ].map((feature, index) => (
                            <IonCard key={index} style={{ background: dark? feature.colorDark : feature.color, marginBottom: "16px", borderRadius: "12px" }}>
                                <IonCardContent style={{ display: "flex", alignItems: "center" }}>
                                <p style={{ fontSize: "24px", marginRight: "16px", color: "#0057B8" }} >{feature.icon}</p>
                                <IonLabel>
                                    <h2 style={{ margin: 0, color: "#0057B8" }}>{feature.title}</h2>
                                    <p style={{ margin: 0,  color: `${!dark? '#333':'#cccccc'}` }}>{feature.subtitle}</p>
                                </IonLabel>
                                </IonCardContent>
                            </IonCard>
                            ))}
                        </IonList>
                
                        {/* Footer */}
                        <div style={{ textAlign: "center", marginTop: "20px" }}>
                            <p style={{ fontSize: "14px", color:`${!dark? '#555':'#cccccc'}` }}>
                            💖 Built with <strong>React</strong>, <strong>Firebase</strong> and <strong>Ionic</strong>
                            </p>
                
                            
                        </div>
                    </IonCol>
                </IonRow>
            </IonGrid>
        </IonContent>    
      </IonPage>
    );
  };
  
  export default About;
  
  