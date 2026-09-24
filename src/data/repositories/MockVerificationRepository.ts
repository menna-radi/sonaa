import { VerificationRepository, VerificationRequest } from '../../domain/repositories/VerificationRepository';
import { Result, ok } from '../../core/result/Result';

export class MockVerificationRepository implements VerificationRepository {
  private queue: VerificationRequest[] = [
    {
      id: 's1',
      name: 'Yousef Al-Harbi',
      role: 'Plumber',
      submittedAgo: '8 min ago',
      verificationId: '#VR-2841',
      faceScore: 96,
      docsCount: '5/5',
      risk: 'Low',
      status: 'pending',
      completedStepsCount: 5,
      totalSteps: 5,
      verificationStatus: 'UNDER_REVIEW',
      firstName: 'Yousef',
      lastName: 'Al-Harbi',
      dateOfBirth: '1990-05-12',
      gender: 'MALE',
      nationality: 'Palestinian',
      residentialAddress: 'Beit Hanina, Jerusalem',
      emergencyContactPhone: '+972 50 123 4567',
      idFrontImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800',
      idBackImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800',
      idDocumentType: 'Jerusalem / Palestinian ID',
      ocrDetectedName: 'Yousef A. Al-Harbi',
      ocrConfidence: 98.4,
      idExpiryDate: '2031-04-15',
      selfieImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      faceMatchScore: 96,
      livenessPassed: true,
      tradeCategory: 'PLUMBER',
      yearsExperience: 8,
      bio: 'Master certified plumber with 8+ years experience in central Jerusalem piping and emergency leak repairs.',
      certImageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800',
      certAuthority: 'Jerusalem Vocational Association',
      insuranceLimit: 50000,
    },
    {
      id: 's2',
      name: 'Mohamed Ali',
      role: 'Electrician',
      submittedAgo: '21m ago',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
      verificationId: '#VR-2840',
      faceScore: 94,
      docsCount: '4/5',
      risk: 'Low',
      status: 'pending',
      completedStepsCount: 4,
      totalSteps: 5,
      verificationStatus: 'PENDING_SUBMISSION',
      firstName: 'Mohamed',
      lastName: 'Ali',
      dateOfBirth: '1992-09-18',
      gender: 'MALE',
      nationality: 'Palestinian',
      residentialAddress: 'Old City, Jerusalem',
      emergencyContactPhone: '+970 59 000 0001',
      idFrontImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      idBackImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      idDocumentType: 'Jerusalem / Palestinian ID',
      ocrDetectedName: 'Mohamed Ali',
      ocrConfidence: 97.2,
      idExpiryDate: '2030-11-20',
      selfieImageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
      faceMatchScore: 94,
      livenessPassed: true,
      tradeCategory: 'ELECTRICIAN',
      yearsExperience: 6,
      bio: 'Licensed electrician specializing in circuit breaker installations, rewiring, and smart home lighting.',
      certImageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800',
      certAuthority: 'Palestinian Engineering Syndicate',
      insuranceLimit: 30000,
    },
    {
      id: 's3',
      name: 'Ahmad Khatib',
      role: 'Plumber & Carpenter',
      submittedAgo: '34m ago',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      verificationId: '#VR-2839',
      faceScore: 98,
      docsCount: '5/5',
      risk: 'Low',
      status: 'today',
      isVerifiedId: true,
      completedStepsCount: 5,
      totalSteps: 5,
      verificationStatus: 'APPROVED',
      firstName: 'Ahmad',
      lastName: 'Khatib',
      dateOfBirth: '1988-02-14',
      gender: 'MALE',
      nationality: 'Palestinian',
      residentialAddress: 'Shuafat, Jerusalem',
      emergencyContactPhone: '+972 50 123 4567',
      idFrontImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800',
      idBackImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800',
      idDocumentType: 'Jerusalem / Palestinian ID',
      ocrDetectedName: 'Ahmad Khatib',
      ocrConfidence: 99.1,
      idExpiryDate: '2032-01-10',
      selfieImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      faceMatchScore: 98,
      livenessPassed: true,
      tradeCategory: 'PLUMBER',
      yearsExperience: 10,
      bio: 'Master Craftsman in sanitary plumbing and residential woodwork repairs with 10 years experience.',
      certImageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800',
      certAuthority: 'Jerusalem Trade Union',
      insuranceLimit: 75000,
    },
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
