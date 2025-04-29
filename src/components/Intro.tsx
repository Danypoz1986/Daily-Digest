import React from 'react';
import { ReactNode } from 'react';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import 'swiper/css';
import Intro1 from '../assets/intro/undraw_mobile-feed_5vtf.svg'
import Intro2 from '../assets/intro/undraw_newspaper_cqtq.svg'
import Intro3 from '../assets/intro/undraw_reading_c1xl.svg'
import { IonButton, IonText } from '@ionic/react';

interface ContainerProps {
    onFinish: () => void; 
}

const SwiperButtonNext = ({ children }: { children: ReactNode }) => {
    const swiper = useSwiper();
    return <IonButton onClick={() => swiper.slideNext()}>{children}</IonButton>
}

const Intro: React.FC<ContainerProps> = ({ onFinish }) => {

    return <Swiper>
                <SwiperSlide>
                    <img src={Intro1} alt='Intro1'/>
                    <IonText>
                        <h3>Top stories, anytime, anywhere.</h3>
                    </IonText>
                    <SwiperButtonNext>Next</SwiperButtonNext>
                </SwiperSlide>
                
                <SwiperSlide>
                    <img src={Intro2} alt='Intro2'/>
                    <IonText>
                        <h3>News that matters to you.</h3>
                    </IonText>
                    <SwiperButtonNext>Next</SwiperButtonNext>
                </SwiperSlide>

                <SwiperSlide>
                    <img src={Intro3} alt='Intro3'/>
                    <IonText>
                        <h3>Trusted sources in one place.</h3>
                    </IonText>
                    <IonButton onClick={() => onFinish()}>Finish</IonButton>
                </SwiperSlide>
           </Swiper>
};

export default Intro;