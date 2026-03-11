import { SupportTicket, SLAConfig } from '@/types';

export const mockTickets: SupportTicket[] = [
  {
    id: 'TKT-2025-001',
    title: 'Investment license application status inquiry',
    description: 'I submitted my UIA investment license application 10 days ago (reference: UIA/2025/00234) for a coffee processing facility in Mbale. I have not received any update. Can you please check the status?',
    category: 'application_support',
    status: 'RESOLVED',
    priority: 'medium',
    assignee: 'Sarah Nakato',
    assigneeAgency: 'Uganda Investment Authority',
    createdAt: '2025-02-01T09:23:00Z',
    updatedAt: '2025-02-03T14:45:00Z',
    slaDeadline: '2025-02-01T13:23:00Z',
    responseTime: '1.2 hours',
    resolutionTime: '2.3 days',
    history: [
      {
        id: 'hist-001-1',
        timestamp: '2025-02-01T09:23:00Z',
        action: 'Ticket Created',
        actor: 'System',
        details: 'Ticket automatically created from chatbot escalation',
        status: 'NEW'
      },
      {
        id: 'hist-001-2',
        timestamp: '2025-02-01T10:34:00Z',
        action: 'Assigned',
        actor: 'Moses Kaggwa',
        details: 'Assigned to Sarah Nakato (UIA Licensing Officer)',
        status: 'ASSIGNED'
      },
      {
        id: 'hist-001-3',
        timestamp: '2025-02-01T11:45:00Z',
        action: 'Response Sent',
        actor: 'Sarah Nakato',
        details: 'Your application is under review by the licensing committee. Missing document: Environmental approval from NEMA.',
        status: 'IN_PROGRESS'
      },
      {
        id: 'hist-001-4',
        timestamp: '2025-02-03T14:45:00Z',
        action: 'Resolved',
        actor: 'Sarah Nakato',
        details: 'NEMA approval received. License approved and issued. Reference: LIC/2025/0234',
        status: 'RESOLVED'
      }
    ],
    attachments: [
      {
        id: 'att-001-1',
        name: 'application_receipt.pdf',
        type: 'application/pdf',
        size: '234 KB',
        uploadedAt: '2025-02-01T09:23:00Z'
      }
    ],
    satisfaction: 5,
    contactEmail: 'john.kimani@coffeecorp.co.ke',
    contactName: 'John Kimani'
  },
  {
    id: 'TKT-2025-002',
    title: 'VIP Investor: Land acquisition assistance needed urgently',
    description: 'I am an investor from UAE planning to invest USD 50M in a pharmaceutical manufacturing plant. I need assistance acquiring 20 acres in Namanve Industrial Park. This is time-sensitive as I have board approval expiring in 3 weeks.',
    category: 'vip',
    status: 'IN_PROGRESS',
    priority: 'critical',
    assignee: 'Dr. Chris Kassami',
    assigneeAgency: 'Uganda Investment Authority',
    createdAt: '2025-02-10T08:15:00Z',
    updatedAt: '2025-02-12T11:30:00Z',
    slaDeadline: '2025-02-10T09:15:00Z',
    responseTime: '0.5 hours',
    history: [
      {
        id: 'hist-002-1',
        timestamp: '2025-02-10T08:15:00Z',
        action: 'Ticket Created',
        actor: 'System',
        details: 'VIP investor ticket - auto-escalated to Executive Director',
        status: 'NEW'
      },
      {
        id: 'hist-002-2',
        timestamp: '2025-02-10T08:45:00Z',
        action: 'Assigned',
        actor: 'Dr. Chris Kassami',
        details: 'Executive Director taking direct ownership',
        status: 'ASSIGNED'
      },
      {
        id: 'hist-002-3',
        timestamp: '2025-02-10T09:30:00Z',
        action: 'Response Sent',
        actor: 'Dr. Chris Kassami',
        details: 'Meeting scheduled for Feb 11 at State House with Minister of Finance and UIA team. Land allocation process initiated.',
        status: 'IN_PROGRESS'
      },
      {
        id: 'hist-002-4',
        timestamp: '2025-02-11T14:00:00Z',
        action: 'Update',
        actor: 'Dr. Chris Kassami',
        details: 'Meeting held successfully. 25-acre plot reserved in Namanve. Letter of Intent signed. Proceeding with land lease documentation.',
        status: 'IN_PROGRESS'
      }
    ],
    attachments: [
      {
        id: 'att-002-1',
        name: 'investment_proposal.pdf',
        type: 'application/pdf',
        size: '4.2 MB',
        uploadedAt: '2025-02-10T08:15:00Z'
      },
      {
        id: 'att-002-2',
        name: 'board_approval_letter.pdf',
        type: 'application/pdf',
        size: '856 KB',
        uploadedAt: '2025-02-10T08:15:00Z'
      }
    ],
    contactEmail: 'ahmad.rashid@gulfpharma.ae',
    contactName: 'Ahmad Rashid Al-Maktoum'
  },
  {
    id: 'TKT-2025-003',
    title: 'Complaint: Delayed work permit processing at Immigration',
    description: 'My company applied for 5 Class C work permits for expatriate staff 6 weeks ago. Immigration Department has not responded despite multiple follow-ups. This is delaying our project implementation. Application reference: WP/2025/00123',
    category: 'complaint',
    status: 'PENDING_EXTERNAL',
    priority: 'high',
    assignee: 'Grace Tumusiime',
    assigneeAgency: 'Uganda Investment Authority',
    createdAt: '2025-02-05T10:20:00Z',
    updatedAt: '2025-02-08T16:45:00Z',
    slaDeadline: '2025-02-05T12:20:00Z',
    responseTime: '1.5 hours',
    history: [
      {
        id: 'hist-003-1',
        timestamp: '2025-02-05T10:20:00Z',
        action: 'Ticket Created',
        actor: 'System',
        details: 'Complaint ticket created',
        status: 'NEW'
      },
      {
        id: 'hist-003-2',
        timestamp: '2025-02-05T11:50:00Z',
        action: 'Assigned',
        actor: 'Moses Kaggwa',
        details: 'Assigned to Grace Tumusiime (Investor Relations)',
        status: 'ASSIGNED'
      },
      {
        id: 'hist-003-3',
        timestamp: '2025-02-05T13:30:00Z',
        action: 'Escalated to External Agency',
        actor: 'Grace Tumusiime',
        details: 'Escalated to Directorate of Citizenship and Immigration Control (DCIC). Request for priority processing sent to Commissioner.',
        status: 'PENDING_EXTERNAL'
      },
      {
        id: 'hist-003-4',
        timestamp: '2025-02-08T16:45:00Z',
        action: 'Update',
        actor: 'Grace Tumusiime',
        details: 'DCIC confirmed applications located. Security clearance pending from Internal Security Organisation. Expected completion: Feb 15.',
        status: 'PENDING_EXTERNAL'
      }
    ],
    attachments: [
      {
        id: 'att-003-1',
        name: 'work_permit_applications.pdf',
        type: 'application/pdf',
        size: '1.8 MB',
        uploadedAt: '2025-02-05T10:20:00Z'
      }
    ],
    contactEmail: 'hr@chinaconstructionug.com',
    contactName: 'Wang Lei'
  },
  {
    id: 'TKT-2025-004',
    title: 'General inquiry: Tax incentives for tourism sector',
    description: 'I am planning to build a 50-room eco-lodge near Murchison Falls National Park. What tax incentives are available for tourism investments? What is the minimum investment to qualify?',
    category: 'general_inquiry',
    status: 'CLOSED',
    priority: 'low',
    assignee: 'Patrick Mugisha',
    assigneeAgency: 'Uganda Investment Authority',
    createdAt: '2025-01-28T14:30:00Z',
    updatedAt: '2025-01-30T09:15:00Z',
    slaDeadline: '2025-01-29T14:30:00Z',
    responseTime: '3.2 hours',
    resolutionTime: '1.8 days',
    history: [
      {
        id: 'hist-004-1',
        timestamp: '2025-01-28T14:30:00Z',
        action: 'Ticket Created',
        actor: 'System',
        details: 'General inquiry ticket',
        status: 'NEW'
      },
      {
        id: 'hist-004-2',
        timestamp: '2025-01-28T17:45:00Z',
        action: 'Assigned',
        actor: 'Moses Kaggwa',
        details: 'Assigned to Patrick Mugisha (Tourism & Hospitality Specialist)',
        status: 'ASSIGNED'
      },
      {
        id: 'hist-004-3',
        timestamp: '2025-01-29T09:20:00Z',
        action: 'Response Sent',
        actor: 'Patrick Mugisha',
        details: 'Tourism investments outside Kampala qualify for 10-year income tax exemption. Minimum investment: USD 500,000. Additional benefits: VAT exemption on construction materials, duty-free import of equipment. Detailed guide sent via email.',
        status: 'RESOLVED'
      },
      {
        id: 'hist-004-4',
        timestamp: '2025-01-30T09:15:00Z',
        action: 'Closed',
        actor: 'System',
        details: 'Ticket auto-closed - investor confirmed satisfaction',
        status: 'CLOSED'
      }
    ],
    attachments: [],
    satisfaction: 4,
    contactEmail: 'susan.okello@ugandaecotours.com',
    contactName: 'Susan Okello'
  },
  {
    id: 'TKT-2025-005',
    title: 'Procedure query: Environmental Impact Assessment requirements',
    description: 'We are setting up a 5MW solar farm in Soroti. What are the EIA requirements? How long does NEMA approval take? What documents are needed?',
    category: 'procedure_query',
    status: 'RESOLVED',
    priority: 'medium',
    assignee: 'David Okware',
    assigneeAgency: 'National Environment Management Authority',
    createdAt: '2025-02-07T11:00:00Z',
    updatedAt: '2025-02-07T15:30:00Z',
    slaDeadline: '2025-02-07T19:00:00Z',
    responseTime: '2.5 hours',
    resolutionTime: '4.5 hours',
    history: [
      {
        id: 'hist-005-1',
        timestamp: '2025-02-07T11:00:00Z',
        action: 'Ticket Created',
        actor: 'System',
        details: 'Procedure query ticket',
        status: 'NEW'
      },
      {
        id: 'hist-005-2',
        timestamp: '2025-02-07T13:30:00Z',
        action: 'Assigned',
        actor: 'Grace Tumusiime',
        details: 'Assigned to NEMA representative (One-Stop Centre)',
        status: 'ASSIGNED'
      },
      {
        id: 'hist-005-3',
        timestamp: '2025-02-07T15:30:00Z',
        action: 'Response Sent',
        actor: 'David Okware',
        details: 'Solar farms require full EIA. Documents needed: Project brief, site plan, feasibility study, land title, proof of capital. Processing time: 60-90 days. Fee: USD 2,000. Detailed checklist sent. Contact NEMA: +256-414-251064',
        status: 'RESOLVED'
      }
    ],
    attachments: [
      {
        id: 'att-005-1',
        name: 'eia_checklist.pdf',
        type: 'application/pdf',
        size: '456 KB',
        uploadedAt: '2025-02-07T15:30:00Z'
      }
    ],
    satisfaction: 5,
    contactEmail: 'projects@sunenergyug.com',
    contactName: 'Rajesh Kumar'
  },
  {
    id: 'TKT-2025-006',
    title: 'License delay: UNBS product certification taking too long',
    description: 'We submitted our product samples for UNBS certification 3 months ago for our new line of roofing tiles. UNBS has not completed testing. This is delaying our market entry. Reference: UNBS/CERT/2024/1234',
    category: 'license_delay',
    status: 'IN_PROGRESS',
    priority: 'high',
    assignee: 'Martha Nabirye',
    assigneeAgency: 'Uganda National Bureau of Standards',
    createdAt: '2025-02-09T09:45:00Z',
    updatedAt: '2025-02-12T10:20:00Z',
    slaDeadline: '2025-02-09T11:45:00Z',
    responseTime: '1.8 hours',
    history: [
      {
        id: 'hist-006-1',
        timestamp: '2025-02-09T09:45:00Z',
        action: 'Ticket Created',
        actor: 'System',
        details: 'License delay complaint',
        status: 'NEW'
      },
      {
        id: 'hist-006-2',
        timestamp: '2025-02-09T11:33:00Z',
        action: 'Assigned',
        actor: 'Grace Tumusiime',
        details: 'Escalated to UNBS One-Stop Centre representative',
        status: 'ASSIGNED'
      },
      {
        id: 'hist-006-3',
        timestamp: '2025-02-09T14:15:00Z',
        action: 'Response Sent',
        actor: 'Martha Nabirye',
        details: 'Testing delayed due to laboratory equipment breakdown. Testing resumed Feb 5. Expected completion: Feb 20.',
        status: 'IN_PROGRESS'
      },
      {
        id: 'hist-006-4',
        timestamp: '2025-02-12T10:20:00Z',
        action: 'Update',
        actor: 'Martha Nabirye',
        details: 'Testing 80% complete. Preliminary results positive. Final report and certificate will be issued by Feb 18.',
        status: 'IN_PROGRESS'
      }
    ],
    attachments: [
      {
        id: 'att-006-1',
        name: 'unbs_submission_receipt.pdf',
        type: 'application/pdf',
        size: '178 KB',
        uploadedAt: '2025-02-09T09:45:00Z'
      }
    ],
    contactEmail: 'quality@ugandatiles.co.ug',
    contactName: 'James Otim'
  },
  {
    id: 'TKT-2025-007',
    title: 'Application status: TIN registration for new company',
    description: 'We registered our company with URSB 2 weeks ago. We applied for TIN with URA but have not received it yet. We need it urgently to open a bank account. Company name: AgriTech Solutions Ltd. URSB Reg: 2025/12345',
    category: 'application_support',
    status: 'ASSIGNED',
    priority: 'medium',
    assignee: 'Robert Kyagulanyi',
    assigneeAgency: 'Uganda Revenue Authority',
    createdAt: '2025-02-11T13:20:00Z',
    updatedAt: '2025-02-11T15:45:00Z',
    slaDeadline: '2025-02-11T17:20:00Z',
    history: [
      {
        id: 'hist-007-1',
        timestamp: '2025-02-11T13:20:00Z',
        action: 'Ticket Created',
        actor: 'System',
        details: 'Application status inquiry',
        status: 'NEW'
      },
      {
        id: 'hist-007-2',
        timestamp: '2025-02-11T15:45:00Z',
        action: 'Assigned',
        actor: 'Moses Kaggwa',
        details: 'Assigned to URA representative at One-Stop Centre',
        status: 'ASSIGNED'
      }
    ],
    attachments: [
      {
        id: 'att-007-1',
        name: 'ursb_certificate.pdf',
        type: 'application/pdf',
        size: '1.2 MB',
        uploadedAt: '2025-02-11T13:20:00Z'
      }
    ],
    contactEmail: 'info@agritechsolutions.co.ug',
    contactName: 'Mary Namugga'
  },
  {
    id: 'TKT-2025-008',
    title: 'General inquiry: Minimum capital for foreign investor',
    description: 'I am from Nigeria and want to invest in a poultry farm in Uganda. What is the minimum capital required for foreign investors? Do I need a UIA license?',
    category: 'general_inquiry',
    status: 'NEW',
    priority: 'low',
    createdAt: '2025-02-12T08:30:00Z',
    updatedAt: '2025-02-12T08:30:00Z',
    slaDeadline: '2025-02-13T08:30:00Z',
    history: [
      {
        id: 'hist-008-1',
        timestamp: '2025-02-12T08:30:00Z',
        action: 'Ticket Created',
        actor: 'System',
        details: 'New inquiry awaiting assignment',
        status: 'NEW'
      }
    ],
    attachments: [],
    contactEmail: 'chukwu.okonkwo@gmail.com',
    contactName: 'Chukwu Okonkwo'
  },
  {
    id: 'TKT-2025-009',
    title: 'Procedure query: Steps to register a branch of foreign company',
    description: 'Our Indian company wants to open a branch office in Kampala to provide IT consulting services. What is the registration process? What documents do we need? How long does it take?',
    category: 'procedure_query',
    status: 'IN_PROGRESS',
    priority: 'medium',
    assignee: 'Sarah Nakato',
    assigneeAgency: 'Uganda Registration Services Bureau',
    createdAt: '2025-02-10T16:00:00Z',
    updatedAt: '2025-02-11T10:30:00Z',
    slaDeadline: '2025-02-11T00:00:00Z',
    responseTime: '5.2 hours',
    history: [
      {
        id: 'hist-009-1',
        timestamp: '2025-02-10T16:00:00Z',
        action: 'Ticket Created',
        actor: 'System',
        details: 'Procedure query ticket',
        status: 'NEW'
      },
      {
        id: 'hist-009-2',
        timestamp: '2025-02-10T21:15:00Z',
        action: 'Assigned',
        actor: 'Moses Kaggwa',
        details: 'Assigned to URSB representative',
        status: 'ASSIGNED'
      },
      {
        id: 'hist-009-3',
        timestamp: '2025-02-11T10:30:00Z',
        action: 'Response Sent',
        actor: 'Sarah Nakato',
        details: 'Documents needed: (1) Certificate of incorporation from India, (2) Board resolution to open branch, (3) Memorandum & Articles, (4) Directors\' IDs/passports. Process takes 5-7 days. Fee: USD 300. Detailed guide sent.',
        status: 'IN_PROGRESS'
      }
    ],
    attachments: [
      {
        id: 'att-009-1',
        name: 'branch_registration_guide.pdf',
        type: 'application/pdf',
        size: '678 KB',
        uploadedAt: '2025-02-11T10:30:00Z'
      }
    ],
    contactEmail: 'legal@infosysug.com',
    contactName: 'Priya Sharma'
  },
  {
    id: 'TKT-2025-010',
    title: 'VIP Investor: Urgent meeting request with Minister of Finance',
    description: 'I represent a consortium of Chinese investors planning a USD 120M steel manufacturing plant in Jinja. We need to meet with the Minister of Finance to discuss fiscal incentives before our board meeting on Feb 25. This is time-critical.',
    category: 'vip',
    status: 'ASSIGNED',
    priority: 'critical',
    assignee: 'Dr. Chris Kassami',
    assigneeAgency: 'Uganda Investment Authority',
    createdAt: '2025-02-12T07:00:00Z',
    updatedAt: '2025-02-12T08:30:00Z',
    slaDeadline: '2025-02-12T08:00:00Z',
    responseTime: '0.8 hours',
    history: [
      {
        id: 'hist-010-1',
        timestamp: '2025-02-12T07:00:00Z',
        action: 'Ticket Created',
        actor: 'System',
        details: 'VIP investor - auto-escalated to Executive Director',
        status: 'NEW'
      },
      {
        id: 'hist-010-2',
        timestamp: '2025-02-12T07:50:00Z',
        action: 'Assigned',
        actor: 'Dr. Chris Kassami',
        details: 'ED taking direct ownership. Coordinating with Ministry of Finance.',
        status: 'ASSIGNED'
      },
      {
        id: 'hist-010-3',
        timestamp: '2025-02-12T08:30:00Z',
        action: 'Update',
        actor: 'Dr. Chris Kassami',
        details: 'Meeting scheduled for Feb 14 at 10:00 AM at Ministry of Finance. Attendees: Minister, Permanent Secretary, UIA ED, URA Commissioner. Location: Ministry of Finance Boardroom, Apollo Kaggwa Road.',
        status: 'ASSIGNED'
      }
    ],
    attachments: [
      {
        id: 'att-010-1',
        name: 'investment_proposal_steel_plant.pdf',
        type: 'application/pdf',
        size: '6.8 MB',
        uploadedAt: '2025-02-12T07:00:00Z'
      },
      {
        id: 'att-010-2',
        name: 'consortium_profile.pdf',
        type: 'application/pdf',
        size: '2.3 MB',
        uploadedAt: '2025-02-12T07:00:00Z'
      }
    ],
    contactEmail: 'zhang.wei@chinasteel-africa.com',
    contactName: 'Zhang Wei'
  }
];

export const slaConfigs: SLAConfig[] = [
  {
    category: 'general_inquiry',
    priority: 'low',
    responseTime: '24 hours',
    resolutionTime: '5 business days'
  },
  {
    category: 'general_inquiry',
    priority: 'medium',
    responseTime: '12 hours',
    resolutionTime: '3 business days'
  },
  {
    category: 'general_inquiry',
    priority: 'high',
    responseTime: '4 hours',
    resolutionTime: '2 business days'
  },
  {
    category: 'procedure_query',
    priority: 'low',
    responseTime: '8 hours',
    resolutionTime: '3 business days'
  },
  {
    category: 'procedure_query',
    priority: 'medium',
    responseTime: '4 hours',
    resolutionTime: '2 business days'
  },
  {
    category: 'procedure_query',
    priority: 'high',
    responseTime: '2 hours',
    resolutionTime: '1 business day'
  },
  {
    category: 'application_support',
    priority: 'low',
    responseTime: '8 hours',
    resolutionTime: '3 business days'
  },
  {
    category: 'application_support',
    priority: 'medium',
    responseTime: '4 hours',
    resolutionTime: '2 business days'
  },
  {
    category: 'application_support',
    priority: 'high',
    responseTime: '2 hours',
    resolutionTime: '1 business day'
  },
  {
    category: 'license_delay',
    priority: 'medium',
    responseTime: '4 hours',
    resolutionTime: '5 business days'
  },
  {
    category: 'license_delay',
    priority: 'high',
    responseTime: '2 hours',
    resolutionTime: '3 business days'
  },
  {
    category: 'license_delay',
    priority: 'critical',
    responseTime: '1 hour',
    resolutionTime: '2 business days'
  },
  {
    category: 'complaint',
    priority: 'medium',
    responseTime: '4 hours',
    resolutionTime: '5 business days'
  },
  {
    category: 'complaint',
    priority: 'high',
    responseTime: '2 hours',
    resolutionTime: '3 business days'
  },
  {
    category: 'complaint',
    priority: 'critical',
    responseTime: '1 hour',
    resolutionTime: '2 business days'
  },
  {
    category: 'vip',
    priority: 'high',
    responseTime: '2 hours',
    resolutionTime: 'same business day'
  },
  {
    category: 'vip',
    priority: 'critical',
    responseTime: '1 hour',
    resolutionTime: 'same business day'
  }
];
