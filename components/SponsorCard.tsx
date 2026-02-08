'use client'

import React from 'react'

const SponsorCard: React.FC = () => {
  return (
    <div className="flex justify-center my-8">
      <iframe
        src="https://github.com/sponsors/Eskyee/card"
        title="Sponsor Eskyee"
        className="w-full max-w-[600px] h-[225px] border-0 rounded-lg shadow-lg"
      />
    </div>
  )
}

export default SponsorCard