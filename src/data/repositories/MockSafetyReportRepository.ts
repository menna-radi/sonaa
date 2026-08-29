import { SafetyReportRepository, SafetyReport } from '../../domain/repositories/SafetyReportRepository';
import { Result, ok } from '../../core/result/Result';

const INITIAL_REPORTS: SafetyReport[] = [
  {
    id: 'R-2001',
    title: 'Off-platform payment demand',
    severity: 'high',
    reporter: 'Saad Al-Dawsari',
    reporterId: 'USR-8821',
    reporterPhone: '+972 54 123 9988',
    reporterPriorReportsCount: 1,
    subject: 'Ahmad Al-Otaibi (Plumber)',
    suspectId: 'CRF-4019',
    suspectPhone: '+972 54 887 1122',
    suspectStatus: 'ACTIVE',
    suspectPriorReportsCount: 3,
    subjectType: 'Craftsman / Partner',
    category: 'fraud',
    time: '34s ago',
    desc: 'Craftsman insisted on direct cash payment of 350 ILS outside Sonaa to bypass platform fees and threatened to cancel order if unfulfilled.',
    taskId: 'T-1001',
    taskDisplayId: '#TSK-2001',
    taskTitle: 'Emergency Plumbing Repair & Leak Isolation',
    orderBudget: 350.00,
    escrowStatus: 'FROZEN',
    chatLogs: [
      { sender: 'Saad Al-Dawsari', text: 'Hello Ahmad, when will you arrive for the pipe inspection in Shuafat?', time: '10:14 AM' },
      { sender: 'Ahmad Al-Otaibi (Plumber)', text: 'I am arriving in 10 minutes. Please prepare 350 ILS cash directly, do not pay through the app.', time: '10:16 AM', flagged: true },
      { sender: 'Saad Al-Dawsari', text: 'Why cash? The booking is already escrowed and protected in Sonaa.', time: '10:17 AM' },
      { sender: 'Ahmad Al-Otaibi (Plumber)', text: 'If you refuse cash payment on site I will cancel the dispatch right now.', time: '10:19 AM', flagged: true }
    ],
    evidenceImages: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'
    ],
    auditTrail: [
      { action: 'Report Filed by Customer', actor: 'Saad Al-Dawsari', timestamp: '10:20 AM' },
      { action: 'Escrow Payout Placed on Hold (350 ILS)', actor: 'System Safeguard', timestamp: '10:21 AM' },
      { action: 'Opened in Admin Workspace', actor: 'Admin Moderator', timestamp: 'Just now' }
    ]
  },
  {
    id: 'R-2002',
    title: 'Multiple rapid registrations detected',
    severity: 'high',
    reporter: 'System Safeguard AI',
    reporterId: 'SYS-AI-01',
    reporterPhone: '+972 2 500 0000',
    reporterPriorReportsCount: 0,
    subject: 'IP 81.10.142.90 (Jerusalem)',
    suspectId: 'USR-BOT-99',
    suspectPhone: '+972 50 999 0011',
    suspectStatus: 'SUSPENDED',
    suspectPriorReportsCount: 2,
    subjectType: 'IP Cluster',
    category: 'fake_accounts',
    time: '6m ago',
    desc: '5 accounts registered in under 90 seconds from identical fingerprint IP in Beit Hanina. Automated bot syndicate behavior detected.',
    taskId: 'T-1002',
    taskDisplayId: '#TSK-2002',
    taskTitle: 'System Account Verification Batch',
    orderBudget: 0.00,
    escrowStatus: 'RELEASED',
    chatLogs: [],
    evidenceImages: [],
    auditTrail: [
      { action: 'Automated Anomaly Alert Triggered', actor: 'System Safeguard AI', timestamp: '10:10 AM' },
      { action: 'IP Range Rate-Limited', actor: 'Security Firewall', timestamp: '10:11 AM' }
    ]
  },
  {
    id: 'R-2003',
    title: 'Harassment and abusive message',
    severity: 'medium',
    reporter: 'Layla Mansour',
    reporterId: 'USR-3190',
    reporterPhone: '+972 52 445 6677',
    reporterPriorReportsCount: 0,
    subject: 'Tariq Nabulsi (Electrician)',
    suspectId: 'CRF-1092',
    suspectPhone: '+972 54 332 9900',
    suspectStatus: 'ACTIVE',
    suspectPriorReportsCount: 1,
    subjectType: 'Craftsman / Partner',
    category: 'chats',
    time: '14m ago',
    desc: 'Customer reported unprofessional and hostile communication following quote dispute.',
    taskId: 'T-1003',
    taskDisplayId: '#TSK-2003',
    taskTitle: 'Main Distribution Board Circuit Breaker Swap',
    orderBudget: 220.00,
    escrowStatus: 'FROZEN',
    chatLogs: [
      { sender: 'Layla Mansour', text: 'You arrived 2 hours late and are quoting double the app estimated price.', time: '09:40 AM' },
      { sender: 'Tariq Nabulsi (Electrician)', text: 'You do not understand electrical work, do not tell me how to price my job!', time: '09:42 AM', flagged: true },
      { sender: 'Layla Mansour', text: 'Please leave the premises if you cannot honor the agreed rate.', time: '09:43 AM' },
      { sender: 'Tariq Nabulsi (Electrician)', text: 'You will regret wasting my time, do not ever request me again.', time: '09:45 AM', flagged: true }
    ],
    evidenceImages: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
    ],
    auditTrail: [
      { action: 'Dispute Filed by Customer', actor: 'Layla Mansour', timestamp: '09:50 AM' },
      { action: 'Order Placed in Disputed State', actor: 'System Safeguard', timestamp: '09:51 AM' }
    ]
  },
  {
    id: 'R-2004',
    title: 'Spam service solicitation broadcast',
    severity: 'low',
    reporter: 'Omar Qadi',
    reporterId: 'USR-5512',
    reporterPhone: '+972 50 776 2211',
    reporterPriorReportsCount: 0,
    subject: 'Auto-Clean Solutions',
    suspectId: 'USR-SPAM-12',
    suspectPhone: '+972 59 111 8899',
    suspectStatus: 'ACTIVE',
    suspectPriorReportsCount: 4,
    subjectType: 'Direct Chat Sender',
    category: 'spam',
    time: '42m ago',
    desc: 'Unsolicited promotional WhatsApp / SMS blast sent to customer directory.',
    taskId: 'T-1004',
    taskDisplayId: '#TSK-2004',
    taskTitle: 'Air Conditioning Duct Sanitization',
    orderBudget: 150.00,
    escrowStatus: 'RELEASED',
    chatLogs: [
      { sender: 'Auto-Clean Solutions', text: 'Special discount! 50% off all AC cleaning services this weekend only. Call 059-111-8899.', time: '08:30 AM', flagged: true }
    ],
    evidenceImages: [],
    auditTrail: [
      { action: 'Spam Flagged by User', actor: 'Omar Qadi', timestamp: '08:35 AM' }
    ]
  }
];

export class MockSafetyReportRepository implements SafetyReportRepository {
  private reports: SafetyReport[] = [...INITIAL_REPORTS];

  public async getSafetyReports(): Promise<Result<SafetyReport[]>> {
    if (this.reports.length === 0) {
      this.reports = [...INITIAL_REPORTS];
    }
    return ok([...this.reports]);
  }

  public async moderateReport(
    id: string,
    action: 'dismiss' | 'suspend' | 'ban',
    _notes?: string
  ): Promise<Result<boolean>> {
    this.reports = this.reports.filter((r) => r.id !== id);
    return ok(true);
  }
}
export default MockSafetyReportRepository;
