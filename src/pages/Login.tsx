import { IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonPage, IonRow, IonTitle, IonToolbar, useIonLoading } from '@ionic/react';
import { newspaperOutline, logInOutline, personCircleOutline, refreshCircleOutline } from 'ionicons/icons'
import React, { useEffect, useState, useRef } from 'react';
import { Preferences } from '@capacitor/preferences'
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../FireBaseConfig';
import { toast } from 'sonner'
import Intro from '../components/Intro';
import '../components/Intro.css'
import './Login.css'
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { loadDarkMode } from '../utils/loadDarkMode'


const INTRO_KEY = 'intro-seen'



const Login: React.FC = () => {

    
    const [introSeen, setIntroSeen] = useState(true)
    const [present, dismiss] = useIonLoading();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const emailRef = useRef<string>("");
    const passwordRef = useRef<string>("");
    const [isLandscape, setIsLandscape] = useState(false)

    useEffect(() => {
        const check = () => setIsLandscape(window.matchMedia("(orientation: landscape)").matches);
      
        check(); // Initial check
        window.addEventListener("resize", check); // Listen for changes
      
        return () => window.removeEventListener("resize", check);
      }, []);

      

    useEffect(() =>{
        const checkStorage = async () =>{
            const seen = await Preferences.get({ key: INTRO_KEY })
            console.log("📍 ~ file: Login.tsx:18 ~ checkStorage ~ seen:", seen);
            setIntroSeen(seen.value === 'true');
        }
        checkStorage();
    }, [])

      
    localStorage.removeItem("logoutType");

    const doLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        localStorage.setItem("loggingOut","null")
        event.preventDefault();

        if (passwordRef.current === '' || emailRef.current === ''){
            toast.info("Email and password are required", {
                position:"top-center",
                duration: 4000
            })
            return;
        }                   

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRef.current)) {
            console.log(emailRef.current)
            toast.info("Please enter a valid email address (e.g., name@example.com)", {
            position: 'top-center',
            duration: 4000
        });
            return;
        }
        
        await present("Logging in...")

        try{
            await signInWithEmailAndPassword(auth, emailRef.current, passwordRef.current)
            await dismiss();
            const user = auth.currentUser;
            if (user) {
            const db = getFirestore();
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            localStorage.removeItem("manualLogout")

            if (userSnap.exists()) {
                const data = userSnap.data();
                console.log("🔁 registering:", data.registering);
                console.log("🟢 firstLogin:", data.firstLogin);
            }
            await loadDarkMode((isDark) => {
                const html = document.documentElement;
                const body = document.body;
              
                const backgroundColor = isDark ? '#121212' : '#ffffff';
                const textColor = isDark ? '#ffffff' : '#000000';
                const secondaryBackground = isDark ? '#1e1e1e' : '#ffffff';
              
                html.classList.toggle('ion-palette-dark', isDark);
                html.style.setProperty('--ion-background-color', backgroundColor, 'important');
                html.style.setProperty('--ion-text-color', textColor, 'important');
                html.style.setProperty('--ion-toolbar-background', secondaryBackground, 'important');
                html.style.setProperty('--ion-toolbar-color', textColor, 'important');
                html.style.setProperty('--ion-tab-bar-background', secondaryBackground, 'important');
              
                body.style.backgroundColor = backgroundColor;
              });
              
        }

        localStorage.setItem("lastLogin", Date.now().toString());
        setTimeout(() => {
            toast.success("You have successfully logged in", { position: "top-center", duration: 2000 });
        }, 200);
        } catch(e){
            dismiss();
            if(e instanceof Error){
            toast.error(e.message, {
                position:"top-center",
                duration: 4000
            })
        } else{
            dismiss();
            toast.error("Unknown error has happened", {
                position:"top-center",
                duration: 4000
            })
        }
      }
    }

    const finishIntro = async () =>{
        Preferences.set({ key: INTRO_KEY, value: 'true' })
        setIntroSeen(true);
    }

    const watchIntroAgain = async () =>{
        Preferences.remove({ key: INTRO_KEY })
        setIntroSeen(false);
    }


    return (
        <>
            {!introSeen ? (
                <Intro onFinish={finishIntro}/>
            ):
            (
            <IonPage>
                <IonHeader>
                    <IonToolbar style={{"--background":"#0057B8", "--color":"white"}}>
                        <IonTitle><IonIcon icon={newspaperOutline} style={{ verticalAlign: "-3px" }} /> Welcome Page</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding" scrollY={isLandscape} style={{backgroundColor: '#f4f6f8'}}>
                    <IonGrid fixed>
                        <IonRow class='ion-justify-content-center'>
                            <IonCol size='12' sizeMd='8' sizeLg='6' sizeXl='4'>
                            <div style={{textAlign:"center", color:"#007BFF"}} className='fade-in'>
                                <IonIcon icon={newspaperOutline} style={{fontSize:"200px"}}/>
                                <IonTitle style={{fontSize:"55px"}}><b>Daily Digest</b></IonTitle>
                                <p style={{fontFamily: "'Dancing Script', cursive", fontSize: "1.2rem"}}>Your personalized news, refreshed daily.</p>
                            </div>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                    <IonGrid fixed>
                        <IonRow class='ion-justify-content-center'>
                            <IonCol size='12' sizeMd='8' sizeLg='6' sizeXl='4'>
                                <IonCard>
                                    <IonCardContent>
                                        <form onSubmit={doLogin} noValidate>
                                            <IonInput fill='outline' 
                                            labelPlacement='floating' 
                                            label='Email' 
                                            type='email' 
                                            placeholder='name@domain.extension' 
                                            onIonChange={(e) => {
                                                emailRef.current = e.detail.value!.trim();
                                                setEmail(emailRef.current);
                                            }}
                                            />
                                            <IonInput className='ion-margin-top' 
                                            fill='outline' 
                                            labelPlacement='floating' 
                                            placeholder='Enter the password' 
                                            label='Password' 
                                            type='password'
                                            onIonChange={(e) => {
                                                passwordRef.current = e.detail.value!.trim();
                                                setPassword(passwordRef.current);
                                            }}
                                            />
                                            <IonButton color={'secondary'} className='ion-margin-top' type='submit' expand='block'>Login <IonIcon icon={logInOutline} /></IonButton>
                                            <IonButton routerLink="/register" color={'tertiary'} className='ion-margin-top' expand='block'>
                                                Create Account <IonIcon icon={personCircleOutline} />
                                            </IonButton>
                                            <IonButton onClick={watchIntroAgain} fill='clear' size='small' color={'medium'} className='ion-margin-top' expand='block'>
                                                Watch intro again <IonIcon icon={refreshCircleOutline} />
                                            </IonButton>
                                        </form>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>
                    </IonGrid>    
                </IonContent>
            </IonPage>
            )}
        </>    
    );
};

export default Login;