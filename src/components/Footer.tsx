import SubscribeEmail from './SubscribeEmail';

const BASE = 'https://www.audiomediagrading.com';

export default function Footer() {
  return (
    <div className="bg-[#252422] flex flex-col items-center justify-center py-10">
      <div className="text-white max-w-[90rem] w-full relative py-5 lg:py-10 px-7 lg:px-14 flex flex-col lg:flex-row items-start justify-between">
        <div className="flex flex-col gap-[14px] w-full lg:w-1/4">
          <p className="text-4xl leading-[59.6px] font-theme-font-medium">Connect With Us</p>
          <p className="font-theme-font-light">Be the first to know about new updates, products, and more from AMG.</p>
          <SubscribeEmail />
        </div>

        <div className="flex flex-wrap justify-between mt-16 lg:mt-0 lg:justify-evenly w-full lg:w-1/2">
          <div className="flex flex-col gap-4 lg:gap-[23px] w-1/2 mb-6 lg:mb-0 lg:w-auto">
            <p className="font-theme-font-bold uppercase text-[14px] lg:text-base">Help —</p>
            <div className="flex flex-col gap-1 lg:gap-2">
              <a href={`${BASE}/faq`} className="text-[16px] lg:text-[24px] font-theme-font-light hover:underline">Faq</a>
              <a href={`${BASE}/returns`} className="text-[16px] lg:text-[24px] font-theme-font-light hover:underline">Returns</a>
              <a href={`${BASE}/refusals`} className="text-[16px] lg:text-[24px] font-theme-font-light hover:underline">Refusals</a>
              <a href={`${BASE}/grading-scale`} className="text-[16px] lg:text-[24px] font-theme-font-light hover:underline">Grading Scale</a>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:gap-[23px] w-1/2 mb-6 lg:mb-0 lg:w-auto">
            <p className="font-theme-font-bold uppercase text-[14px] lg:text-base">Connect —</p>
            <div className="flex flex-col gap-1 lg:gap-2">
              <a href={`${BASE}/contact-us`} className="text-[16px] lg:text-[24px] font-theme-font-light hover:underline">Contact</a>
              <a href={`${BASE}/careers`} className="text-[16px] lg:text-[24px] font-theme-font-light hover:underline">Careers</a>
              <a href="https://www.instagram.com/audiomediagrading" target="_blank" rel="noopener noreferrer" className="text-[16px] lg:text-[24px] font-theme-font-light hover:underline">Instagram</a>
              <a href="https://x.com/audiomediagrading" target="_blank" rel="noopener noreferrer" className="text-[16px] lg:text-[24px] font-theme-font-light hover:underline">X</a>
              <a href="https://www.tiktok.com/@audiomediagrading" target="_blank" rel="noopener noreferrer" className="text-[16px] lg:text-[24px] font-theme-font-light hover:underline">Tiktok</a>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:gap-[23px] mb-6 lg:mb-0 w-1/2 lg:w-auto">
            <p className="font-theme-font-bold uppercase text-[14px] lg:text-base">Legal —</p>
            <div className="flex flex-col gap-1 lg:gap-2">
              <a href={`${BASE}/tos`} className="text-[16px] lg:text-[24px] font-theme-font-light hover:underline">ToS</a>
              <a href={`${BASE}/privacy-policy`} className="text-[16px] lg:text-[24px] font-theme-font-light hover:underline">Privacy Policy</a>
              <a href={`${BASE}/amg-grade-guarantee`} className="text-[16px] lg:text-[24px] font-theme-font-light hover:underline">AMG Grade Guarantee</a>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm max-w-[90rem] text-white opacity-40 flex justify-center items-center lg:items-end px-14 lg:justify-end w-full">
        <p>© Audio Media Grading 2024</p>
      </div>
    </div>
  );
}
