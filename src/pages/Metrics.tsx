import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButtons,
    IonMenuButton,
    IonIcon,
    useIonViewWillEnter,
    IonGrid,
    IonRow,
    IonCol
  } from '@ionic/react';
  import { getAuth } from 'firebase/auth';
  import { collection, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';
  import { statsChartOutline } from 'ionicons/icons';
  import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
  import React, { useEffect, useState } from 'react';
  import { Article } from '../types/article'
  import { toast } from 'sonner';
  import './Metrics.css'
  
  
  const Metrics: React.FC = () => {
    const [chartData, setChartData] = useState<{ category: string; count: number }[]>([]);
    const [cardHeight, setCardHeight] = useState('300px');
    const [marginTop, setMarginTop] = useState('50%');
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
  
    // 🔄 Orientation listener - useEffect for cleanup
    useEffect(() => {
      const updateHeight = () => {
        const isLandscape = window.matchMedia("(orientation: landscape)").matches;
        const isWideScreen = window.innerWidth > 1200

        if (isWideScreen) {
          setCardHeight('400px');
          setMarginTop('30%');
        } else if (isLandscape) {
          setCardHeight('250px');
          setMarginTop('20px');
        } else {
          setCardHeight('300px');
          setMarginTop('50%');
        }
      };
  
      updateHeight(); // Initial check
      window.addEventListener("resize", updateHeight); // Watch for orientation changes
  
      return () => window.removeEventListener("resize", updateHeight); // Cleanup
    }, []);
  
    
    useIonViewWillEnter(() => {
      const auth = getAuth();
      const user = auth.currentUser;
    
      if (user) {
        fetchMetrics(user.uid); // ✅ If available immediately
      } else {
        const timeout = setTimeout(() => {
          toast.error("User not logged in.", {position:'top-center', duration:4000});
          console.warn("User not logged in.");
        }, 2000); // Wait 2 seconds before showing the toast
    
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            clearTimeout(timeout); // 🧹 Cancel toast
            fetchMetrics(user.uid); // ✅ Fetch once user is available
          }
        });
    
        return () => {
          clearTimeout(timeout);
          unsubscribe();
        };
      }
    });
    
    
      

    const fetchMetrics = async (uid: string) => {
  try {
    const db = getFirestore();
    const favsRef = collection(db, 'users', uid, 'reads');
    const snapshot = await getDocs(favsRef);
    const reads: Article[] = snapshot.docs.map(doc => doc.data() as Article);

    const categoryCounts = reads.reduce((acc, curr) => {
      const categories = Array.isArray(curr.category)
        ? curr.category
        : typeof curr.category === 'string'
        ? [curr.category]
        : ['Unknown'];

      categories.forEach(cat => {
        const category = cat.toLowerCase();
        acc[category] = (acc[category] || 0) + 1;
      });

      return acc;
    }, {} as Record<string, number>);

    const dataForChart = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count
    }));

    setChartData(dataForChart);
  } catch (error) {
    console.error("Error loading metrics", error);
    toast.error("Failed to load metrics");
  }
};

    
    
  
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar style={{ "--background": "#0057B8", "--color": "white" }}>
            <IonButtons slot="start">
              <IonMenuButton style={{ color: "white" }} />
            </IonButtons>
            <IonTitle>
              <IonIcon icon={statsChartOutline} style={{ verticalAlign: "-3px" }} /> Metrics
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className={`ion-padding ${dark ? 'metrics-dark' : 'metrics-light'}`}>
          <IonGrid fixed>
            <IonRow class='ion-justify-content-center'>
              <IonCol size='12' sizeMd='10' sizeLg='8' sizeXl='6'>
                <IonCard style={{marginTop: marginTop,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)', // subtle shadow
                        borderRadius: '12px' // optional: makes it a bit softer
                }}>
                  <IonCardHeader>
                    <IonCardTitle className={`${dark ? 'card-title-color-dark' : 'card-title-color-light'}`}><b>Read articles by Category</b></IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ height: cardHeight }}>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                                angle={-20} 
                                textAnchor="end"
                                dataKey="category"
                              
                        />

                          <YAxis allowDecimals={false} />
                          <Tooltip cursor={{ fill: 'transparent' }} />
                          <Bar dataKey="count" fill="#007bff" activeBar={false} barSize={40}  />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p>No data yet.</p>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  };
  
  export default Metrics;
  