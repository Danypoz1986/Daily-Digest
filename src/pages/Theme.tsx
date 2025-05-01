import { IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonItem, IonLabel, IonMenuButton, IonPage, IonRow, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { loadDarkMode } from '../utils/loadDarkMode';  // adjust the path if needed




const Theme: React.FC = () => {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    loadDarkMode((isDark) => {
      setDark(isDark);
    });
  }, []);
  
  

  const toggleDarkPalette = (shouldEnable: boolean) => {
    const html = document.documentElement;
    const body = document.body;
  
    const backgroundColor = shouldEnable ? '#121212' : '#ffffff';
    const textColor = shouldEnable ? '#ffffff' : '#000000';
    const secondaryBackground = shouldEnable ? '#1e1e1e' : '#ffffff';
  
    html.classList.toggle('ion-palette-dark', shouldEnable);
  
    html.style.setProperty('--ion-background-color', backgroundColor, 'important');
    html.style.setProperty('--ion-text-color', textColor, 'important');
    html.style.setProperty('--ion-toolbar-background', secondaryBackground, 'important');
    html.style.setProperty('--ion-toolbar-color', textColor, 'important');
    html.style.setProperty('--ion-tab-bar-background', secondaryBackground, 'important');
    html.style.setProperty('--ion-icon-color', textColor, 'important');
  
    body.style.backgroundColor = backgroundColor;
  
    const menuList = document.querySelector('ion-menu ion-list') as HTMLElement | null;
    if (menuList) {
      menuList.style.setProperty('--background', secondaryBackground, 'important');
      menuList.style.setProperty('--color', textColor, 'important');
    }
  };

  

  const handleToggleChange = async (event: CustomEvent) => {
    const isChecked = event.detail.checked;
    setDark(isChecked);
    toggleDarkPalette(isChecked);
  
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getFirestore();
  
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), { darkMode: isChecked }, { merge: true });
  
        // ✅ Fire custom event
        window.dispatchEvent(new CustomEvent('darkmode-changed', { detail: { dark: isChecked } }));
  
      } catch (error) {
        console.error("Error saving darkMode to Firestore", error);
      }
    } else {
      localStorage.setItem('darkMode', isChecked.toString());
  
      // ✅ Fire custom event
      window.dispatchEvent(new CustomEvent('darkmode-changed', { detail: { dark: isChecked } }));
    }
  };
  

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{"--background":"#0057B8", "--color":"white"}}>
            <IonButtons slot="start">
              <IonMenuButton/>
            </IonButtons>
          <IonTitle>Theme</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
         <IonGrid fixed>
            <IonRow class='ion-justify-content-center'>
              <IonCol size='12' sizeMd='10' sizeLg='10' sizeXl='8'>
                <IonItem style={{ justifyContent: 'center' }} lines='none'>
                  <IonLabel>Dark Mode</IonLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '14px' }}>{dark ? 'On' : 'Off'}</span>
                      <IonToggle
                          slot="end"
                          id="paletteToggle"
                          checked={dark}
                          onIonChange={handleToggleChange}
                          style={{
                            '--handle-background': dark ? '#3B82F6' : '#e0e0e0',
                            '--track-background': dark ? '#2a2a2a' : '#ccc',
                            '--track-border-radius': '20px',
                            '--handle-border-radius': '50%',
                            width: '60px',
                            height: '30px',
                            position: 'relative',
                            padding: '0',
                          }}
                          ref={(el) => {
                            if (el) {
                              const track = el.shadowRoot?.querySelector('.toggle-track');
                              if (track) {
                                track.setAttribute(
                                  'style',
                                  `position: relative; font-size: 12px; font-weight: bold; color: ${
                                    dark ? '#ffffff' : '#000000'
                                  }; display: flex; align-items: center; justify-content: ${
                                    dark ? 'flex-end' : 'flex-start'
                                  }; padding: 0 8px;`
                                );
                                track.textContent = dark ? 'On' : 'Off';
                              }
                            }
                          }}
                      />
                    </div>
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Theme;

