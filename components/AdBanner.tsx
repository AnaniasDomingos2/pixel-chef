
import React, { useEffect } from 'react';

interface AdBannerProps {
  className?: string;
  label: string;
  format?: 'horizontal' | 'square';
  dataAdSlot?: string; // ID do slot do AdSense
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  className = "", 
  label, 
  format = 'horizontal',
  dataAdSlot = "1234567890" // Substitua pelo seu ID real do AdSense
}) => {
  
  useEffect(() => {
    try {
      // Tenta carregar o anúncio
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      console.error("Erro ao carregar AdSense", e);
    }
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center my-4 ${className}`}>
      <div className="text-[10px] uppercase tracking-widest text-chef-300 dark:text-darkbg-700 mb-1">
        {label}
      </div>
      
      {/* Container do Anúncio */}
      <div 
        className={`overflow-hidden
          ${format === 'horizontal' ? 'min-h-[90px] w-full max-w-[728px]' : 'min-h-[250px] w-[300px]'}
        `}
      >
        {/* Bloco do Google AdSense */}
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // COLOQUE SEU ID DE PUBLICADOR AQUI (ex: ca-pub-123456789)
             data-ad-slot={dataAdSlot}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
             
        {/* 
           NOTA: Enquanto o AdSense não aprova seu site, este espaço ficará em branco.
           Você pode colocar uma imagem de fallback aqui se desejar.
        */}
      </div>
    </div>
  );
};

export default AdBanner;
