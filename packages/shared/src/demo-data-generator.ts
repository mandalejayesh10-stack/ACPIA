export interface DemoCaseData {
  caseId: string
  title: string
  incidentType: string
  victimInfo: { name: string; ageCategory: string; location: string }
  suspectInfo: { alias: string; ip: string; telegram: string }
  evidenceFiles: { fileName: string; mimeType: string; hash: string; riskScore: number }[]
  threatScore: number
}

export function generateDemoCase(seed = '2024-001'): DemoCaseData {
  return {
    caseId: `CASE-${seed}`,
    title: 'Operation Cyber Shield: Dark Web Grooming & Extortion Syndicate',
    incidentType: 'Child Exploitation & Financial Sextortion',
    victimInfo: {
      name: 'Ananya R.',
      ageCategory: 'Minor (16)',
      location: 'Kochi, Kerala, India',
    },
    suspectInfo: {
      alias: 'Phantom_Ghost_99',
      ip: '185.220.101.4',
      telegram: '@dark_phantom_99',
    },
    evidenceFiles: [
      {
        fileName: 'Telegram_Chat_Export.json',
        mimeType: 'application/json',
        hash: 'a4f891b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
        riskScore: 92,
      },
      {
        fileName: 'Landmark_Land_Rover_GPS.png',
        mimeType: 'image/png',
        hash: 'b8f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0',
        riskScore: 78,
      },
      {
        fileName: 'Extracted_Voicemail_Threat.mp3',
        mimeType: 'audio/mp3',
        hash: 'c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
        riskScore: 96,
      },
    ],
    threatScore: 8.7,
  }
}
