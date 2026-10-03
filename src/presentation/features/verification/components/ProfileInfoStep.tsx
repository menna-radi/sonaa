import React from 'react';
import type { Submission } from '../types';
import { Card, StatTile } from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';
import { formatDate } from '../../../../core/utils/format';
import { User, Phone, Mail, MapPin, Calendar, Hash } from 'lucide-react';

interface ProfileInfoStepProps {
  submission: Submission;
}

export const ProfileInfoStep: React.FC<ProfileInfoStepProps> = ({ submission }) => {
  const { t, language } = useLanguage();
  return (
    <div className="ui-stack">
      <Card title={t('vr_profile_title')} padding="md">
        <div className="vr-grid-tiles">
          <StatTile label={t('vr_profile_name')} value={submission.name} icon={<User size={16} />} />
          {submission.phoneNumber && (
            <StatTile
              label={t('vr_profile_phone')}
              value={<bdi className="ui-num">{submission.phoneNumber}</bdi>}
              icon={<Phone size={16} />}
            />
          )}
          {submission.email && (
            <StatTile label={t('vr_profile_email')} value={submission.email} icon={<Mail size={16} />} />
          )}
          {submission.city && (
            <StatTile label={t('vr_field_city')} value={submission.city} icon={<MapPin size={16} />} />
          )}
          {submission.dateOfBirth && (
            <StatTile
              label={t('vr_profile_dob')}
              value={formatDate(submission.dateOfBirth, language)}
              icon={<Calendar size={16} />}
            />
          )}
          {submission.nationality && <StatTile label={t('vr_profile_nationality')} value={submission.nationality} />}
          {submission.residentialAddress && (
            <StatTile
              label={t('vr_profile_address')}
              value={submission.residentialAddress}
              icon={<MapPin size={16} />}
            />
          )}
          {submission.emergencyContactPhone && (
            <StatTile
              label={t('vr_profile_emergency')}
              value={<bdi className="ui-num">{submission.emergencyContactPhone}</bdi>}
              icon={<Phone size={16} />}
            />
          )}
        </div>
      </Card>

      <Card title={t('vr_profile_diag_title')} padding="md">
        <div className="vr-grid-tiles">
          {submission.registeredDate && (
            <StatTile
              label={t('vr_profile_registered')}
              value={formatDate(submission.registeredDate, language)}
              icon={<Calendar size={16} />}
            />
          )}
          <StatTile
            label={t('vr_profile_verification_id')}
            value={<bdi className="ui-num">{submission.verificationId}</bdi>}
            icon={<Hash size={16} />}
          />
        </div>
      </Card>
    </div>
  );
};

export default ProfileInfoStep;
