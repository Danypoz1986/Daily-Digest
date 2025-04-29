import { IonBackButton, 
    IonButton, 
    IonButtons, 
    IonCard, 
    IonCardContent, 
    IonContent, 
    IonHeader, 
    IonIcon, 
    IonInput, 
    IonPage, 
    IonTitle, 
    IonToolbar, 
    IonRow, 
    IonCol, 
    IonGrid, 
    useIonLoading, 
    useIonRouter
   } from '@ionic/react';
import { checkmarkDoneOutline } from 'ionicons/icons'
import React, { useRef, useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../FireBaseConfig';
import { toast } from 'sonner'
import { doc, getFirestore, setDoc } from 'firebase/firestore';

const Register: React.FC = () => {
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [present, dismiss] = useIonLoading();
const [confirmPassword, setConfirmPassword] = useState('')
const emailRef = useRef<string>("");
const passwordRef = useRef<string>("");
const confirmPasswordRef = useRef<string>("")
const router = useIonRouter();


const doRegister = async (event: React.FormEvent<HTMLFormElement>) => {
   event.preventDefault();

   if (!passwordRef.current || !confirmPasswordRef.current || !emailRef.current){
       toast.info("All fields must be filled",{
           position: 'top-center',
           duration: 4000
       })
       return;
   }

   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRef.current)) {
       toast.info("Please enter a valid email address (e.g., name@example.com)", {
         position: 'top-center',
         duration: 4000
       });
       return;
   }

   if (passwordRef.current !== confirmPasswordRef.current){
       toast.info("Password and confirm password don't match",{
           position: 'top-center',
           duration: 4000
       })
       return;
   }

   try {
    await present("Creating account...");
  
    const result = await createUserWithEmailAndPassword(auth, emailRef.current, passwordRef.current);
    const newUser = result.user;
    
  
    const db = getFirestore();
    const userRef = doc(db, "users", newUser.uid);
  
    await setDoc(userRef, { firstLogin: true, registering: true }, { merge: true });

    
    toast.success("Account created!", {
      position: 'top-center',
      duration: 4000
    });
    
    await dismiss();
    
    setTimeout(async() => {
        await setDoc(userRef, { registering: false }, { merge: true });
    }, 2000);
    
    await auth.signOut();
    router.push('/login', 'root');
    
    

  
  } catch (e) {
    await dismiss();
    if (e instanceof Error) {
      toast.error(e.message, {
        position: 'top-center',
        duration: 4000
      });
    } else {
      toast.error("Unknown error has happened during registration", {
        position: 'top-center',
        duration: 4000
      });
    }
  }
   
}

return (
   <IonPage>
       <IonHeader>
           <IonToolbar>
               <IonButtons slot='start'>
                   <IonBackButton defaultHref='/' />
               </IonButtons>    
               <IonTitle>Page Title</IonTitle>
           </IonToolbar>
       </IonHeader>
       <IonContent className="ion-padding">
           <IonGrid fixed>
               <IonRow class='ion-justify-content-center'>
                   <IonCol size='12' sizeMd='8' sizeLg='6' sizeXl='4'>
                       <IonCard>
                           <IonCardContent>
                               <form onSubmit={doRegister} noValidate>
                                   <IonInput fill='outline' 
                                   labelPlacement='floating' 
                                   label='Email' type='email' 
                                   placeholder='name@domain.extension'
                                   onIonChange={(e) => {
                                       emailRef.current = e.detail.value!.trim();
                                       setEmail(emailRef.current);
                                   }} 
                                   />
                                   <IonInput className='ion-margin-top' 
                                   fill='outline' 
                                   labelPlacement='floating' 
                                   placeholder='Create a password' 
                                   label='Password' 
                                   type='password'
                                   onIonChange={(e) => {
                                       passwordRef.current = e.detail.value!.trim();
                                       setPassword(passwordRef.current);
                                   }} 
                                   />
                                   <IonInput className='ion-margin-top' 
                                   fill='outline' 
                                   labelPlacement='floating' 
                                   placeholder='Confirm password' 
                                   label='Password Confirmation' 
                                   type='password'
                                   onIonChange={(e) => {
                                       confirmPasswordRef.current = e.detail.value!.trim();
                                       setConfirmPassword(confirmPasswordRef.current);
                                   }} 
                                   />
                                   <IonButton color={'tertiary'} className='ion-margin-top' type='submit' expand='block'>
                                       Create my account <IonIcon icon={checkmarkDoneOutline} />
                                   </IonButton>
                               </form>
                           </IonCardContent>
                       </IonCard>
                   </IonCol>
               </IonRow>
           </IonGrid>    
       </IonContent>
   </IonPage>
);
};

export default Register