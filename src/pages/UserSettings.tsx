import { 
        IonButton, 
        IonButtons, 
        IonCard, 
        IonCardContent, 
        IonCardTitle, 
        IonCol, 
        IonContent, 
        IonGrid, 
        IonHeader, 
        IonIcon, 
        IonInput, 
        IonMenuButton, 
        IonPage, 
        IonRow, 
        IonTitle, 
        IonToolbar 
    } from '@ionic/react';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { deleteUser as firebaseDeleteUser } from 'firebase/auth'
import { deleteDoc, doc, getDoc, getFirestore } from 'firebase/firestore';
import { personCircleOutline, skullOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner'

    const UserSettings: React.FC = () => {
        const user = getAuth().currentUser;
      
        const [oldPassword, setOldPassword] = useState('');
        const [newPassword, setNewPassword] = useState('');
        const oldPwRef = useRef<string>("");
        const newPwRef = useRef<string>("");
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

          useEffect(() => {
                  const handleDarkModeChange = (event: Event) => {
                    const customEvent = event as CustomEvent<{ dark: boolean }>;
                    setDark(customEvent.detail.dark);
                  };
                
                  window.addEventListener('darkmode-changed', handleDarkModeChange);
                
                  return () => {
                    window.removeEventListener('darkmode-changed', handleDarkModeChange);
                  };
                }, []);
      
        const handlePasswordReset = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
          
            if (!user || !user.email) return;
          
            if (!oldPwRef.current || !newPwRef.current) {
              toast.info('Please fill in both fields', { position: 'top-center', duration:4000 });
              return;
            }

            if (newPwRef.current.length < 6 ){
                toast.info('New password must be at least 6 characters long', { position: 'top-center', duration:4000 });
              return;
            }
          
            const credential = EmailAuthProvider.credential(user.email, oldPwRef.current);
          
            try {
              // Step 1: Re-authenticate the user
              await reauthenticateWithCredential(user, credential);
          
              // Step 2: Update the password
              await updatePassword(user, newPwRef.current);
          
              toast.success('Password updated successfully!', {position:'top-center', duration:4000});
              setOldPassword('');
              setNewPassword('');
            } catch (error) {

              if (error instanceof Error) {
                toast.error(error.message, { position: 'top-center', duration:4000 });
              } else {
                toast.error('Failed to update password', { position: 'top-center', duration: 4000 });
              }
            }

          };

        const deleteUser = async () => {
            const userResponse = confirm("Are you sure to delete the account?");
            if(!userResponse) return

            const user = getAuth().currentUser
            if(!user) return

            try {
                await deleteDoc(doc(getFirestore(), 'users', user.uid)); // if you have a 'users' collection
                await firebaseDeleteUser(user); // ✅ correct method
                setTimeout(() => {
                    toast.success('Your account has been successfully deleted.', { position: 'top-center', duration: 4000 });
                }, 500);
                
              } catch (e) {
                if(e instanceof Error){
                    setTimeout(() => {
                        toast.error(e.message, { position: 'top-center', duration: 4000 });
                    }, 500);
                    
                }else{
                    setTimeout(() => {
                        toast.error("It was impossible to delete user", { position: 'top-center', duration: 4000 });
                    }, 500);
                }
              }
        }
          

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar style={{"--background":"#0057B8", "--color":"white"}}>
                    <IonButtons slot="start">
                        <IonMenuButton style={{color:"white"}}/>
                    </IonButtons>
                    <IonTitle>User Settings</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
            { getAuth().currentUser?.email !== 'test@test.test' ? (
            <IonGrid fixed>
                    <IonRow class='ion-justify-content-center'>
                        <IonCol size='12' sizeMd='8' sizeLg='6' sizeXl='4'>
                            <IonCard style={{marginTop:"40px"}}>
                                <IonCardTitle style={{textAlign:"center", marginTop:"10px"}} color={'tertiary'}>Change password</IonCardTitle>
                                <IonCardContent>
                                    <form noValidate>
                                    <IonInput 
                                        fill='outline' 
                                        labelPlacement='floating' 
                                        label='Email' 
                                        type='email' 
                                        value={user?.email} 
                                        readonly={true}
                                        />
                                        <IonInput className='ion-margin-top'
                                        fill='outline' 
                                        labelPlacement='floating' 
                                        placeholder='Enter the old password' 
                                        label='Old password' 
                                        type='password'
                                        onIonChange={(e) => {
                                            oldPwRef.current = e.detail.value!.trim();
                                            setOldPassword(oldPwRef.current);
                                        }}
                                        
                                        />
                                        <IonInput className='ion-margin-top' 
                                        fill='outline' 
                                        labelPlacement='floating' 
                                        placeholder='Enter the new password' 
                                        label='New password' 
                                        type='password'
                                        onIonChange={(e) => {
                                            newPwRef.current = e.detail.value!.trim();
                                            setNewPassword(newPwRef.current);
                                        }}
                                        
                                        />
                                        <IonButton 
                                            color={'tertiary'} 
                                            className='ion-margin-top' 
                                            expand='block'
                                            onClick={handlePasswordReset}
                                        >
                                            Reset password <IonIcon icon={personCircleOutline} />
                                        </IonButton>
                                    </form>
                                </IonCardContent>
                            </IonCard>
                            <IonButton
                                    onClick={deleteUser}
                                    expand="block"
                                    fill='solid'
                                    style={{ '--background':`${dark? '#c5000f':'#2f2f2f'}`, '--color':`${dark? 'black':'white'}`, marginTop:"100px"}}           
                                    >
                                    <b>Delete user</b> &nbsp;
                                    <IonIcon icon={skullOutline} />
                                    </IonButton>
    
                        </IonCol>
                    </IonRow>
                </IonGrid>
                 ):(<div style={{display:"flex", 
                                justifyContent:"center", 
                                alignItems:"flex-start", 
                                height:"100vh", 
                                marginLeft:"10px",
                                marginTop:"200px"
                            }}>
                    <h1>Password change and account deletion are disabled for the test user.</h1>
                    </div>)}
            </IonContent>                        
        </IonPage>
    );
};

export default UserSettings;