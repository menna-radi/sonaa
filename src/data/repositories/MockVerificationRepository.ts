import { VerificationRepository, VerificationRequest } from '../../domain/repositories/VerificationRepository';
import { Result, ok } from '../../core/result/Result';

export class MockVerificationRepository implements VerificationRepository {
  private queue: VerificationRequest[] = [
    { id: 's1', name: 'Yousef Al-Harbi', role: 'Plumber', submittedAgo: '8 min ago', verificationId: '#VR-2841', faceScore: 96, docsCount: '7/7', risk: 'Low', status: 'pending' },
    { id: 's2', name: 'Bandar Al-Omari', role: 'Carpenter', submittedAgo: '21m ago', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', verificationId: '#VR-2840', faceScore: 91, docsCount: '6/7', risk: 'Low', status: 'pending' },
    { id: 's3', name: 'Hassan Al-Mutairi', role: 'Painter', submittedAgo: '34m ago', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', verificationId: '#VR-2839', faceScore: 88, docsCount: '7/7', risk: 'Low', status: 'pending' },
    { id: 's4', name: 'Khalid Al-Subaie', role: 'AC Tech', submittedAgo: '52m ago', verificationId: '#VR-2838', faceScore: 94, docsCount: '7/7', risk: 'Low', status: 'pending' },
    { id: 's5', name: 'Faisal Al-Anzi', role: 'Electrician', submittedAgo: '1h ago', verificationId: '#VR-2837', faceScore: 97, docsCount: '7/7', risk: 'Low', status: 'flagged' },
    { id: 's6', name: 'Tariq Al-Hazmi', role: 'Plumber', submittedAgo: '1h 14m ago', avatar: 'https://randomuser.me/api/portraits/men/12.jpg', verificationId: '#VR-2836', faceScore: 89, docsCount: '6/7', risk: 'Low', status: 'today' },
  ];

  public async getVerificationQueue(): Promise<Result<VerificationRequest[]>> {
    return ok(this.queue);
  }

  public async moderateVerification(
    requestId: string,
    decision: 'APPROVED' | 'REJECTED' | 'FLAGGED',
    _moderatorNotes: string
  ): Promise<Result<boolean>> {
    const statusMap = {
      APPROVED: 'today' as const,
      REJECTED: 'pending' as const,
      FLAGGED: 'flagged' as const,
    };
    this.queue = this.queue.map((q) =>
      q.id === requestId ? { ...q, status: statusMap[decision] } : q
    );
    return ok(true);
  }

  private autoVerifyEnabled = true;

  public async getAutoVerification(): Promise<Result<{ enabled: boolean }>> {
    return ok({ enabled: this.autoVerifyEnabled });
  }

  public async toggleAutoVerification(enabled: boolean): Promise<Result<{ enabled: boolean }>> {
    this.autoVerifyEnabled = enabled;
    return ok({ enabled: this.autoVerifyEnabled });
  }
}
export default MockVerificationRepository;
