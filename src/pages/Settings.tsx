import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs, IonRouterOutlet } from '@ionic/react';
import React from 'react';
import { Redirect, Route } from 'react-router'
import { ellipse, triangle } from 'ionicons/icons';
import Theme from './Theme';
import UserSettings from './UserSettings';

const Settings: React.FC = () => {

    return (
        
        <IonTabs>
          <IonTabBar slot='bottom'>
            <IonTabButton tab="User settings" href="/app/settings/user-settings">
            <IonIcon icon={triangle} />
            <IonLabel>User settings</IonLabel>
            </IonTabButton>
            <IonTabButton tab="Theme" href="/app/settings/theme">
            <IonIcon icon={ellipse} />
            <IonLabel>Theme</IonLabel>
            </IonTabButton>
          </IonTabBar>
          <IonRouterOutlet>
            <Route path="/app/settings/user-settings" component={UserSettings}/>
            <Route path="/app/settings/theme" component={Theme}/>

            <Route exact path="/app/settings">
              <Redirect to="/app/settings/user-settings" />
            </Route>
          </IonRouterOutlet>
        </IonTabs>
        
      );
};

export default Settings;