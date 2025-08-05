// Logo mapping for Uganda government agencies and organizations
export const LOGO_MAPPING = {
  // Key government agencies (exact name matching) - using available logos
  'Uganda Investment Authority (UIA)': '/images/uganda-coat-of-arms.png',
  'Uganda Investment Authority': '/images/uganda-coat-of-arms.png',
  'Uganda Revenue Authority (URA)': '/images/uganda-coat-of-arms.png',
  'Uganda Revenue Authority': '/images/uganda-coat-of-arms.png',
  'Uganda Registration Services Bureau (URSB)': '/images/uganda-coat-of-arms.png',
  'Uganda Registration Services Bureau': '/images/uganda-coat-of-arms.png',
  'National Social Security Fund (NSSF)': '/images/uganda-coat-of-arms.png',
  'National Social Security Fund': '/images/uganda-coat-of-arms.png',
  'Uganda Communications Commission (UCC)': '/images/uganda-coat-of-arms.png',
  'Uganda Communications Commission': '/images/uganda-coat-of-arms.png',
  'Capital Markets Authority (CMA)': '/images/uganda-coat-of-arms.png',
  'Capital Markets Authority': '/images/uganda-coat-of-arms.png',
  
  // Additional agencies with provided logos
  'Bank of Uganda (BOU)': '/images/logos/BOU.jpeg',
  'Bank of Uganda': '/images/logos/BOU.jpeg',
  'Kampala Capital City Authority (KCCA)': '/images/logos/kcca.png',
  'Kampala Capital City Authority': '/images/logos/kcca.png',
  'Uganda National Examinations Board (UNEB)': '/images/logos/UNEB.jpeg',
  'Uganda National Examinations Board': '/images/logos/UNEB.jpeg',
  'National Drug Authority (NDA)': '/images/logos/drug authority.png',
  'National Drug Authority': '/images/logos/drug authority.png',
  'National Environment Management Authority (NEMA)': '/images/logos/NEMA.png',
  'National Environment Management Authority': '/images/logos/NEMA.png',
  'Petroleum Authority of Uganda (PAU)': '/images/logos/PAU.png',
  'Petroleum Authority of Uganda': '/images/logos/PAU.png',
  'Uganda Tourism Board (UTB)': '/images/logos/UTB.png',
  'Uganda Tourism Board': '/images/logos/UTB.png',
  'Uganda Microfinance Regulatory Authority (UMR)': '/images/logos/umr.png',
  'Uganda Microfinance Regulatory Authority': '/images/logos/umr.png',
  
  // Government ministry and department fallbacks
  'Ministry of Agriculture, Animal Industry and Fisheries': '/images/uganda-coat-of-arms.png',
  'Ministry of Agriculture, Animal Industry and Fisheries (MAAIF)': '/images/uganda-coat-of-arms.png',
  'Ministry of Energy and Mineral Development': '/images/uganda-coat-of-arms.png',
  'Ministry of ICT and National Guidance': '/images/uganda-coat-of-arms.png',
  'Ministry of Lands, Housing and Urban Development': '/images/uganda-coat-of-arms.png',
  'Ministry of Health': '/images/uganda-coat-of-arms.png',
  'Ministry of Education and Sports': '/images/uganda-coat-of-arms.png',
  'Ministry of Internal Affairs': '/images/uganda-coat-of-arms.png',
  'Ministry of Water and Environment': '/images/uganda-coat-of-arms.png',
  'Ministry of Works and Transport': '/images/uganda-coat-of-arms.png',
  
  // Statutory bodies and authorities - using available logos
  'National Water and Sewerage Corporation': '/images/uganda-coat-of-arms.png',
  'Uganda Electricity Distribution Company Limited': '/images/uganda-coat-of-arms.png',
  'Electricity Regulatory Authority': '/images/uganda-coat-of-arms.png',
  'Civil Aviation Authority': '/images/logos/CIVIL aviation',
  'Uganda Higher Education Board': '/images/logos/UHEB.png',
  'Uganda Higher Education Board (UHEB)': '/images/logos/UHEB.png',
  
  // Default fallback
  'default': '/images/logos/uganda-coat-of-arms.png'
}

// Function to get logo URL by agency name
export const getLogoByAgency = (agencyName) => {
  if (!agencyName) return LOGO_MAPPING.default
  
  // Check for exact match first
  if (LOGO_MAPPING[agencyName]) {
    return LOGO_MAPPING[agencyName]
  }
  
  // Check for partial matches
  for (const [key, logo] of Object.entries(LOGO_MAPPING)) {
    if (agencyName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(agencyName.toLowerCase())) {
      return logo
    }
  }
  
  return LOGO_MAPPING.default
}

// Function to get logo by URL pattern (for existing data)
export const getLogoByUrl = (logoUrl) => {
  if (!logoUrl || !logoUrl.includes('http')) return logoUrl // Return as-is if not HTTP URL
  
  // Map external URLs to local assets - using available logos
  const urlMappings = {
    'UIA%20logo.png': '/images/uganda-coat-of-arms.png',
    'URA%20logo.png': '/images/uganda-coat-of-arms.png',
    'URSB%20logo.png': '/images/uganda-coat-of-arms.png',
    'NSSF%20logo.png': '/images/uganda-coat-of-arms.png',
    'UCC%20logo.png': '/images/uganda-coat-of-arms.png',
    'CMA%20logo.png': '/images/uganda-coat-of-arms.png',
    'kcca.go.ug': '/images/logos/kcca.png',
    'agriculture.go.ug': '/images/uganda-coat-of-arms.png',
    'ugandacoffee.go.ug': '/images/uganda-coat-of-arms.png',
    'mwe.go.ug': '/images/uganda-coat-of-arms.png',
    'utb.go.ug': '/images/logos/UTB.png',
    'memd.go.ug': '/images/uganda-coat-of-arms.png',
    'ict.go.ug': '/images/uganda-coat-of-arms.png',
    'nita.go.ug': '/images/uganda-coat-of-arms.png',
    'nda.or.ug': '/images/logos/drug authority.png',
    'era.go.ug': '/images/uganda-coat-of-arms.png',
    'health.go.ug': '/images/uganda-coat-of-arms.png',
    'education.go.ug': '/images/uganda-coat-of-arms.png',
    'molhud.go.ug': '/images/uganda-coat-of-arms.png',
    'nwsc.co.ug': '/images/uganda-coat-of-arms.png',
    'uedcl.co.ug': '/images/uganda-coat-of-arms.png',
    'bou.or.ug': '/images/logos/BOU.jpeg',
    'caa.co.ug': '/images/logos/CIVIL aviation',
    'pau.go.ug': '/images/logos/PAU.png',
    'nema.go.ug': '/images/logos/NEMA.png',
    'uneb.ac.ug': '/images/logos/UNEB.jpeg'
  }
  
  for (const [pattern, localLogo] of Object.entries(urlMappings)) {
    if (logoUrl.includes(pattern)) {
      return localLogo
    }
  }
  
  return LOGO_MAPPING.default
}