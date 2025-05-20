// components/ScythraApps.jsx

import React, { useState } from 'react';


import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';



const ScythraApps = () => {
  const images = [
    '/partners/ScythraPayments 1.png',
    '/partners/ScythraPayments 2.png',
    '/partners/ScythraPayments 4.png',
  ];

  const swiperTwoImages = [
    '/partners/ScythraPaymentsCheckout1.png',
    '/partners/ScythraPaymentsCheckout2.png',
      ];

  const swiperThreeImages = [
    '/partners/ScythraPay 1.png',
    '/partners/ScythraPay 2.png',
    '/partners/ScythraPay 3.png',
    '/partners/ScythraPay 4.png',
  ];

  // Reusable Swiper component
  const renderSwiper = (images) => (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      loop={true}
      pagination={{ clickable: true }}
      spaceBetween={30}
      slidesPerView={1}
      autoHeight={true}
      className="rounded-xl mb-10"
    >
      {images.map((src, index) => (
        <SwiperSlide key={index} className="flex justify-center items-center">
          <img
            src={src}
            alt={`Scythra App ${index + 1}`}
            className="max-h-[400px] w-auto h-auto object-contain mx-auto"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );

  return (
    <section style={{ backgroundColor: '#14182b' }} className="py-16 text-white text-center">
       <section id="scythraapps" className="scythraapps-container"></section>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4">Scythra Apps</h2>
        <p className="mb-8 text-lg opacity-80">Explore the apps driving the Scythra ecosystem</p>
        <p className="mb-8 text-lg opacity-80">Currently in development</p>

        {/* First Swiper */}
        <div className="mx-auto max-w-4xl">
          <h3 className="text-2xl font-semibold mb-4">Scythra Payments</h3>
          {renderSwiper(images)}
        </div>

        {/* Second Swiper */}
        <div className="mx-auto max-w-4xl mt-12">
          <h3 className="text-2xl font-semibold mb-4">Scythra Payments - Checkout View</h3>
          {renderSwiper(swiperTwoImages)}
        </div>

        {/* Third Swiper */}
        <div className="mx-auto max-w-4xl mt-12">
          <h3 className="text-2xl font-semibold mb-4">Scythra Pay</h3>
          {renderSwiper(swiperThreeImages)}
        </div>
      </div>
    </section>
  );
};

export default ScythraApps;
