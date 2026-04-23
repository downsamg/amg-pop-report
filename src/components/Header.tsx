'use client';
import { useState } from 'react';
import Image from 'next/image';

const BASE = 'https://www.audiomediagrading.com';

export default function Header() {
  const [openSideBar, setOpenSideBar] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);

  return (
    <>
      <div
        className="w-full h-[99px] px-4 sm:px-12 relative z-10 flex justify-center bg-[#F8F7F3]"
        style={{ boxShadow: '0px 4px 25px 0px rgba(0, 0, 0, 0.15)' }}
      >
        <div className="max-w-[90rem] h-[99px] w-full items-center justify-between flex">
          {/* Left nav */}
          <div className="hidden flex-1 lg:flex flex-row gap-10 items-center">
            <a className="text-lg font-theme-font-roman" href={`${BASE}/about`}>About</a>

            <div className="relative">
              <button
                className="text-lg font-theme-font-roman"
                onClick={() => setResearchOpen(!researchOpen)}
              >
                Research
              </button>
              {researchOpen && (
                <div
                  className="absolute left-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                  onMouseLeave={() => setResearchOpen(false)}
                >
                  <div className="py-1">
                    <a
                      href="/"
                      className="block px-4 py-2 text-sm text-gray-700 font-theme-font-roman hover:bg-gray-100"
                    >
                      Pop Report
                    </a>
                    <a
                      href={`${BASE}/archiving`}
                      className="block px-4 py-2 text-sm text-gray-700 font-theme-font-roman hover:bg-gray-100"
                    >
                      HoloID Lookup
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a className="text-lg font-theme-font-roman" href={`${BASE}/merch`}>Merch</a>
          </div>

          {/* Hamburger (mobile) */}
          <button onClick={() => setOpenSideBar(true)} className="block mr-4 lg:hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="#100F0F" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Logo */}
          <a href={BASE}>
            <Image
              src="/logo/amg.svg"
              alt="AMG logo"
              width={137}
              height={41}
              className="!w-[75px] !h-[22px] lg:!w-[137px] lg:!h-[41px]"
            />
          </a>

          {/* Right nav */}
          <div className="flex flex-row gap-4 flex-1 justify-end items-center">
            <a
              href={`${BASE}/sign-in`}
              className="flex gap-2 items-center rounded-full border border-[#252422] px-2 py-2.5 sm:px-4 sm:py-2.5"
            >
              <p className="font-theme-font-roman">Login</p>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {openSideBar && (
        <div className="fixed top-0 left-0 w-full h-screen z-20 flex flex-row">
          <div className="bg-white w-4/6 py-10 h-full flex flex-col items-center justify-between">
            <a href={BASE} onClick={() => setOpenSideBar(false)}>
              <Image src="/logo/amg.svg" alt="AMG logo" width={120} height={36} />
            </a>
            <div className="flex flex-col gap-8">
              <a className="text-[32px] font-theme-font-bold" href={`${BASE}/about`}>About</a>
              <div className="flex flex-col gap-4">
                <p className="text-[32px] font-theme-font-bold">Research</p>
                <a className="text-[24px] font-theme-font-roman pl-4 underline" href="/">Pop Report</a>
                <a className="text-[24px] font-theme-font-roman pl-4" href={`${BASE}/archiving`}>HoloID Lookup</a>
              </div>
              <a className="text-[32px] font-theme-font-bold" href={`${BASE}/merch`}>Merch</a>
            </div>
            <p className="text-sm text-black opacity-40">© Audio Media Grading 2024</p>
          </div>
          <div
            onClick={() => setOpenSideBar(false)}
            className="bg-[rgba(255,255,255,0.7)] w-2/6 h-full relative"
          >
            <button
              className="absolute top-[36px] border bg-black border-[#292927] rounded-md right-5 flex items-center justify-center p-1"
              onClick={() => setOpenSideBar(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
