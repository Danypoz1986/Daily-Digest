import { IonPage, IonContent, IonText, IonButton, IonIcon } from '@ionic/react';
import { homeOutline } from 'ionicons/icons';
import { getAuth } from 'firebase/auth';
import React from 'react';

const NotFound: React.FC = () => {
  const handleGoHome = () => {
    const isLoggedIn = getAuth().currentUser !== null;
    window.location.href = isLoggedIn ? '/app/home' : '/login';
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        <div style={{ textAlign: 'center', marginTop: '20vh' }}>
          <IonText color="danger">
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
            <h2>Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
          </IonText>

          <IonButton expand="block" className="ion-margin-top" onClick={handleGoHome}>
            <IonIcon icon={homeOutline} slot="start" />
            Go to Home
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotFound;


