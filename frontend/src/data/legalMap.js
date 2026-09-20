/**
 * Legal Section Mapping for ShieldAI Cyber Cell Complaint Pack.
 * BNS (Bharatiya Nyaya Sanhita, 2023) replaced IPC on 1 July 2024.
 * IT Act refers to Information Technology Act, 2000.
 *
 * Deterministic mapping rules:
 * - Sections come ONLY from verified statutory provisions.
 * - Final sections are decided by police/court.
 */

export const LEGAL_DISCLAIMER =
  "Indicative mapping to help you file. Final sections are decided by police/court. Not legal advice.";

export const BSA_EVIDENCE_NOTE =
  "Police may ask for a BSA 2023 s.63 electronic-evidence certificate. The SHA-256 above is included for that.";

export const SECTIONS = {
  bns318_4: {
    id: 'bns318_4',
    act: 'BNS',
    section: '318(4)',
    title: 'Cheating and dishonestly inducing delivery of property',
    description: 'Cheating and dishonestly inducing delivery of property',
    oldRef: 'IPC 420',
  },
  bns319: {
    id: 'bns319',
    act: 'BNS',
    section: '319',
    title: 'Cheating by personation',
    description: 'Cheating by personation',
    oldRef: 'IPC 419',
  },
  bns61_2: {
    id: 'bns61_2',
    act: 'BNS',
    section: '61(2)',
    title: 'Criminal conspiracy',
    description: 'Criminal conspiracy',
    oldRef: 'IPC 120B',
  },
  bns204: {
    id: 'bns204',
    act: 'BNS',
    section: '204',
    title: 'Personating a public servant',
    description: 'Personating a public servant',
    oldRef: 'IPC 170',
  },
  bns308: {
    id: 'bns308',
    act: 'BNS',
    section: '308',
    title: 'Extortion',
    description: 'Extortion',
    oldRef: 'IPC 383/384',
  },
  bns351: {
    id: 'bns351',
    act: 'BNS',
    section: '351',
    title: 'Criminal intimidation',
    description: 'Criminal intimidation',
    oldRef: 'IPC 503/506',
  },
  bns336_3: {
    id: 'bns336_3',
    act: 'BNS',
    section: '336(3)',
    title: 'Forgery for the purpose of cheating',
    description: 'Forgery for the purpose of cheating',
    oldRef: 'IPC 468',
  },
  bns340_2: {
    id: 'bns340_2',
    act: 'BNS',
    section: '340(2)',
    title: 'Using a forged document/electronic record as genuine',
    description: 'Using a forged document/electronic record as genuine',
    oldRef: 'IPC 471',
  },
  it66c: {
    id: 'it66c',
    act: 'IT Act',
    section: '66C',
    title: 'Identity theft',
    description: 'Identity theft (fraudulent use of electronic signature, password, or unique identity)',
    oldRef: '-',
  },
  it66d: {
    id: 'it66d',
    act: 'IT Act',
    section: '66D',
    title: 'Cheating by personation using a computer resource',
    description: 'Cheating by personation using a computer resource',
    oldRef: '-',
  },
  it66: {
    id: 'it66',
    act: 'IT Act',
    section: '66 (with 43)',
    title: 'Computer-related offences',
    description: 'Computer-related offences (unauthorized access, hacking, system tampering)',
    oldRef: '-',
  },
  it66e: {
    id: 'it66e',
    act: 'IT Act',
    section: '66E',
    title: 'Violation of privacy',
    description: 'Violation of privacy (capturing/publishing private images without consent)',
    oldRef: '-',
  },
  it67a: {
    id: 'it67a',
    act: 'IT Act',
    section: '67A',
    title: 'Publishing/transmitting sexually explicit material electronically',
    description: 'Publishing/transmitting sexually explicit material electronically',
    oldRef: '-',
  },
};

export const BY_CATEGORY = {
  'UPI fraud': ['bns318_4', 'it66c', 'it66d'],
  'Fake OTP': ['bns318_4', 'it66c', 'it66d', 'it66'],
  'Phishing': ['bns318_4', 'it66c', 'it66d'],
  'KYC': ['bns318_4', 'bns319', 'it66c', 'it66d'],
  'Delivery': ['bns318_4', 'it66d'],
  'Sextortion': ['bns308', 'bns351', 'it66e', 'it67a'],
  'Crypto': ['bns318_4', 'bns61_2', 'it66d'],
  'Job offer': ['bns318_4', 'bns319', 'it66d'],
};

export const ADDONS = {
  posed_as_bank_or_company: {
    id: 'posed_as_bank_or_company',
    label: 'Scammer pretended to be a bank or company',
    sections: ['bns319', 'it66d'],
  },
  posed_as_govt_officer: {
    id: 'posed_as_govt_officer',
    label: 'Scammer posed as a police or government officer',
    sections: ['bns204', 'bns319', 'it66d'],
  },
  threatened_or_blackmailed: {
    id: 'threatened_or_blackmailed',
    label: 'Threatened, blackmailed, or coerced for money',
    sections: ['bns308', 'bns351'],
  },
  private_images_used: {
    id: 'private_images_used',
    label: 'Private photos or videos were involved or threatened',
    sections: ['it66e', 'it67a'],
  },
  fake_website_or_document: {
    id: 'fake_website_or_document',
    label: 'Fake website, phishing link, or forged document used',
    sections: ['bns336_3', 'bns340_2'],
  },
  multiple_people_or_accounts: {
    id: 'multiple_people_or_accounts',
    label: 'Multiple callers, gang, or syndicate involved',
    sections: ['bns61_2'],
  },
  otp_or_id_misused: {
    id: 'otp_or_id_misused',
    label: 'OTP, password, or login credentials were stolen/misused',
    sections: ['it66c'],
  },
};

/**
 * Deterministically resolve applicable legal sections:
 * union of BY_CATEGORY[category] + checked ADDONS, deduped, BNS first then IT Act.
 */
export function getApplicableSections(category, activeAddonKeys = []) {
  const sectionIdSet = new Set();

  // Find category sections (exact or normalized match)
  let catSections = BY_CATEGORY[category];
  if (!catSections && category) {
    const key = Object.keys(BY_CATEGORY).find(
      (k) => k.toLowerCase() === category.toLowerCase() || category.toLowerCase().includes(k.toLowerCase())
    );
    if (key) {
      catSections = BY_CATEGORY[key];
    }
  }

  if (catSections) {
    catSections.forEach((id) => sectionIdSet.add(id));
  }

  // Add checked addons
  activeAddonKeys.forEach((addonKey) => {
    const addon = ADDONS[addonKey];
    if (addon && addon.sections) {
      addon.sections.forEach((id) => sectionIdSet.add(id));
    }
  });

  // Resolve to full section objects
  const list = Array.from(sectionIdSet)
    .map((id) => SECTIONS[id])
    .filter(Boolean);

  // Sort: BNS first, then IT Act; then numerically by section
  list.sort((a, b) => {
    if (a.act === b.act) {
      return a.section.localeCompare(b.section, undefined, { numeric: true });
    }
    return a.act === 'BNS' ? -1 : 1;
  });

  return list;
}
